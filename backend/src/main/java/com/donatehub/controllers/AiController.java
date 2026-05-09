package com.donatehub.controllers;

import com.donatehub.dto.AiChatRequest;
import com.donatehub.dto.AiChatResponse;
import com.donatehub.services.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chatWithAi(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiService.getAiResponse(request.getMessage(), request.getSession_id()));
    }
}
