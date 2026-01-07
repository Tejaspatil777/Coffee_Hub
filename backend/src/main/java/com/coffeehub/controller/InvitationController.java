package com.coffeehub.controller;

import com.coffeehub.dto.request.AcceptInvitationRequest;
import com.coffeehub.dto.request.InviteStaffRequest;
import com.coffeehub.entity.User;
import com.coffeehub.repository.UserRepository;
import com.coffeehub.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InvitationController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Admin sends invitation to chef/waiter
     * POST /api/invitations/send
     */
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendInvitation(@Valid @RequestBody InviteStaffRequest request) {
        try {
            log.info("📧 Processing invitation for email: {}, role: {}", request.getEmail(), request.getRole());

            // 1. Validate role (only CHEF and WAITER can be invited)
            if (request.getRole() != User.Role.CHEF && request.getRole() != User.Role.WAITER) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only CHEF and WAITER roles can be invited"));
            }

            // 2. Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("⚠️ Email already exists: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already exists in the system"));
            }

            // 3. Generate unique invitation token
            String token = UUID.randomUUID().toString();
            log.info("🔑 Generated invitation token: {}", token);

            // 4. Split name into first and last name
            String[] nameParts = request.getName().trim().split("\\s+", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            // 5. Create user with PENDING status
            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(request.getEmail());
            user.setRole(request.getRole());
            user.setInvitationToken(token);
            user.setInvitationSentAt(LocalDateTime.now());
            user.setPassword(passwordEncoder.encode("TEMP_PASSWORD_" + UUID.randomUUID())); // Temporary secure password
            user.setEnabled(false); // Not enabled until they accept
            user.setMaxActiveOrders(10);
            user.setCurrentActiveOrders(0);
            user.setIsAvailable(true);

            userRepository.save(user);
            log.info("✅ User created with invitation pending: {}", user.getId());

            // 6. Send email with invitation link
            emailService.sendInvitationEmail(
                user.getEmail(), 
                user.getFullName(), 
                token,
                request.getRole().toString()
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Invitation sent successfully",
                "userId", user.getId(),
                "email", user.getEmail()
            ));

        } catch (Exception e) {
            log.error("❌ Failed to send invitation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send invitation: " + e.getMessage()));
        }
    }

    /**
     * Validate invitation token
     * GET /api/invitations/validate/{token}
     */
    @GetMapping("/validate/{token}")
    public ResponseEntity<?> validateToken(@PathVariable String token) {
        try {
            log.info("🔍 Validating invitation token: {}", token);

            User user = userRepository.findByInvitationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

            // Check if already accepted
            if (user.getInvitationAcceptedAt() != null) {
                log.warn("⚠️ Invitation already used for: {}", user.getEmail());
                return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("error", "This invitation has already been used"));
            }

            // Check if expired (7 days)
            LocalDateTime expiryDate = user.getInvitationSentAt().plusDays(7);
            if (LocalDateTime.now().isAfter(expiryDate)) {
                log.warn("⚠️ Invitation expired for: {}", user.getEmail());
                return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("error", "This invitation has expired. Please contact your administrator."));
            }

            log.info("✅ Token validated successfully for: {}", user.getEmail());

            // Return user info (without sensitive data)
            Map<String, Object> response = new HashMap<>();
            response.put("name", user.getFullName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().toString());
            response.put("sentAt", user.getInvitationSentAt());
            response.put("expiresAt", expiryDate);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Token validation failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Accept invitation and set password
     * POST /api/invitations/accept
     */
    @PostMapping("/accept")
    public ResponseEntity<?> acceptInvitation(@Valid @RequestBody AcceptInvitationRequest request) {
        try {
            log.info("✍️ Processing invitation acceptance for token: {}", request.getToken());

            User user = userRepository.findByInvitationToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

            // Validate token again
            if (user.getInvitationAcceptedAt() != null) {
                return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("error", "This invitation has already been used"));
            }

            // Check expiration
            LocalDateTime expiryDate = user.getInvitationSentAt().plusDays(7);
            if (LocalDateTime.now().isAfter(expiryDate)) {
                return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("error", "This invitation has expired"));
            }

            // Update user name if provided in acceptance
            if (request.getName() != null && !request.getName().isBlank()) {
                String[] nameParts = request.getName().trim().split("\\s+", 2);
                user.setFirstName(nameParts[0]);
                user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            }

            // Set phone number if provided
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                user.setPhoneNumber(request.getPhoneNumber());
            }

            // Set password and enable account
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEnabled(true);
            user.setInvitationAcceptedAt(LocalDateTime.now());
            user.setInvitationToken(null); // Clear token (one-time use)

            userRepository.save(user);

            log.info("✅ Account activated successfully for: {}", user.getEmail());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Account activated successfully! You can now login.",
                "email", user.getEmail(),
                "role", user.getRole().toString()
            ));

        } catch (Exception e) {
            log.error("❌ Failed to accept invitation", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get pending invitations
     * GET /api/invitations/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingInvitations() {
        try {
            log.info("📋 Fetching pending invitations");

            List<User> pending = userRepository.findPendingInvitations();

            List<Map<String, Object>> response = pending.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getFullName());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRole().toString());
                userMap.put("invitationSentAt", user.getInvitationSentAt());
                
                // Calculate expiration
                LocalDateTime expiryDate = user.getInvitationSentAt().plusDays(7);
                userMap.put("expiresAt", expiryDate);
                userMap.put("isExpired", LocalDateTime.now().isAfter(expiryDate));
                
                return userMap;
            }).toList();

            log.info("✅ Found {} pending invitations", response.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Failed to fetch pending invitations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch pending invitations"));
        }
    }

    /**
     * Resend invitation
     * POST /api/invitations/{userId}/resend
     */
    @PostMapping("/{userId}/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resendInvitation(@PathVariable Long userId) {
        try {
            log.info("🔄 Resending invitation for user: {}", userId);

            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if invitation can be resent
            if (user.getInvitationAcceptedAt() != null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cannot resend invitation - already accepted"));
            }

            // Generate new token
            String newToken = UUID.randomUUID().toString();
            user.setInvitationToken(newToken);
            user.setInvitationSentAt(LocalDateTime.now());
            userRepository.save(user);

            // Send email again
            emailService.sendInvitationEmail(
                user.getEmail(), 
                user.getFullName(), 
                newToken,
                user.getRole().toString()
            );

            log.info("✅ Invitation resent successfully to: {}", user.getEmail());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Invitation resent successfully"
            ));

        } catch (Exception e) {
            log.error("❌ Failed to resend invitation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel invitation
     * DELETE /api/invitations/{userId}/cancel
     */
    @DeleteMapping("/{userId}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelInvitation(@PathVariable Long userId) {
        try {
            log.info("🗑️ Cancelling invitation for user: {}", userId);

            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if invitation can be cancelled
            if (user.getInvitationAcceptedAt() != null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cannot cancel invitation - already accepted"));
            }

            // Delete user if invitation not accepted yet
            userRepository.delete(user);

            log.info("✅ Invitation cancelled successfully for: {}", user.getEmail());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Invitation cancelled successfully"
            ));

        } catch (Exception e) {
            log.error("❌ Failed to cancel invitation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get invitation statistics
     * GET /api/invitations/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getInvitationStats() {
        try {
            List<User> allUsers = userRepository.findAll();
            
            long totalInvitations = allUsers.stream()
                .filter(u -> u.getInvitationSentAt() != null)
                .count();
            
            long acceptedInvitations = allUsers.stream()
                .filter(u -> u.getInvitationAcceptedAt() != null)
                .count();
            
            long pendingInvitations = userRepository.findPendingInvitations().size();
            
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            long expiredInvitations = userRepository.findExpiredInvitations(sevenDaysAgo).size();

            Map<String, Object> stats = new HashMap<>();
            stats.put("total", totalInvitations);
            stats.put("accepted", acceptedInvitations);
            stats.put("pending", pendingInvitations);
            stats.put("expired", expiredInvitations);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("❌ Failed to fetch invitation stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch stats"));
        }
    }
}
