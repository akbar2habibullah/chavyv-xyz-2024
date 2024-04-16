import HeroSection from "@/component/hero"
import Link from "next/link"
import { NotionRenderer } from "react-notion"
import "react-notion/src/styles.css"

interface Author {
	id: string
	firstName: string
	lastLame: string
	fullName: string
	profilePhoto: string
}

interface BlogProps {
	id: string
	slug: string
	date: string
	authors: Author[]
	published: boolean
	page: string
	tags: string[]
}

export default async function Slug({ params }: { params: { slug: string; id: string; date: string } }) {
	const data = await getData(params.id)
	const title = data[params.id].value.properties.title[0]

	return (
		<HeroSection backgroundImage="/images/background.png">
			<h1>
				<span className="text-white">{title}</span>
			</h1>
			<br />
			<h2 className="text-4xl max-md:text-2xl text-white">{params.date}</h2>
			<br />
			<p className="[&>main]:text-2xl [&>main]:max-md:text-xl [&>main]:bg-white [&>main]:rounded">
				<NotionRenderer blockMap={data} />
			</p>
			<br />
			<h2 className="text-4xl max-md:text-2xl">
				<Link href="/blog">Back</Link>
			</h2>
			<br />
			<br />
			<br />
		</HeroSection>
	)
}

async function getData(id: string) {
	const res = await fetch(`https://notion-api.splitbee.io/v1/page/${id}`, { next: { revalidate: 600 } })

	if (!res.ok) {
		// This will activate the closest `error.js` Error Boundary
		throw new Error("Failed to fetch data")
	}

	return res.json()
}

export async function generateStaticParams() {
	const response = await fetch(`https://notion-api.splitbee.io/v1/table/${process.env.NOTION_BLOG_ID}`, { next: { revalidate: 600 } })

	const posts = await response.json()

	return posts.map((post: BlogProps) => ({
		slug: post.slug,
		id: post.id,
		date: post.date,
	}))
}
