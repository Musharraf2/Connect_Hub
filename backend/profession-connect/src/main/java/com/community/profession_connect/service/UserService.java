// src/main/java/com/community/profession_connect/service/UserService.java

package com.community.profession_connect.service;

import com.community.profession_connect.dto.LoginRequest;
import com.community.profession_connect.dto.LoginResponse; // Make sure this DTO exists and has name, email, and profession fields.
import com.community.profession_connect.dto.RegistrationRequest;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public String registerUser(RegistrationRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists!";
        }

        // Create new User
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // (later you should hash this!)
        user.setProfession(request.getProfession());

        // Save to DB
        userRepository.save(user);

        return "User registered successfully!";
    }

    // ------------------- CORRECTED LOGIN METHOD -------------------
    public LoginResponse loginUser(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(request.getPassword())) {
                // Return a full LoginResponse object with user data on success
                return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getProfession());
            }
        }
        // Return a LoginResponse with null fields for a failed login
        return new LoginResponse(null, null, null, null);
    }

    // This method is correctly implemented as per our previous conversation
    public List<User> getUsersByProfession(String profession) {
        return userRepository.findByProfession(profession);
    }
}