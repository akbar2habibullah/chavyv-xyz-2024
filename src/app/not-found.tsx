import HeroSection from "@/component/hero"

export default function Error() {
	return (
		<HeroSection backgroundImage="/images/background.png">
			<h1 className="text-5xl text-center max-md:text-2xl">
				<span className="bg-[#FB7C33] text-white rounded">YOU JUST HIT ROUTE THAT DOESN&apos;T EXIST</span>
			</h1>
			<br />
			<h2 className="text-center text-white text-8xl">404</h2>
			<br />
			<br />
			<br />
		</HeroSection>
	)
}
