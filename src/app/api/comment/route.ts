import prisma from "@/lib/prisma"

export async function POST(req: Request) {
	const { content, postId, authorId } = await req.json()

	const newComment = await prisma.comment.create({
		data: {
			content,
			post: {
				connect: {
					id: postId,
				},
			},
			author: {
				connect: {
					id: authorId,
				},
			},
		},
	})

	return { comment: newComment }
}

export async function GET(req: Request) {
	const { postId } = await req.json()

	const comments = await prisma.comment.findMany({
		where: {
			postId,
		},
	})

	return { comments }
}
