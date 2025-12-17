package com.community.profession_connect.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

@Component
public class AiPostScheduler {

    private final AiPostService aiPostService;

    private final AtomicInteger professionCounter = new AtomicInteger(0);
    private final AtomicInteger contentCounter = new AtomicInteger(0);

    private static final String[] PROFESSIONS = {
            "STUDENT",
            "TEACHER",
            "DOCTOR"
    };

    private static final String[] CONTENT_TYPES = {
            "BOOK",
            "QUOTE",
            "TIP",
            "NEWS"
    };

    public AiPostScheduler(AiPostService aiPostService) {
        this.aiPostService = aiPostService;
    }

    /**
     * ⏱ Every 1 minute (testing)
     * Change to hourly later: 0 0 * * * ?
     */
    @Scheduled(cron = "0 */1 * * * ?")
    public void generateAiPost() {

        int professionIndex =
                professionCounter.getAndIncrement() % PROFESSIONS.length;

        int contentIndex =
                contentCounter.getAndIncrement() % CONTENT_TYPES.length;

        String profession = PROFESSIONS[professionIndex];
        String contentType = CONTENT_TYPES[contentIndex];

        aiPostService.generateAiPost(profession, contentType);
    }
}
