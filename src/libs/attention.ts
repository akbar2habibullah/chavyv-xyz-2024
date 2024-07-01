import cosineSimilarity from 'compute-cosine-similarity';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004"});


import Groq from "groq-sdk"

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
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
	})
}

// Function to generate response from Groq
export async function generateResponse(prompt: string) {
  const result = await groqChatCompletion(prompt)

  return result.choices[0]?.message?.content || "" as unknown as string;
}

// Function to generate response from Groq with system prompt
export async function generateResponseWithSystemPrompt(systemPrompt: string, prompt: string, ) {
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
  const words = prompt.split(' ');
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

// Function to find the most influential tokens for a sentence
export async function findInfluentialTokensForSentence(sentence: string, options: { systemPrompt?: string, threshold: number} ) {
  const { systemPrompt, threshold } = options
  const baseResponse = systemPrompt ? await generateResponseWithSystemPrompt(sentence, systemPrompt) : await generateResponse(sentence);
  const baseEmbedding = await getEmbedding(baseResponse);
  const variants = createVariants(sentence);
  const variantOutputs = await Promise.all(variants.map(str => systemPrompt ? generateResponseWithSystemPrompt(str, systemPrompt) : generateResponse(str)));
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
  const words = sentence.split(' ');
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