import { NextRequest, NextResponse } from "next/server";

import { getUUID } from "@/utils/uuid"
import { dateNow } from "@/utils/date"
import { wrapMemory, wrapSystemPrompt } from "@/utils/string"
import errorHandler from "@/utils/error"
import { addChatHistory, addVectorDBEntry, getMemory } from "@/utils/upstash"
import { Message } from "ai"
import { getEmbedding } from '@/utils/googleAI'
import { groqChatCompletion } from '@/utils/groq'

export const runtime = "edge";

async function handler(req: NextRequest) {

    const body = await req.json();
    const messages: Message[] = body.messages?.slice(-50) ?? [];
    const name: string = body.user ?? "Anonymous User";
    const userId: string = body.user_id ?? getUUID();
    const msgId = getUUID();

    messages[messages.length - 1].id = msgId

    if (name !== process.env.USER_NAME || userId !== process.env.USER_ID) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = messages[messages.length - 1].content;

    const timestamp = dateNow()

    const retrieval = await getMemory(input)

    const preMemories = wrapMemory(retrieval.result, name)

    const preSystemPrompt = wrapSystemPrompt({ memories: preMemories, timestamp, name})

    const trimmedMessages = messages.slice(-10)

    const preResponse = await groqChatCompletion({
        model: "gemma2-9b-it",
        messages:  [
                { id: "0", role: "system", content: preSystemPrompt },
                ...trimmedMessages.map((data: any) => ({ id: data.id, role: data.role, content: data.content, name: data.role === 'user' ? name : process.env.AGENT }))
        ],
        stop: [`${name}:`, `\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`],
    });

    const reflection = await getMemory(preResponse)

    const memories = wrapMemory([...retrieval.result, ...reflection.result], name)

    const systemPrompt = wrapSystemPrompt({ memories, timestamp, name})

    const response = await groqChatCompletion({
        model: "llama-3.1-70b-versatile",
        messages:  [
                { id: "0", role: "system", content: preSystemPrompt },
                ...messages.map((data: any) => ({ id: data.id, role: data.role, content: data.content, name: data.role === 'user' ? name : process.env.AGENT }))
        ],
        stop: [`${name}:`, `\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`],
    });

    const keywords = [ ...retrieval.keywords, ...reflection.keywords ]
    const vector = await getEmbedding(keywords.join(", "))

    await addVectorDBEntry({
        id: msgId,
        vector,
        metadata: {
            keywords,
            input,
            output: response,
            timestamp,
            systemPrompt,
            messages: messages.map((data: any) => (data.id)),
        }
    })

    await addChatHistory(msgId)

    return NextResponse.json({ text: response }, { status: 200 })
}

export const POST = errorHandler(handler);