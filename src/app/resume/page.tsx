import HeroSection from "@/component/hero"

export default function Resume() {
	return (
		<HeroSection backgroundImage="/images/background.png">
			<h2 className="text-5xl text-center max-md:text-2xl">
				<span className="bg-[#FB7C33] text-white rounded">THIS IS MY RESUME...</span>
			</h2>
			<br />
			<div className="flex justify-center">
				<iframe src="https://drive.google.com/file/d/1Ov1aT7n4csNRiDYy-ZApmYercbCJPZ1F/preview" className="w-full h-[100vh] rounded"></iframe>
			</div>
			<br />
			<h2 className="text-5xl text-center max-md:text-2xl">
				<span className="bg-[#FB7C33] text-white rounded">...PORTFOLIO...</span>
			</h2>
			<br />
			<div className="flex justify-center">
				<iframe src="https://drive.google.com/file/d/1MZjyUW8bMFxXE-JW_roi3OYkt1pTZGHD/preview" className="w-full h-[60vh] rounded"></iframe>
			</div>
			<br />
			<h2 className="text-5xl text-center max-md:text-2xl">
				<span className="bg-[#FB7C33] text-white rounded">...AND MY CAREER JOURNEY</span>
			</h2>
			<br />
			<div className="flex justify-center">
				<iframe src="https://drive.google.com/file/d/1Sxpxo6se8O-5cAWWdEkbmmBDHG7JKap3/preview" className="w-full h-[60vh] rounded"></iframe>
			</div>
			<br />
			<br />
			<br />
		</HeroSection>
	)
}
