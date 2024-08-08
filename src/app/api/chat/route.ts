import { NextRequest, NextResponse } from "next/server";
import { trimNewlines, wrapMemoryMbakAI, wrapSystemPromptMbakAI } from "@/libs/string";
import { getUUID } from "@/libs/uuid"
import { dateNow } from "@/libs/date"
import { groqChatCompletion } from "@/libs/groq"
import { addChatHistoryMbakAI, addVectorDBEntryMbakAI, getMemoryMbakAI } from "@/libs/upstash"
import { queryWikipedia } from "@/libs/wikipedia"
import errorHandler from "@/libs/error"

export const runtime = "edge";

async function handler(req: NextRequest) {
    const body = await req.json();
    const messages = body.messages.slice(-25) ?? [];
    const name: string = body.user ?? "Anonymous User";
    const userId: string = body.user_id ?? getUUID();
    const msgId = getUUID()

    messages[messages.length - 1].id = msgId

    const currentMessageContent = messages[messages.length - 1].content;

    const timestamp = dateNow()

    const wiki = await queryWikipedia(currentMessageContent)

    const { result, vector, keywords } = await getMemoryMbakAI(currentMessageContent)

    const memories = wrapMemoryMbakAI(result)

    const systemPrompt = wrapSystemPromptMbakAI({
        memories,
        wiki,
        name,
        userId,
        timestamp
    })

    const completion = await groqChatCompletion({
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            ...messages.map((data: any) => ({ role: data.role, content: data.content, name: data.role === 'user' ? name : "Mbak AI" }))
        ],
        model: "llama3-70b-8192",
    });

    const response = trimNewlines(completion);

    await addVectorDBEntryMbakAI({
        id: msgId,
        vector,
        metadata: {
            name,
            userId,
            wikipedia: wiki,
            keywords,
            input: currentMessageContent,
            output: response,
            timestamp,
            systemPrompt,
            messages,
        }
    })

    await addChatHistoryMbakAI(msgId)

    return NextResponse.json({ text: response }, { status: 200 })
}

export const POST = errorHandler(handler);