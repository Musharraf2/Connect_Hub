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

    @Autowired
    public UserController(UserService userService,
                          FileStorageService fileStorageService,
                          OnlineUserService onlineUserService,
                          PhoneVerificationService phoneVerificationService) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
        this.onlineUserService = onlineUserService;
        this.phoneVerificationService = phoneVerificationService;
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
        LoginResponse response = userService.loginUser(request);

        if (response.getName() != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().build();
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
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
            }
            Map<String, String> response = phoneVerificationService.initiateVerification(userId, phoneNumber);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
                return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
            }
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
            }
            
            Map<String, String> response = phoneVerificationService.completeVerification(userId, otp, phoneNumber);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{userId}/privacy")
    public ResponseEntity<Map<String, String>> updatePhonePrivacy(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean isPhonePublic = request.get("isPhonePublic");
            if (isPhonePublic == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "isPhonePublic is required"));
            }
            
            Map<String, String> response = phoneVerificationService.updatePhonePrivacy(userId, isPhonePublic);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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