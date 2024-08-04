import { Message } from "ai"

export async function openRouterChatCompletion(messages: Message[], model: string, stop: string[], temperature: number = 0.9, name: string = 'Random User', agent: string = 'Mbak AI', provider?: string) {
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

  const result = await response.json()

  return result.choices[0]?.message?.content || "" as unknown as string;
}