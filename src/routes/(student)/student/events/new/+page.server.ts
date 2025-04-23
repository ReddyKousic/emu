import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema/event';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, cookies, locals }) => {
		const eventData = await request.formData();

		const eventName = eventData.get('event_name');
		const eventType = eventData.get('event_type');
		const limit = eventData.get('event_limit');

		const eventVenue = eventData.get('event_venue');
		const eventStartDateTime = eventData.get('event_start_date_time');
		const eventEndDateTime = eventData.get('event_end_date_time');

		if (!eventName || !eventType || !eventVenue || !eventStartDateTime || !eventEndDateTime) {
			return fail(400, {
				eventName,
				eventType,
				limit,
				eventVenue,
				eventStartDateTime,
				eventEndDateTime,
				message: 'All fields are required'
			});
		}

		if (eventType === 'limited' && !limit) {
			return fail(400, {
				eventName,
				eventType,
				limit,
				eventVenue,
				eventStartDateTime,
				eventEndDateTime,
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

		

		try {
			const newEvent = await db
				.insert(event)
				.values({
					eventName: String(eventName),
					eventType: eventType === 'limited' ? 'limited' : 'open',
					eventVenue: String(eventVenue),
					eventStartDateTime: new Date(String(eventStartDateTime)),
					eventEndDateTime: new Date(String(eventEndDateTime)),
					limit: limit ? Number(limit) : 0,
					studentManager: locals.user?.id,
					universityAdministrationApproval: 'pending',
					publishStatus: 'pending_publish',
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
				eventVenue,
				eventStartDateTime,
				eventEndDateTime,
				message: 'Failed to create event'
			});
		}

		throw redirect(303, '/student/events/all'); // Redirect after successful creation

		// console.log(eventName, eventType, limit, eventVenue, eventStartDateTime, eventEndDateTime);
	}
} satisfies Actions;
