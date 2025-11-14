# Image Upload Features

This document describes the image upload features for profile images and post images using **Cloudinary** cloud storage.

## Features

### 1. Profile Image Upload

Users can upload and display profile images stored on Cloudinary.

**Backend Endpoints:**
- `POST /api/users/{userId}/profile-image` - Upload profile image
  - Request: multipart/form-data with `file` parameter
  - Response: `{ "profileImageUrl": "https://res.cloudinary.com/..." }`
  - Max file size: 10MB
  - Supported formats: jpg, jpeg, png, gif, webp

**Frontend Usage:**
- Navigate to profile page
- Click camera icon on profile avatar
- Select image from file picker
- Upload and see updated profile image instantly

**Database Changes:**
- Added `profileImageUrl` VARCHAR column to `users` table (stores Cloudinary URL)

### 2. Post Image Upload

Users can attach images to their posts, stored on Cloudinary.

**Backend Endpoints:**
- `POST /api/posts/{postId}/image` - Upload post image
  - Request: multipart/form-data with `file` parameter
  - Response: `{ "imageUrl": "https://res.cloudinary.com/..." }`
  - Max file size: 10MB
  - Supported formats: jpg, jpeg, png, gif, webp

**Frontend Usage:**
- Click "Create Post" button
- Write post content (optional if image is provided)
- Click "Add an image" section to upload image
- Preview image before posting
- Submit post with image

**Database Changes:**
- Added `imageUrl` VARCHAR column to `posts` table (stores Cloudinary URL)

## Technical Implementation

### Backend (Spring Boot)

**Dependencies:**
```xml
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.36.0</version>
</dependency>
```

**Services:**
- `FileStorageService` - Handles file upload to Cloudinary
  - Uploads files with automatic folder organization
  - Returns secure HTTPS URLs
  - Supports file deletion

**Configuration:**
```properties
# Cloudinary Configuration
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME:your-cloud-name}
cloudinary.api-key=${CLOUDINARY_API_KEY:your-api-key}
cloudinary.api-secret=${CLOUDINARY_API_SECRET:your-api-secret}
```

**Environment Variables Required:**
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Frontend (Next.js/React)

**Components:**
- `ImageUpload` - Reusable image upload component
  - File picker with preview
  - Validation (type, size)
  - Remove functionality

**API Functions:**
- `uploadProfileImage(userId, file)` - Upload profile image
- `uploadPostImage(postId, file)` - Upload post image

**Updated Pages:**
- Profile page - Profile image upload dialog with live preview
- Home page - Post creation with image support

## Cloudinary Setup

To use this feature, you need a Cloudinary account:

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard:
   - Cloud name
   - API Key
   - API Secret
3. Set environment variables:
   ```bash
   export CLOUDINARY_CLOUD_NAME=your-cloud-name
   export CLOUDINARY_API_KEY=your-api-key
   export CLOUDINARY_API_SECRET=your-api-secret
   ```

## Image Organization

Images are automatically organized in Cloudinary folders:
- `profile-images/` - User profile pictures
- `post-images/` - Post attachments

## Security Considerations

1. **File Type Validation**: Only image files are accepted (server-side check)
2. **File Size Limit**: Maximum 10MB per file
3. **Cloudinary Security**: Images are served via HTTPS
4. **API Key Protection**: Credentials stored in environment variables
5. **Automatic Optimization**: Cloudinary provides automatic image optimization

## Benefits Over Local Storage

1. **Scalability**: No server storage limits
2. **CDN**: Fast global content delivery
3. **Automatic Optimization**: Image compression and format conversion
4. **Reliability**: Built-in backup and redundancy
5. **Transformations**: On-the-fly image resizing and manipulation available

## Future Enhancements

Possible improvements:
- Image transformations (resize, crop, filters)
- Multiple image support per post
- Image galleries
- Video upload support
- Profile cover images
