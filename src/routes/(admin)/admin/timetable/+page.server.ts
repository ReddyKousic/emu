import { db } from '$lib/server/db';
import { bookings } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const approvedBookings = await db.query.bookings.findMany({
		where: and(
			eq(bookings.bookingApprovalStatus, 'Approved'),
			eq(bookings.isCancelled, false)
		),
		with: {
			event: true,
			venue: {
				with: {
					block: true
				}
			}
		}
	});

	return {
		bookings: approvedBookings
	};
}) satisfies PageServerLoad;