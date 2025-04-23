// /admin/api/event/[id]/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema/event';
import { eq } from 'drizzle-orm';
import { approvalStatusEnum } from '$lib/server/db/schema/event';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	const eventId = id ? parseInt(id) : NaN;

	if (isNaN(eventId)) {
		return json({ error: 'Invalid event ID' }, { status: 400 });
	}

	const data = await request.json();
	const { status, rejectionRemarks } = data;

	// Validate the status
	if (!approvalStatusEnum.enumValues.includes(status)) {
		return json({ error: 'Invalid approval status' }, { status: 400 });
	}

	try {
		const updatedEvent = await db
			.update(event)
			.set({
				universityAdministrationApproval: status,
				rejectionRemarks: rejectionRemarks || null
			})
			.where(eq(event.id, eventId))
			.returning();

		if (updatedEvent.length === 0) {
			return json({ error: 'Event not found' }, { status: 404 });
		}

		return json({ event: updatedEvent[0] }, { status: 200 });
	} catch (error) {
		console.error('Error updating event:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
