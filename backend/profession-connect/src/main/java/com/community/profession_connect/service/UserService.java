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
import com.community.profession_connect.model.Achievement;
import com.community.profession_connect.repository.AcademicInfoRepository;
import com.community.profession_connect.repository.SkillRepository;
import com.community.profession_connect.repository.InterestRepository;
import com.community.profession_connect.repository.AchievementRepository;
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

    @Autowired
    private AchievementRepository achievementRepository;
    // --- END INJECTIONS ---

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private EmailVerificationService emailVerificationService;

    public String registerUser(RegistrationRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists!";
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // (later you should hash this!)
        user.setProfession(request.getProfession());
        // User is created with isEmailVerified = false (set in @PrePersist)
        userRepository.save(user);
        
        // Generate OTP for email verification
        emailVerificationService.generateOtp(user.getEmail());
        
        return "OTP_SENT";
    }

    public LoginResponse loginUser(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // Check if email is verified before allowing login
            if (user.getIsEmailVerified() == null || !user.getIsEmailVerified()) {
                throw new RuntimeException("Email not verified. Please check your email for the verification code.");
            }
            
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

        // 1. Update basic User info (excluding phoneNumber which requires verification)
        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        if (updateRequest.getLocation() != null) {
            user.setLocation(updateRequest.getLocation());
        }
        if (updateRequest.getAboutMe() != null) {
            user.setAboutMe(updateRequest.getAboutMe());
        }
        // phoneNumber is NOT updated here - must use verification endpoints
        if (updateRequest.getCoverImageUrl() != null) {
            user.setCoverImageUrl(updateRequest.getCoverImageUrl());
        }
        if (updateRequest.getProfileImageUrl() != null) {
            user.setProfileImageUrl(updateRequest.getProfileImageUrl());
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

        // 5. Update Achievements (Delete all, then re-add)
        if (updateRequest.getAchievements() != null) {
            achievementRepository.deleteByUserId(userId);

            for (String achievementText : updateRequest.getAchievements()) {
                Achievement newAchievement = new Achievement();
                newAchievement.setUser(user);
                newAchievement.setAchievement(achievementText);
                achievementRepository.save(newAchievement);
            }
        }

        return updatedUser;
    }


    public List<User> getUsersByProfession(String profession) {
        return userRepository.findByProfession(profession);
    }

    // This method now returns the complete profile DTO with privacy controls
    public UserProfileDetailResponse getUserById(Long id) {
        return getUserById(id, null);
    }

    // Overloaded method with requester ID for privacy checks
    public UserProfileDetailResponse getUserById(Long targetUserId, Long requesterId) {
        Objects.requireNonNull(targetUserId, "User ID must not be null");

        // 1. Fetch the User
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + targetUserId));

        // 2. Fetch all related data
        AcademicInfo academicInfo = academicInfoRepository.findByUserId(targetUserId).orElse(null);
        List<Skill> skills = skillRepository.findAllByUserId(targetUserId);
        List<Interest> interests = interestRepository.findAllByUserId(targetUserId);
        List<Achievement> achievementsEntities = achievementRepository.findByUserId(targetUserId);
        List<String> achievements = achievementsEntities.stream()
                .map(Achievement::getAchievement)
                .toList();

        // --- 3. (NEW) Fetch the counts ---
        int connectionsCount = connectionRepository.countByReceiverAndStatusOrRequesterAndStatus(
                user, ConnectionStatus.ACCEPTED, user, ConnectionStatus.ACCEPTED
        );
        int pendingRequestsCount = connectionRepository.countByReceiverAndStatus(
                user, ConnectionStatus.PENDING
        );

        // 4. Build the DTO
        UserProfileDetailResponse response = UserProfileDetailResponse.from(
            user, academicInfo, skills, interests, achievements, connectionsCount, pendingRequestsCount
        );

        // 5. Apply privacy controls for phone number
        boolean isOwnProfile = requesterId != null && requesterId.equals(targetUserId);
        boolean isPhonePublic = user.getIsPhonePublic() != null && user.getIsPhonePublic();
        
        if (!isOwnProfile && !isPhonePublic) {
            // Hide phone number if not own profile and not public
            response.setPhoneNumber(null);
        }

        return response;
    }

    public User updateProfileImage(Long userId, String profileImageUrl) {
        Objects.requireNonNull(userId, "User ID must not be null");
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setProfileImageUrl(profileImageUrl);
        return userRepository.save(user);
    }

    public User updateCoverImage(Long userId, String coverImageUrl) {
        Objects.requireNonNull(userId, "User ID must not be null");
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setCoverImageUrl(coverImageUrl);
        return userRepository.save(user);
    }
}