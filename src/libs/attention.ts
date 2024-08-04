import { GoogleGenerativeAI } from "@google/generative-ai";

import { groq } from './groq';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004"});

import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_KEY,
})

async function groqChatCompletion(input: string) {
	return groq.chat.completions.create({
		messages: [
			{
				role: "user",
				content: input,
			},
		],
		model: "llama3-8b-8192",
    max_tokens: 256
	})
}

async function groqChatCompletionWithSystemPrompt(systemPrompt: string, input: string) {
	return groq.chat.completions.create({
		messages: [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: input,
			},
		],
		model: "llama3-8b-8192",
    max_tokens: 256
	})
}

async function openRouterChatCompletion(input: string) {
	return openai.chat.completions.create({
    model: "lynn/soliloquy-l3",
    messages: [
      { role: "user", content: input}
    ],
  })
}

async function openRouterChatCompletionWithSystemPrompt(systemPrompt: string, input: string) {
	return await openai.chat.completions.create({
    model: "lynn/soliloquy-l3",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input }
    ],
  })
}

// Function to generate response from Groq
export async function generateResponse(prompt: string, openrouter: boolean = false) {
  if (openrouter) {
    const result = await openRouterChatCompletion(prompt)

    return result.choices[0]?.message?.content || "" as unknown as string;
  }

  const result = await groqChatCompletion(prompt)

  return result.choices[0]?.message?.content || "" as unknown as string;
}

// Function to generate response from Groq with system prompt
export async function generateResponseWithSystemPrompt(systemPrompt: string, prompt: string, openrouter: boolean = false) {
  if (openrouter) {
    const result = await openRouterChatCompletionWithSystemPrompt(systemPrompt, prompt)

    return result.choices[0]?.message?.content || "" as unknown as string;
  }
  const result = await groqChatCompletionWithSystemPrompt(systemPrompt, prompt)

  return result.choices[0]?.message?.content || "" as unknown as string;
}


// Function to get embedding from Google text embedding
export async function getEmbedding(text: string) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// Function to find the most influential tokens for a sentence
export async function findInfluentialTokensForSentence(sentence: string) {
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
    "model": "llama3-70b-8192",
    "temperature": 0.9,
    "top_p": 1,
    "stream": false,
    "response_format": {
      "type": "json_object"
    },
    "stop": null
  });

  const { influential_words } = JSON.parse(chatCompletion.choices[0].message.content);

  console.log(influential_words)

  return influential_words.length > 0 ? influential_words : sentence.split(" ").length < 4 ? sentence.split(" ") : [] ;
}