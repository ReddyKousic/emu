import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema/event';
import { count, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { student } from '$lib/server/db/schema/student';

export const load = (async () => {
	const allEventsAndStudents = await db
		.select({
			id: event.id,
			name: event.eventName,
			startDateTime: event.eventStartDateTime,
			venue: event.eventVenue,
			studentId: student.id,
			studentName: student.name,
			approval: event.universityAdministrationApproval
		})
		.from(event)
		.innerJoin(student, eq(event.studentManager, student.id));

	const eventCount = await db.select({ count: count(event.id) }).from(event);	

	return {
		allEventsAndStudents,
		eventCount
	};
}) satisfies PageServerLoad;
