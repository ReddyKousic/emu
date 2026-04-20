import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { bookings } from '$lib/server/db/schema/bookings';
import { event } from '$lib/server/db/schema/event';
import { and, eq, not, or, lte, gte } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const eventId = parseInt(params.id || '');
	if (isNaN(eventId)) {
		return json({ error: 'Invalid event ID' }, { status: 400 });
	}

	if (!locals.user) {
		return json({ error: 'User not authenticated' }, { status: 401 });
	}

	try {
		const eventData = await db.query.event.findFirst({
			where: (event, { eq, and }) => and(eq(event.id, eventId), eq(event.managedBy, locals.user!.id))
		});

		if (!eventData) {
			return json({ error: 'Event not found or unauthorized' }, { status: 404 });
		}

		if (!eventData.isOpenForBookingVenue) {
			return json({ error: 'Event is not yet open for venue booking' }, { status: 403 });
		}

		const data = await request.json();
		const { proposals } = data; // Array of { venueId, start, end }

		if (!Array.isArray(proposals) || proposals.length === 0) {
			return json({ error: 'At least one proposal is required' }, { status: 400 });
		}

		// Check current proposal count
		const currentProposals = await db.query.bookings.findMany({
			where: (bookings, { eq }) => eq(bookings.eventId, eventId)
		});

		if (currentProposals.length + proposals.length > 4) {
			return json({ error: 'Maximum 4 proposals allowed per event.' }, { status: 400 });
		}

		for (const prop of proposals) {
			const start = new Date(prop.start);
			const end = new Date(prop.end);

			if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
				return json({ error: 'Invalid duration for proposal' }, { status: 400 });
			}

			// STRICT OVERLAP CHECK: Check if any APPROVED booking overlaps
			const overlaps = await db.query.bookings.findFirst({
				where: (bookings, { and, eq, or, lte, gte }) =>
					and(
						eq(bookings.venueId, prop.venueId),
						eq(bookings.bookingApprovalStatus, 'Approved'),
						eq(bookings.isCancelled, false),
						or(
							// (StartA <= EndB) and (EndA >= StartB)
							and(lte(bookings.bookingStartDateTime, end), gte(bookings.bookingEndDateTime, start))
						)
					)
			});

			if (overlaps) {
				return json(
					{ error: `The selected time slot for venue overlaps with an already approved booking.` },
					{ status: 400 }
				);
			}
		}

		// Insert proposals
		const inserted = await db
			.insert(bookings)
			.values(
				proposals.map((p: any) => ({
					eventId,
					venueId: p.venueId,
					bookingStartDateTime: new Date(p.start),
					bookingEndDateTime: new Date(p.end),
					bookedByStudent: locals.user!.id,
					bookingApprovalStatus: 'Pending' as any
				}))
			)
			.returning();

		return json({ proposals: inserted }, { status: 201 });
	} catch (error) {
		console.error('Error proposing bookings:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
