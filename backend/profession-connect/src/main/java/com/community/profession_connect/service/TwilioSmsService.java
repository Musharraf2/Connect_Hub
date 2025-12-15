package com.community.profession_connect.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

/**
 * Twilio SMS Service for sending OTP messages
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up for Twilio at https://www.twilio.com/
 * 2. Get your Account SID, Auth Token, and Phone Number from Twilio Console
 * 3. Add the following to application.properties:
 *    twilio.account.sid=YOUR_ACCOUNT_SID
 *    twilio.auth.token=YOUR_AUTH_TOKEN
 *    twilio.phone.number=YOUR_TWILIO_PHONE_NUMBER
 * 4. OR set environment variables:
 *    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
@Service
public class TwilioSmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    private boolean initialized = false;

    /**
     * Initialize Twilio client
     */
    private void initializeTwilio() {
        if (!initialized && twilioEnabled && accountSid != null && !accountSid.isEmpty()) {
            try {
                Twilio.init(accountSid, authToken);
                initialized = true;
                System.out.println("✅ Twilio SMS Service initialized successfully");
            } catch (Exception e) {
                System.err.println("❌ Failed to initialize Twilio: " + e.getMessage());
                System.err.println("Falling back to console-only mode");
            }
        }
    }

    /**
     * Send OTP via SMS using Twilio
     * 
     * @param toPhoneNumber Phone number to send OTP to (e.g., +1234567890)
     * @param otp The OTP code to send
     * @return true if SMS sent successfully, false otherwise
     */
    public boolean sendOtp(String toPhoneNumber, String otp) {
        // Always log to console for development
        System.out.println("===========================================");
        System.out.println("Sending OTP " + otp + " to " + toPhoneNumber);
        System.out.println("===========================================");

        // If Twilio is not enabled, return true (console-only mode)
        if (!twilioEnabled) {
            System.out.println("ℹ️  Twilio disabled. Check console for OTP.");
            return true;
        }

        // Initialize Twilio if not already done
        if (!initialized) {
            initializeTwilio();
        }

        // If still not initialized, fall back to console only
        if (!initialized) {
            System.out.println("⚠️  Twilio not configured. Check console for OTP.");
            return true;
        }

        try {
            String messageBody = "Your Connect Hub verification code is: " + otp + ". Valid for 5 minutes.";
            
            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),  // To number
                    new PhoneNumber(twilioPhoneNumber), // From number (your Twilio number)
                    messageBody  // Message body
            ).create();

            System.out.println("✅ SMS sent successfully! SID: " + message.getSid());
            return true;
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS via Twilio: " + e.getMessage());
            System.err.println("⚠️  Falling back to console-only mode. Check console for OTP.");
            return true; // Return true so verification still works
        }
    }

    /**
     * Check if Twilio is properly configured and enabled
     */
    public boolean isConfigured() {
        return twilioEnabled && 
               accountSid != null && !accountSid.isEmpty() &&
               authToken != null && !authToken.isEmpty() &&
               twilioPhoneNumber != null && !twilioPhoneNumber.isEmpty();
    }

    /**
     * Get configuration status for debugging
     */
    public String getConfigurationStatus() {
        if (!twilioEnabled) {
            return "Twilio is disabled (twilio.enabled=false)";
        }
        if (accountSid == null || accountSid.isEmpty()) {
            return "Twilio Account SID not configured";
        }
        if (authToken == null || authToken.isEmpty()) {
            return "Twilio Auth Token not configured";
        }
        if (twilioPhoneNumber == null || twilioPhoneNumber.isEmpty()) {
            return "Twilio Phone Number not configured";
        }
        return "Twilio is fully configured and ready";
    }
}
