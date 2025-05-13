import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Check if user is authenticated and is an admin
    if (!locals.user || locals.user.role !== 'admin') {
        throw redirect(302, '/admin/login');
    }

    return {};
};
