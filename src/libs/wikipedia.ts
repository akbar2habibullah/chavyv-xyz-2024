import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run"
import { findInfluentialTokens } from "./attention"
import { appendLog } from "./log"
import { trimStringToMaxLength } from "./string"

export async function queryWikipedia(input: string) {
  const keywords = await findInfluentialTokens(input)

  let wiki = ""

  try {
      const tool = new WikipediaQueryRun({
          topKResults: 2,
          maxDocContentLength: 1000,
      })

      wiki = await tool.invoke(keywords.join(" "))

      await appendLog(`queryWikipedia success with retrieval: ${trimStringToMaxLength(wiki)}`)
  } catch(e: any) {
      console.error(e.message)
  }

  return wiki
}