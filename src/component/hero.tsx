import Image from "next/image"
import { ReactNode } from "react"

interface HeroSectionProps {
	backgroundImage: string
	children: ReactNode
}

const HeroSection: React.FC<HeroSectionProps> = ({ backgroundImage, children }) => {
	return (
		<section className="flex flex-col justify-center w-full shadow-2xl bg-orange-400 bg-opacity-40 max-md:max-w-full">
			<div className="flex overflow-hidden relative flex-col px-5 pt-20 w-full min-h-[100vh] max-md:max-w-full">
				<Image src={backgroundImage} alt="" fill className="object-cover absolute inset-0" />
				<div className="relative self-center mt-20 text-7xl w-[800px] max-md:mt-10 max-md:max-w-full max-md:text-5xl text-[#1E1E1E]">{children}</div>
			</div>
		</section>
	)
}

export default HeroSection
