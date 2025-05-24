import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { gallery_item } from '$lib/server/db/schema.js';

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
	},
	deleteItem: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) return fail(400, { error: 'ID is required' });

		try {
			await db.delete(gallery_item).where(eq(gallery_item.id, Number(id)));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete item' });
		}
	}
};