import { Redis } from '@upstash/redis';
import { Index } from "@upstash/vector";

export const redis = new Redis({
  url: process.env.REDIS_MASTER_LINK,
  token: process.env.REDIS_MASTER_TOKEN,
});

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
  const history = await redis.get<string[]>("chatHistory") || [];

  history.push(uuid)

  return await redis.set("chatHistory", history)
}

export async function getChunkHistory(uuid: string, lengthBefore: number = - 1, lengthAfter: number = 2) {
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
  const history = await redis.get<string[]>("chatHistoryMbakAI") || [];

  history.push(uuid)

  return await redis.set("chatHistoryMbakAI", history)
}