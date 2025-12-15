package com.community.profession_connect.service;

import com.community.profession_connect.config.OpenAIClient;
import com.community.profession_connect.model.ConnectionStatus;
import com.community.profession_connect.model.JobPost;
import com.community.profession_connect.model.User;
import com.community.profession_connect.repository.ConnectionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class TrustScoreService {

    private final ConnectionRepository connectionRepository;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    /**
     * Calculate trust score for a job post based on user factors and content analysis.
     * @param user The user posting the job
     * @param jobPost The job post to analyze
     * @return Trust score (0-100)
     */
    public int calculateScore(User user, JobPost jobPost) {
        int score = 0;

        // --- USER FACTORS ---

        // +20 if user.createdAt > 3 months
        if (user.getCreatedAt() != null) {
            long monthsSinceCreation = ChronoUnit.MONTHS.between(user.getCreatedAt(), LocalDateTime.now());
            if (monthsSinceCreation >= 3) {
                score += 20;
            }
        }

        // +30 if user.phoneNumber is verified
        if (user.getPhoneVerified() != null && user.getPhoneVerified()) {
            score += 30;
        }

        // +10 if user has more than 10 accepted connections
        try {
            int connectionCount = connectionRepository.countByReceiverAndStatusOrRequesterAndStatus(
                user, ConnectionStatus.ACCEPTED, user, ConnectionStatus.ACCEPTED
            );
            if (connectionCount > 10) {
                score += 10;
            }
        } catch (Exception e) {
            System.out.println("[TrustScore] Error counting connections: " + e.getMessage());
        }

        // --- CONTENT FACTORS (AI) ---
        // +40 if job description aligns with profession
        boolean alignsWithProfession = checkProfessionAlignment(jobPost.getDescription(), jobPost.getProfession());
        if (alignsWithProfession) {
            score += 40;
        }

        // Ensure score is between 0-100
        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * Use AI to check if job description aligns with the profession.
     */
    private boolean checkProfessionAlignment(String description, String profession) {
        try {
            String systemPrompt = "You are a job posting validator. Answer only YES or NO.";
            String userPrompt = String.format(
                "Does this job description: '%s' align with the profession '%s'? Answer YES or NO.",
                description, profession
            );

            String body = String.format("""
                {
                  "model": "gpt-4o-mini",
                  "messages": [
                    { "role": "system", "content": %s },
                    { "role": "user", "content": %s }
                  ]
                }
                """,
                objectMapper.writeValueAsString(systemPrompt),
                objectMapper.writeValueAsString(userPrompt)
            );

            String apiResponse = openAIClient.callApi(body);
            JsonNode root = objectMapper.readTree(apiResponse);
            String answer = root.path("choices").get(0)
                    .path("message").path("content").asText("NO").trim().toUpperCase();

            return answer.contains("YES");

        } catch (Exception e) {
            System.out.println("[TrustScore] Error checking profession alignment: " + e.getMessage());
            // On error, assume it doesn't align (fail-safe)
            return false;
        }
    }
}
