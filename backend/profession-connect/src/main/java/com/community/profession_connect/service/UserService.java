package com.community.profession_connect.service;

import com.community.profession_connect.dto.LoginRequest;
import com.community.profession_connect.dto.LoginResponse;
import com.community.profession_connect.dto.RegistrationRequest;
import com.community.profession_connect.dto.UserProfileDetailResponse; // <-- IMPORT THIS
import com.community.profession_connect.dto.UserProfileUpdateRequest;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.UserRepository;

// --- CORRECT IMPORTS ---
import com.community.profession_connect.model.AcademicInfo;
import com.community.profession_connect.model.Skill;
import com.community.profession_connect.model.Interest;
import com.community.profession_connect.repository.AcademicInfoRepository;
import com.community.profession_connect.repository.SkillRepository;
import com.community.profession_connect.repository.InterestRepository;
// --- END IMPORTS ---

import com.community.profession_connect.model.ConnectionStatus;
import com.community.profession_connect.repository.ConnectionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // --- INJECT YOUR OTHER REPOSITORIES ---
    @Autowired
    private AcademicInfoRepository academicInfoRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private InterestRepository interestRepository;
    // --- END INJECTIONS ---

    @Autowired
    private ConnectionRepository connectionRepository;

    public String registerUser(RegistrationRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists!";
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // (later you should hash this!)
        user.setProfession(request.getProfession());
        userRepository.save(user);
        return "User registered successfully!";
    }

    public LoginResponse loginUser(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(request.getPassword())) {
                return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getProfession());
            }
        }
        return new LoginResponse(null, null, null, null);
    }

    @Transactional
    public User updateUserProfile(Long userId, UserProfileUpdateRequest updateRequest) {
        Objects.requireNonNull(userId, "User ID must not be null");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Update basic User info
        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        if (updateRequest.getLocation() != null) {
            user.setLocation(updateRequest.getLocation());
        }
        if (updateRequest.getAboutMe() != null) {
            user.setAboutMe(updateRequest.getAboutMe());
        }

        User updatedUser = userRepository.save(user);

        // 2. Update Academic Info (Find or Create)
        if (updateRequest.getUniversity() != null || updateRequest.getMajor() != null || updateRequest.getYear() != null || updateRequest.getGpa() != null) {
            AcademicInfo academicInfo = academicInfoRepository.findByUserId(userId)
                    .orElse(new AcademicInfo()); // Or create a new one

            academicInfo.setUserId(userId);
            academicInfo.setUniversity(updateRequest.getUniversity());
            academicInfo.setMajor(updateRequest.getMajor());
            academicInfo.setYear(updateRequest.getYear());
            academicInfo.setGpa(updateRequest.getGpa());
            academicInfoRepository.save(academicInfo);
        }

        // 3. Update Skills (Delete all, then re-add)
        if (updateRequest.getSkills() != null) {
            skillRepository.deleteByUserId(userId);

            for (String skillName : updateRequest.getSkills()) {
                Skill newSkill = new Skill();
                newSkill.setUserId(userId);
                newSkill.setSkill(skillName);
                skillRepository.save(newSkill);
            }
        }

        // 4. Update Interests (Delete all, then re-add)
        if (updateRequest.getInterests() != null) {
            interestRepository.deleteByUserId(userId);

            for (String interestName : updateRequest.getInterests()) {
                Interest newInterest = new Interest();
                newInterest.setUserId(userId);
                newInterest.setInterest(interestName);
                interestRepository.save(newInterest);
            }
        }

        return updatedUser;
    }


    public List<User> getUsersByProfession(String profession) {
        return userRepository.findByProfession(profession);
    }

    // This method now returns the complete profile DTO
    public UserProfileDetailResponse getUserById(Long id) {
        Objects.requireNonNull(id, "User ID must not be null");

        // 1. Fetch the User
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // 2. Fetch all related data
        AcademicInfo academicInfo = academicInfoRepository.findByUserId(id).orElse(null);
        List<Skill> skills = skillRepository.findAllByUserId(id);
        List<Interest> interests = interestRepository.findAllByUserId(id);

        // --- 3. (NEW) Fetch the counts ---
        int connectionsCount = connectionRepository.countByReceiverAndStatusOrRequesterAndStatus(
                user, ConnectionStatus.ACCEPTED, user, ConnectionStatus.ACCEPTED
        );
        int pendingRequestsCount = connectionRepository.countByReceiverAndStatus(
                user, ConnectionStatus.PENDING
        );

        // 4. Build and return the new complete DTO
        return UserProfileDetailResponse.from(user, academicInfo, skills, interests, connectionsCount, pendingRequestsCount);
    }

    public User updateProfileImage(Long userId, String profileImageUrl) {
        Objects.requireNonNull(userId, "User ID must not be null");
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setProfileImageUrl(profileImageUrl);
        return userRepository.save(user);
    }
}