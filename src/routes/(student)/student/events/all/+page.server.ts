import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema/event';
import { eq } from 'drizzle-orm';
export const load = (async ({ locals }) => {
	const allEventsByStudent = await db
		.select()
		.from(event)
		.where(eq(event.managedBy, Number(locals.user?.id)));

	return { allEventsByStudent };
}) satisfies PageServerLoad;
