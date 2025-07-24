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
		
			studentId: student.id,
			studentName: student.name,
			approval: event.universityAdministrationApproval
		})
		.from(event)
		.innerJoin(student, eq(event.managedBy, student.id));

	return {
		allEventsAndStudents
	};
}) satisfies PageServerLoad;
