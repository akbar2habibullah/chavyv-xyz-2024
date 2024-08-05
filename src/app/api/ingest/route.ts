import { NextRequest, NextResponse } from "next/server"
import { Message as VercelChatMessage } from "ai"

import { getUUID } from "@/libs/uuid"
import { getChatHistory } from "@/libs/upstash"

export const runtime = "edge"

export async function POST(req: NextRequest) {
	try {

		const body = await req.json()
		const name: string = body.user ?? "Anonymous User"
		const id: string = body.user_id ?? getUUID()
    const length: number = body.length ?? 25

		if (name !== process.env.USER_NAME || id !== process.env.USER_ID) {
			throw new Error("Unauthorized")
		}

    const history = await getChatHistory()

    let conversation: VercelChatMessage[] = []

    for (let i = 0; i < history.length; i++) {
      const element = history[i];

      conversation.push({ id: `${element?.id}-1`, content: element?.metadata?.input as unknown as string, role: 'user'})
      conversation.push({ id: `${element?.id}-2`, content: element?.metadata?.output as unknown as string, role: 'assistant'})
    }

		return NextResponse.json({ output: conversation.slice(-length) }, { status: 200 })
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: e.status ?? 500 })
	}
}
