# Image Upload Features

This document describes the newly implemented image upload features for profile images and post images.

## Features

### 1. Profile Image Upload

Users can now upload and display profile images.

**Backend Endpoints:**
- `POST /api/users/{userId}/profile-image` - Upload profile image
  - Request: multipart/form-data with `file` parameter
  - Response: `{ "profileImageUrl": "profile-images/uuid.ext" }`
  - Max file size: 10MB
  - Supported formats: jpg, jpeg, png, gif, webp

**Frontend Usage:**
- Navigate to profile page
- Click camera icon on profile avatar
- Select image from file picker
- Upload and see updated profile image

**Database Changes:**
- Added `profileImageUrl` VARCHAR column to `users` table

### 2. Post Image Upload

Users can attach images to their posts.

**Backend Endpoints:**
- `POST /api/posts/{postId}/image` - Upload post image
  - Request: multipart/form-data with `file` parameter
  - Response: `{ "imageUrl": "post-images/uuid.ext" }`
  - Max file size: 10MB
  - Supported formats: jpg, jpeg, png, gif, webp

**Frontend Usage:**
- Click "Create Post" button
- Write post content (optional if image is provided)
- Click "Add an image" section to upload image
- Preview image before posting
- Submit post with image

**Database Changes:**
- Added `imageUrl` VARCHAR column to `posts` table

### 3. File Serving

Uploaded images are served through a dedicated endpoint.

**Backend Endpoint:**
- `GET /api/files/{subDirectory}/{filename}` - Serve uploaded files
  - Serves images from local `uploads/` directory
  - Automatically sets correct Content-Type
  - Returns 404 for non-existent files

## Technical Implementation

### Backend (Spring Boot)

**Services:**
- `FileStorageService` - Handles file storage operations
  - Stores files in `uploads/{subDirectory}/` with UUID filenames
  - Validates file types and sizes
  - Supports file deletion

**Controllers:**
- `UserController` - Added profile image upload endpoint
- `PostController` - Added post image upload endpoint
- `FileController` - Serves uploaded files

**Configuration:**
```properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=uploads
```

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
- Profile page - Profile image upload dialog
- Home page - Post creation with image support

## File Structure

```
uploads/
├── profile-images/
│   └── {uuid}.{ext}
└── post-images/
    └── {uuid}.{ext}
```

The `uploads/` directory is excluded from version control via `.gitignore`.

## Security Considerations

1. **File Type Validation**: Only image files are accepted
2. **File Size Limit**: Maximum 10MB per file
3. **UUID Filenames**: Prevents path traversal attacks
4. **No User-Controlled Paths**: Files stored with generated names
5. **Content-Type Verification**: Server validates file types

## Future Enhancements

Possible improvements for future versions:
- Cloud storage integration (AWS S3, Azure Blob, etc.)
- Image compression and optimization
- Multiple image support per post
- Image cropping/editing tools
- Profile cover images
- Image galleries
