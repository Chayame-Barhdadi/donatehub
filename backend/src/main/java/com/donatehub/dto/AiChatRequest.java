package com.donatehub.dto;

public class AiChatRequest {
    private String message;
    private String session_id;

    public AiChatRequest() {}
    public AiChatRequest(String message, String session_id) { 
        this.message = message; 
        this.session_id = session_id;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSession_id() { return session_id; }
    public void setSession_id(String session_id) { this.session_id = session_id; }
}
