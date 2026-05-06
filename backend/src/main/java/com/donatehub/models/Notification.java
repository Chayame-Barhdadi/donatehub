package com.donatehub.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "email", "items"})
    private User recipient;

    private String message;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "actor_id")
    @JsonIgnoreProperties({"password", "roles", "email", "items", "city"})
    private User actor;
    
    private String type; // e.g., "COMMENT", "INTEREST"
    
    private Long relatedItemId;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getRelatedItemId() { return relatedItemId; }
    public void setRelatedItemId(Long relatedItemId) { this.relatedItemId = relatedItemId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
