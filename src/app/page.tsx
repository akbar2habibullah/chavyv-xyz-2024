"use client"

import HeroSection from "@/component/hero"
import { TypeAnimation } from "react-type-animation"

export default function Home() {
	return (
		<HeroSection backgroundImage="/images/hero-background.png">
			<h1>
				I AM A(N)
				<br />
				<span className="text-white bg-[#FB7C33] rounded">
					<TypeAnimation sequence={["ARCH WIZARD 🧙‍♂️", 1000, "SOFTWARE ENGINEER 👨‍💻", 1000, "MACHINE LEARNING ENGINEER 🤖", 1000, "CONTENT CREATOR 😎", 1000, "FOUNDER 💡", 1000, "LIVESTREAMER 🎮", 1000]} speed={50} repeat={Infinity} />
				</span>
				<br />
				YOU CAN CALL ME HABIB<span className="text-white">ULLAH AKBAR</span>
			</h1>
		</HeroSection>
	)
}
