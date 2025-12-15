package com.community.profession_connect.controller;

import com.community.profession_connect.dto.JobPostRequest;
import com.community.profession_connect.dto.JobPostResponse;
import com.community.profession_connect.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<JobPostResponse> createJobPost(@RequestBody JobPostRequest request) {
        JobPostResponse response = jobService.createJobPost(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<JobPostResponse>> getAllJobPosts(
            @RequestParam(required = false) String profession,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location
    ) {
        if (profession != null && !profession.isEmpty()) {
            if ((type != null && !type.isEmpty()) || (location != null && !location.isEmpty())) {
                return ResponseEntity.ok(jobService.getFilteredJobPosts(profession, type, location));
            }
            return ResponseEntity.ok(jobService.getJobPostsByProfession(profession));
        }
        return ResponseEntity.ok(jobService.getAllJobPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostResponse> getJobPostById(@PathVariable Long id) {
        JobPostResponse response = jobService.getJobPostById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobPostResponse> updateJobPost(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody JobPostRequest request
    ) {
        JobPostResponse response = jobService.updateJobPost(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJobPost(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        String message = jobService.deleteJobPost(id, userId);
        return ResponseEntity.ok(message);
    }
}
