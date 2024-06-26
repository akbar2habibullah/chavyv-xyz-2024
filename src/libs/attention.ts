import cosineSimilarity from 'compute-cosine-similarity';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004"});

import OpenAI from "openai"
import Groq from "groq-sdk"

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
})


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
		model: "gemma-7b-it",
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
		model: "gemma-7b-it",
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

// Function to create prompt variants
function createVariants(prompt: string) {
  const words = splitSentenceIntoParts(prompt);
  return words.map((word, index) => {
    const replaced = words.slice();
    replaced[index] = '<placeholder>';
    return replaced.join(' ');
  });
}

// Function to split paragraph into sentences
function splitIntoSentences(paragraph: string) {
  return paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
}

function splitSentenceIntoParts(sentence: string): string[] {
  // Split the sentence into words
  const words = sentence.split(' ');

  // Calculate the number of parts (max 30)
  const numParts = Math.min(words.length, 30);

  // Calculate the size of each part
  const partSize = Math.ceil(words.length / numParts);

  // Initialize an array to hold the parts
  const parts: string[] = [];

  // Divide the words into parts and join them into strings
  for (let i = 0; i < words.length; i += partSize) {
      parts.push(words.slice(i, i + partSize).join(' '));
  }

  return parts;
}

// Function to find the most influential tokens for a sentence
export async function findInfluentialTokensForSentence(sentence: string, options: { systemPrompt?: string, threshold: number} ) {
  const { systemPrompt, threshold } = options
  const baseResponse = systemPrompt ? await generateResponseWithSystemPrompt(sentence, systemPrompt) : await generateResponse(sentence);
  const baseEmbedding = await getEmbedding(baseResponse);
  const variants = createVariants(sentence);
  const variantOutputs = await Promise.all(variants.map((str) => systemPrompt ? generateResponseWithSystemPrompt(str, systemPrompt) : generateResponse(str)));
  const variantEmbeddings = await Promise.all(variantOutputs.map(str => getEmbedding(str)));
  const baseVec = baseEmbedding;
  const distances = variantEmbeddings.map(variantVec => {
    const similarity = cosineSimilarity(baseVec, variantVec) || 0;
    return 1 - similarity;
  });
  const sortedIndices = distances
    .map((distance, index) => ({ distance, index }))
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 3)
    .map(item => item.index);
  const maxDistances = sortedIndices.map(index => distances[index]);
  const thresholdDistances = maxDistances.map(distance => distance * (1 - threshold));
  const words = splitSentenceIntoParts(sentence);
  const influentialTokens = new Set();
  sortedIndices.forEach((topIndex, i) => {
    influentialTokens.add(words[topIndex]);
    words.forEach((word, index) => {
      if (distances[index] >= thresholdDistances[i]) {
        influentialTokens.add(word);
      }
    });
  });
  const orderedInfluentialTokens = words.filter(word => influentialTokens.has(word));
  return orderedInfluentialTokens;
}

// Main function to process each sentence in a paragraph
export async function findInfluentialTokensInParagraph(paragraph: string, systemPrompt?: string) {
  const sentences = splitIntoSentences(paragraph);
  const influentialTokensArray = await Promise.all(sentences.map(sentence => findInfluentialTokensForSentence(sentence, { systemPrompt, threshold: 0.20})));
  console.log(`Influential tokens array: ${JSON.stringify(influentialTokensArray, null, 2)}`);

  return influentialTokensArray
}