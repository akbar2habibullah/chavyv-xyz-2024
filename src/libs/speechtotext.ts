import { groq } from "./groq";

export async function speechToText(file: File) {

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    prompt: "Specify context or spelling", // Optional
    response_format: "json", // Optional
    language: "id", // Optional
    temperature: 0.0, // Optional
  });

  return transcription;
}