package com.donatehub.services;

import com.donatehub.dto.AiChatRequest;
import com.donatehub.dto.AiChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AiService {

    private final RestTemplate restTemplate;

    @Value("${ai.assistant.url}")
    private String aiServiceUrl;

    public AiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AiChatResponse getAiResponse(String message, String session_id) {
        AiChatRequest request = new AiChatRequest(message, session_id);
        String url = aiServiceUrl + "/api/ai/chat";
        try {
            return restTemplate.postForObject(url, request, AiChatResponse.class);
        } catch (Exception e) {
            AiChatResponse errorResponse = new AiChatResponse();
            errorResponse.setResponse("Désolé, l'assistant IA est temporairement indisponible. Veuillez réessayer plus tard.");
            return errorResponse;
        }
    }
}
