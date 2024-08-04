import Groq from "groq-sdk";

export const runtime = "edge";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const id = formData.get("id") as string;

  
  if (name !== process.env.USER_NAME || id !== process.env.USER_ID) {
    throw new Error("Unauthorized")
  }

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    prompt: "Specify context or spelling", // Optional
    response_format: "json", // Optional
    language: "id", // Optional
    temperature: 0.0, // Optional
  });

  return Response.json(transcription.text);
}