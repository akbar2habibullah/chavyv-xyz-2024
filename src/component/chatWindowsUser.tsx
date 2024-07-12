"use client"

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { Message, useChat } from "ai/react"
import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"

import { ChatMessageBubble } from "@/component/chatMessageBubble"

const trimMessage = (message: Message[]) => {
	return message.slice(-500, message.length)
}

export function ChatWindowUser(props: { endpoint: string; placeholder?: string; name: string; id: string }) {
	const messageContainerRef = useRef<HTMLDivElement | null>(null)

	const { endpoint, placeholder } = props
	const [loading, setLoading] = useState<boolean>(false)
	const [bufferedMessages, setBufferedMessages] = useState<Message[]>([])

	const { messages, input, setInput, handleInputChange, setMessages } = useChat({
		api: endpoint,
		onError: (e) => {
			toast(e.message, {
				theme: "dark",
			})
		},
	})

	useEffect(() => {
		console.log(bufferedMessages)
		console.log(messages)
		if (bufferedMessages.length > 0 && bufferedMessages[bufferedMessages.length - 1].content.includes("[Output]")) {
			const outputMessage = bufferedMessages[bufferedMessages.length - 1].content.split("[Output]")[1]
			const idMessage = bufferedMessages[bufferedMessages.length - 1].content.split("[Output]")[2]
			messages[messages.length - 1].id = `${idMessage}-1`
			const newMessages = trimMessage([...messages, { id: `${idMessage}-2`, content: outputMessage, role: "assistant" }])
			setMessages(newMessages)
			setBufferedMessages([])
			setLoading(false)
		} else if (bufferedMessages.length > 0 && bufferedMessages[bufferedMessages.length - 1].content.includes("[Error]")) {
			toast( bufferedMessages[bufferedMessages.length - 1].content.split("[Error]")[1], {
				theme: "dark",
			})
			setBufferedMessages([])
			setLoading(false)
		}
	}, [bufferedMessages, messages, setMessages])

	async function sendMessage(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()

		if (messageContainerRef.current) {
			messageContainerRef.current.classList.add("grow")
		}
		if (!messages.length) {
			await new Promise((resolve) => setTimeout(resolve, 300))
		}
		setLoading(true)
		const messagesWithUserReply = messages.concat({ id: messages.length.toString(), content: input, role: "user" })
		setMessages(messagesWithUserReply)
		setInput("")
		const response = await fetch(endpoint, {
			method: "POST",
			body: JSON.stringify({
				messages: messagesWithUserReply,
				user: props.name || "Anonymous User",
				user_id: props.id,
			}),
		})

		const reader = response.body?.getReader()
		const decoder = new TextDecoder("utf-8")

		if (reader) {
			let buffer = ""
			
			while (true) {
				const { done, value } = await reader.read()
				if (done) break;
				buffer += decoder.decode(value, { stream: true })
			}

			// Final part of buffer
			if (buffer) {
				setBufferedMessages((prev) => [
					...prev,
					{ id: prev.length.toString(), content: buffer, role: "assistant" },
				])
			}
		}
	}

	async function ingest() {
		setLoading(true)

		const response = await fetch("/api/ingest", {
			method: "POST",
			body: JSON.stringify({
				user: props.name || "Anonymous User",
				user_id: props.id,
			}),
		})

		const json = await response.json()

		if (response.status === 200) {
			setMessages(trimMessage([...json.output]))
			setLoading(false)
		} else {
			toast(json.error, {
				theme: "dark",
			});
			setLoading(false);
			throw new Error(json.error)
		}
	}

	useEffect(() => {
		console.log(messages)
	}, [messages])

	return (
		<div className={`relative flex flex-col items-center p-4 rounded grow overflow-hidden h-full`}>
			<h2 className={`${messages.length > 0 ? "" : "hidden"} text-2xl text-[#1E1E1E] mt-4`}>🦋</h2>
			{messages.length === 0 ? (
				<div onClick={ingest} className="p-4 md:p-8 rounded text-[#FB7C33] overflow-hidden cursor-pointer">
					<h1 className="text-3xl md:text-4xl">Load 🦋</h1>
				</div>
			) : (
				""
			)}
			<div className="flex flex-col-reverse w-full overflow-auto transition-[flex-grow] ease-in-out" ref={messageContainerRef}>
				{messages.length > 0
					? [...messages].reverse().map((m, i) => {
							return <ChatMessageBubble key={m.id} message={m} sender={m.role === "assistant" ? "🦋" : `${props.name}`}></ChatMessageBubble>
					  })
					: ""}
			</div>
			<form onSubmit={sendMessage} className="flex w-full flex-col">
				<div className="flex w-full items-center">
					<textarea
						className="grow mr-2 p-4 rounded text-black"
						rows={4}
						value={input}
						placeholder={messages.length === 0 ? placeholder : ""}
						onChange={handleInputChange}
					/>
					<button type="submit" className="shrink-0 p-2 h-min">
						<div role="status" className={`${loading ? "" : "hidden"} flex justify-center`}>
							<svg
								aria-hidden="true"
								className="w-6 h-6 text-white animate-spin fill-[#FB7C33]"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
								<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
							</svg>
						</div>
						<span className={loading ? "hidden" : ""}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-send text-[#FB7C33]/50 hover:text-[#FB7C33]"
							>
								<path d="m22 2-7 20-4-9-9-4Z" />
								<path d="M22 2 11 13" />
							</svg>
						</span>
					</button>
				</div>
			</form>
			<ToastContainer />
		</div>
	);
}
