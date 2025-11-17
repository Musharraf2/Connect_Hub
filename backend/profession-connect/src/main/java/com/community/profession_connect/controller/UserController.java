package com.community.profession_connect.controller;

import com.community.profession_connect.dto.LoginRequest;
import com.community.profession_connect.dto.LoginResponse;
import com.community.profession_connect.dto.RegistrationRequest;
import com.community.profession_connect.dto.UserProfileDetailResponse; // <-- IMPORT THIS
import com.community.profession_connect.dto.UserProfileUpdateRequest;
import com.community.profession_connect.model.User;
import com.community.profession_connect.service.FileStorageService;
import com.community.profession_connect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

    @Autowired
    public UserController(UserService userService, FileStorageService fileStorageService) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
    }

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
    public ResponseEntity<UserProfileDetailResponse> getUserProfile(@PathVariable Long userId) { // <-- Use new DTO
        try {
            // This now returns our new DTO
            UserProfileDetailResponse profile = userService.getUserById(userId);
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

    @PostMapping("/{userId}/profile-image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
            }

            // Store file
            String filePath = fileStorageService.storeFile(file, "profile-images");

            // Update user profile
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
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
            }

            // Store file
            String filePath = fileStorageService.storeFile(file, "cover-images");

            // Update user cover image
            User user = userService.updateCoverImage(userId, filePath);

            Map<String, String> response = new HashMap<>();
            response.put("coverImageUrl", user.getCoverImageUrl());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload cover image: " + e.getMessage()));
        }
    }
}