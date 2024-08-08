import { Message } from "ai"
import { dateNow } from "./date"
import { groqChatCompletion } from "./groq"
import { wrapMemoryMbakAI, wrapSystemPromptMbakAI } from "./string"
import { getMemoryMbakAI, MetadataMbakAI } from "./upstash"
import { getUUID } from "./uuid"
import { findInfluentialTokens } from "./attention"
import { getEmbedding } from "./googleAI"

export async function memoryAbstractionMbakAI(input: string, messages: Message[], depth: number = 1, { wiki = "", name = "Anonymous User", userId = getUUID(), timestamp = dateNow(), recall = "", memory = [] as MetadataMbakAI[], system = ""}): Promise<{ response: string, vector: number[], keywords: string[], systemPrompt: string }> {
  if (depth === 0) {
    return { response: recall, keywords: [], systemPrompt: system, vector: [] }
  }

  let result
  let vector: number[] = [] 
  let keywords: string[] = []

  if (recall === "") {
    const retrieval = await getMemoryMbakAI(input)
    
    result = retrieval.result
    vector = retrieval.vector
    keywords = retrieval.keywords
  } else {
    const retrieval = await getMemoryMbakAI(recall)
    
    result = retrieval.result

    if (depth === 2) {
      keywords = await findInfluentialTokens(input)
    }
  }

  const memories = wrapMemoryMbakAI([...memory, ...result])

  const systemPrompt = wrapSystemPromptMbakAI({
    memories,
    wiki,
    name,
    userId,
    timestamp
  })

  const completion = await groqChatCompletion({
    messages: [
      {
        id: '-1',
        role: "system",
        content: systemPrompt,
      },
      ...messages.map((data: any, idx: number) => ({ id: `${idx}`, role: data.role, content: data.content, name: data.role === 'user' ? name : "Mbak AI" }))
    ],
    model: "llama-3.1-70b-versatile",
  });

  const abstraction = await memoryAbstractionMbakAI(input, messages, depth - 1, {
    wiki,
    name,
    userId,
    timestamp,
    recall: completion,
    memory: [...memory, ...result],
    system: systemPrompt
  })

  const { response } = abstraction

  keywords = [...keywords, ...abstraction.keywords]
  
  if (depth === 2) {
    const keywordsAdd = await findInfluentialTokens(response)
    keywords = [...keywords, ...keywordsAdd]
    vector = await getEmbedding(keywords.join(", "))
  }

  if (depth > 2) {
    vector = abstraction.vector
  }

  return { response, vector, keywords, systemPrompt: abstraction.systemPrompt }
}