import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { event, participant } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const load = (async ({ params }) => {
	const { slug } = params;
	const eventSlug = slug ? String(slug) : '';

	if (!eventSlug) {
		throw redirect(302, '/');
	}

	const eventData = await db.query.event.findFirst({
		where: (event, { eq }) => eq(event.slug, eventSlug),
		with: {
			bookings: {
				where: (bookings, { eq }) => eq(bookings.bookingApprovalStatus, 'Approved'),
				with: {
					venue: true
				}
			}
		}
	});

	if (!eventData) {
		throw redirect(302, '/');
	}
	const participantsCount = await db
		.select({ count: sql<number>`count(*)` })
		.from(participant)
		.where(eq(participant.eventId, eventData.id));

	const totalParticipants = Number(participantsCount[0].count);

	const remainingSeats =
		eventData.eventType === 'limited'
			? Math.max(eventData.limit - totalParticipants, 0)
			: null;

	return {
		eventDetails: eventData,
		approvedBooking: eventData.bookings[0] || null,
		totalParticipants,
		remainingSeats
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
