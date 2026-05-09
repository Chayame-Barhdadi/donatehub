package com.donatehub.dto;

import java.util.List;

public class AiChatResponse {
    private String response;
    private List<String> suggestions;
    private String category;
    private String city;

    public AiChatResponse() {}

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
