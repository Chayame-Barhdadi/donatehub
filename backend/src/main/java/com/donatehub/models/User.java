package com.donatehub.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String city;

    @Column(nullable = false)
    private String password;

    private String avatarColor;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    private java.util.Set<Role> roles = new java.util.HashSet<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<DonationItem> items;

    public User() {}

    public User(Long id, String name, String email, String city, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.city = city;
        this.password = password;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public java.util.Set<Role> getRoles() { return roles; }
    public void setRoles(java.util.Set<Role> roles) { this.roles = roles; }
    public List<DonationItem> getItems() { return items; }
    public void setItems(List<DonationItem> items) { this.items = items; }
    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
}
