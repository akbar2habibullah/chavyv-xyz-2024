import OpenAI from "openai"
import { OpenAIStream, StreamingTextResponse } from "ai"

// IMPORTANT! Set the runtime to edge
export const runtime = "edge"

const fireworks = new OpenAI({
	baseURL: "https://api.fireworks.ai/inference/v1",
	apiKey: process.env.FIREWORKS_API_KEY!,
})

export async function POST(req: Request) {
	const { prompt } = await req.json()

	const response = await fireworks.completions.create({
		model: "accounts/fireworks/models/mixtral-8x7b-instruct",
		stream: true,
		max_tokens: 4096,
		prompt,
	})
	// Convert the response into a friendly text-stream.
	const stream = OpenAIStream(response)
	// Respond with the stream
	return new StreamingTextResponse(stream)
}
