package com.donatehub.dto;

public class AiItemDTO {
    private Long id;
    private String title;
    private String category;
    private String city;
    private String imageUrl;

    public AiItemDTO() {}

    public AiItemDTO(Long id, String title, String category, String city, String imageUrl) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.city = city;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
