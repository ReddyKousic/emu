import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { block } from '$lib/server/db/schema/block';
import { venue } from '$lib/server/db/schema/venue';
import { eq } from 'drizzle-orm';

export const load = (async () => {
	const blocksWithVenues = await db.query.block.findMany({
		columns: {
			id: true,
			name: true
		},
		with: {
			venues: {
				columns: {
					id: true,
					name: true,
					description: true,
					capacity: true
				},
				orderBy: (venue, { asc }) => [asc(venue.name)]
			}
		},
		orderBy: (block, { asc }) => [asc(block.name)]
	});

	


	return { blocksWithVenues };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request }) => {
		const fd = await request.formData();

		// Get and validate required fields
		const name = fd.get('venue_name')?.toString().trim();
		const description = fd.get('venue_description')?.toString().trim();
		const capacityStr = fd.get('venue_capacity')?.toString();
		const blockStr = fd.get('venue_block')?.toString();

		// Check for missing fields
		if (!name || !description || !capacityStr || !blockStr) {
			return fail(400, {
				error: 'All fields are required',
				missing: {
					name: !name,
					description: !description,
					capacity: !capacityStr,
					block: !blockStr
				},
				values: { name, description, capacity: capacityStr, block: blockStr }
			});
		}

		// Convert and validate numeric fields
		let capacity: number;
		let block: number;

		try {
			capacity = parseInt(capacityStr);
			block = parseInt(blockStr);

			if (isNaN(capacity) || isNaN(block)) {
				throw new Error('Invalid number');
			}
		} catch {
			return fail(400, {
				error: 'Capacity and Block must be valid numbers',
				values: { name, description, capacity: capacityStr, block: blockStr }
			});
		}

		// Validate field lengths and constraints
		const errors: Record<string, string> = {};

		if (name.length > 255) {
			errors.name = 'Name must be 255 characters or less';
		}

		if (description.length > 255) {
			errors.description = 'Description must be 255 characters or less';
		}

		if (capacity <= 0) {
			errors.capacity = 'Capacity must be a positive number';
		}

		if (block <= 0) {
			errors.block = 'Block must be a positive number';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				error: 'Validation failed',
				errors,
				values: { name, description, capacity, block }
			});
		}

		// If we get here, all validation passed
		try {
			const newVenue = await db
				.insert(venue)
				.values({
					name,
					description,
					capacity,
					block
				})
				.returning();
			if (!newVenue || newVenue.length === 0) {
				throw new Error('Failed to create venue');
			}

			return {
				success: true,
				message: `Venue with identity ${newVenue[0].name} created successfully.`
			};
		} catch (error) {
			// Handle potential unique constraint violation
			if (error instanceof Error && error.message.includes('unique constraint')) {
				return fail(400, {
					error: 'A venue with this name already exists in the selected block',
					values: { name, description, capacity, block }
				});
			}

			return fail(500, {
				error: 'Failed to create venue. Please try again.',
				values: { name, description, capacity, block }
			});
		}
	}
} satisfies Actions;
