import { GoogleGenerativeAI } from "@google/generative-ai";
import { appendLog } from "./log"
import { trimStringToMaxLength } from "./string"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004"});

export async function getEmbedding(text: string) {
  const result = await embeddingModel.embedContent(text);

  await appendLog(`getEmbedding success with string: ${trimStringToMaxLength(text)}`)

  return result.embedding.values;
}