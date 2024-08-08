import { NextRequest, NextResponse } from "next/server";

import { getUUID } from "@/utils/uuid"
import { dateNow } from "@/utils/date"
import { wrapMemory, wrapSystemPrompt } from "@/utils/string"
import errorHandler from "@/utils/error"
import { addChatHistory, addVectorDBEntry, getMemory } from "@/utils/upstash"
import { openRouterChatCompletion } from "@/utils/openRouter"
import { Message } from "ai"

export const runtime = "edge";

async function handler(req: NextRequest) {

    const body = await req.json();
    const messages: Message[] = body.messages?.slice(-25) ?? [];
    const name: string = body.user ?? "Anonymous User";
    const userId: string = body.user_id ?? getUUID();
    const msgId = getUUID();

    messages[messages.length - 1].id = msgId

    if (name !== process.env.USER_NAME || userId !== process.env.USER_ID) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = messages[messages.length - 1].content;

    const timestamp = dateNow()

    const { result, vector, keywords } = await getMemory(input)

    const memories = wrapMemory(result, name)

    const systemPrompt = wrapSystemPrompt({ memories, timestamp, name})

    const response = await openRouterChatCompletion({
        model: "google/gemma-2-27b-it",
        messages:  [
                { id: "0", role: "system", content: systemPrompt },
                ...messages.map((data: any) => ({ id: data.id, role: data.role, content: data.content, name: data.role === 'user' ? name : process.env.AGENT }))
        ],
        provider: "Together",
        stop: [`${name}:`, `\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`],
    });

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