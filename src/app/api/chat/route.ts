// app/api/chat/route.ts

import { OpenAI } from "openai"
import { OpenAIStream, StreamingTextResponse } from "ai"

export const runtime = "edge"

const fireworks = new OpenAI({
	baseURL: "https://api.fireworks.ai/inference/v1",
	apiKey: process.env.FIREWORKS_API_KEY!,
})

// Build a prompt from the messages
function buildPrompt(messages: { content: string; role: "system" | "user" | "assistant" }[]) {
	return (
		messages
			.map(({ content, role }) => {
				if (role === "user") {
					return `Human: ${content}`
				} else {
					return `Assistant: ${content}`
				}
			})
			.join("\n\n") + "Assistant:"
	)
}

export async function POST(req: Request) {
	// Extract the `messages` from the body of the request
	const { messages } = await req.json()

	// Request the Fireworks API for the response based on the prompt
	const response = await fireworks.completions.create({
		model: "accounts/fireworks/models/mixtral-8x7b",
		stream: true,
		prompt: buildPrompt(messages),
		max_tokens: 400,
		temperature: 0.7,
		top_p: 1,
		frequency_penalty: 1,
	})

	// Convert the response into a friendly text-stream
	const stream = OpenAIStream(response)

	// Respond with the stream
	return new StreamingTextResponse(stream)
}
