import { groq } from './groq';
import { appendLog } from './log'

// Function to find the most influential tokens for a sentence
export async function findInfluentialTokens(sentence: string) {
  const chatCompletion = await groq.chat.completions.create({
    "messages": [
      {
        "role": "system",
        "content": "You are a word extractor API capable of extracting the most influential words in user input that respond in JSON. The JSON schema should include\n{\n  \"influential_words\": [...]\n}"
      },
      {
        "role": "user",
        "content": sentence
      }
    ],
    "model": "llama-3.1-70b-versatile",
    "temperature": 0.9,
    "top_p": 1,
    "stream": false,
    "response_format": {
      "type": "json_object"
    },
    "stop": null
  });

  const { influential_words } = JSON.parse(chatCompletion.choices[0].message.content);

  await appendLog(`findInfluentialTokens success with tokens: [${influential_words.join(", ")}]`)

  return influential_words.length > 0 ? influential_words : sentence.split(" ").length < 4 ? sentence.split(" ") : [] ;
}