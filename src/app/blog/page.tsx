import BlogCard from "@/component/blogCard"
import HeroSection from "@/component/hero"
import { getDatabase } from "@/libs/notion"

interface BlogProps {
	id: string
	slug: string
	date: string
	published: boolean
	page: string
	tags: string[]
}

export default async function Blog() {
	const data = await getData()

	return (
		<HeroSection backgroundImage="/images/background.png">
			<h1>
				<span className="bg-[#FB7C33] text-white rounded">Chavyv Blog</span>
			</h1>
			<br />
			<h2 className="text-5xl max-md:text-2xl">Welcome to my blog! This is my place to share something about my life or random thoughts</h2>
			<br />
			<div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
				{data ? (
					data.map((item: BlogProps) => <BlogCard key={item.id} id={item.id} title={item.page} date={item.date} tags={item.tags} slug={item.slug} />)
				) : (
					<>
						<div role="status" className="max-w-sm p-4 border border-white rounded shadow animate-pulse md:p-6">
							<div className="flex items-center justify-center h-48 mb-4 bg-white rounded">
								<svg className="w-10 h-10 text-[#1E1E1E]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
									<path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
									<path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
								</svg>
							</div>
							<div className="h-2.5 bg-white rounded-full w-48 mb-4"></div>
							<div className="h-2 bg-white rounded-full mb-2.5"></div>
							<div className="h-2 bg-white rounded-full mb-2.5"></div>
							<div className="h-2 bg-white rounded-full"></div>
							<span className="sr-only">Loading...</span>
						</div>
						<div role="status" className="max-w-sm p-4 border border-white rounded shadow animate-pulse md:p-6">
							<div className="flex items-center justify-center h-48 mb-4 bg-white rounded">
								<svg className="w-10 h-10 text-[#1E1E1E]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
									<path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
									<path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
								</svg>
							</div>
							<div className="h-2.5 bg-white rounded-full w-48 mb-4"></div>
							<div className="h-2 bg-white rounded-full mb-2.5"></div>
							<div className="h-2 bg-white rounded-full mb-2.5"></div>
							<div className="h-2 bg-white rounded-full"></div>
							<span className="sr-only">Loading...</span>
						</div>
						<div role="status" className="max-w-sm p-4 border border-white rounded shadow animate-pulse md:p-6">
							<div className="flex items-center justify-center h-48 mb-4 bg-white rounded">
								<svg className="w-10 h-10 text-[#1E1E1E]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
									<path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
									<path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
								</svg>
							</div>
							<div className="h-2.5 bg-white rounded-full w-48 mb-4"></div>
							<div className="h-2 bg-white rounded-full mb-2.5"></div>
							<div className="h-2 bg-white rounded-full mb-2.5"></div>
							<div className="h-2 bg-white rounded-full"></div>
							<span className="sr-only">Loading...</span>
						</div>
						<div role="status" className="max-w-sm p-4 border border-white rounded shadow animate-pulse md:p-6">
							<div className="flex items-center justify-center h-48 mb-4 bg-white rounded">
								<svg className="w-10 h-10 text-[#1E1E1E]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
									<path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
									<path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
								</svg>
							</div>
							<div className="h-2.5 bg-white rounded-full w-48 mb-4"></div>
							<div className="h-2 bg-white rounded-full mb-2.5"></div>
							<div className="h-2 bg-white rounded-full mb-2.5"></div>
							<div className="h-2 bg-white rounded-full"></div>
							<span className="sr-only">Loading...</span>
						</div>
					</>
				)}
			</div>
			<br />
			<br />
			<br />
		</HeroSection>
	)
}

async function getData() {
	const res = await getDatabase(process.env.NOTION_BLOG_ID!)

	return res.map((item) => ({ id: item.id, slug: item.properties.slug.rich_text[0].plain_text, date: item.properties.date.date.start, published: item.properties.published.checkbox, page: item.properties.page.title[0].plain_text, tags: item.properties.tags.multi_select.map((tag: { name: string }) => tag.name) })).reverse()
}
