import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { event, publishStatusEnum } from '$lib/server/db/schema/event';

import { block, venue } from '$lib/server/db/schema'; // Your schema files

// export const load = async () => {
// 	// Query all blocks with their venues
// 	const blocksWithVenues = await db.query.block.findMany({
// 		with: {
// 			venues: true // This will include all venues for each block
// 		}
// 	});

// 	// Transform the data into your desired structure
// 	const blocksGrouped = blocksWithVenues.reduce(
// 		(acc, block) => {
// 			acc[block.name] = block.venues; // Using block name as key
// 			return acc;
// 		},
// 		{} as Record<string, any>
// 	);

// 	return {
// 		blocks: blocksGrouped
// 	};
// };

export const actions = {
	default: async ({ request, cookies, locals }) => {
		const eventData = await request.formData();

		const eventName = eventData.get('event_name');
		const eventType = eventData.get('event_type');
		const limit = eventData.get('event_limit');
		const description = eventData.get('event_description');

		if (!eventName || !eventType || !description) {
			return fail(400, {
				eventName,
				eventType,
				description,
				limit,

				message: 'All fields are required'
			});
		}

		if (eventType === 'limited' && !limit) {
			return fail(400, {
				eventName,
				eventType,
				limit,

				message: 'Event limit is required for limited events'
			});
		}

		const slug = `${Date.now().toString(36)}-${String(eventName)
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '')}`;

		if (!locals.user?.id) {
			return fail(401, {
				eventName,
				eventType,
				limit,
				message: 'Authentication required'
			});
		}

		try {
			const newEvent = await db
				.insert(event)
				.values({
					eventName: String(eventName),
					eventType: eventType === 'limited' ? 'limited' : 'open',
					description: String(description),
					limit: limit ? Number(limit) : -1,
					managedBy: locals.user.id,
					slug: slug
				})
				.returning();

			console.log('Event inserted successfully:', newEvent);
		} catch (error) {
			console.error('Error inserting event:', error);
			return fail(500, {
				eventName,
				eventType,
				limit,
				message: 'Failed to create event'
			});
		}

		throw redirect(303, '/student/events/all'); // Redirect after successful creation

		// console.log(eventName, eventType, limit, eventVenue, eventStartDateTime, eventEndDateTime);
	}
} satisfies Actions;
