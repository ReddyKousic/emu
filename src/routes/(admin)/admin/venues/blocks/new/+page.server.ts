import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { block } from '$lib/server/db/schema/block';
import { fail } from '@sveltejs/kit';
import { error } from 'console';

export const load = (async () => {
	return {
		blocks: await db.select().from(block).orderBy(block.name)
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const blockName = fd.get('block_name');
		const blockDescription = fd.get('block_description');

		// const blockImage = fd.get('block_image') as File;

		if (!blockName || !blockDescription) {
			return fail(400, {
				error: 'All fields are required',
				blockName,
				blockDescription
			});
		}

		try {
			const newBlock = await db
				.insert(block)
				.values({
					name: String(blockName),
					description: String(blockDescription)
				})
				.returning();

			if (newBlock.length === 0) {
				return fail(500, {
					error: 'Failed to create block',
					blockName,
					blockDescription
				});
			}

			return {
				success: true,
				message: `Block named <strong>${newBlock[0].name}</strong> created successfully`,
				block: newBlock[0]
			};

  
		} catch (error) {
			console.error('Error inserting block:', error);
			return fail(500, {
				error: 'Failed to create block',
				blockName,
				blockDescription
			});
		}
	}
};
