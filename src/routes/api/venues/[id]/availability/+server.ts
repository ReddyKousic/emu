import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { bookings } from '$lib/server/db/schema/bookings';
import { eq, and, or, gte, lte } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const venueId = parseInt(params.id || '');

	if (isNaN(venueId)) {
		return json({ error: 'Invalid venue ID' }, { status: 400 });
	}

	try {
		const venueAvailability = await db.query.bookings.findMany({
			where: (bookings, { eq, and, not }) =>
				and(
					eq(bookings.venueId, venueId),
					eq(bookings.isCancelled, false),
					not(eq(bookings.bookingApprovalStatus, 'Rejected'))
				),
			with: {
				event: {
					columns: {
						eventName: true
					}
				}
			}
		});

		return json({ availability: venueAvailability }, { status: 200 });
	} catch (error) {
		console.error('Error fetching venue availability:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
