import { Message } from "ai"
import { appendLog } from "./log"
import { trimStringToMaxLength } from "./string"

interface OpenRouterChatCompletion { 
  messages: Message[], 
  model: string, 
  stop?: string[], 
  temperature?: number, 
  name?: string, 
  agent?: string,
  provider?: string
}

export async function openRouterChatCompletion({ messages, model, stop, temperature = 0.9, name = 'Random User', agent = 'Mbak AI', provider }: OpenRouterChatCompletion) {
	const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        "model": model,
        "messages": messages.map(
          (message) => ({ role: message.role, content: message.content, name: message.role === 'user' ? name : agent })
        ),
        "provider": provider ? {
          "order": [
              provider
          ]
        } : null,
        "temperature": temperature,
        "stop": stop ? stop : [`${name}:`, `\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`],
    })
  });

  let result = await response.json()
  result = result.choices[0]?.message?.content || "" as unknown as string
  
  await appendLog(`openRouterChatCompletion success with response: ${trimStringToMaxLength(result)}`)

  return result;
}