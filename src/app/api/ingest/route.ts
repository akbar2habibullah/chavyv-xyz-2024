import { NextRequest, NextResponse } from "next/server"
import { Message } from "ai"

import { getUUID } from "@/utils/uuid"
import { getChatHistory } from "@/utils/upstash"
import errorHandler from "@/utils/error"

export const runtime = "edge"

async function handler(req: NextRequest) {
	const body = await req.json()
	const name: string = body.user ?? "Anonymous User"
	const id: string = body.user_id ?? getUUID()
	const length: number = body.length ?? 25

	if (name !== process.env.USER_NAME || id !== process.env.USER_ID) {
		throw new Error("Unauthorized")
	}

	const history = await getChatHistory()

	let conversation: Message[] = []

	for (let i = 0; i < history.length; i++) {
		const element = history[i];

		conversation.push({ id: `${element?.id}-1`, content: element?.metadata?.input as unknown as string, role: 'user'})
		conversation.push({ id: `${element?.id}-2`, content: element?.metadata?.output as unknown as string, role: 'assistant'})
	}

	return NextResponse.json({ output: conversation.slice(-length) }, { status: 200 })
}

export const POST = errorHandler(handler);