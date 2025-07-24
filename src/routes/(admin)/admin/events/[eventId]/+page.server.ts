import { db } from '$lib/server/db';
import { Column, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error } from 'console';

export const load = (async ({ params }) => {
	const eventId = parseInt(params.eventId);

	console.log('Loading event details for eventId:', eventId);

	try {
		const eventDetails = await db.query.event.findFirst({
			where: (event) => eq(event.id, eventId),
			with: {
				bookings: {
					with: {
						venue: {
							with: {
								block: true // Include the block relation
							}
						},
						bookedByStudent: true,
						bookingApprovedBy: true,
						bookingRejectedBy: true
					}
				},
				managedBy: {
					columns: {
						id: true,
						name: true,
						email: true,
						phone: true
					}
				},
				eventApprovedBy: {
					columns: {
						id: true,
						name: true,
						email: true,
						phone: true
					}
				},
				eventRejectedBy: {
					columns: {
						id: true,
						name: true,
						email: true,
						phone: true
					}
				}
			}
		});

		if (!eventDetails) {
			return {
				status: 404,
				error: 'Event not found' // Return plain string instead of Error object
			};
		}
		console.log('Event details loaded successfully:', eventDetails);
		// Convert to plain object to ensure serialization
		return {
			eventDetails: {
				...eventDetails,
				status: 200,
				error: null // Ensure the response is a plain object
			}
		};
	} catch (error) {
		console.error('Error fetching event details:', error);
		return {
			status: 500,
			error: 'Failed to load event details' // Return plain string instead of Error object
		};
	}
}) satisfies PageServerLoad;
