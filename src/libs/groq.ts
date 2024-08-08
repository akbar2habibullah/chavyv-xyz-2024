
import { Message } from "ai"
import Groq from "groq-sdk";
import { appendLog } from "./log"
import { trimStringToMaxLength } from "./string"

export const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
})

interface GroqChatCompletion { 
  messages: Message[], 
  model: string, 
  stop?: string[], 
  temperature?: number, 
  name?: string, 
  agent?: string
}

export async function groqChatCompletion({ messages, model, stop = [`\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`], temperature = 0.9, name = 'Random User', agent = 'Mbak AI' }: GroqChatCompletion) {
	const response = await groq.chat.completions.create({
		messages: messages.map(
      (message) => ({ role: message.role, content: message.content, name: message.role === 'user' ? name : agent })
    ),
		model,
    stop,
    temperature
	})

  const result = response.choices[0]?.message?.content || "" as unknown as string

  await appendLog(`groqChatCompletion success with response: ${trimStringToMaxLength(result)}`)

  return result;
}