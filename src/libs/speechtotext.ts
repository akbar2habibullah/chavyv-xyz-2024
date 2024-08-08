import { groq } from "./groq";
import { appendLog } from "./log"
import { trimStringToMaxLength } from "./string"

export async function speechToText(file: File, language: string = 'id', prompt: string = 'Specify context or spelling') {

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    prompt,
    response_format: "json",
    language,
  });

  
  await appendLog(`speechToText success with response: ${trimStringToMaxLength(transcription.text)}`)

  return transcription;
}