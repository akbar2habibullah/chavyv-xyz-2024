import { dateNow } from "./date"
import { redis } from "./upstash";

export async function appendLog(log: string, maxLength = 1000) {
  const length = await redis.lpush("log", `[${dateNow()}] ${log}`); 

  if (length > maxLength) {
    await redis.rpop("log");
  }
}