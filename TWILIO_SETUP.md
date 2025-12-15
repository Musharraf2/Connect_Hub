# Twilio SMS Integration Setup Guide

This guide explains how to set up **real SMS sending** using Twilio for phone number verification.

## 🚀 Quick Start

### Step 1: Sign Up for Twilio

1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Click "Sign up" and create a free account
3. Verify your email and phone number
4. You'll get **$15.50 in free credit** to test SMS

### Step 2: Get Your Twilio Credentials

After signing up, go to your [Twilio Console](https://console.twilio.com/):

1. **Account SID**: Found on the dashboard (starts with "AC...")
2. **Auth Token**: Click "Show" to reveal it (keep this secret!)
3. **Phone Number**: Go to "Phone Numbers" → "Manage" → "Active numbers"
   - If you don't have one, click "Buy a number" (free with trial credit)
   - Choose a number that supports SMS

### Step 3: Configure Application

You have **two options** to add your credentials:

#### Option A: Using `application.properties` (Development)

Add these lines to `backend/profession-connect/src/main/resources/application.properties`:

```properties
# Twilio SMS Configuration
twilio.enabled=true
twilio.account.sid=YOUR_ACCOUNT_SID_HERE
twilio.auth.token=YOUR_AUTH_TOKEN_HERE
twilio.phone.number=YOUR_TWILIO_PHONE_NUMBER_HERE
```

**Example:**
```properties
twilio.enabled=true
twilio.account.sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
twilio.auth.token=your_auth_token_here
twilio.phone.number=+15551234567
```

#### Option B: Using Environment Variables (Production - **RECOMMENDED**)

Set environment variables (more secure for production):

**Linux/Mac:**
```bash
export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export TWILIO_AUTH_TOKEN=your_auth_token_here
export TWILIO_PHONE_NUMBER=+15551234567
export TWILIO_ENABLED=true
```

**Windows (PowerShell):**
```powershell
$env:TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
$env:TWILIO_AUTH_TOKEN="your_auth_token_here"
$env:TWILIO_PHONE_NUMBER="+15551234567"
$env:TWILIO_ENABLED="true"
```

Then update `application.properties`:
```properties
twilio.enabled=${TWILIO_ENABLED:false}
twilio.account.sid=${TWILIO_ACCOUNT_SID:}
twilio.auth.token=${TWILIO_AUTH_TOKEN:}
twilio.phone.number=${TWILIO_PHONE_NUMBER:}
```

### Step 4: Restart Your Application

Stop and restart your Spring Boot application to load the new configuration.

### Step 5: Test SMS Sending

1. Go to Edit Profile page
2. Enter your phone number with country code
3. Click "Verify"
4. You should receive an SMS with the OTP code!

## 📱 Phone Number Format

- **Country Code**: Select from dropdown (e.g., +1 for US/Canada)
- **Phone Number**: Enter 10 digits without spaces or dashes
- **Example**: Country code `+1` + number `2025551234` = `+12025551234`

## 💰 Twilio Pricing

### Trial Account (Free)
- **$15.50 free credit** when you sign up
- Can send SMS to **verified numbers only**
- Each SMS costs ~$0.0075 (about 2,000 free messages!)

### Paid Account
- **$0.0079 per SMS** in the US
- Can send to **any number** (not just verified ones)
- [See full pricing](https://www.twilio.com/sms/pricing/us)

## 🔒 Security Best Practices

### ⚠️ NEVER commit credentials to Git!

1. **Add to `.gitignore`:**
   ```
   application.properties
   .env
   ```

2. **Use environment variables** in production

3. **Use separate credentials** for dev/staging/production

4. **Rotate credentials** if exposed

5. **Create `.env.example`** file (without actual values):
   ```properties
   twilio.enabled=true
   twilio.account.sid=YOUR_ACCOUNT_SID_HERE
   twilio.auth.token=YOUR_AUTH_TOKEN_HERE
   twilio.phone.number=YOUR_TWILIO_PHONE_NUMBER_HERE
   ```

## 🧪 Testing Without SMS (Development Mode)

If you want to test without real SMS (free development):

**Option 1:** Set `twilio.enabled=false` in `application.properties`
```properties
twilio.enabled=false
```

**Option 2:** Don't configure Twilio credentials at all

In both cases, OTP codes will be printed to the **console** instead of sent via SMS.

## 🐛 Troubleshooting

### SMS Not Sending?

1. **Check console logs** for errors:
   - "✅ Twilio SMS Service initialized successfully" = Good!
   - "❌ Failed to initialize Twilio" = Check credentials

2. **Verify credentials**:
   - Account SID starts with "AC"
   - Phone number includes country code (+15551234567)
   - Auth token is correct (no spaces)

3. **Check Twilio Console**:
   - Go to "Monitor" → "Logs" → "Errors" to see detailed error messages
   - Verify your phone number is SMS-enabled

4. **Trial Account Restrictions**:
   - You can only send to **verified phone numbers**
   - Go to "Phone Numbers" → "Verified Caller IDs" to add numbers

### Still Getting Console OTP?

If configured correctly but still seeing console OTP:
- Check `twilio.enabled=true` is set
- Verify all 3 credentials are present
- Check application logs for initialization messages

### Error: "Unable to create record"

This means your phone number isn't verified in trial mode:
1. Go to Twilio Console
2. Navigate to "Phone Numbers" → "Verified Caller IDs"
3. Click "Add a new Caller ID"
4. Follow verification steps

## 📚 Additional Resources

- [Twilio SMS Quickstart](https://www.twilio.com/docs/sms/quickstart/java)
- [Twilio Console](https://console.twilio.com/)
- [Twilio Support](https://support.twilio.com/)

## ✅ What's Included

This implementation includes:
- ✅ Country code dropdown (20 countries)
- ✅ 10-digit phone number input (separate from country code)
- ✅ Twilio SMS integration with fallback to console
- ✅ Environment variable support for secure credentials
- ✅ Graceful degradation (works without Twilio configured)
- ✅ Real-time phone number validation
- ✅ OTP expiration (5 minutes)
- ✅ Production-ready architecture

## 🎯 Summary

1. **Sign up** for Twilio (free)
2. **Get credentials** from Twilio Console
3. **Add to** `application.properties` or environment variables
4. **Restart** application
5. **Test** by verifying a phone number

That's it! Your users will now receive real SMS messages for phone verification! 🎉
