# Quick Start Guide - Image Upload Features with Cloudinary

## Prerequisites

1. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com) and get your credentials
2. **MySQL Database**: Ensure MySQL is running
3. **Java 17**: Backend requires Java 17+
4. **Node.js**: Frontend requires Node.js for npm

## Setup Instructions

### Cloudinary Configuration

1. **Get Cloudinary Credentials**:
   - Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
   - Copy your:
     - Cloud Name
     - API Key
     - API Secret

2. **Set Environment Variables**:
   
   **Linux/Mac**:
   ```bash
   export CLOUDINARY_CLOUD_NAME=your-cloud-name
   export CLOUDINARY_API_KEY=your-api-key
   export CLOUDINARY_API_SECRET=your-api-secret
   ```
   
   **Windows (CMD)**:
   ```cmd
   set CLOUDINARY_CLOUD_NAME=your-cloud-name
   set CLOUDINARY_API_KEY=your-api-key
   set CLOUDINARY_API_SECRET=your-api-secret
   ```
   
   **Windows (PowerShell)**:
   ```powershell
   $env:CLOUDINARY_CLOUD_NAME="your-cloud-name"
   $env:CLOUDINARY_API_KEY="your-api-key"
   $env:CLOUDINARY_API_SECRET="your-api-secret"
   ```

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend/profession-connect
   ```

2. **Update application.properties** (if needed):
   The default configuration uses environment variables. You can also hardcode values:
   ```properties
   cloudinary.cloud-name=your-cloud-name
   cloudinary.api-key=your-api-key
   cloudinary.api-secret=your-api-secret
   ```

3. **Start the Spring Boot backend**:
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Verify the backend is running** at `http://localhost:8080`

### Frontend Setup

1. **Install dependencies**:
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
7. Your profile image will be **uploaded to Cloudinary and displayed immediately**

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
8. Your post will appear in the feed **with the image served from Cloudinary**

## How It Works

1. **User selects image** in browser
2. **Frontend sends image** to backend via multipart/form-data
3. **Backend uploads to Cloudinary** using Cloudinary SDK
4. **Cloudinary returns secure URL** (e.g., `https://res.cloudinary.com/...`)
5. **Backend saves URL** to database
6. **Frontend displays image** directly from Cloudinary CDN

## API Endpoints Reference

### Upload Profile Image
```
POST /api/users/{userId}/profile-image
Content-Type: multipart/form-data

Body:
  file: [image file]

Response:
  {
    "profileImageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234/profile-images/abc123.jpg"
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
    "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234/post-images/def456.jpg"
  }
```

### View Images
Images are served directly from Cloudinary's CDN - no special endpoint needed. Just use the URL returned from the upload endpoint.

## Troubleshooting

### Image Upload Fails

**Problem**: "Failed to upload image"

**Solutions**:
- Check Cloudinary credentials are set correctly
- Verify file size (must be under 10MB)
- Ensure file is a valid image format
- Check backend server is running
- View backend logs for Cloudinary API errors
- Verify internet connection (backend needs to reach Cloudinary)

### "Cloudinary configuration error"

**Problem**: Backend fails to start or upload fails

**Solutions**:
- Ensure all three environment variables are set:
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
- Check for typos in credentials
- Verify credentials in Cloudinary dashboard
- Restart backend after setting environment variables

### Image Not Displaying

**Problem**: Image uploaded but not showing

**Solutions**:
- Check browser console for CORS or loading errors
- Verify the URL is a valid Cloudinary URL (starts with `https://res.cloudinary.com/`)
- Check browser developer tools network tab
- Ensure Cloudinary account is active
- Try accessing the image URL directly in browser

### CORS Errors

**Problem**: CORS policy blocking requests

**Solutions**:
- Ensure frontend is running on `http://localhost:3000`
- Backend `@CrossOrigin` is set to `http://localhost:3000`
- Clear browser cache and cookies

## Cloudinary Dashboard

Monitor your uploads in the Cloudinary dashboard:
- View all uploaded images
- Check storage usage
- Analyze bandwidth consumption
- Configure delivery optimizations
- Set up image transformations

## Benefits

1. **No Local Storage**: Images stored in cloud, not on server
2. **Fast Delivery**: Cloudinary CDN serves images globally
3. **Automatic Optimization**: Images compressed and optimized automatically
4. **Scalability**: Unlimited storage (based on plan)
5. **Transformations**: Can add image transformations in future

## Next Steps

- Test uploading various image formats
- Try uploading images of different sizes
- Create posts with and without images
- Update your profile image multiple times
- Monitor Cloudinary dashboard for uploads

## Support

For issues or questions:
1. Check the main `IMAGE_UPLOAD_FEATURES.md` documentation
2. Review browser console for errors
3. Check backend logs for Cloudinary API issues
4. Verify Cloudinary credentials
5. Ensure internet connectivity
6. Check Cloudinary status page if service issues suspected
