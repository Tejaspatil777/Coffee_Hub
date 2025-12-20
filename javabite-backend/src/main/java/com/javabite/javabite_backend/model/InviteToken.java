package com.javabite.javabite_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "invite_tokens")
public class InviteToken {
    @Id
    private String id;

    @Indexed(unique = true)
    private String token;

    private String email;
    private String name;
    private Role role;
    private boolean used = false;
    private Instant expiresAt;
    private String invitedByAdmin;
    private Instant createdAt;

    // Getters
    public String getId() { return id; }
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public Role getRole() { return role; }
    public boolean isUsed() { return used; }
    public Instant getExpiresAt() { return expiresAt; }
    public String getInvitedByAdmin() { return invitedByAdmin; }
    public Instant getCreatedAt() { return createdAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setToken(String token) { this.token = token; }
    public void setEmail(String email) { this.email = email; }
    public void setName(String name) { this.name = name; }
    public void setRole(Role role) { this.role = role; }
    public void setUsed(boolean used) { this.used = used; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public void setInvitedByAdmin(String invitedByAdmin) { this.invitedByAdmin = invitedByAdmin; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    // MongoDB lifecycle method
    public void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}