import prisma from "@/lib/prisma"

export async function GET(req: Request) {
	const posts = await prisma.post.findMany()
	return Response.json({ posts })
}

export async function POST(req: Request) {
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
