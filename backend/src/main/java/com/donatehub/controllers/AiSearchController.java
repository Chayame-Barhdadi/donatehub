package com.donatehub.controllers;

import com.donatehub.dto.AiItemDTO;
import com.donatehub.services.AiSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai/items")
public class AiSearchController {

    private final AiSearchService aiSearchService;

    public AiSearchController(AiSearchService aiSearchService) {
        this.aiSearchService = aiSearchService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<AiItemDTO>> searchItems(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query) {
        
        List<AiItemDTO> results = aiSearchService.searchItemsForAi(city, category, query);
        return ResponseEntity.ok(results);
    }
}
