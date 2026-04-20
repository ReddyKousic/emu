import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { bookings } from '$lib/server/db/schema/bookings';
import { event } from '$lib/server/db/schema/event';
import { eq, and, not } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const eventId = parseInt(params.id || '');
	if (isNaN(eventId)) {
		return json({ error: 'Invalid event ID' }, { status: 400 });
	}

	if (!locals.user) {
		return json({ error: 'User not authenticated' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const { bookingId } = data;

		if (!bookingId) {
			return json({ error: 'Booking ID is required' }, { status: 400 });
		}

		// 1. Get the target booking
		const targetBooking = await db.query.bookings.findFirst({
			where: (bookings, { eq, and }) => and(eq(bookings.id, bookingId), eq(bookings.eventId, eventId))
		});

		if (!targetBooking) {
			return json({ error: 'Booking not found' }, { status: 404 });
		}

		// 2. Perform updates in a transaction
		await db.transaction(async (tx) => {
			// Approve the selected booking
			await tx
				.update(bookings)
				.set({
					bookingApprovalStatus: 'Approved',
					bookingApprovedBy: locals.user!.id,
					bookingRejectedBy: null
				})
				.where(eq(bookings.id, bookingId));

			// Reject other bookings for the same event
			await tx
				.update(bookings)
				.set({
					bookingApprovalStatus: 'Rejected',
					bookingRejectedBy: locals.user!.id,
					bookingApprovedBy: null
				})
				.where(and(eq(bookings.eventId, eventId), not(eq(bookings.id, bookingId))));

			// Auto-publish the event
			await tx
				.update(event)
				.set({
					publishStatus: 'published'
				})
				.where(eq(event.id, eventId));
		});

		return json({ message: 'Booking approved and event published successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error approving booking:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
