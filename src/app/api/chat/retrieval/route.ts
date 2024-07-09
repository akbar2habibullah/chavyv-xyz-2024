import { NextRequest, NextResponse } from "next/server";
import { Redis } from '@upstash/redis';
import { Index } from "@upstash/vector";
import { getEmbedding, findInfluentialTokensForSentence } from "@/libs/attention";
import Groq from "groq-sdk";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
});

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

async function* fetchLoadingMessages(cancelToken: { cancel: boolean }): AsyncGenerator<string, void, unknown> {
	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	for (let i = 0; i < 10; ++i) {
		if (cancelToken.cancel) break;
		await sleep(3000); // Sleep for 3 seconds
		if (cancelToken.cancel) break;
		yield "[Loading]";
	}
}

function trimNewlines(input: string): string {
	return input.replace(/^\s+|\s+$/g, '');
}

async function getChunkData(id: string, memory: number) {
	const history: string = memory === 1 ? await redis1.get("history") || ""  : await redis2.get("history") || "";

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

export async function POST(req: NextRequest) {
	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();

	const cancelToken = { cancel: false };

	try {
		const uid = new ShortUniqueId({ length: 10 });

		const body = await req.json();
		const messages = body.messages ?? [];
		const name: string = body.user ?? "Anonymous User";
		const id: string = body.user_id ?? uid.rnd();

		if (name !== process.env.USER_NAME || id !== process.env.USER_ID) {
			writer.close();
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

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

		writer.write("[Loading]");

		const loadingMessages = fetchLoadingMessages(cancelToken);

		const sendLoadingMessages = async () => {
			for await (const message of loadingMessages) {
				writer.write(message);
			}
		};

		const loadingPromise = sendLoadingMessages();

		const inputKeyWords = await findInfluentialTokensForSentence(currentMessageContent, { systemPrompt: process.env.AGENT_EGO, threshold: 0.15 });
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
			const responseRange = await getChunkData(retrieval1[i].id as unknown as string, 1);

			const responseParsed = responseRange.map(
				(data) => `${name}: ${data?.metadata?.input}\n
				Me: ${data?.metadata?.output}\n`
			).join();

			memories += `Conversation I remember from ${responseRange[0]?.metadata?.timestamp}:\n${responseParsed}\n\n`;
		}

		for (let i = 0; i < retrieval2.length; i++) {
			const responseRange = await getChunkData(retrieval2[i].id as unknown as string, 2);

			const responseParsed = responseRange.map(
				(data) => `${name}: ${data?.metadata?.input}\n
				Me: ${data?.metadata?.output}\n`
			).join();

			memories += `Conversation I remember from ${responseRange[0]?.metadata?.timestamp}:\n${responseParsed}\n\n`;
		}

		const SYSTEM_PROMPT = `${process.env.AGENT_EGO}
${memories}
Timestamp for now is ${timestamp}.
And I'm currently in online conversation with ${name} via text chat interface.`;

		const completionPromise = groq.chat.completions.create({
			messages: [
				{
					role: "system",
					content: SYSTEM_PROMPT,
				},
				...messages.map((data: any) => ({ role: data.role, content: data.content, name: data.role === 'user' ? name : process.env.AGENT }))
			],
			model: "gemma2-9b-it",
			temperature: 0.9,
			stop: [`${name}:`, `\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`],
		});

		const completion = await completionPromise;

		cancelToken.cancel = true; // Stop the loading messages

		const response = trimNewlines(completion.choices[0].message.content);

		const uuid = uid.rnd();

		await index2.upsert({
			id: uuid,
			vector: inputEmbedding,
			metadata: {
				keywords: inputKeyWords,
				input: currentMessageContent,
				output: response,
				timestamp: timestamp,
				completePrompt: SYSTEM_PROMPT,
				messages: messages,
			},
		});

		const history = await redis2.get<string>("history") || "";

		let historyArr = history.split(", ");

		historyArr.push(uuid);

		await redis2.set("history", historyArr.join(", "));

		writer.write("[Output]" + response);
		writer.close();

		await loadingPromise; // Wait for the loading messages to stop

		return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

	} catch (e: any) {
		console.error(e.message)
		cancelToken.cancel = true; // Stop the loading messages
		writer.close();
		return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
	}
}
