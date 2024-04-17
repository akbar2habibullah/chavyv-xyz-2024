"use client"

import { ChatWindow } from "@/component/chatWindow"
import { useState } from "react"
import ShortUniqueId from "short-unique-id"

const Chat: React.FC = () => {
	const [show, setShow] = useState<boolean>(false)
	const [dialog, setDialog] = useState<boolean>(false)

	const [name, setName] = useState<string>("Anonymous User")
	const [id, setId] = useState<string>(new ShortUniqueId({ length: 5 }).rnd())

	return (
		<>
			<div className={`fixed right-10 top-10 max-md:right-5 max-md:top-5 cursor-pointer ${show || dialog ? "hidden" : ""}`} onClick={() => setDialog(true)}>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bot hover:text-[#1E1E1E] hover:scale-150">
					<path d="M12 8V4H8" />
					<rect width="16" height="12" x="4" y="8" rx="2" />
					<path d="M2 14h2" />
					<path d="M20 14h2" />
					<path d="M15 13v2" />
					<path d="M9 13v2" />
				</svg>
			</div>
			<div className={`fixed right-10 top-10 w-[250px] max-md:max-w-full rounded bg-white/80 z-40 p-4 ${dialog ? "" : "hidden"}`}>
				<div className={`absolute top-5 right-5 z-50 cursor-pointer`} onClick={() => setDialog(false)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-x hover:text-[#1E1E1E]">
						<circle cx="12" cy="12" r="10" />
						<path d="m15 9-6 6" />
						<path d="m9 9 6 6" />
					</svg>
				</div>
				<br />
				<h2 className="text-[#FB7C33] text-xl text-center">
					Chat bareng
					<br />
					Mbak AI 🙋‍♀️
				</h2>
				<br />
				<input
					onChange={(e) => {
						if (e.target.value === "") {
							setName("Anonymous User")
							setId(new ShortUniqueId({ length: 5 }).rnd())
						} else {
							const value = e.target.value.split("#")
							if (value.length > 1) {
								setId(value[1])
								setName(value[0])
							} else {
								setName(value[0])
							}
						}
					}}
					className="w-full rounded px-4 py-2 text-center text-[#1E1E1E]"
					placeholder="Input your name"
				/>
				<div className="text-[#1E1E1E] text-center my-4">Or leave blank to be Anonymous user</div>
				<button
					className="bg-[#FB7C33] hover:bg-[#FB7C33]/80 px-4 py-2 rounded w-full"
					onClick={() => {
						setShow(true)
						setDialog(false)
					}}
				>
					Submit
				</button>
			</div>
			<div className={`fixed right-10 top-10 w-[500px] h-[80vh] max-md:h-[85vh] max-md:max-w-full rounded bg-white/80 z-40 max-md:inset-0 ${show ? "" : "hidden"}`}>
				<div className={`absolute top-5 right-5 z-50 cursor-pointer`} onClick={() => setShow(false)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-x hover:text-[#1E1E1E]">
						<circle cx="12" cy="12" r="10" />
						<path d="m15 9-6 6" />
						<path d="m9 9 6 6" />
					</svg>
				</div>
				<ChatWindow endpoint="/api/chat" name={name} id={id} placeholder="Hi, I am an AI Agent behind this website, you can call me Mbak AI. What's your name?"></ChatWindow>
			</div>
		</>
	)
}

export default Chat
