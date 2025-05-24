import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/admin/login');
	}

	const galleryItems = await db.query.gallery_item.findMany({
		with: {
			category: true
		}
	});

	return {
		user: locals.user,
		galleryItems
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/admin/login');
	}
};