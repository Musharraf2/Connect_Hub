package com.community.profession_connect.controller;

import com.community.profession_connect.model.AiNote;
import com.community.profession_connect.repository.AiNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai-notes")
@RequiredArgsConstructor
public class AiNoteController {

    private final AiNoteRepository repo;

    @GetMapping("/{postId}")
    public List<AiNote> getNotes(@PathVariable Long postId) {
        return repo.findByPostId(postId);
    }
}
