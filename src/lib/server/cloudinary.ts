import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables from .env file
config();

// Environment variables for server-side Cloudinary operations
// These are optional - the system will work without them but won't delete from Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Track if Cloudinary is configured
let isCloudinaryConfigured = false;

// Configure Cloudinary only if all required variables are present
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    try {
        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
        });
        isCloudinaryConfigured = true;
    } catch (error) {
        console.error('❌ Failed to configure Cloudinary:', error);
        isCloudinaryConfigured = false;
    }
} else {
    console.log('ℹ️  Cloudinary deletion disabled: Missing API credentials');
    console.log('   To enable Cloudinary deletion, add these to your .env file:');
    console.log('   - CLOUDINARY_CLOUD_NAME');
    console.log('   - CLOUDINARY_API_KEY');
    console.log('   - CLOUDINARY_API_SECRET');
}

/**
 * Check if Cloudinary is properly configured for deletions
 */
export function isCloudinaryDeleteEnabled(): boolean {
    return isCloudinaryConfigured;
}

/**
 * Extract the public ID from a Cloudinary URL
 * @param url - The Cloudinary image URL
 * @returns The public ID of the image
 */
export function extractPublicId(url: string): string {
    try {
        // Handle different Cloudinary URL formats
        // Example: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg
        // or: https://res.cloudinary.com/cloud-name/image/upload/folder/image.jpg
        
        const urlParts = url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL format');
        }
        
        // Get everything after 'upload' and optional version
        let pathAfterUpload = urlParts.slice(uploadIndex + 1);
        
        // Remove version if present (starts with 'v' followed by numbers)
        if (pathAfterUpload[0] && /^v\d+$/.test(pathAfterUpload[0])) {
            pathAfterUpload = pathAfterUpload.slice(1);
        }
        
        // Join the remaining parts and remove file extension
        const publicIdWithExtension = pathAfterUpload.join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
        
        return publicId;
    } catch (error) {
        console.error('Error extracting public ID from URL:', url, error);
        throw new Error('Failed to extract public ID from Cloudinary URL');
    }
}

/**
 * Delete an image from Cloudinary (if configured)
 * @param imageUrl - The Cloudinary image URL
 * @returns Promise that resolves when the image is deleted or skipped
 */
export async function deleteCloudinaryImage(imageUrl: string): Promise<{ deleted: boolean; reason?: string }> {
    // Check if Cloudinary is properly configured
    if (!isCloudinaryConfigured) {
        const reason = 'Cloudinary deletion disabled: API credentials not configured';
        return { deleted: false, reason };
    }

    try {
        const publicId = extractPublicId(imageUrl);
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            return { deleted: true };
        } else if (result.result === 'not found') {
            const reason = 'Image not found in Cloudinary (may have been already deleted)';
            return { deleted: false, reason };
        } else {
            const reason = `Unexpected result from Cloudinary: ${result.result}`;
            console.error('❌', reason);
            return { deleted: false, reason };
        }
    } catch (error) {
        const reason = `Error deleting image from Cloudinary: ${error}`;
        console.error('❌', reason);
        return { deleted: false, reason };
    }
}

export { cloudinary }; 