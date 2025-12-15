package com.community.profession_connect.controller;

import com.community.profession_connect.dto.LoginRequest;
import com.community.profession_connect.dto.LoginResponse;
import com.community.profession_connect.dto.RegistrationRequest;
import com.community.profession_connect.dto.UserProfileDetailResponse;
import com.community.profession_connect.dto.UserProfileUpdateRequest;
import com.community.profession_connect.model.User;
import com.community.profession_connect.service.FileStorageService;
import com.community.profession_connect.service.OnlineUserService;
import com.community.profession_connect.service.PhoneVerificationService;
import com.community.profession_connect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final OnlineUserService onlineUserService;
    private final PhoneVerificationService phoneVerificationService;
    private final com.community.profession_connect.service.EmailVerificationService emailVerificationService;
    private final com.community.profession_connect.repository.UserRepository userRepository;

    @Autowired
    public UserController(UserService userService,
                          FileStorageService fileStorageService,
                          OnlineUserService onlineUserService,
                          PhoneVerificationService phoneVerificationService,
                          com.community.profession_connect.service.EmailVerificationService emailVerificationService,
                          com.community.profession_connect.repository.UserRepository userRepository) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
        this.onlineUserService = onlineUserService;
        this.phoneVerificationService = phoneVerificationService;
        this.emailVerificationService = emailVerificationService;
        this.userRepository = userRepository;
    }

    // --------------------------------------------------------------------------------
    // <--- 6. ADD THIS NEW ENDPOINT FOR ONLINE STATUS
    // --------------------------------------------------------------------------------
    @GetMapping("/online-status")
    public ResponseEntity<Set<Long>> getOnlineUsers() {
        return ResponseEntity.ok(onlineUserService.getOnlineUsers());
    }
    // --------------------------------------------------------------------------------

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegistrationRequest request) {
        String message = userService.registerUser(request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.loginUser(request);

            if (response.getName() != null) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (RuntimeException e) {
            // Handle email not verified exception
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(403).body(null);
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            
            Map<String, String> response = new HashMap<>();
            
            if (email == null || email.trim().isEmpty()) {
                response.put("error", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (otp == null || otp.trim().isEmpty()) {
                response.put("error", "OTP is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Verify OTP
            boolean isValid = emailVerificationService.verifyOtp(email, otp);
            
            if (!isValid) {
                response.put("error", "Invalid or expired OTP. Please request a new code.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update email verification status
            user.setIsEmailVerified(true);
            userRepository.save(user);
            
            response.put("message", "Email verified successfully! You can now log in.");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("Error in verifyEmail endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error in verifyEmail endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/by-profession")
    public ResponseEntity<List<User>> getUsersByProfession(@RequestParam String profession) {
        List<User> users = userService.getUsersByProfession(profession);
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDetailResponse> getUserProfile(
            @PathVariable Long userId,
            @RequestParam(required = false) Long requesterId) {
        try {
            UserProfileDetailResponse profile = userService.getUserById(userId, requesterId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateProfile(@PathVariable Long userId, @RequestBody UserProfileUpdateRequest updateRequest) {
        try {
            User updatedUser = userService.updateUserProfile(userId, updateRequest);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Phone Verification Endpoints
    @PostMapping("/{userId}/phone/verify-init")
    public ResponseEntity<Map<String, String>> initiatePhoneVerification(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            String phoneNumber = request.get("phoneNumber");
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Phone number is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            Map<String, String> response = phoneVerificationService.initiateVerification(userId, phoneNumber);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("Error in initiatePhoneVerification endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error in initiatePhoneVerification endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/{userId}/phone/verify-confirm")
    public ResponseEntity<Map<String, String>> confirmPhoneVerification(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            String otp = request.get("otp");
            String phoneNumber = request.get("phoneNumber");
            
            if (otp == null || otp.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "OTP is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Phone number is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Map<String, String> response = phoneVerificationService.completeVerification(userId, otp, phoneNumber);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("Error in confirmPhoneVerification endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error in confirmPhoneVerification endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{userId}/privacy")
    public ResponseEntity<Map<String, String>> updatePhonePrivacy(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean isPhonePublic = request.get("isPhonePublic");
            if (isPhonePublic == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "isPhonePublic is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Map<String, String> response = phoneVerificationService.updatePhonePrivacy(userId, isPhonePublic);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("Error in updatePhonePrivacy endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error in updatePhonePrivacy endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/{userId}/profile-image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
            }

            String filePath = fileStorageService.storeFile(file, "profile-images");
            User user = userService.updateProfileImage(userId, filePath);

            Map<String, String> response = new HashMap<>();
            response.put("profileImageUrl", user.getProfileImageUrl());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    @PostMapping("/{userId}/cover-image")
    public ResponseEntity<Map<String, String>> uploadCoverImage(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
            }

            String filePath = fileStorageService.storeFile(file, "cover-images");
            User user = userService.updateCoverImage(userId, filePath);

            Map<String, String> response = new HashMap<>();
            response.put("coverImageUrl", user.getCoverImageUrl());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload cover image: " + e.getMessage()));
        }
    }
}