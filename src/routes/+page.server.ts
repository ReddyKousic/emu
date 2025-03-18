import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { authController } from '$lib/server/controllers/authController';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, cookies }) => {
		const fd = await request.formData();
		const email = fd.get('email');
		const password = fd.get('password');

		const auth = new authController();

		// Form validation
		if (!email || !password) {
			return fail(400, {
				email,
				message: 'Both email and password are required'
			});
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+$/;
		if (!emailRegex.test(String(email))) {
			return fail(400, {
				email,
				message: 'Please enter a valid email address'
			});
		}

		let token: string;

		try {
			// Authenticate student
			const result = await auth.studentLogin(String(email), String(password));
			token = result.token;

			// Set token in cookies
			cookies.set('authToken', token, {
				httpOnly: true,
				path: '/',
				maxAge: 60 * 60 * 24, // 1 day
				secure: process.env.NODE_ENV === 'production'
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
			return fail(400, {
				email,
				message: errorMessage
			});
		}

		// Redirect only if authentication is successful
		throw redirect(303, '/student');
	}
} satisfies Actions;
