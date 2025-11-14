# Quick Start Guide - Image Upload Features

## Setup Instructions

### Backend Setup

1. **Ensure MySQL is running** with the database configured in `application.properties`

2. **Start the Spring Boot backend**:
   ```bash
   cd backend/profession-connect
   ./mvnw spring-boot:run
   ```

3. **Verify the backend is running** at `http://localhost:8080`

### Frontend Setup

1. **Install dependencies** (if not already done):
   ```bash
   cd Frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the application** at `http://localhost:3000`

## Using the Features

### Uploading a Profile Image

1. **Log in** to your account
2. **Navigate to Profile** page (click on profile icon in header)
3. **Click the camera icon** on your profile avatar
4. **Select an image** from your device
   - Supported formats: JPG, PNG, GIF, WebP
   - Maximum size: 10MB
5. **Preview** the image
6. **Click "Upload"** to save
7. Your profile image will be **updated immediately**

### Posting with Images

1. **Navigate to Home** page
2. **Click "Create Post"** button
3. **Write your post content** (optional if you're uploading an image)
4. **Click "Add an image"** section
5. **Select an image** from your device
   - Supported formats: JPG, PNG, GIF, WebP
   - Maximum size: 10MB
6. **Preview** the image before posting
7. **Click "Post"** to share
8. Your post will appear in the feed **with the image displayed**

## API Endpoints Reference

### Upload Profile Image
```
POST /api/users/{userId}/profile-image
Content-Type: multipart/form-data

Body:
  file: [image file]

Response:
  {
    "profileImageUrl": "profile-images/abc123.jpg"
  }
```

### Upload Post Image
```
POST /api/posts/{postId}/image
Content-Type: multipart/form-data

Body:
  file: [image file]

Response:
  {
    "imageUrl": "post-images/def456.jpg"
  }
```

### View Uploaded Images
```
GET /api/files/{subDirectory}/{filename}
```

## Troubleshooting

### Image Upload Fails

**Problem**: "Failed to upload image"

**Solutions**:
- Check file size (must be under 10MB)
- Verify file is a valid image format
- Ensure backend server is running
- Check browser console for error details

### Image Not Displaying

**Problem**: Image uploaded but not showing

**Solutions**:
- Refresh the page
- Check browser developer tools for 404 errors
- Verify the `uploads/` directory exists in backend
- Check file permissions on uploads directory

### CORS Errors

**Problem**: CORS policy blocking requests

**Solutions**:
- Ensure frontend is running on `http://localhost:3000`
- Backend `@CrossOrigin` is set to `http://localhost:3000`
- Clear browser cache and cookies

## File Structure After Upload

```
backend/profession-connect/
└── uploads/
    ├── profile-images/
    │   ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
    │   └── ...
    └── post-images/
        ├── b2c3d4e5-f6a7-8901-bcde-f12345678901.png
        └── ...
```

## Security Notes

1. **File validation** is performed on both client and server
2. **Unique filenames** (UUIDs) prevent path traversal attacks
3. **Type checking** ensures only images are accepted
4. **Size limits** prevent abuse and server overload
5. Files are stored **locally** (consider cloud storage for production)

## Next Steps

- Test uploading various image formats
- Try uploading images of different sizes
- Create posts with and without images
- Update your profile image multiple times
- Share the app with your team for feedback

## Support

For issues or questions:
1. Check the main `IMAGE_UPLOAD_FEATURES.md` documentation
2. Review browser console for errors
3. Check backend logs for server-side issues
4. Ensure all dependencies are installed
5. Verify database migrations ran successfully
