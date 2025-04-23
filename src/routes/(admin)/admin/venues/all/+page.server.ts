import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';


export const load = (async () => {
    const blocksWithVenues = await db.query.block.findMany({
        columns: {
            id: true,
            name: true
        },
        with: {
            venues: {
                columns: {
                    id: true,
                    name: true,
                    description: true,
                    capacity: true
                },
                orderBy: (venue, { asc }) => [asc(venue.name)]
            }
        },
        orderBy: (block, { asc }) => [asc(block.name)]
    });


    return { blocksWithVenues };
}) satisfies PageServerLoad;
