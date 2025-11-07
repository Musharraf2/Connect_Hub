# Connection Feature Troubleshooting Guide

## Issue: "Failed to fetch" errors when using connection features

If you're seeing errors like:
- `Error: Failed to fetch pending requests`
- `Error: Failed to fetch accepted connections`
- `Error: Failed to send connection request`

Follow these troubleshooting steps:

## Step 1: Restart the Backend Server

**IMPORTANT**: After the latest code changes (commit b967a63), you MUST restart your Spring Boot backend server for the changes to take effect.

### How to restart:

1. **Stop the current backend server** (if running):
   - Press `Ctrl+C` in the terminal where the backend is running
   - Or kill the Java process

2. **Rebuild and start the backend**:
   ```bash
   cd backend/profession-connect
   mvn clean install
   mvn spring-boot:run
   ```

3. **Verify the backend is running**:
   - Check that you see: `Started ProfessionConnectApplication`
   - Default port should be: `http://localhost:8080`

## Step 2: Verify Database is Running

The backend requires a MySQL database. Make sure:

1. **MySQL is running** on `localhost:3306`
2. **Database exists**: `professiondb`
3. **Credentials match** (from `application.properties`):
   - Username: `root`
   - Password: `Musharraf@123`

### Quick MySQL check:
```bash
mysql -u root -p
# Enter password: Musharraf@123
SHOW DATABASES;
# Should see 'professiondb' in the list
USE professiondb;
SHOW TABLES;
# Should see 'users' and 'connections' tables
```

## Step 3: Check for Detailed Error Messages

With the latest frontend changes, error messages now include:
- HTTP status code
- Backend error response

**Check the browser console** for detailed error information like:
- `Failed to fetch pending requests: 500 - Internal Server Error`
- `Failed to fetch pending requests: 404 - Not Found`
- `Failed to fetch pending requests: Failed to fetch` (means backend not reachable)

## Step 4: Verify CORS Configuration

The backend should allow requests from `http://localhost:3000`. This is configured in the `ConnectionController` with:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

Make sure your frontend is running on port 3000.

## Step 5: Common Issues and Solutions

### Issue: "Failed to fetch" (no status code)
**Cause**: Backend is not running or not reachable
**Solution**: Start/restart the backend server (Step 1)

### Issue: "500 - Internal Server Error"
**Cause**: Database connection issue or query error
**Solution**: Check database is running and tables exist (Step 2)

### Issue: "404 - Not Found"
**Cause**: Backend routes not registered properly
**Solution**: Restart backend after rebuild with `mvn clean install`

### Issue: JSON parse error
**Cause**: This should be fixed with the ConnectionResponse DTO
**Solution**: Make sure backend is rebuilt and restarted with latest code

## Step 6: Verify API Endpoints Manually

Test the endpoints directly using curl or browser:

```bash
# Test pending requests (replace {userId} with actual user ID)
curl http://localhost:8080/api/connections/pending/1

# Test accepted connections
curl http://localhost:8080/api/connections/accepted/1

# Test send connection (using POST)
curl -X POST "http://localhost:8080/api/connections/send?requesterId=1&receiverId=2"
```

Expected responses:
- GET endpoints: JSON array `[...]` or empty array `[]`
- POST endpoint: Text response like `"Connection request sent successfully"`

## What Changed in the Latest Fix

The latest fix (commit b967a63) introduced a `ConnectionResponse` DTO to prevent JSON serialization errors. This change:

1. **Added**: `ConnectionResponse.java` DTO class
2. **Modified**: `ConnectionService.java` to return DTOs instead of entities
3. **Modified**: `ConnectionController.java` to use DTOs in API responses

**Critical**: These backend changes require a server restart to take effect.

## Need More Help?

If errors persist after following all steps:
1. Share the **exact error message** from browser console (with status code)
2. Share **backend logs** from the terminal where Spring Boot is running
3. Confirm all steps above were completed
