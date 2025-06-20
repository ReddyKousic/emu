import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return {
		...locals.user
	};
}) satisfies LayoutServerLoad;
