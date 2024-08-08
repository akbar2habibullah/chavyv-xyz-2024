import { NextRequest, NextResponse } from "next/server";
import { Redis } from '@upstash/redis';
import { Index } from "@upstash/vector";
import { findInfluentialTokens } from "@/libs/attention";
import { getEmbedding } from "@/libs/googleAI";
import { Message } from "ai"

const redis1 = new Redis({
    url: process.env.REDIS_LINK!,
    token: process.env.REDIS_TOKEN!,
});

const index1 = new Index({
    url: process.env.UPSTASH_LINK,
    token: process.env.UPSTASH_TOKEN,
});

const redis2 = new Redis({
    url: process.env.REDIS2_LINK!,
    token: process.env.REDIS2_TOKEN!,
});

const index2 = new Index({
    url: process.env.UPSTASH2_LINK,
    token: process.env.UPSTASH2_TOKEN,
});

import ShortUniqueId from "short-unique-id";
import { getUUID } from "@/libs/uuid"
import { dateNow } from "@/libs/date"
import { trimNewlines } from "@/libs/string"
import errorHandler from "@/libs/error"

async function getChunkData(id: string, memory: number) {
    const history: string = memory === 1 ? await redis1.get("history") || "" : await redis2.get("history") || "";

    const orderedIds = history.split(", ");
    const idx = orderedIds.indexOf(id);
    if (idx === -1) {
        throw new Error('ID not found in the ordered array');
    }

    const startIndex = Math.max(0, idx - 1);
    const endIndex = Math.min(orderedIds.length - 1, idx + 2);

    const chunkIds = orderedIds.slice(startIndex, endIndex + 1);

    const chunkData = memory === 1 ? await index1.fetch(chunkIds, { includeMetadata: true }) : await index2.fetch(chunkIds, { includeMetadata: true });

    return chunkData;
}

export const runtime = "edge";

async function handler(req: NextRequest) {

    const body = await req.json();
    const messages = body.messages?.slice(-25) ?? [];
    const name: string = body.user ?? "Anonymous User";
    const id: string = body.user_id ?? getUUID();

    const uuid = getUUID();

    messages[messages.length - 1].id = uuid

    if (name !== process.env.USER_NAME || id !== process.env.USER_ID) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentMessageContent = messages[messages.length - 1].content;

    const timestamp = dateNow()

    const inputKeyWords = await findInfluentialTokens(currentMessageContent);
    const inputKeyWordsString = inputKeyWords.join(", ");

    const inputEmbedding = await getEmbedding(inputKeyWordsString);

    const retrieval1 = await index1.query({
        vector: inputEmbedding,
        topK: 2,
        includeMetadata: true,
    });

    const retrieval2 = await index2.query({
        vector: inputEmbedding,
        topK: 1,
        includeMetadata: true,
    });

    let memories = ``;

    for (let i = 0; i < retrieval1.length; i++) {
        try {
            const responseRange = await getChunkData(retrieval1[i].id as unknown as string, 1);

            const responseParsed = responseRange.map(
                (data) => `${name}: ${data?.metadata?.input}\n
                Me: ${data?.metadata?.output}\n`
            ).join();

            memories += `Conversation I remember from ${responseRange[0]?.metadata?.timestamp as unknown as string}:\n${responseParsed}\n\n`;
        } catch (err) {

        }
    }

    for (let i = 0; i < retrieval2.length; i++) {
        try {
            const responseRange = await getChunkData(retrieval2[i].id as unknown as string, 2);

            const responseParsed = responseRange.map(
                (data) => `${name}: ${data?.metadata?.input}\n
                Me: ${data?.metadata?.output}\n`
            ).join();

            memories += `Conversation I remember from ${responseRange[0]?.metadata?.timestamp}:\n${responseParsed}\n\n`;
        } catch (err) {

        }
    }

    const SYSTEM_PROMPT = `${process.env.AGENT_EGO}
${memories}
Timestamp for now is ${timestamp}.
And I'm currently in online conversation with ${name} via text chat interface.`;

    const completionResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "google/gemma-2-27b-it",
            "messages":  [
                {"role": "system", "content": SYSTEM_PROMPT},
                ...messages.map((data: any) => ({ role: data.role, content: data.content, name: data.role === 'user' ? name : process.env.AGENT }))
            ],
            "provider": {
                "order": [
                    "Together"
                ]
            },
            "temperature": 0.9,
            "stop": [`${name}:`, `\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`]
        })
    });

    const completion = await completionResponse.json()

    const response = trimNewlines(completion.choices[0].message.content);

    await index2.upsert({
        id: uuid,
        vector: inputEmbedding,
        metadata: {
            keywords: inputKeyWords,
            input: currentMessageContent,
            output: response,
            timestamp: timestamp,
            completePrompt: SYSTEM_PROMPT,
            messages: messages.map((data: any) => ({ id: data.id })),
        },
    });

    const history = await redis2.get<string>("history") || "";

    let historyArr = history.split(", ");

    historyArr.push(uuid);

    await redis2.set("history", historyArr.join(", "));

    return NextResponse.json({ text: response }, { status: 200 })
}

export const POST = errorHandler(handler);