import { NextRequest, NextResponse } from "next/server";
import { findInfluentialTokens } from "@/libs/attention";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run"
import { trimNewlines } from "@/libs/string";
import { getUUID } from "@/libs/uuid"
import { dateNow } from "@/libs/date"
import { groqChatCompletion } from "@/libs/groq"
import { addChatHistoryMbakAI, addVectorDBEntryMbakAI, getRetrievalMbakAI } from "@/libs/upstash"

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const messages = body.messages.slice(-25) ?? [];
        const name: string = body.user ?? "Anonymous User";
        const id: string = body.user_id ?? getUUID();

		messages[messages.length - 1].id = getUUID()

        const currentMessageContent = messages[messages.length - 1].content;

        const timestamp = dateNow()

        const preresponse = await groqChatCompletion(
            [
                {   
                    id: '1',
                    role: "system",
                    content: process.env.PRE_PROMPT!,
                },
                {   
                    id: '2',
                    role: "user",
                    content: messages[messages.length - 1].content,
                },
            ],
            "mixtral-8x7b-32768"
        )

        let wikires = ""

        try {
            const tool = new WikipediaQueryRun({
                topKResults: 2,
                maxDocContentLength: 1000,
            })

            wikires = preresponse !== "(No keywords)" ? await tool.invoke(preresponse) : ""
        } catch(e: any) {
            console.error(e.message)
        }

        const inputKeyWords = await findInfluentialTokens(currentMessageContent);
        const inputKeyWordsString = inputKeyWords.join(", ");

        const { result, vector : inputVector} = await getRetrievalMbakAI(inputKeyWordsString)

        let memories = ``;

        for (let i = 0; i < result.length; i++) {
            const responseParsed = `${result[i].name}#${result[i]?.userId}: ${result[i]?.input}\n
                Me: ${result[i]?.output}\n`

            memories += `Conversation I remember from ${result[i]?.timestamp} with ${result[i]?.name}#${result[i]?.userId}:\n${responseParsed}\n\n`;
        }

        const SYSTEM_PROMPT = `${process.env.MBAK_AI_EGO_1}

I have memory and I remember this interaction in the past with various people or source of information I interacted with:
${memories || "There's no memory yet"}

${
	wikires !== ""
		? `I also have knowledge about a certain topic that I recall, I remember reading wikipedia articles like this:

${wikires}`
		: ""
}
${process.env.MBAK_AI_EGO_2}
Timestamp for now is ${timestamp}.
And I'm currently in online conversation with ${name}#${id} via text chat interface.`;

        const completion = await groqChatCompletion(
            [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                ...messages.map((data: any) => ({ role: data.role, content: data.content, name: data.role === 'user' ? name : "Mbak AI" }))
            ],
            "llama3-70b-8192",
        );

        const response = trimNewlines(completion);

        await addVectorDBEntryMbakAI({
            id: messages[messages.length - 1].id,
            vector: inputVector,
            metadata: {
                name,
                userId: id,
                wikipedia: wikires,
                keywords: inputKeyWords,
                input: currentMessageContent,
                output: response,
                timestamp,
                systemPrompt: SYSTEM_PROMPT,
                messages,
            }
        })

        await addChatHistoryMbakAI(messages[messages.length - 1].id)

        return NextResponse.json({}, { status: 200 })
    } catch (e: any) {
        console.error(e.message)
        
		return NextResponse.json({ error: e.message }, { status: e.status ?? 500 })
    }
}
