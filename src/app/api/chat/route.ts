import { OpenAI } from "openai"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { RateLimiterMemory } from "rate-limiter-flexible"

// IMPORTANT! Set the runtime to edge
export const runtime = "edge"

// Create a rate limiter with a limit of 1000 requests per 24 hours
const rateLimiter = new RateLimiterMemory({
	points: 1000,
	duration: 60 * 60 * 24,
})

const fireworks = new OpenAI({
	baseURL: "https://api.fireworks.ai/inference/v1",
	apiKey: process.env.FIREWORKS_API_KEY!,
})

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
	// Check if the request is allowed by the rate limiter
	rateLimiter
		.consume("Root", 1)
		.then(async (rateLimiterRes) => {
			// Extract the `messages` from the body of the request
			const { messages } = await req.json()

			// Request the Fireworks API for the response based on the prompt
			const response = await fireworks.completions.create({
				model: "accounts/fireworks/models/mixtral-8x7b-instruct",
				stream: true,
				prompt: buildPrompt(messages),
				max_tokens: 400,
				temperature: 0.7,
				top_p: 1,
				frequency_penalty: 1,
			})

			// Consume a request point from the rate limiter
			await rateLimiter.consume(1)

			// Convert the response into a friendly text-stream
			const stream = OpenAIStream(response)

			// Respond with the stream
			return new StreamingTextResponse(stream)
		})
		.catch((rateLimiterRes) => {
			// Not enough points to consume
			return new Response("Too many requests", { status: 429 })
		})
}
