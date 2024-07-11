import { NextRequest, NextResponse } from "next/server";
import { Redis } from '@upstash/redis';
import { Index } from "@upstash/vector";
import { getEmbedding, findInfluentialTokensForSentence } from "@/libs/attention";

import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run"

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const redis = new Redis({
    url: process.env.REDIS3_LINK!,
    token: process.env.REDIS3_TOKEN!,
});

const index = new Index({
    url: process.env.UPSTASH3_LINK,
    token: process.env.UPSTASH3_TOKEN,
});

import ShortUniqueId from "short-unique-id";

async function* fetchLoadingMessages(cancelToken: { cancel: boolean }): AsyncGenerator<Uint8Array, void, unknown> {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < 10; ++i) {
        if (cancelToken.cancel) break;
        await sleep(3000); // Sleep for 3 seconds
        if (cancelToken.cancel) break;
        yield new TextEncoder().encode("[Loading]");
    }
}

function trimNewlines(input: string): string {
    return input.replace(/^\s+|\s+$/g, '');
}

export const runtime = "edge";

export async function POST(req: NextRequest) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const cancelToken = { cancel: false };

    try {
        const uid = new ShortUniqueId({ length: 10 });

        const uuid = uid.rnd();

        const body = await req.json();
        const messages = body.messages ?? [];
        const name: string = body.user ?? "Anonymous User";
        const id: string = body.user_id ?? uid.rnd();

		messages[messages.length - 1].id = uuid

        const currentMessageContent = messages[messages.length - 1].content;

        let options: Intl.DateTimeFormatOptions = {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            weekday: "long",
        };
        let dateFormatter = new Intl.DateTimeFormat([], options);

        const timestamp = dateFormatter.format(new Date());

        writer.write(new TextEncoder().encode("[Loading]"));

        const preresult = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: process.env.PRE_PROMPT,
            },
            {
              role: "user",
              content: messages[messages.length - 1].content,
            },
          ],
          model: "mixtral-8x7b-32768",
        })
        const preresponse = preresult.choices[0]?.message?.content || ""

        const tool = new WikipediaQueryRun({
          topKResults: 2,
          maxDocContentLength: 1000,
        })
    
        const wikires = preresponse !== "(No keywords)" ? await tool.invoke(preresponse) : ""

        const loadingMessages = fetchLoadingMessages(cancelToken);

        const sendLoadingMessages = async () => {
            for await (const message of loadingMessages) {
                writer.write(message);
            }
        };

        const loadingPromise = sendLoadingMessages();

        const inputKeyWords = await findInfluentialTokensForSentence(currentMessageContent, { systemPrompt: process.env.MBAK_AI_EGO, threshold: 0.15 });
        const inputKeyWordsString = inputKeyWords.join(", ");

        const inputEmbedding = await getEmbedding(inputKeyWordsString);

        const retrieval = await index.query({
            vector: inputEmbedding,
            topK: 5,
            includeMetadata: true,
        });

        let memories = ``;

        for (let i = 0; i < retrieval.length; i++) {
            const responseParsed = `${retrieval[i]?.metadata?.username}#${retrieval[i]?.metadata?.userId}: ${retrieval[i]?.metadata?.input}\n
                Me: ${retrieval[i]?.metadata?.output}\n`

            memories += `Conversation I remember from ${retrieval[i]?.metadata?.timestamp} with ${retrieval[i]?.metadata?.username}#${retrieval[i]?.metadata?.userId}:\n${responseParsed}\n\n`;
        }

        const SYSTEM_PROMPT = `${process.env.MBAK_AI_EGO_1}

I have memory and I remember this interaction in the past with various people or source of information I interacted with:
${memories || "There's no memory yet"}

${
	wikires !== ""
		? `I also have knowledge about a certain topic that I recall, I remember reading wikipedia articles like this:

${wikires}`
		: ""
}
${process.env.MBAK_AI_EGO_2}
Timestamp for now is ${timestamp}.
And I'm currently in online conversation with ${name}#${id} via text chat interface.`;

        const completionPromise = groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                ...messages.map((data: any) => ({ role: data.role, content: data.content, name: data.role === 'user' ? name : "Mbak AI" }))
            ],
            model: "llama3-70b-8192",
            temperature: 0.9,
            stop: [`${name}:`, `\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`],
        });

        const completion = await completionPromise;

        cancelToken.cancel = true; // Stop the loading messages

        const response = trimNewlines(completion.choices[0].message.content);

        await index.upsert({
            id: uuid,
            vector: inputEmbedding,
            metadata: {
                username: name,
                userId: id,
                wikipedia: wikires,
                keywords: inputKeyWords,
                input: currentMessageContent,
                output: response,
                timestamp: timestamp,
                completePrompt: SYSTEM_PROMPT,
                messages: messages,
            },
        });

        const history = await redis.get<string>("history") || "";

        let historyArr = history.split(", ");

        historyArr.push(uuid);

        await redis.set("history", historyArr.join(", "));

        writer.write(new TextEncoder().encode("[Output]" + response));
        writer.close();

        await loadingPromise; // Wait for the loading messages to stop

        return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

    } catch (e: any) {
        console.error(e.message)
        cancelToken.cancel = true; // Stop the loading messages

		writer.write(new TextEncoder().encode("[Error]" + e.message));
        writer.close();
        return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
}
