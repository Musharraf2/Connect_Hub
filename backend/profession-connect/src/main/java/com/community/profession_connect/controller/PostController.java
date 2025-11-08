package com.community.profession_connect.controller;

import com.community.profession_connect.dto.CommentRequest;
import com.community.profession_connect.dto.CommentResponse;
import com.community.profession_connect.dto.PostRequest;
import com.community.profession_connect.dto.PostResponse;
import com.community.profession_connect.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@RequestBody PostRequest request) {
        PostResponse response = postService.createPost(request);
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
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<PostResponse> addComment(
        @PathVariable Long postId,
        @RequestBody CommentRequest request
    ) {
        request.setPostId(postId);
        PostResponse response = postService.addComment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        List<CommentResponse> comments = postService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }
}
