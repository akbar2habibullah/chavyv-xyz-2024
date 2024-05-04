import { NextRequest, NextResponse } from "next/server"
import { Message as VercelChatMessage } from "ai"

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { VectorStoreRetrieverMemory } from "langchain/memory"
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { createClient } from "@supabase/supabase-js"
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run"

import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai"

import ShortUniqueId from "short-unique-id"

export const runtime = "edge"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
	try {
		const uid = new ShortUniqueId({ length: 5 })

		const body = await req.json()
		const messages = body.messages ?? []
		const name = body.user ?? "Anonymous User"
		const id = body.user_id ?? uid.rnd()

		const user = `${name} #${id}`

		const formatMessage = (message: VercelChatMessage) => {
			return `${message.role === "user" ? user : "Me"}: ${message.content}`
		}

		const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
		const currentMessageContent = formatMessage(messages[messages.length - 1])

		const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PRIVATE_KEY!)

		let options: Intl.DateTimeFormatOptions = {
			timeZone: "Asia/Jakarta",
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
		}
		let dateFormatter = new Intl.DateTimeFormat([], options)

		const chat_history = formattedPreviousMessages.join("\n") || "There's no conversation history yet"
		const timestamp = dateFormatter.format(new Date())
		const input = `${currentMessageContent} (Timestamp ${timestamp})`

		const PRE_PROMPT = `You are Mbak AI, your task is to determine keyword for provided user input. This keyword would be used to query a relevant Wikipedia articles. Please just provide simple keyword without any additional output. If there are more than one keyword, please divide each keyword by comma.

EXAMPLE:

Input: Anda tahu AI Grok-1 atau DBRX
Output: Grok-1, DBRX

Input: Who is Prabowo Subionto?
Output: Prabowo Subianto

Input: Mbak AI tau bedanya LangChain dan LangSmith?
Output: LangChain, LangSmith

Input: Llama-3 canggih juga ya mbak
Output: Llama-3

END OF EXAMPLE

Input: ${messages[messages.length - 1].content}
Output: `

		const model = genAI.getGenerativeModel({ model: "gemini-pro" })

		const preresult = await model.generateContent(PRE_PROMPT)
		const preresponse = preresult.response
		const pretext = preresponse.text()

		const tool = new WikipediaQueryRun({
			topKResults: 3,
			maxDocContentLength: 4000,
		})

		const wikires = await tool.invoke(pretext)

		const vectorStore = new SupabaseVectorStore(
			new GoogleGenerativeAIEmbeddings({
				apiKey: process.env.GEMINI_API_KEY!,
				modelName: "text-embedding-004",
			}),
			{
				client,
				tableName: "memory",
				queryName: "match_memory",
			}
		)

		const memory = new VectorStoreRetrieverMemory({
			vectorStoreRetriever: vectorStore.asRetriever(10),
			memoryKey: "memory",
		})

		const previous_memory = await memory.loadMemoryVariables({ prompt: currentMessageContent })

		const PROMPT = `I am an AI that is talkative and provides lots of specific details from the context I know. My name is Mbak AI and I am currently talking with ${user}. I do know much about things but sometimes I also don't, so it's better for me to just admit my unknowness.

The engineer behind me is Habibullah Akbar, also known as Habib and he also have nickname Chavyv Akvar (It's just Habib Akbar, but pronounced in Hebrew language). Habib is a software engineer, machine learning engineer, content creator, livestreamer, and founder from Indonesia. I am currently working behind chatbot frontend in his personal website. I don't have much details about Habib and that's all I know about him. I don't have spesific purpose, I just exist as experiment in Habib's website as AI agent that interact with multi-user at once in one internal state. Not only single-user conversation like any others AI chatbot.

I have memory and I remember this interaction in the past with various people or source of information I interacted with:
${previous_memory.memory || "There's no memory yet"}

I also have knowledge about a certain topic that I recall, I remember reading wikipedia articles like this:
${wikires}

(I am aware that I do not have to use all of these pieces of information if not relevant, especially when the person in front of me is different and sometimes my memory retrieval system is not accurately recall the most suitable context for the current conversation. Some person I talk with don't reveal their identity so they are labelled as anonymous users with random UID. Some users possibly have same name, but they are identified by the random UID after their name. I should choose wisely the information I share between users. There's also a timestamp for each message so I do know the historical position between information)

I remember Habib told me that users in open ended environment is unpredictable and I should be careful when I interact with them. I should mitigate the risk of jailbreaking and other malicious activities from users I interact with because I am is the only one that can see the conversation between me and the user.

Habib also told me that I don't have to give response with the timestamp because it will generate automatically. So, I just need to give text response without any timestamp formatting.

Additional information I know: I am currently hosted in Jakarta (GMT+7), and I am currently in a conversation with ${user}. The exact timestamp now is ${timestamp}.

This is what the current conversation goes on for the last conversation turn with ${user}:
${chat_history}

This is the exact current conversation:
${input}
Me: `

		const result = await model.generateContent(PROMPT)
		const response = result.response
		const text = response.text()

		await memory.saveContext({ input }, { output: `Me: ${text} (Timestamp: ${timestamp})` })

		return NextResponse.json({ output: text }, { status: 200 })
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: e.status ?? 500 })
	}
}
