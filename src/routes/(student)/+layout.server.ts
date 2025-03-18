import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
    console.log("Locals from Layout: ",locals.user);
	return {
		...locals.user
	};
}) satisfies LayoutServerLoad;
