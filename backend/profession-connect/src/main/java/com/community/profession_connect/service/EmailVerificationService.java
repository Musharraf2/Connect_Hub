package com.community.profession_connect.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

    // Thread-safe storage for OTPs
    // Key: email, Value: Map with "otp" and "timestamp"
    private final Map<String, Map<String, Object>> otpStorage = new ConcurrentHashMap<>();
    
    private static final int OTP_EXPIRATION_MINUTES = 5;
    private final Random random = new Random();

    /**
     * Generate a 6-digit OTP and store it with timestamp
     * @param email User's email address
     * @return The generated OTP
     */
    public String generateOtp(String email) {
        // Generate 6-digit OTP
        int otp = 100000 + random.nextInt(900000);
        String otpString = String.valueOf(otp);
        
        // Store OTP with timestamp
        Map<String, Object> otpData = new HashMap<>();
        otpData.put("otp", otpString);
        otpData.put("timestamp", LocalDateTime.now());
        otpStorage.put(email, otpData);
        
        // Mock email sending - print to console
        System.out.println("========================================");
        System.out.println("EMAILING OTP " + otpString + " to " + email);
        System.out.println("========================================");
        
        return otpString;
    }

    /**
     * Verify the OTP for a given email
     * @param email User's email address
     * @param otp OTP to verify
     * @return true if OTP is valid and not expired, false otherwise
     */
    public boolean verifyOtp(String email, String otp) {
        Map<String, Object> otpData = otpStorage.get(email);
        
        if (otpData == null) {
            System.out.println("No OTP found for email: " + email);
            return false;
        }
        
        String storedOtp = (String) otpData.get("otp");
        LocalDateTime timestamp = (LocalDateTime) otpData.get("timestamp");
        
        // Check if OTP matches
        if (!storedOtp.equals(otp)) {
            System.out.println("Invalid OTP for email: " + email);
            return false;
        }
        
        // Check if OTP is expired (more than 5 minutes old)
        if (isOtpExpired(timestamp)) {
            System.out.println("OTP expired for email: " + email);
            otpStorage.remove(email); // Remove expired OTP
            return false;
        }
        
        // OTP is valid - remove it from storage (one-time use)
        otpStorage.remove(email);
        System.out.println("Email verified successfully for: " + email);
        return true;
    }

    /**
     * Check if OTP is expired (older than OTP_EXPIRATION_MINUTES)
     * @param timestamp Timestamp when OTP was generated
     * @return true if expired, false otherwise
     */
    private boolean isOtpExpired(LocalDateTime timestamp) {
        LocalDateTime expirationTime = timestamp.plusMinutes(OTP_EXPIRATION_MINUTES);
        return LocalDateTime.now().isAfter(expirationTime);
    }

    /**
     * Check if an OTP exists for an email and is not expired
     * @param email User's email address
     * @return true if valid OTP exists, false otherwise
     */
    public boolean hasValidOtp(String email) {
        Map<String, Object> otpData = otpStorage.get(email);
        if (otpData == null) {
            return false;
        }
        
        LocalDateTime timestamp = (LocalDateTime) otpData.get("timestamp");
        return !isOtpExpired(timestamp);
    }

    /**
     * Resend OTP (regenerate and store new OTP)
     * @param email User's email address
     * @return The new OTP
     */
    public String resendOtp(String email) {
        // Remove old OTP if exists
        otpStorage.remove(email);
        // Generate and return new OTP
        return generateOtp(email);
    }
}
