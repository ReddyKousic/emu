// /student/api/event/[id]/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema/event';
import { and, eq } from 'drizzle-orm';
import { publishStatusEnum } from '$lib/server/db/schema/event';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    const { id } = params;
    const eventId = id ? parseInt(id) : NaN;

    if (isNaN(eventId)) {
        return json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const data = await request.json();
    const { published } = data;

    // Validate the status
    if (!publishStatusEnum.enumValues.includes(status)) {
        return json({ error: 'Invalid approval status' }, { status: 400 });
    }

    try {
        if (!locals.user) {
            return json({ error: 'User not authenticated' }, { status: 401 });
        }

        const updatedEvent = await db
            .update(event)
            .set({
                publishStatus: status
            })
            .where(and(eq(event.id, eventId), eq(event.studentManager, locals.user.id)))
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
