import { NextRequest, NextResponse } from "next/server"
import { Message as VercelChatMessage } from "ai"

import { Redis } from '@upstash/redis'
import { Index } from "@upstash/vector"

const redis = new Redis({
  url: process.env.REDIS2_LINK!,
  token: process.env.REDIS2_TOKEN!,
})

const index = new Index({
  url: process.env.UPSTASH2_LINK,
  token: process.env.UPSTASH2_TOKEN,
})

function getLastElements(arr: VercelChatMessage[]) {
  // Calculate the starting index for slicing
  const startIndex = Math.max(arr.length - 30, 0);
  // Use slice to get the last 100 elements
  return arr.slice(startIndex);
}


import ShortUniqueId from "short-unique-id"

export const runtime = "edge"

export async function POST(req: NextRequest) {
	try {
		const uid = new ShortUniqueId({ length: 10 })

		const body = await req.json()
		const name: string = body.user ?? "Anonymous User"
		const id: string = body.user_id ?? uid.rnd()

		if (name !== process.env.USER_NAME || id !== process.env.USER_ID) {
			throw new Error("Unauthorized")
		}

    const value = await redis.get<string>("history") || "";

    const response = value.split(", ")

    const responseHistory = await index.fetch(response, { includeMetadata: true });

    let conversation: VercelChatMessage[] = []

    for (let i = 0; i < responseHistory.length; i++) {
      const element = responseHistory[i];

      conversation.push({ id: `${element?.id}-1`, content: element?.metadata?.input as unknown as string, role: 'user'})
      conversation.push({ id: `${element?.id}-2`, content: element?.metadata?.output as unknown as string, role: 'assistant'})
    }

		return NextResponse.json({ output: getLastElements(conversation) }, { status: 200 })
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: e.status ?? 500 })
	}
}
