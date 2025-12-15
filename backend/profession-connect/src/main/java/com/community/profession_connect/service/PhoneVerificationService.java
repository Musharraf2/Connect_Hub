package com.community.profession_connect.service;

import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PhoneVerificationService {

    private final UserRepository userRepository;
    private final TwilioSmsService twilioSmsService;
    
    // Store OTP with userId as key, value is OTP data (otp code, phone number, expiration time)
    // NOTE: In-memory storage for development. For production, use Redis with automatic expiration:
    // @Autowired private RedisTemplate<Long, OTPData> redisTemplate;
    private final Map<Long, OTPData> otpStorage = new ConcurrentHashMap<>();
    
    // OTP expires after 5 minutes
    private static final int OTP_EXPIRATION_MINUTES = 5;

    public PhoneVerificationService(UserRepository userRepository, TwilioSmsService twilioSmsService) {
        this.userRepository = userRepository;
        this.twilioSmsService = twilioSmsService;
    }

    /**
     * Initiate phone verification by generating and storing OTP
     */
    public Map<String, String> initiateVerification(Long userId, String phoneNumber) {
        try {
            // Validate phone number format (simple regex for international format)
            if (!isValidPhoneNumber(phoneNumber)) {
                throw new RuntimeException("Invalid phone number format. Use format: +1234567890");
            }

            // Generate 6-digit OTP
            String otp = generateOTP();
            
            // Store OTP with expiration time
            LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);
            otpStorage.put(userId, new OTPData(otp, phoneNumber, expirationTime));

            // Send OTP via Twilio (will fall back to console if not configured)
            boolean smsSent = twilioSmsService.sendOtp(phoneNumber, otp);

            Map<String, String> response = new HashMap<>();
            if (smsSent) {
                response.put("message", "OTP sent successfully to " + maskPhoneNumber(phoneNumber));
            } else {
                response.put("message", "OTP generated. Check console for code (SMS not configured).");
            }
            response.put("expiresIn", OTP_EXPIRATION_MINUTES + " minutes");
            return response;
        } catch (Exception e) {
            System.err.println("Error in initiateVerification: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to initiate verification: " + e.getMessage());
        }
    }

    /**
     * Complete verification by checking OTP
     */
    public Map<String, String> completeVerification(Long userId, String otp, String phoneNumber) {
        // Check if OTP exists for this user
        OTPData storedOTP = otpStorage.get(userId);
        
        if (storedOTP == null) {
            throw new RuntimeException("No OTP found. Please request a new OTP.");
        }

        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(storedOTP.getExpirationTime())) {
            otpStorage.remove(userId);
            throw new RuntimeException("OTP has expired. Please request a new OTP.");
        }

        // Check if OTP matches
        if (!storedOTP.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP. Please try again.");
        }

        // Check if phone number matches
        if (!storedOTP.getPhoneNumber().equals(phoneNumber)) {
            throw new RuntimeException("Phone number mismatch. Please use the same number.");
        }

        // Update user with verified phone number
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPhoneNumber(phoneNumber);
        user.setPhoneVerified(true);
        userRepository.save(user);

        // Remove OTP from storage
        otpStorage.remove(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Phone number verified successfully!");
        response.put("phoneNumber", phoneNumber);
        return response;
    }

    /**
     * Update privacy setting for phone number visibility
     */
    public Map<String, String> updatePhonePrivacy(Long userId, boolean isPhonePublic) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsPhonePublic(isPhonePublic);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Privacy setting updated successfully");
        response.put("isPhonePublic", String.valueOf(isPhonePublic));
        return response;
    }

    /**
     * Generate random 6-digit OTP
     */
    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6-digit number
        return String.valueOf(otp);
    }

    /**
     * Validate phone number format (international format with +)
     */
    private boolean isValidPhoneNumber(String phoneNumber) {
        // Simple regex for international phone format: +[country code][number]
        // Accepts formats like +1234567890, +919876543210, etc.
        return phoneNumber != null && phoneNumber.matches("^\\+[1-9]\\d{1,14}$");
    }

    /**
     * Mask phone number for display (e.g., +1234***890)
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 7) {
            return phoneNumber;
        }
        int visibleDigits = 3;
        String prefix = phoneNumber.substring(0, Math.min(5, phoneNumber.length() - 3));
        String suffix = phoneNumber.substring(phoneNumber.length() - visibleDigits);
        return prefix + "***" + suffix;
    }

    /**
     * Inner class to store OTP data
     */
    private static class OTPData {
        private final String otp;
        private final String phoneNumber;
        private final LocalDateTime expirationTime;

        public OTPData(String otp, String phoneNumber, LocalDateTime expirationTime) {
            this.otp = otp;
            this.phoneNumber = phoneNumber;
            this.expirationTime = expirationTime;
        }

        public String getOtp() {
            return otp;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public LocalDateTime getExpirationTime() {
            return expirationTime;
        }
    }
}
