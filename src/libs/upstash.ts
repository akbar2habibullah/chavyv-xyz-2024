import { Redis } from '@upstash/redis';
import { Index } from "@upstash/vector";
import { Client } from "@upstash/qstash";
import { Message } from 'ai'

import { getEmbedding } from './googleAI'
import { findInfluentialTokens } from './attention'
import { appendLog } from './log'

const queue = new Client({ token: process.env.QSTASH_TOKEN! });

export const redis = new Redis({
  url: process.env.REDIS_MASTER_LINK,
  token: process.env.REDIS_MASTER_TOKEN,
});

export const redisMbakAI = new Redis({
  url: process.env.REDIS_MBKAI_LINK,
  token: process.env.REDIS_MBKAI_TOKEN,
})

export const vectorMbakAI = new Index({
  url: process.env.VECTOR_LINK_MBAK_AI,
  token: process.env.VECTOR_TOKEN_MBAK_AI,
});

export const vector = new Index({
  url: process.env.VECTOR_LINK,
  token: process.env.VECTOR_TOKEN,
});

export async function getChatHistoryIds(length?: number): Promise<string[]> {
  const history = await redis.get<string[]>("chatHistory") || [];

  if (length) {
    return history.slice(-length);
  }

  return history;
}

export async function getChatHistory(length: number = 25) {
  const historyIds: string[] = await getChatHistoryIds(length)

  const history = await vector.fetch(historyIds, { includeMetadata: true });

  return history
}

export async function addChatHistory(uuid: string) {
  await redis.rpush("chatHistory", uuid)

  await appendLog(`addChatHistory success with id: ${uuid}`)
}

export async function getChunkHistory({ uuid, lengthBefore = - 1, lengthAfter = 2 }: {uuid: string, lengthBefore: number, lengthAfter: number}) {
  const history = await redis.get<string[]>("chatHistory") || [];

    const idx = history.indexOf(uuid);
    if (idx === -1) {
        throw new Error('ID not found in the ordered array');
    }

    const startIndex = Math.max(0, idx - 1);
    const endIndex = Math.min(history.length - lengthBefore, idx + lengthAfter);

    const chunkIds = history.slice(startIndex, endIndex + 1);

    const chunkData = await vector.fetch(chunkIds, { includeMetadata: true });

    return chunkData;
}

export async function addChatHistoryMbakAI(uuid: string) {
  await redis.rpush("chatHistoryMbakAI", uuid)

  await appendLog(`addChatHistoryMbakAI success with id: ${uuid}`)
}

export interface MetadataMbakAI { 
  messages: Message[],
  name: string,
  systemPrompt: string,
  timestamp: string,
  input: string,
  output: string,
  keywords: string[],
  wikipedia: string,
  userId: string,
}

export async function getRetrievalMbakAI(string: string, length: number = 2) {
  const vector = await getEmbedding(string)

  const retrieval = await vectorMbakAI.query({
    vector,
    topK: length,
  });

  const queryIds = retrieval.map((data) => `chat-${data.id}`)

  const result: MetadataMbakAI[] = await redis.mget(...queryIds)

  await appendLog(`getRetrievalMbakAI success with retrieval: [${queryIds.join(", ")}]`)

  return { result, vector }
}

export async function addVectorDBEntryMbakAI({id, vector, metadata: { userId, messages, name, systemPrompt, timestamp, input, output, keywords, wikipedia }}: { id: string, vector: number[], metadata: MetadataMbakAI}) {

  await vectorMbakAI.upsert({
    id,
    vector,
  });

  await redisMbakAI.set(`chat-${id}`, {
    id,
    username: name,
    userId: userId,
    wikipedia,
    keywords,
    input,
    output,
    timestamp,
    systemPrompt,
    messages,
  })

  await appendLog(`addVectorDBEntryMbakAI success with insertion: chat-${id}`)
}

export async function getMemoryMbakAI(input: string) {
  const keywords = await findInfluentialTokens(input);

  const retrieval = await getRetrievalMbakAI(keywords.join(", "))

  return { ...retrieval, keywords }
}