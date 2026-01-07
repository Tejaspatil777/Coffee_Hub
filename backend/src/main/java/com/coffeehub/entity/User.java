package com.coffeehub.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Size(min = 6)
    @Column(nullable = false)
    private String password;

    @NotBlank
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Invitation fields
    @Column(name = "invitation_token", unique = true)
    private String invitationToken;

    @Column(name = "invitation_sent_at")
    private LocalDateTime invitationSentAt;

    @Column(name = "invitation_accepted_at")
    private LocalDateTime invitationAcceptedAt;

    // Staff capacity fields
    @Column(name = "max_active_orders")
    private Integer maxActiveOrders = 10;

    @Column(name = "current_active_orders")
    private Integer currentActiveOrders = 0;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public boolean canAcceptOrder() {
        return isAvailable != null && isAvailable && 
               enabled != null && enabled &&
               currentActiveOrders != null && maxActiveOrders != null &&
               (currentActiveOrders < maxActiveOrders);
    }

    public void incrementActiveOrders() {
        if (this.currentActiveOrders == null) {
            this.currentActiveOrders = 0;
        }
        this.currentActiveOrders++;
    }

    public void decrementActiveOrders() {
        if (this.currentActiveOrders != null && this.currentActiveOrders > 0) {
            this.currentActiveOrders--;
        }
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public enum Role {
        ADMIN, CHEF, WAITER, CUSTOMER
    }
}