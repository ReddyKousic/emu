import { db } from '$lib/server/db';
import { event, participant } from '$lib/server/db/schema';
import { and, count, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const eventId = id ? parseInt(id) : NaN;
	if (isNaN(eventId)) {
		throw redirect(302, '/student/events');
	}

	if (!locals.user) {
		throw redirect(302, '/'); // Redirect to login page if user is not authenticated
	}

	const eventDetails = await db
		.select()
		.from(event)
		.where(and(eq(event.id, eventId), eq(event.managedBy, locals.user.id)));

	if (eventDetails.length === 0) {
		throw redirect(302, '/student/events');
	}

	const participantsCount = await db
		.select({
			count: count()
		})
		.from(participant)
		.where(eq(participant.eventId, eventId));

	const participants = await db.select().from(participant).where(eq(participant.eventId, eventId));

	return {
		event: eventDetails[0],
		participants: participants,
		participantsCount: participantsCount[0].count
	};
}) satisfies PageServerLoad;
