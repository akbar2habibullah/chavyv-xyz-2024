
import { Message } from "ai"
import Groq from "groq-sdk";

export const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
})

export async function groqChatCompletion(messages: Message[], model: string, stop: string[] = [`\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`], temperature: number = 0.9, name: string = 'Random User', agent: string = 'Mbak AI') {
	const result = await groq.chat.completions.create({
		messages: messages.map(
      (message) => ({ role: message.role, content: message.content, name: message.role === 'user' ? name : agent })
    ),
		model,
    stop,
    temperature
	})

  return result.choices[0]?.message?.content || "" as unknown as string;
}