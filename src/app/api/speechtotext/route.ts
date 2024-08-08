
import errorHandler from "@/libs/error"
import { speechToText } from "@/libs/speechtotext"

export const runtime = "edge";

async function handler(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const id = formData.get("id") as string;

  
  if (name !== process.env.USER_NAME || id !== process.env.USER_ID) {
    throw new Error("Unauthorized")
  }

  const transcription = await speechToText(file)

  return Response.json(transcription.text);
}

export const POST = errorHandler(handler);