import type { Message } from "ai/react"

export function ChatMessageBubble(props: { message: Message; sender: string }) {
	const colorClassName = props.message.role === "user" ? "bg-[#FB7C33]" : "bg-white text-black"
	const alignmentClassName = props.message.role === "user" ? "ml-auto" : "mr-auto"
	return (
		<div className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}>
			<div className="mr-2">{props.sender}:</div>
			<div className="whitespace-pre-wrap flex flex-col">
				<span>{props.message.content}</span>
			</div>
		</div>
	)
}
