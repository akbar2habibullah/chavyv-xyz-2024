import prisma from "@/lib/prisma"

export const runtime = "edge"

// specify the only parameter is userId
export const GET = async (req: Request, context: { params: { userId: string } }) => {
	const userId = context.params.userId
	const posts = await prisma.post.findMany({
		where: {
			authorId: userId,
			published: true,
		},
	})
	return Response.json({ posts })
}
