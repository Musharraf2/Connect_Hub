package com.community.profession_connect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

    // Inject the JavaMailSender we configured in application.properties
    @Autowired
    private JavaMailSender mailSender;

    // Read the email username to use as the "From" address
    @Value("${spring.mail.username}")
    private String fromEmail;

    private final Map<String, Map<String, Object>> otpStorage = new ConcurrentHashMap<>();
    private static final int OTP_EXPIRATION_MINUTES = 5;
    private final Random random = new Random();

    public String generateOtp(String email) {
        int otp = 100000 + random.nextInt(900000);
        String otpString = String.valueOf(otp);

        // Store OTP
        Map<String, Object> otpData = new ConcurrentHashMap<>();
        otpData.put("otp", otpString);
        otpData.put("timestamp", LocalDateTime.now());
        otpStorage.put(email, otpData);

        // --- PRODUCTION CHANGE: Send Real Email ---
        sendEmail(email, "ConnectHub Verification Code", "Your OTP is: " + otpString);

        System.out.println("✅ Email sent to " + email);
        return otpString;
    }

    // New method to handle actual email sending
    @Async // Makes it non-blocking so the UI doesn't freeze while sending
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
            // In production, you might want to throw this or log it to a file
        }
    }

    // ... (Keep your existing verifyOtp, isOtpExpired, hasValidOtp methods as they are) ...

    public boolean verifyOtp(String email, String otp) {
        Map<String, Object> otpData = otpStorage.get(email);

        if (otpData == null) return false;

        String storedOtp = (String) otpData.get("otp");
        LocalDateTime timestamp = (LocalDateTime) otpData.get("timestamp");

        if (!storedOtp.equals(otp)) return false;

        if (isOtpExpired(timestamp)) {
            otpStorage.remove(email);
            return false;
        }

        otpStorage.remove(email);
        return true;
    }

    private boolean isOtpExpired(LocalDateTime timestamp) {
        LocalDateTime expirationTime = timestamp.plusMinutes(OTP_EXPIRATION_MINUTES);
        return LocalDateTime.now().isAfter(expirationTime);
    }

    public String resendOtp(String email) {
        otpStorage.remove(email);
        return generateOtp(email);
    }
}