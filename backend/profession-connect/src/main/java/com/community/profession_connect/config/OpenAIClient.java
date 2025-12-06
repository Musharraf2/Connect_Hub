package com.community.profession_connect.config;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class OpenAIClient {

    @Value("${openai.api.key}")
    private String apiKey;

    // Single constant URL – no need to pass it each time
    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    /**
     * Call OpenAI Chat Completions API with a JSON body.
     */
    public String callApi(String body) throws Exception {
        try (CloseableHttpClient client = HttpClients.createDefault()) {

            HttpPost post = new HttpPost(OPENAI_URL);
            post.setHeader("Authorization", "Bearer " + apiKey);
            post.setHeader("Content-Type", "application/json");

            post.setEntity(new StringEntity(body, StandardCharsets.UTF_8));

            try (CloseableHttpResponse response = client.execute(post)) {
                return EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
            }
        }
    }
}
