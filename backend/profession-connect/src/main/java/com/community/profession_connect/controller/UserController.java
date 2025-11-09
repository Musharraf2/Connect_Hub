package com.community.profession_connect.controller;

import com.community.profession_connect.dto.LoginRequest;
import com.community.profession_connect.dto.LoginResponse;
import com.community.profession_connect.dto.RegistrationRequest;
// import com.community.profession_connect.dto.UserDashboardResponse;
import com.community.profession_connect.dto.UserProfileUpdateRequest;
import com.community.profession_connect.model.User;
import com.community.profession_connect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
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
    public ResponseEntity<User> getUserProfile(@PathVariable Long userId) {
        // In a real application, you'd verify the request's user is authorized to view this profile.
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) { // Assuming UserService throws a clear exception if not found
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{userId}") // Use PUT for full update or PATCH for partial
    public ResponseEntity<User> updateProfile(@PathVariable Long userId, @RequestBody UserProfileUpdateRequest updateRequest) {
        try {
            User updatedUser = userService.updateUserProfile(userId, updateRequest);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

