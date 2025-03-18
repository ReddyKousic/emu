import { redirect, type Handle } from '@sveltejs/kit';
import { authController, type DecodedToken } from '$lib/server/controllers/authController';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('authToken');
	const auth = new authController();

	if (token) {
		try {
			const localUser: DecodedToken = await auth.getLocalStudentDetails(token);
			event.locals.user = localUser;
		} catch (err) {
			event.cookies.delete('authToken', { path: '/' });
			event.locals.user = undefined;
			console.error('Token verification failed:', err);
			throw redirect(302, '/');
		}
	} else {
		event.locals.user = undefined;
	}

	if (event.url.pathname.startsWith('/student') || event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			throw redirect(302, '/');
		}
	}

	return resolve(event);
};
