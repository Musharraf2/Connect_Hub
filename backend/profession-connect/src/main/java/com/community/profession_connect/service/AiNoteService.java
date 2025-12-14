package com.community.profession_connect.service;

import com.community.profession_connect.config.OpenAIClient;
import com.community.profession_connect.model.AiNote;
import com.community.profession_connect.model.Post;
import com.community.profession_connect.repository.AiNoteRepository;
import com.community.profession_connect.repository.PostRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiNoteService {

    private final OpenAIClient openAIClient;
    private final AiNoteRepository aiNoteRepository;
    private final PostRepository postRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void analyzePost(Long postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

            if (post.isDeleted()) return;

            String systemPrompt = """
                    You are a content-moderation and fact-checking assistant for a student community app.
                    Given this post, answer in JSON with ONLY this structure:
                    {
                      "auto_delete": true or false,
                      "category": "sexually explicit | hate speech | misinformation | safe | other",
                      "note": "short disclaimer to show under the post"
                    }
                    Important: Posts with images but minimal text are usually safe content sharing. Only flag if explicitly harmful.
                    """;

            // Build post content description including image info
            StringBuilder postDescription = new StringBuilder("Post content:\n\"");
            postDescription.append(post.getContent() != null ? post.getContent() : "");
            postDescription.append("\"");
            
            if (post.getImageUrl() != null && !post.getImageUrl().isEmpty()) {
                postDescription.append("\n[Post includes an image attachment]");
            }

            String body = """
                    {
                      "model": "gpt-4.1-mini",
                      "messages": [
                        { "role": "system", "content": %s },
                        { "role": "user", "content": %s }
                      ],
                      "response_format": { "type": "json_object" }
                    }
                    """.formatted(
                    objectMapper.writeValueAsString(systemPrompt),
                    objectMapper.writeValueAsString(postDescription.toString())
            );

            String apiResponse = openAIClient.callApi(body);

            JsonNode root = objectMapper.readTree(apiResponse);
            JsonNode contentNode = root.path("choices").get(0)
                    .path("message").path("content");

            JsonNode result = objectMapper.readTree(contentNode.asText());

            boolean autoDelete = result.path("auto_delete").asBoolean(false);
            String category = result.path("category").asText("safe");
            String noteText = result.path("note").asText("");

            if (autoDelete) {
                post.setDeleted(true);
                postRepository.save(post);
            }

            AiNote note = new AiNote();
            note.setPost(post);
            note.setCategory(category);
            note.setNoteText(noteText);
            note.setAutoDelete(autoDelete);

            aiNoteRepository.save(note);

        } catch (Exception ex) {
            System.out.println("[AI] analyzePost failed: " + ex.getMessage());
        }
    }
}
