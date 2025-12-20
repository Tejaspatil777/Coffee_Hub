package com.javabite.javabite_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;
    private Role role;
    private boolean enabled;
    private Instant createdAt;
    private Instant updatedAt;

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public boolean isEnabled() { return enabled; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(Role role) { this.role = role; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    // MongoDB lifecycle methods (no @PrePersist/@PreUpdate annotations needed)
    public void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    public void onUpdate() {
        updatedAt = Instant.now();
    }
}