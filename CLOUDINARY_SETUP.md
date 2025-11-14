# Cloudinary Configuration Guide

This guide explains how to configure Cloudinary for image uploads in the Connect_Hub application.

## Getting Cloudinary Credentials

### Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email address

### Step 2: Access Your Dashboard

1. Log in to [https://cloudinary.com/console](https://cloudinary.com/console)
2. You'll see your account details on the dashboard

### Step 3: Copy Your Credentials

From the dashboard, copy these three values:

- **Cloud Name**: Your unique Cloudinary identifier
- **API Key**: Your application's API key
- **API Secret**: Your application's secret key (click "👁 Reveal" to view)

## Configuration Methods

### Method 1: Environment Variables (Recommended)

Set environment variables before starting the backend:

**Linux/Mac:**
```bash
export CLOUDINARY_CLOUD_NAME=your-cloud-name
export CLOUDINARY_API_KEY=your-api-key
export CLOUDINARY_API_SECRET=your-api-secret
```

**Windows (Command Prompt):**
```cmd
set CLOUDINARY_CLOUD_NAME=your-cloud-name
set CLOUDINARY_API_KEY=your-api-key
set CLOUDINARY_API_SECRET=your-api-secret
```

**Windows (PowerShell):**
```powershell
$env:CLOUDINARY_CLOUD_NAME="your-cloud-name"
$env:CLOUDINARY_API_KEY="your-api-key"
$env:CLOUDINARY_API_SECRET="your-api-secret"
```

### Method 2: Application Properties File

Edit `backend/profession-connect/src/main/resources/application.properties`:

```properties
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret
```

⚠️ **Security Warning**: Don't commit API secrets to version control!

### Method 3: IDE Configuration (IntelliJ IDEA)

1. Open Run Configuration
2. Go to "Environment Variables"
3. Add:
   - `CLOUDINARY_CLOUD_NAME=your-cloud-name`
   - `CLOUDINARY_API_KEY=your-api-key`
   - `CLOUDINARY_API_SECRET=your-api-secret`

### Method 4: Docker Environment

If using Docker, add to `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - CLOUDINARY_CLOUD_NAME=your-cloud-name
      - CLOUDINARY_API_KEY=your-api-key
      - CLOUDINARY_API_SECRET=your-api-secret
```

## Verifying Configuration

### Test Backend Startup

Start the backend and check logs for:

```
✓ Cloudinary configured successfully
```

If you see errors like "Cloudinary not configured", check:
1. Environment variables are set correctly
2. No typos in variable names
3. Terminal/IDE was restarted after setting variables

### Test Image Upload

1. Start both backend and frontend
2. Log in to the application
3. Try uploading a profile image
4. Check Cloudinary dashboard for the uploaded image

## Cloudinary Dashboard Features

### Media Library

View all uploaded images:
1. Go to **Media Library** in Cloudinary dashboard
2. See folders: `profile-images/` and `post-images/`
3. Click on images to see details and URLs

### Usage Monitoring

Track your usage:
1. Go to **Dashboard** → **Usage**
2. Monitor:
   - Storage used
   - Bandwidth consumed
   - Transformations performed
   - API requests made

### Free Tier Limits

Cloudinary free plan includes:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **API Requests**: Unlimited

## Security Best Practices

### 1. Keep API Secret Private

❌ **DON'T**:
```properties
# In application.properties (committed to git)
cloudinary.api-secret=my-secret-key-12345
```

✅ **DO**:
```properties
# In application.properties
cloudinary.api-secret=${CLOUDINARY_API_SECRET}
```

### 2. Use Environment-Specific Credentials

- Development: Use test Cloudinary account
- Production: Use separate production account
- Never share credentials between environments

### 3. Rotate API Keys Regularly

1. Generate new API key in Cloudinary dashboard
2. Update environment variables
3. Restart application
4. Delete old key from Cloudinary

### 4. Restrict Upload Permissions

In Cloudinary dashboard:
1. Go to **Settings** → **Security**
2. Enable upload presets
3. Configure allowed formats and sizes

## Troubleshooting

### "Invalid credentials" error

**Cause**: Wrong API key or secret

**Solution**:
1. Double-check credentials in Cloudinary dashboard
2. Ensure no extra spaces in environment variables
3. Re-copy credentials directly from dashboard

### "Cloud name not found" error

**Cause**: Incorrect cloud name

**Solution**:
1. Verify cloud name in dashboard (not your email/username)
2. Cloud name is usually lowercase, no spaces
3. Check for typos

### Images not uploading

**Cause**: Network or permission issues

**Solution**:
1. Check internet connection
2. Verify Cloudinary account is active
3. Check if you've exceeded free tier limits
4. Review backend logs for detailed error messages

### Environment variables not working

**Cause**: Variables not set in correct scope

**Solution**:
1. Restart terminal/IDE after setting variables
2. Check variable is set: `echo $CLOUDINARY_CLOUD_NAME` (Linux/Mac)
3. For Windows: `echo %CLOUDINARY_CLOUD_NAME%`
4. Ensure variables are set in same session as backend

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Java SDK Reference](https://cloudinary.com/documentation/java_integration)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
- [Media Library Guide](https://cloudinary.com/documentation/dam_media_library)

## Support

If you encounter issues:

1. **Check Cloudinary Status**: [status.cloudinary.com](https://status.cloudinary.com)
2. **Review Logs**: Check backend console for detailed errors
3. **Test Credentials**: Use Cloudinary's API explorer
4. **Contact Support**: Cloudinary support for account-specific issues
