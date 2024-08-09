import { Client } from "@notionhq/client"

const notion = new Client({
	auth: process.env.NOTION_TOKEN!,
})

export const getDatabase = async (databaseId: string) => {
	const response = await notion.databases.query({
		database_id: databaseId,
	})
	return response.results
}

export const getPage = async (pageId: string) => {
	const response = await notion.pages.retrieve({ page_id: pageId })
	return response
}


export const getBlocks = async (blockId: string) => {
	const response = await notion.blocks.children.list({
		block_id: blockId,
	});
	let blocks = response.results;

	// Recursive function to retrieve children of a block and inject them into the blocks array
	const getAllChildBlocks = async (blockIndex: number) => {
		const block = blocks[blockIndex];
		// @ts-ignore
		if (block.has_children) {
			const children = await getBlocks(block.id);
			// Inject children into the blocks array right after the parent block
			blocks = [
				...blocks.slice(0, blockIndex + 1),
				...children,
				...blocks.slice(blockIndex + 1),
			];
			// Recursively process each child block
			for (let i = 0; i < children.length; i++) {
				await getAllChildBlocks(blockIndex + 1 + i);
			}
		}
	};

	// Process each block and retrieve its children if it has any
	for (let i = 0; i < blocks.length; i++) {
		await getAllChildBlocks(i);
	}

	return blocks;
};