package com.community.profession_connect.service;

import com.community.profession_connect.dto.JobPostRequest;
import com.community.profession_connect.dto.JobPostResponse;
import com.community.profession_connect.model.JobPost;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.JobPostRepository;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private UserRepository userRepository;

    public JobPostResponse createJobPost(JobPostRequest request) {
        User user = userRepository.findById(request.getPostedBy())
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobPost jobPost = new JobPost();
        jobPost.setTitle(request.getTitle());
        jobPost.setCompanyName(request.getCompanyName());
        jobPost.setLocation(request.getLocation());
        jobPost.setType(request.getType());
        jobPost.setDescription(request.getDescription());
        jobPost.setApplyLink(request.getApplyLink());
        jobPost.setPostedBy(user);
        jobPost.setProfession(request.getProfession());

        JobPost savedJobPost = jobPostRepository.save(jobPost);
        return mapToResponse(savedJobPost);
    }

    public List<JobPostResponse> getAllJobPosts() {
        return jobPostRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobPostResponse> getJobPostsByProfession(String profession) {
        return jobPostRepository.findByProfessionOrderByCreatedAtDesc(profession)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobPostResponse> getFilteredJobPosts(String profession, String type, String location) {
        List<JobPost> jobPosts;

        if (type != null && !type.isEmpty() && location != null && !location.isEmpty()) {
            jobPosts = jobPostRepository.findByTypeAndLocationAndProfessionOrderByCreatedAtDesc(type, location, profession);
        } else if (type != null && !type.isEmpty()) {
            jobPosts = jobPostRepository.findByTypeAndProfessionOrderByCreatedAtDesc(type, profession);
        } else if (location != null && !location.isEmpty()) {
            jobPosts = jobPostRepository.findByLocationAndProfessionOrderByCreatedAtDesc(location, profession);
        } else {
            jobPosts = jobPostRepository.findByProfessionOrderByCreatedAtDesc(profession);
        }

        return jobPosts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JobPostResponse getJobPostById(Long id) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job post not found"));
        return mapToResponse(jobPost);
    }

    public JobPostResponse updateJobPost(Long id, JobPostRequest request, Long userId) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job post not found"));

        if (!jobPost.getPostedBy().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to update this job post");
        }

        jobPost.setTitle(request.getTitle());
        jobPost.setCompanyName(request.getCompanyName());
        jobPost.setLocation(request.getLocation());
        jobPost.setType(request.getType());
        jobPost.setDescription(request.getDescription());
        jobPost.setApplyLink(request.getApplyLink());

        JobPost updatedJobPost = jobPostRepository.save(jobPost);
        return mapToResponse(updatedJobPost);
    }

    public String deleteJobPost(Long id, Long userId) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job post not found"));

        if (!jobPost.getPostedBy().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this job post");
        }

        jobPostRepository.delete(jobPost);
        return "Job post deleted successfully";
    }

    private JobPostResponse mapToResponse(JobPost jobPost) {
        JobPostResponse response = new JobPostResponse();
        response.setId(jobPost.getId());
        response.setTitle(jobPost.getTitle());
        response.setCompanyName(jobPost.getCompanyName());
        response.setLocation(jobPost.getLocation());
        response.setType(jobPost.getType());
        response.setDescription(jobPost.getDescription());
        response.setApplyLink(jobPost.getApplyLink());
        response.setProfession(jobPost.getProfession());
        response.setCreatedAt(jobPost.getCreatedAt());

        User user = jobPost.getPostedBy();
        JobPostResponse.UserProfileResponse userResponse = new JobPostResponse.UserProfileResponse();
        userResponse.setId(user.getId());
        userResponse.setName(user.getName());
        userResponse.setEmail(user.getEmail());
        userResponse.setProfession(user.getProfession());
        userResponse.setProfileImageUrl(user.getProfileImageUrl());
        response.setPostedBy(userResponse);

        return response;
    }
}
