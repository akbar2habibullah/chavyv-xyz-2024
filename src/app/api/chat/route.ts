import { NextRequest, NextResponse } from "next/server";
import { wrapMemoryMbakAI, wrapSystemPromptMbakAI } from "@/utils/string";
import { getUUID } from "@/utils/uuid"
import { dateNow } from "@/utils/date"
import { groqChatCompletion } from "@/utils/groq"
import { addChatHistoryMbakAI, addVectorDBEntryMbakAI, getMemoryMbakAI } from "@/utils/upstash"
import { queryWikipedia } from "@/utils/wikipedia"
import errorHandler from "@/utils/error"
import { Message } from "ai"

export const runtime = "edge";

async function handler(req: NextRequest) {
    const body = await req.json();
    const messages: Message[] = body.messages.slice(-25) ?? [];
    const name: string = body.user ?? "Anonymous User";
    const userId: string = body.user_id ?? getUUID();
    const msgId = getUUID()

    messages[messages.length - 1].id = msgId

    const input = messages[messages.length - 1].content;

    const timestamp = dateNow()

    const wiki = await queryWikipedia(input)

    const { result, vector, keywords } = await getMemoryMbakAI(input)

    const memories = wrapMemoryMbakAI(result)

    const systemPrompt = wrapSystemPromptMbakAI({
        memories,
        wiki,
        name,
        userId,
        timestamp
    })

    const output = await groqChatCompletion({
        messages: [
            {   
                id: '0',
                role: "system",
                content: systemPrompt,
            },
            ...messages.map((data: any) => ({ id: data.id, role: data.role, content: data.content, name: data.role === 'user' ? name : "Mbak AI" }))
        ],
        model: "llama3-70b-8192",
    });

    await addVectorDBEntryMbakAI({
        id: msgId,
        vector,
        metadata: {
            name,
            userId,
            wiki,
            keywords,
            input,
            output,
            timestamp,
            systemPrompt,
            messages,
        }
    })

    await addChatHistoryMbakAI(msgId)

    return NextResponse.json({ text: output }, { status: 200 })
}

export const POST = errorHandler(handler);