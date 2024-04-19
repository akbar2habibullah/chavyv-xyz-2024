import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/component/navigation"
import Chat from "@/component/chat"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Chavyv Akvar Web",
	description: "This is a portfolio website for Chavyv Akvar aka Habibullah Akbar",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<Head>
				<script async src="https://cdn.splitbee.io/sb.js"></script>
			</Head>
			<body className={inter.className}>
				<main className="flex flex-col justify-center font-bold text-white bg-white">
					{children}
					<Navigation />
					<Chat />
				</main>
			</body>
		</html>
	)
}
