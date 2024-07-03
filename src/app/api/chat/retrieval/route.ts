import { NextRequest, NextResponse } from "next/server"
import { Message as VercelChatMessage } from "ai"

import OpenAI from "openai"

import { Redis } from '@upstash/redis'
import { Index } from "@upstash/vector"
import { getEmbedding, findInfluentialTokensForSentence } from "@/libs/attention"


const redis = new Redis({
  url: process.env.REDIS_LINK!,
  token: process.env.REDIS_TOKEN!,
})

const index = new Index({
  url: process.env.UPSTASH_LINK,
  token: process.env.UPSTASH_TOKEN,
})

const redis2 = new Redis({
  url: process.env.REDIS2_LINK!,
  token: process.env.REDIS2_TOKEN!,
})

const index2 = new Index({
  url: process.env.UPSTASH2_LINK,
  token: process.env.UPSTASH2_TOKEN,
})

import ShortUniqueId from "short-unique-id"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_KEY,
})

function trimNewlines(input: string): string {
  return input.replace(/^\s+|\s+$/g, '');
}

async function getChunkData(id: string) {
  const history: string = await redis.get("history") || "";
  const orderedIds = history.split(", ")
  const idx = orderedIds.indexOf(id);
  if (idx === -1) {
    throw new Error('ID not found in the ordered array');
  }

  const startIndex = Math.max(0, idx - 2);
  const endIndex = Math.min(orderedIds.length - 1, idx + 3);

  const chunkIds = orderedIds.slice(startIndex, endIndex + 1);

  
  const chunkData = await index.fetch(chunkIds, {includeMetadata: true})

  return chunkData;
}

export const runtime = "edge"

export async function POST(req: NextRequest) {
	try {
		const uid = new ShortUniqueId({ length: 10 })

		const body = await req.json()
		const messages = body.messages ?? []
		const name: string = body.user ?? "Anonymous User"
		const id: string = body.user_id ?? uid.rnd()

		if (name !== process.env.USER_NAME || id !== process.env.USER_ID) {
			throw new Error("Unauthorized")
		}

		const formatMessage = (message: VercelChatMessage) => {
			return `${message.role === "user" ? name : "Me"}: ${message.content}`
		}

		const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
		const currentMessageContent = messages[messages.length - 1].content

		let options: Intl.DateTimeFormatOptions = {
			timeZone: "Asia/Jakarta",
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			weekday: "long",
		}
		let dateFormatter = new Intl.DateTimeFormat([], options)

		const chat_history = formattedPreviousMessages.join("\n") || "There's no conversation history yet"
		const timestamp = dateFormatter.format(new Date())

		const inputKeyWords = await findInfluentialTokensForSentence(currentMessageContent, {systemPrompt: process.env.AGENT_EGO, threshold: 0.15})
		const inputKeyWordsString = inputKeyWords.join(", ")

		const inputEmbedding = await getEmbedding(inputKeyWordsString)

		const retrieval = await index.query({
			vector: inputEmbedding,
			topK: 3,
			includeMetadata: true,
		});

		let memories = ``

		for (let i = 0; i < retrieval.length; i++) {
			const responseRange = await getChunkData(retrieval[i].id as unknown as string)

			const responseParsed = responseRange.map(
				(data) => `${name}: ${data?.metadata?.input}\n
				Me: ${data?.metadata?.output}\n`
			).join()

			memories += `Conversation I remember from ${responseRange[0]?.metadata?.timestamp}:\n${responseParsed}\n\n`
		}

		const SYSTEM_PROMPT = `${process.env.AGENT_EGO}
${memories}
Timestamp for now is ${timestamp}.
And below is my current online conversation with ${process.env.USER_NAME} via text chat interface:
${chat_history}`

		const completion = await openai.chat.completions.create({
			model: process.env.MODEL_DEFAULT!,
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: currentMessageContent}
			],
		})
	
		const response = trimNewlines(completion.choices[0].message.content || "")

		const uuid = uid.rnd()

		await index2.upsert({
			id: uuid,
			vector: inputEmbedding,
			metadata: {
				keywords: inputKeyWords,
				input: currentMessageContent,
				output: response,
				timestamp: timestamp,
				completePrompt: SYSTEM_PROMPT
			},
		});

		
    const history = await redis2.get<string>("history") || "";

		let historyArr = history.split(", ")

		historyArr.push(uuid)

		await redis2.set("history", historyArr.join(", "))

		return NextResponse.json({ output: response }, { status: 200 })
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: e.status ?? 500 })
	}
}
