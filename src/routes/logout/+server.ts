import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	// Delete the auth cookie
	cookies.delete('authToken', {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production'
	});

	// Redirect to home page or login page
	throw redirect(303, '/');
};
