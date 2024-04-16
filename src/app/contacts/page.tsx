import HeroSection from "@/component/hero"

export default function Contacts() {
	return (
		<HeroSection backgroundImage="/images/background.png">
			<h1 className="text-5xl text-center max-md:text-2xl">
				<span className="bg-[#FB7C33] text-white rounded">YOU CAN REACH ME WITH:</span>
			</h1>
			<br />
			<ul className="text-4xl max-md:text-2xl max-md:px-4 list-disc">
				<li>
					Instagram: [@chavyv.akvar]
					<a href="https://instagram.com/chavyv.akvar" className="text-white hover:underline break-words">
						(https://instagram.com/chavyv.akvar)
					</a>
				</li>
				<li>
					YouTube: [chavyv akvar]
					<a href="https://www.youtube.com/@ChavyvAkvar" className="text-white hover:underline break-words">
						(https://www.youtube.com/@ChavyvAkvar)
					</a>
				</li>
				<li>
					TikTok: [@chavyv.akvar]
					<a href="https://www.tiktok.com/@chavyv.akvar" className="text-white hover:underline break-words">
						(https://www.tiktok.com/@chavyv.akvar)
					</a>
				</li>
				<li>
					LinkedIn: [Habibullah Akbar]
					<a href="https://www.linkedin.com/in/habibullah-akbar-631880179/" className="text-white hover:underline break-words">
						(https://www.linkedin.com/in/habibullah-akbar-631880179/)
					</a>
				</li>
				<li>
					GitHub: [akbar2habibullah]
					<a href="https://github.com/akbar2habibullah" className="text-white hover:underline break-words">
						(https://github.com/akbar2habibullah)
					</a>
				</li>
				<li>
					HuggingFace: [ChavyvAkvar]
					<a href="https://huggingface.co/ChavyvAkvar" className="text-white hover:underline break-words">
						(https://huggingface.co/ChavyvAkvar)
					</a>
				</li>
				<li>
					Discord Server: [FZTSE (From Zero To Software Engineer)]
					<a href="https://discord.gg/kYmGmExs9t" className="text-white hover:underline break-words">
						(https://discord.gg/kYmGmExs9t)
					</a>
				</li>
			</ul>
			<br />
			<br />
			<br />
		</HeroSection>
	)
}
