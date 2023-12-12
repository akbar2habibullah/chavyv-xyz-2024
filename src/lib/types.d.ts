type Post = {
	id: string
	title: string
	content?: string
	published: boolean
	author?: User
	authorId?: string
	comments?: Comment[]
}

type User = {
	id: string
	name?: string
	email?: string
	emailVerified?: Date
	image?: string
	posts?: Post[]
	accounts?: Account[]
	sessions?: Session[]
	chats?: Chat[]
	comments?: Comment[]
}

type Account = {
	id: string
	userId: string
	type: string
	provider: string
	providerAccountId: string
	refresh_token?: string
	access_token?: string
	expires_at?: number
	token_type?: string
	scope?: string
	id_token?: string
	session_state?: string
	oauth_token_secret?: string
	oauth_token?: string
	user?: User
}

type Session = {
	id: string
	sessionToken: string
	userId: string
	expires: Date
	user?: User
}

type VerificationToken = {
	id: number
	identifier: string
	token: string
	expires: Date
}

type Chat = {
	id: number
	user?: User
	userId: string
	messages?: Message[]
}

type Message = {
	id: number
	chat?: Chat
	chatId: number
	sender: string
	content: string
	timestamp: Date
	responses?: Response[]
}

type Response = {
	id: number
	message?: Message
	messageId: number
	content: string
	timestamp: Date
}

type Comment = {
	id: string
	content: string
	post?: Post
	postId: string
	author?: User
	authorId: string
	createdAt: Date
}
