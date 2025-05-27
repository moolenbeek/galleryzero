# Cloudinary Upload Preset Setup Guide

## Overview
Your Svelte dashboard now includes the Cloudinary upload widget! To complete the setup, you need to:
1. Create an **upload preset** in your Cloudinary account
2. Set up your **environment variables**
3. Update the **upload preset name** in your code

## Step 1: Set Up Environment Variables

First, create a `.env` file in your project root (if it doesn't exist) and add your Cloudinary configuration:

```bash
# Create .env file in project root
touch .env
```

Add the following to your `.env` file:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset-name
```

**Important:** 
- Replace `your-cloud-name-here` with your actual Cloudinary cloud name
- Replace `your-upload-preset-name` with the preset name you'll create in Step 2
- The `VITE_` prefix is required for SvelteKit to expose these variables to the client

## Step 2: Create an Upload Preset

1. **Log into your Cloudinary Console**
   - Go to [cloudinary.com](https://cloudinary.com) and sign in
   - Navigate to your dashboard

2. **Access Upload Settings**
   - Click on the **Settings** gear icon (⚙️) in the top navigation
   - Select the **Upload** tab from the left sidebar

3. **Create a New Upload Preset**
   - Scroll down to the **Upload presets** section
   - Click **Add upload preset**

4. **Configure Your Upload Preset**
   - **Preset name**: Enter a descriptive name (e.g., `gallery-uploads`)
   - **Signing mode**: Choose **Unsigned** (recommended for client-side uploads)
   - **Asset folder**: Optionally specify a folder name (e.g., `gallery-items`)
   - **Use filename**: Toggle ON if you want to preserve original filenames
   - **Unique filename**: Toggle ON to avoid filename conflicts

5. **Optional Advanced Settings**
   - **Allowed formats**: Restrict to image formats (jpg, png, gif, webp)
   - **Max file size**: Set a reasonable limit (e.g., 10MB)
   - **Image transformations**: Add automatic optimizations if desired

6. **Save the Preset**
   - Click **Save** to create your upload preset
   - Note down the preset name - you'll need it for your environment variables

## Step 3: Update Your Environment Variables

Update your `.env` file with the actual values:

```env
# Replace with your actual values
VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=gallery-uploads
```

## Step 4: Update Your Dashboard Code

Your dashboard code in `src/lib/components/admin/dashboard.svelte` needs to be updated to use the environment variable instead of the placeholder.

**Current code (line ~400):**
```javascript
uploadPreset="your_upload_preset"
```

**Should be changed to:**
```javascript
uploadPreset={import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET}
```

## Step 5: Test the Upload

1. **Restart your development server** (required for environment variables):
   ```bash
   npm run dev
   ```

2. **Navigate to your dashboard** and try uploading an image

3. **Verify the upload**:
   - Check that the image preview appears
   - Verify the image URL is populated in the form
   - Submit the form to ensure the image URL is saved

## Troubleshooting

### "Upload preset not found" Error
- Double-check the preset name in your `.env` file matches exactly what you created
- Ensure the preset is set to "Unsigned" mode
- Verify your cloud name is correct in the `.env` file
- Restart your development server after changing environment variables

### Upload Widget Not Appearing
- Check browser console for JavaScript errors
- Verify the `svelte-cloudinary` package is properly installed
- Ensure your environment variables are correctly set with the `VITE_` prefix
- Make sure you restarted the dev server after adding environment variables

### Images Not Uploading
- Check your internet connection
- Verify the upload preset allows the file type you're trying to upload
- Check if there are file size restrictions in your preset
- Ensure the preset is set to "Unsigned" mode for client-side uploads

### Environment Variables Not Working
- Ensure your `.env` file is in the project root directory
- Use the `VITE_` prefix for all client-side environment variables
- Restart your development server after making changes to `.env`
- Check that `.env` is not listed in your `.gitignore` file (though it should be for security)

## Security Considerations

### For Production:
- Consider using **signed** upload presets for better security
- Implement server-side validation of uploaded images
- Set up appropriate folder structures and access controls
- Monitor your Cloudinary usage and set up billing alerts
- Add your `.env` file to `.gitignore` to avoid committing sensitive data

### Upload Preset Security Settings:
- Set reasonable file size limits
- Restrict allowed file formats
- Consider enabling moderation for user-generated content
- Set up folder permissions if using signed presets

## Next Steps

Once your upload preset is working:

1. **Customize transformations**: Add automatic image optimizations
2. **Set up webhooks**: Get notified when uploads complete
3. **Implement image moderation**: For user-generated content
4. **Add progress indicators**: Enhance user experience during uploads
5. **Set up CDN delivery**: Optimize image delivery performance

## Useful Resources

- [Cloudinary Upload Presets Documentation](https://cloudinary.com/documentation/upload_presets)
- [Svelte Cloudinary Documentation](https://svelte.cloudinary.dev/)
- [Upload Widget API Reference](https://cloudinary.com/documentation/upload_widget_reference)
- [SvelteKit Environment Variables](https://kit.svelte.dev/docs/modules#$env-static-public)

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Cloudinary account settings
3. Test with a simple image file first
4. Consult the Cloudinary documentation for advanced configurations

Your gallery dashboard is now ready to handle image uploads seamlessly! 🎉 