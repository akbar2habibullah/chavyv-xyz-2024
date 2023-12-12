import prisma from "@/lib/prisma"

// specify the only parameter is userId
export async function GET(req: Request, context: { params: { userId: string } }) {
	const userId = context.params.userId
	const posts = await prisma.post.findMany({
		where: {
			authorId: userId,
			published: true,
		},
	})
	return Response.json({ posts })
}
