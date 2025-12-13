package com.community.profession_connect.controller;

import com.community.profession_connect.dto.CommentRequest;
import com.community.profession_connect.dto.CommentResponse;
import com.community.profession_connect.dto.PostRequest;
import com.community.profession_connect.dto.PostResponse;
import com.community.profession_connect.service.FileStorageService;
import com.community.profession_connect.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@RequestBody PostRequest request) {
        PostResponse response = postService.createPost(request);
        // Broadcast new post to all subscribers of this profession
        messagingTemplate.convertAndSend("/topic/posts/" + response.getUser().getProfession(), response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-profession")
    public ResponseEntity<List<PostResponse>> getPostsByProfession(
        @RequestParam String profession,
        @RequestParam Long userId
    ) {
        List<PostResponse> posts = postService.getPostsByProfession(profession, userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUserId(
        @PathVariable Long userId,
        @RequestParam Long currentUserId
    ) {
        List<PostResponse> posts = postService.getPostsByUserId(userId, currentUserId);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
        @PathVariable Long postId,
        @RequestParam Long userId,
        @RequestBody PostRequest request
    ) {
        PostResponse response = postService.updatePost(postId, userId, request.getContent());
        // Broadcast update to all subscribers
        messagingTemplate.convertAndSend("/topic/posts/" + response.getUser().getProfession() + "/update", response);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(
        @PathVariable Long postId,
        @RequestParam Long userId
    ) {
        String message = postService.deletePost(postId, userId);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<PostResponse> toggleLike(
        @PathVariable Long postId,
        @RequestParam Long userId
    ) {
        PostResponse response = postService.toggleLike(postId, userId);
        // Broadcast like update to all subscribers
        messagingTemplate.convertAndSend("/topic/posts/" + response.getUser().getProfession() + "/update", response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<PostResponse> addComment(
        @PathVariable Long postId,
        @RequestBody CommentRequest request
    ) {
        request.setPostId(postId);
        PostResponse response = postService.addComment(request);
        // Broadcast comment update to all subscribers
        messagingTemplate.convertAndSend("/topic/posts/" + response.getUser().getProfession() + "/update", response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        List<CommentResponse> comments = postService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{postId}/image")
    public ResponseEntity<Map<String, String>> uploadPostImage(
            @PathVariable Long postId,
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
            String filePath = fileStorageService.storeFile(file, "post-images");

            // Update post with image URL
            postService.updatePostImage(postId, filePath);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", filePath);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    @PostMapping("/{postId}/report")
    public ResponseEntity<Map<String, String>> reportPost(
            @PathVariable Long postId,
            @RequestParam Long userId,
            @RequestParam String reason) {
        try {
            String message = postService.reportPost(postId, userId, reason);
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to report post: " + e.getMessage()));
        }
    }
}
