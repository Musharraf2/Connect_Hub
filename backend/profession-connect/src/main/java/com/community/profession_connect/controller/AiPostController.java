package com.community.profession_connect.controller;

import com.community.profession_connect.dto.AiPostRequestDTO;
import com.community.profession_connect.model.Post;
import com.community.profession_connect.service.AiPostService;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/ai-post")
public class AiPostController {

    private final AiPostService aiPostService;

    public AiPostController(AiPostService aiPostService) {
        this.aiPostService = aiPostService;
    }

    @PostMapping("/generate")
    public Post generatePost(@RequestBody AiPostRequestDTO dto) {
        return aiPostService.generateAiPost(
                dto.getProfession(),
                dto.getCategory()
        );
    }
}


