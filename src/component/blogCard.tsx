import Link from "next/link"

interface BlogCardProps {
	title: string
	date: string
	tags: string[]
	slug: string
	id: string
}

const BlogCard: React.FC<BlogCardProps> = ({ title, date, tags, slug, id }) => {
	return (
		<article className="hover:animate-background bg-gradient-to-r from-white via-[#FB7C33] to-[#1E1E1E] p-1 shadow-xl hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s] rounded-md">
			<Link href={`/blog/${date}/${slug}/${id}`}>
				<div className=" bg-white p-4 !pt-20 sm:p-6 h-full rounded">
					<time dateTime={date} className="block text-xs text-gray-500">
						{date}
					</time>
					<h3 className="mt-0.5 text-lg font-medium text-gray-900">{title}</h3>
					<div className="mt-4 flex flex-wrap gap-1">
						{tags &&
							tags.map((tag) => (
								<span key={tag} className="whitespace-nowrap rounded bg-[#FB7C33] px-2.5 py-0.5 text-xs text-white">
									{tag}
								</span>
							))}
					</div>
				</div>
			</Link>
		</article>
	)
}

export default BlogCard
