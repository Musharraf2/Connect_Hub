// /backend/profession-connect/src/main/java/com/community/profession_connect/service/PostService.java
package com.community.profession_connect.service;

import com.community.profession_connect.dto.CommentRequest;
import com.community.profession_connect.dto.CommentResponse;
import com.community.profession_connect.dto.PostRequest;
import com.community.profession_connect.dto.PostResponse;
import com.community.profession_connect.model.Comment;
import com.community.profession_connect.model.Post;
import com.community.profession_connect.model.PostLike;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.CommentRepository;
import com.community.profession_connect.repository.PostLikeRepository;
import com.community.profession_connect.repository.PostRepository;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// import java.util.ArrayList; // <-- FIX: REMOVED UNUSED IMPORT
import java.util.List;
import java.util.Objects; // <-- FIX: ADDED IMPORT
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    public PostResponse createPost(PostRequest request) {
        // --- FIX: Check for null and satisfy nullness analyzer ---
        Long userId = Objects.requireNonNull(request.getUserId(), "User ID must not be null");
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setContent(request.getContent());
        post.setUser(user);
        post.setProfession(user.getProfession());

        post = postRepository.save(post);

        return convertToPostResponse(post, userId);
    }

    public List<PostResponse> getPostsByProfession(String profession, Long currentUserId) {
        List<Post> posts = postRepository.findByProfessionOrderByCreatedAtDesc(profession);
        return posts.stream()
            .map(post -> convertToPostResponse(post, currentUserId))
            .collect(Collectors.toList());
    }

    @Transactional
    public String deletePost(Long postId, Long userId) {
        // --- FIX: Check for nulls ---
        Objects.requireNonNull(postId, "Post ID must not be null");
        Objects.requireNonNull(userId, "User ID must not be null");

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own posts");
        }

        postRepository.delete(post);
        return "Post deleted successfully";
    }

    @Transactional
    public PostResponse toggleLike(Long postId, Long userId) {
        // --- FIX: Check for nulls ---
        Objects.requireNonNull(postId, "Post ID must not be null");
        Objects.requireNonNull(userId, "User ID must not be null");

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        PostLike existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId).orElse(null);

        if (existingLike != null) {
            // Unlike
            postLikeRepository.delete(existingLike);
            post.setLikesCount(post.getLikesCount() - 1);
        } else {
            // Like
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
            post.setLikesCount(post.getLikesCount() + 1);
        }

        post = postRepository.save(post);
        return convertToPostResponse(post, userId);
    }

    public PostResponse addComment(CommentRequest request) {
        // --- FIX: Check for nulls ---
        Long postId = Objects.requireNonNull(request.getPostId(), "Post ID must not be null");
        Long userId = Objects.requireNonNull(request.getUserId(), "User ID must not be null");

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setPost(post);
        comment.setUser(user);

        commentRepository.save(comment);

        return convertToPostResponse(post, userId);
    }

    public List<CommentResponse> getCommentsByPostId(Long postId) {
        // --- FIX: Check for null ---
        Objects.requireNonNull(postId, "Post ID must not be null");

        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
        return comments.stream()
            .map(this::convertToCommentResponse)
            .collect(Collectors.toList());
    }

    private PostResponse convertToPostResponse(Post post, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setProfession(post.getProfession());
        response.setCreatedAt(post.getCreatedAt());
        response.setLikesCount(post.getLikesCount());
        response.setImageUrl(post.getImageUrl()); // Add image URL

        // User info
        PostResponse.UserInfo userInfo = new PostResponse.UserInfo();
        userInfo.setId(post.getUser().getId());
        userInfo.setName(post.getUser().getName());
        userInfo.setEmail(post.getUser().getEmail());
        userInfo.setProfession(post.getUser().getProfession());
        response.setUser(userInfo);

        // Check if current user liked this post
        boolean liked = currentUserId != null && 
            postLikeRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent();
        response.setLikedByCurrentUser(liked);

        // Get comments
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(post.getId());
        response.setCommentsCount(comments.size());
        response.setComments(comments.stream()
            .map(this::convertToCommentResponse)
            .collect(Collectors.toList()));

        return response;
    }

    public void updatePostImage(Long postId, String imageUrl) {
        Objects.requireNonNull(postId, "Post ID must not be null");
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        post.setImageUrl(imageUrl);
        postRepository.save(post);
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());

        CommentResponse.UserInfo userInfo = new CommentResponse.UserInfo();
        userInfo.setId(comment.getUser().getId());
        userInfo.setName(comment.getUser().getName());
        response.setUser(userInfo);

        return response;
    }
}