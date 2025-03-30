import { redirect, type Handle } from '@sveltejs/kit';
import { authController, type StudentTokenPayload } from '$lib/server/controllers/authController';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('authToken');
	const auth = new authController();

	if (token) {
		try {
			const localUser = (await auth.getLocalStudentDetails(token)) as StudentTokenPayload;
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

	if (event.url.pathname.startsWith('/admin')) {
		if (event.locals.user?.role !== 'admin') {
			throw redirect(302, '/student');
		}
	}

	if (event.url.pathname.startsWith('/student')) {
		if (event.locals.user?.role !== 'student') {
			throw redirect(302, '/admin');
		}
	}

	return resolve(event);
};
