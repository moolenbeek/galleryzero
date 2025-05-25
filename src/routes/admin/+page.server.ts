import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { gallery_item, gallery_category } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/admin/login');
	}

	try {
		console.log('Loading data for user:', locals.user.username);
		
		const [galleryItems, categories] = await Promise.all([
			db.query.gallery_item.findMany({
				with: {
					category: true
				}
			}),
			db.query.gallery_category.findMany({
				orderBy: (category, { desc }) => [desc(category.id)]
			})
		]);

		console.log('Loaded categories:', categories);
		console.log('Loaded gallery items:', galleryItems);

		return {
			user: locals.user,
			galleryItems,
			categories
		};
	} catch (error) {
		console.error('Error loading data:', error);
		return {
			user: locals.user,
			galleryItems: [],
			categories: []
		};
	}
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
	},
	addItem: async ({ request }) => {
		const formData = await request.formData();
		const description = formData.get('description');
		const categoryId = formData.get('categoryId');
		const imageUrl = formData.get('imageUrl');

		if (!description || !categoryId || !imageUrl) {
			return fail(400, { error: 'All fields are required' });
		}

		try {
			const values = {
				description: description.toString(),
				categoryId: parseInt(categoryId.toString(), 10),
				imageUrl: imageUrl.toString()
			};

			const [newItem] = await db.insert(gallery_item).values(values).returning();
			
			// Get the item with its category
			const itemWithCategory = await db.query.gallery_item.findFirst({
				where: eq(gallery_item.id, newItem.id),
				with: {
					category: true
				}
			});

			if (!itemWithCategory) {
				throw new Error('Failed to fetch created item');
			}

			// Return the response in a format that SvelteKit expects
			return {
				success: true,
				data: {
					id: itemWithCategory.id,
					description: itemWithCategory.description,
					imageUrl: itemWithCategory.imageUrl,
					categoryId: itemWithCategory.categoryId,
					category: itemWithCategory.category ? {
						id: itemWithCategory.category.id,
						name: itemWithCategory.category.name
					} : null
				}
			};
		} catch (error: any) {
			console.error('Database error:', error);
			return fail(500, { 
				error: 'Failed to add item', 
				details: error.message
			});
		}
	},
	addCategory: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const slug = formData.get('slug');

		if (!name) {
			return fail(400, { error: 'Category name is required' });
		}

		try {
			const values = {
				name: name.toString(),
				slug: slug?.toString() || name.toString().toLowerCase().replace(/\s+/g, '-')
			};

			const [newCategory] = await db.insert(gallery_category).values(values).returning();

			if (!newCategory) {
				throw new Error('Failed to create category');
			}

			// Return the response in the correct SvelteKit format
			return {
				success: true,
				data: {
					id: newCategory.id,
					name: newCategory.name,
					slug: newCategory.slug
				}
			};
		} catch (error: any) {
			console.error('Database error:', error);
			return fail(500, { 
				error: 'Failed to add category', 
				details: error.message
			});
		}
	},
	deleteCategory: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) return fail(400, { error: 'ID is required' });

		try {
			await db.delete(gallery_category).where(eq(gallery_category.id, Number(id)));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete category' });
		}
	}
};