import { GoogleGenerativeAI } from "@google/generative-ai";
import { appendLog } from "./log"
import { trimNewlines, trimStringToMaxLength } from "./string"
import { Message } from 'ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004"});

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);

  await appendLog(`getEmbedding success with string: ${trimStringToMaxLength(text)}`)

  return result.embedding.values;
}

export interface GeminiChatCompletion {
  messages: Message[],
  model: string,
  stop: string[],
  temperature: number
}

export async function geminiChatCompletion({ messages, model = "gemini-1.5-flash", stop = [`\n\n\n`, `\n\n\n\n`, `\n\n\n\n\n`], temperature = 0.9 }: GeminiChatCompletion ): Promise<string> {
  let systemInstruction = "You are a helpful assistant based on Gemini model"

  if (messages[0].role === "system") {
    systemInstruction = messages[0].content
  }

  const flashModel = genAI.getGenerativeModel({ 
    model,
    systemInstruction : {
      role: "system",
      parts: [{ text: systemInstruction}]
    }
  });

  const chat = flashModel.startChat({
    history: [
      ...messages.slice(1, messages.length - 1).map((message) => ({role: message.role === "user" ? "user" : "model", parts: [{ text: message.content }]}))
    ],
    generationConfig: {
      stopSequences: stop,
      temperature
    }
  });

  const input = messages[messages.length - 1].content
  
  let result = await chat.sendMessage(input);

  return trimNewlines(result.response.text())
}