"use client"

import HeroSection from "@/component/hero"
import { TypeAnimation } from "react-type-animation"

export default function About() {
	return (
		<HeroSection backgroundImage="/images/background.png">
			<h1>
				HELLO, MY NAME IS <span className="bg-[#FB7C33] text-white rounded">HABIB</span>ULLAH AKBAR!
			</h1>
			<h2 className="text-5xl max-md:text-2xl">BUT YOU CAN CALL ME HABIB</h2>
			<br />
			<h1 className="h-[10rem]">
				I AM AN
				<br />
				ARCH WIZARD 🧙‍♂️
			</h1>
			<br />
			<h2 className="text-white text-5xl max-md:text-2xl">
				<span className="bg-[#FB7C33] rounded">Why I am an Arch Wizard?</span>
			</h2>
			<br />
			<p className="text-4xl max-md:text-2xl">Imagine this, you stumbled upon the medieval era where there were dragons 🐲, elves 🧝‍♀️, fairies 🧚‍♀️, knights ⚔️, castles 🏰, and magical creatures 🪄. You remember an eccentric man living in a crumbling tower outside the crowds, who can spell magic very well. This man is different from other wizards, he doesn&apos;t have any recognition from the official academy 🧑‍🎓 despite having a technique better than most of the wizards you often find and being highly knowledgeable about magic and the world.</p>
			<br />
			<p className="text-4xl max-md:text-2xl">He lives outside society and rarely shows his existence to ordinary people but to one insistent student. He typically refuses any apprentices but somehow accepts for this one student. He does his daily with eccentrics and unconventionally, learning magic in unorthodox ways as his habit 🦉, making his potential power unpredictable and unknown, both to him 🧙‍♂️ and the world 🌏.</p>
			<br />
			<h1 className="h-[10rem]">
				I AM ALSO A
				<br />
				<TypeAnimation sequence={["SOFTWARE ENGINEER 👨‍💻", 1000, "MACHINE LEARNING ENGINEER 🤖", 1000, "CONTENT CREATOR 😎", 1000, "FOUNDER 💡", 1000, "LIVESTREAMER 🎮", 1000]} speed={50} repeat={Infinity} />
			</h1>
			<br />
			<br />
			<p className="text-5xl max-md:text-2xl">
				I am a Software Engineer from Indonesia 🇮🇩. Having expertise in <span className="bg-[#FB7C33] text-white rounded">web development</span> 🕸️, <span className="bg-[#FB7C33] text-white rounded">cloud infrastructure</span> ☁️, <span className="bg-[#FB7C33] text-white rounded">machine learning engineering</span> 🤖, and software engineering in general 👨‍💻️. I have a progressive career as a software engineer with solid experience working in some <span className="bg-[#FB7C33] text-white rounded">overseas companies</span> 🌐️.
			</p>
			<br />
			<p className="text-5xl max-md:text-2xl">If I have to explain myself, I would describe myself as a person who has enough many ideas 💡, creativity 👾, and intuition 💭 to solve unique problems in any situation. That also mentions that I&apos;m being able to be analytical 📊 and logical 🤔 at the moment.</p>
			<br />
			<p className="text-5xl max-md:text-2xl">
				I have a high level of interest and passion in the fields of science 🚀, mathematics 🧮, and of course, technology 🤖. My life motto is <span className="bg-[#FB7C33] text-white rounded">&quot;Speak less 😇, talk more 🫶, and do my best 🙌&quot;</span>.
			</p>
			<br />
			<div className="text-5xl max-md:text-2xl">
				<h2>For those who understand, this is my complete typology:</h2>
				<br />
				<br />
				<ul className="text-4xl max-md:text-xl list-disc px-8 max-md:px-4">
					<li>
						My Big 5 SLOAN:{" "}
						<a className="bg-[#FB7C33] text-white hover:text-[#1E1E1E] hover:underline rounded" href="https://bigfive-test.com/result/6518f63cb5a6690008ec8f70">
							/R/coe[I]
						</a>
					</li>
					<li>
						My Socionics type:{" "}
						<a className="bg-[#FB7C33] text-white hover:text-[#1E1E1E] hover:underline rounded" href="https://sociotype.xyz/ydMAZNboZI=2fX3B">
							ILI-Ni
						</a>
					</li>
					<li>
						My HEXACO assesment{" "}
						<a className="bg-[#FB7C33] text-white hover:text-[#1E1E1E] hover:underline rounded" href="https://survey.ucalgary.ca/jfe/form/SV_3eH9wXVMVLxCsHs?wAtt=&wInc=&wOus=&h0to4=6.04,5.96,6.12,2.93&e0to4=5,4.18,3.86,2.28&x0to4=4.9,3.23,2.34,4.98&a0to4=6.19,4.36,4.6,7.05&c0to4=3.64,4.25,3.38,7.1&o0to4=5.87,6.53,6.09,7.43&i0=3.32&hexaco=5.51,3.33,3.4,5.87,4.37,6.91">
							result
						</a>
					</li>
					<li>My Temprament: Phlegmatic</li>
					<li>My Enneagram Tritype: Type 549</li>
					<li>My DISC Type: CD</li>
					<li>My Moral Alignment: True Neutral</li>
					<li>
						My IQ Test:{" "}
						<a className="bg-[#FB7C33] text-white hover:text-[#1E1E1E]  hover:underline rounded" href="https://brght.org/profile/habibullah-akbar-1/">
							138
						</a>
					</li>
				</ul>
			</div>
			<br />
			<p className="text-5xl max-md:text-2xl text-center">And by the way...</p>
			<br />
			<h2 className="text-5xl text-center max-md:text-2xl">
				<span className="bg-[#FB7C33] text-white rounded">I AM ALSO A CONTENT CREATOR</span>
			</h2>
			<br />
			<div className="flex justify-center">
				<iframe width="560" height="315" src="https://www.youtube.com/embed/ssKgjqJsZKw?si=CRXFjLVExaEF5UNE" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
			</div>
			<br />
			<p className="text-5xl text-center max-md:text-2xl">
				THIS IS{" "}
				<a className="hover:bg-[#FB7C33] hover:text-white hover:underline rounded" href="https://www.youtube.com/@ChavyvAkvar">
					MY YOUTUBE CHANNEL
				</a>
			</p>
			<br />
			<br />
			<br />
		</HeroSection>
	)
}
