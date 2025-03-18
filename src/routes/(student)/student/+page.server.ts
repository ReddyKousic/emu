import type { PageServerLoad } from './$types';

export const load = (async ({locals}) => {
    return {
        ...locals.user
    };
}) satisfies PageServerLoad;