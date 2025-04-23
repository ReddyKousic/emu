import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { event, participant } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async ({ params, request }) => {
	const { slug } = params;
	const eventSlug = slug ? String(slug) : '';

	if (eventSlug === '') {
		redirect(302, '/');
	}

	// Fetch the event details from the database using the slug

	const eventDetails = await db.select().from(event).where(eq(event.slug, eventSlug)).limit(1);
	if (eventDetails.length === 0) {
		redirect(302, '/');
	}

	return {
		eventDetails: eventDetails[0]
	};
}) satisfies PageServerLoad;
export const actions = {
	default: async ({ request, params }) => {
		const fd = await request.formData();
		const eventId = fd.get('event_id') as string;
		const name = fd.get('full_name') as string;
		const email = fd.get('email') as string;
		const phone = fd.get('phone') as string;
		const address = fd.get('address') as string;

		if (!eventId || !name || !email || !phone || !address) {
			return fail(400, { error: 'All fields are required' });
		}
		if (eventId === '' || name === '' || email === '' || phone === '' || address === '') {
			return fail(400, { error: 'All fields are required' });
		}

		try {
			const newParticipant = await db
				.insert(participant)
				.values({
					eventId: parseInt(eventId, 10),
					name: name,
					email: email,
					phone: phone,
					address: address
				})
				.returning();

			if (newParticipant.length === 0) {
				return fail(500, {
					error: 'Failed to register for the event',
					details: 'No participant was returned after insertion'
				});
			}

			return {
				success: true,
				message: 'Successfully registered for the event',
				participant: newParticipant[0]
			};
		} catch (error) {
			console.error('Database insertion error:', error);
			return fail(500, {
				error: 'Failed to register for the event',
				details: error instanceof Error ? error.message : 'Unknown database error'
			});
		}
	}
} satisfies Actions;
