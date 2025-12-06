// /backend/profession-connect/src/main/java/com/community/profession_connect/service/PostService.java
package com.community.profession_connect.service;

import com.community.profession_connect.dto.AiNoteDTO;
import com.community.profession_connect.dto.CommentRequest;
import com.community.profession_connect.dto.CommentResponse;
import com.community.profession_connect.dto.PostRequest;
import com.community.profession_connect.dto.PostResponse;
import com.community.profession_connect.model.AiNote;
import com.community.profession_connect.model.Comment;
import com.community.profession_connect.model.Post;
import com.community.profession_connect.model.PostLike;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.AiNoteRepository;
import com.community.profession_connect.repository.CommentRepository;
import com.community.profession_connect.repository.PostLikeRepository;
import com.community.profession_connect.repository.PostRepository;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private AiNoteService aiNoteService;

    @Autowired
    private AiNoteRepository aiNoteRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private NotificationService notificationService;

    // ------------------- CREATE POST -------------------

    public PostResponse createPost(PostRequest request) {
        Long userId = Objects.requireNonNull(request.getUserId(), "User ID must not be null");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setContent(request.getContent());
        post.setUser(user);
        post.setProfession(user.getProfession());

        // 1) Save post first
        post = postRepository.save(post);

        // Make final copy for thread
// NEW: pass only the ID to the background thread
        final Long savedPostId = post.getId();

        new Thread(() -> {
            try {
                aiNoteService.analyzePost(savedPostId);
            } catch (Exception e) {
                System.out.println("[AI] Note Generation Failed: " + e.getMessage());
            }
        }).start();


        // 3) Return to frontend
        return convertToPostResponse(post, userId);
    }

    // ------------------- FETCH POSTS -------------------

    public List<PostResponse> getPostsByProfession(String profession, Long currentUserId) {
        List<Post> posts = postRepository
                .findByProfessionAndDeletedFalseOrderByCreatedAtDesc(profession);  // 👈 only visible posts
        return posts.stream()
                .map(post -> convertToPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }


    // ------------------- DELETE POST -------------------

    @Transactional
    public String deletePost(Long postId, Long userId) {
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

    // ------------------- LIKE / UNLIKE -------------------

    @Transactional
    public PostResponse toggleLike(Long postId, Long userId) {
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

            // CREATE NOTIFICATION: Only notify if user is NOT liking their own post
            if (!post.getUser().getId().equals(userId)) {
                notificationService.createLikeNotification(
                        post.getUser().getId(),  // Post owner
                        userId,                  // Person who liked
                        postId                   // Post ID
                );
            }
        }

        post = postRepository.save(post);
        return convertToPostResponse(post, userId);
    }

    // ------------------- ADD COMMENT -------------------

    public PostResponse addComment(CommentRequest request) {
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

        // CREATE NOTIFICATION: Only notify if user is NOT commenting on their own post
        if (!post.getUser().getId().equals(userId)) {
            notificationService.createCommentNotification(
                    post.getUser().getId(),  // Post owner
                    userId,                  // Person who commented
                    postId                   // Post ID
            );
        }

        return convertToPostResponse(post, userId);
    }

    // ------------------- GET COMMENTS -------------------

    public List<CommentResponse> getCommentsByPostId(Long postId) {
        Objects.requireNonNull(postId, "Post ID must not be null");

        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
        return comments.stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList());
    }

    // ------------------- MAPPING: Post -> PostResponse -------------------

    private PostResponse convertToPostResponse(Post post, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setProfession(post.getProfession());
        response.setCreatedAt(post.getCreatedAt());
        response.setLikesCount(post.getLikesCount());
        response.setImageUrl(post.getImageUrl());

        // 🔥 AI moderation flag (soft delete)
        response.setDeleted(post.isDeleted());

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

// AI Notes mapping
        List<AiNote> notes = aiNoteRepository.findByPostId(post.getId());
        response.setAiNotes(
                notes.stream()
                        .map(n -> new AiNoteDTO(
                                n.getNoteText(),      // FIXED
                                n.getCategory(),
                                n.isAutoDelete(),
                                n.getCreatedAt() != null ? n.getCreatedAt().toString() : ""
                        ))
                        .collect(Collectors.toList())
        );



        return response;
    }

    // ------------------- UPDATE IMAGE -------------------

    public void updatePostImage(Long postId, String imageUrl) {
        Objects.requireNonNull(postId, "Post ID must not be null");

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setImageUrl(imageUrl);
        postRepository.save(post);
    }

    // ------------------- MAPPING: Comment -> CommentResponse -------------------

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
