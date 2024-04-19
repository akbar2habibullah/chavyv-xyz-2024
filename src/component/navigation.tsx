"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import splitbee from "@splitbee/web"

const Navigation: React.FC = () => {
	const navItems = [{ label: "HOME" }, { label: "ABOUT" }, { label: "RESUME" }, { label: "BLOG" }, { label: "CONTACTS" }]
	const pathname = usePathname()

	useEffect(() => {
		splitbee.init()
	})

	return (
		<nav className="flex fixed bottom-0 left-0 right-0 justify-center items-center px-16 py-4 w-full text-xl text-center whitespace-nowrap border border-solid backdrop-blur-[10.199999809265137px] bg-stone-900 bg-opacity-70 border-stone-900 border-opacity-10 max-md:px-5 max-md:py-5 max-md:max-w-full max-md:text-xs">
			<ul className="flex gap-5 items-center p-1 max-w-full rounded-md border-white border-solid bg-orange-400 bg-opacity-0 border-[2px] max-md:gap-1">
				{navItems.map((item, index) => (
					<Link href={`/${item.label === "HOME" ? "" : item.label.toLowerCase()}`} key={index}>
						<li className={`self-stretch my-auto justify-center py-1 px-2 max-md:px-1 transition duration-500 border-transparent hover:border-white border-solid border-[3px] rounded ${"/" + item.label.toLowerCase() === pathname || (item.label.toLowerCase() === "home" && pathname === "/") ? "bg-white text-stone-900 border-white border-solid border-[3px]" : "bg-transperent"}`}>{item.label}</li>
					</Link>
				))}
			</ul>
		</nav>
	)
}

export default Navigation
