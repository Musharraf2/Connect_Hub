package com.community.profession_connect.service;

import com.community.profession_connect.model.Post;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.PostRepository;
import com.community.profession_connect.repository.UserRepository;
import org.springframework.stereotype.Service;


@Service
public class AiPostService {

    private final GeminiService geminiService;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public AiPostService(
            GeminiService geminiService,
            PostRepository postRepository,
            UserRepository userRepository
    ) {
        this.geminiService = geminiService;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public Post generateAiPost(String profession, String category) {

        String prompt = AiPostPromptTemplate.buildPrompt(profession, category);
        String aiContent = geminiService.generateText(prompt);

        Post post = new Post();
        post.setContent(aiContent);
        post.setProfession(profession);
        post.setAiPost(true);
        post.setAiCategory(category);
        post.setDeleted(false);
        post.setUser(getSystemUser());

        return postRepository.save(post);
    }

    private User getSystemUser() {
        return userRepository.findByEmail("system_ai@connecthub.com")
                .orElseThrow(() ->
                        new RuntimeException("SYSTEM_AI user not found"));
    }

}
