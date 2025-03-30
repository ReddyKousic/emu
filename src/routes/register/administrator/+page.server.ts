import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { universityAdministration } from '$lib/server/db/schema/universityAdministration';
import { hashPassword } from '$lib';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;
export const actions = {
	default: async ({ request, cookies }) => {
		const fd = await request.formData();
		const name = fd.get('name');
		const email = fd.get('email');
		const phone = fd.get('phone');
		const password = fd.get('password');

		// Form validation
		if (!name || !email || !phone || !password) {
			return fail(400, {
				name,
				email,
				phone,
				message: 'All fields are required'
			});
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(String(email))) {
			return fail(400, {
				name,
				email,
				phone,
				message: 'Please enter a valid email address'
			});
		}

		try {
			// Hash password
			const hashedPassword = await hashPassword(String(password));

			// Attempt to insert user
			const user = await db
				.insert(universityAdministration)
				.values({
					name: String(name),
					email: String(email),
					phone: String(phone),
					password: hashedPassword
				})
				.returning();

			// Success case - DO NOT use throw redirect here
		} catch (error) {
			// Handle uniqueness constraint violations
			if (error instanceof Error) {
				// Check for uniqueness constraint errors (specific to Neon/Postgres)
				if (
					error.message.includes('duplicate key') ||
					error.message.includes('unique constraint')
				) {
					// Determine which field caused the uniqueness violation
					if (error.message.includes('email')) {
						return fail(400, {
							name,
							phone,
							message: 'Email already in use'
						});
					} else if (error.message.includes('phone')) {
						return fail(400, {
							name,
							email,
							message: 'Phone number already in use'
						});
					}
				}

				// Log the error for debugging
				console.error('Database error:', error);

				// Return a generic error for other database issues
				return fail(500, {
					message: 'An error occurred while creating your account'
				});
			}

			return fail(500, {
				message: 'Failed to create user'
			});
		}

		// Place the redirect outside the try/catch block
		// throw redirect(303, '/admin/login');
	}
} satisfies Actions;
