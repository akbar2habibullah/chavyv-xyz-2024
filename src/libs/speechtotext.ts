import { groq } from "./groq";

export async function speechToText(file: File, language: string = 'id', prompt: string = 'Specify context or spelling') {

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    prompt,
    response_format: "json",
    language,
  });

  return transcription;
}