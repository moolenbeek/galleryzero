import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	try {
		// Fetch gallery items with their categories for the carousel
		const galleryItems = await db.query.gallery_item.findMany({
			with: {
				category: true
			},
			orderBy: (item, { desc }) => [desc(item.id)],
			limit: 10 // Limit to 10 most recent items for the carousel
		});

		return {
			galleryItems
		};
	} catch (error) {
		console.error('Error loading gallery data for home page:', error);
		return {
			galleryItems: []
		};
	}
}; 