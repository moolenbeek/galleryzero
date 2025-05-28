import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	try {
		const [galleryItems, categories] = await Promise.all([
			db.query.gallery_item.findMany({
				with: {
					category: true
				},
				orderBy: (item, { desc }) => [desc(item.id)]
			}),
			db.query.gallery_category.findMany({
				orderBy: (category, { asc }) => [asc(category.name)]
			})
		]);

		return {
			galleryItems,
			categories
		};
	} catch (error) {
		console.error('Error loading gallery data:', error);
		return {
			galleryItems: [],
			categories: []
		};
	}
}; 