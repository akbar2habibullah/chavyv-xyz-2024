import prisma from "@/lib/prisma"

export const GET = async (req: Request) => {
	const posts = await prisma.post.findMany({
		where: {
			published: true,
		},
	})
	return Response.json({ posts })
}

export const POST = async (req: Request) => {
	const { title, content, authorId } = await req.json()

	const newPost = await prisma.post.create({
		data: {
			title,
			content,
			author: {
				connect: {
					id: authorId,
				},
			},
		},
	})

	return Response.json({ post: newPost })
}
