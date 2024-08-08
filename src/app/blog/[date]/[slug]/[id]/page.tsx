import HeroSection from "@/component/hero"
import { getBlocks, getDatabase, getPage } from "@/utils/notion"
import Link from "next/link"
import { NotionBlock, Render } from "@9gustin/react-notion-render"

interface Author {
	id: string
	firstName: string
	lastLame: string
	fullName: string
	profilePhoto: string
}

export default async function Slug({ params }: { params: { slug: string; id: string; date: string; page: string } }) {
	const data = await getData(params.id)
	const title = data.title || "Loading"

	return (
		<HeroSection backgroundImage="/images/background.png">
			<h1>
				<span className="text-white">{title}</span>
			</h1>
			<br />
			<h2 className="text-4xl max-md:text-2xl text-white">{params.date}</h2>
			<br />
			<p className="text-2xl max-md:text-xl bg-white rounded">
				<Render blocks={data.blocks as unknown as NotionBlock[]} />
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
	const res = await getPage(id)
	const resBlocks = await getBlocks(id)

	// @ts-ignore
	return { title: res.properties.page.title[0].plain_text, blocks: resBlocks }
}

export async function generateStaticParams() {
	const res = await getDatabase(process.env.NOTION_BLOG_ID!)

	// @ts-ignore
	return res.map((item) => ({ id: item.id, slug: item.properties.slug.rich_text[0].plain_text, date: item.properties.date.date.start }))
}

export const revalidate = 3600 * 3
