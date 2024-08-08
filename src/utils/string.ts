import { dateNow } from "./date"
import { MetadataChat, MetadataMbakAI } from "./upstash"
import { getUUID } from "./uuid"

export function trimNewlines(input: string): string {
  return input.replace(/^\s+|\s+$/g, '');
}

export function trimStringToMaxLength(input: string, maxLength = 100): string {
  if (input.length <= maxLength) {
      return input;
  }
  return input.substring(0, maxLength) + "...";
}

export function wrapMemory(memory: MetadataChat[], name: string): string {
  let memories = ``;

  for (let i = 0; i < memory.length; i++) {
    const responseParsed = `${name}: ${memory[i]?.input}\n
Me: ${memory[i]?.output}\n`

    memories += `Conversation I remember from ${memory[i]?.timestamp} with ${name}:\n${responseParsed}\n\n`;
  }

  return memories
}

export function wrapSystemPrompt({ memories = "There's no memory yet", timestamp = dateNow(), name = "Anonymous User" }): string {
  const systemPrompt = `${process.env.AGENT_EGO}
  ${memories}
  Timestamp for now is ${timestamp}.
  And I'm currently in online conversation with ${name} via text chat interface.`;

  return systemPrompt
}

export function wrapMemoryMbakAI(memory: MetadataMbakAI[]): string {
  let memories = ``;

  for (let i = 0; i < memory.length; i++) {
    const responseParsed = `${memory[i].name}#${memory[i]?.userId}: ${memory[i]?.input}\n
      Me: ${memory[i]?.output}\n`

    memories += `Conversation I remember from ${memory[i]?.timestamp} with ${memory[i]?.name}#${memory[i]?.userId}:\n${responseParsed}\n\n`;
  }

  return memories
}

export function wrapSystemPromptMbakAI({ memories = "There's no memory yet", wiki = "", timestamp = dateNow(), name = "Anonymous User", userId = getUUID() }): string {
  const systemPrompt = `${process.env.MBAK_AI_EGO_1}

I have memory and I remember this interaction in the past with various people or source of information I interacted with:
${memories}

${
	wiki !== ""
		? `I also have knowledge about a certain topic that I recall, I remember reading wikipedia articles like this:

${wiki}`
		: ""
}
${process.env.MBAK_AI_EGO_2}
Timestamp for now is ${timestamp}.
And I'm currently in online conversation with ${name}#${userId} via text chat interface.`;

  return systemPrompt
}