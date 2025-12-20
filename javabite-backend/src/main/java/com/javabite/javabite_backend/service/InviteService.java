package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.model.InviteToken;
import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.repository.InviteTokenRepository;
import com.javabite.javabite_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InviteService {

    private final InviteTokenRepository inviteRepo;
    private final JavaMailSender mailSender;
    private final UserRepository userRepo;

    @Value("${app.invite.expiry-hours:48}")
    private long expiryHours;

    @Value("${app.frontend.invite-url}")
    private String inviteBaseUrl;

    private static final DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a")
                    .withZone(ZoneId.systemDefault());

    public InviteToken createInvite(String name, String email, Role role, String adminEmail) {
        log.info("=== CREATING INVITE ===");
        log.info("Name: {}, Email: {}, Role: {}, Admin: {}", name, email, role, adminEmail);

        // 1. Check if user is already registered
        if (userRepo.findByEmail(email).isPresent()) {
            log.error("User already registered: {}", email);
            throw new IllegalArgumentException("Staff member with email " + email + " is already registered.");
        }

        // 2. Check for active, unused invite token
        Optional<InviteToken> existingInviteOpt = inviteRepo.findByEmailAndUsedFalse(email);

        if (existingInviteOpt.isPresent()) {
            InviteToken existingInvite = existingInviteOpt.get();
            if (existingInvite.getExpiresAt().isAfter(Instant.now())) {
                log.info("Active token exists for {}, resending email", email);
                sendInviteEmail(existingInvite);
                return existingInvite;
            } else {
                log.info("Existing token expired for {}, creating new one", email);
            }
        }

        // Create new token
        InviteToken token = new InviteToken();
        String tokenString = UUID.randomUUID().toString();
        token.setToken(tokenString);
        log.info("Generated token: {}", tokenString);

        token.setEmail(email);
        token.setName(name);
        token.setRole(role);
        token.setExpiresAt(Instant.now().plusSeconds(expiryHours * 3600));
        token.setInvitedByAdmin(adminEmail);
        token.setCreatedAt(Instant.now());
        token.setUsed(false);

        InviteToken savedToken = inviteRepo.save(token);
        log.info("Saved invite token - ID: {}, Token: {}, Email: {}",
                savedToken.getId(), savedToken.getToken(), savedToken.getEmail());

        // Verify it was saved
        Optional<InviteToken> verify = inviteRepo.findByToken(tokenString);
        log.info("Verification - Token found after save: {}", verify.isPresent());

        if (!verify.isPresent()) {
            log.error("CRITICAL: Token not found immediately after save!");
            throw new RuntimeException("Failed to save token to database");
        }

        sendInviteEmail(savedToken);

        log.info("=== INVITE CREATION COMPLETE ===");
        return savedToken;
    }

    @Async
    public void sendInviteEmail(InviteToken token) {
        try {
            log.info("Sending invitation email to: {}", token.getEmail());

            String link = inviteBaseUrl + token.getToken();
            String expiryTime = formatter.format(token.getExpiresAt());

            String roleDisplay = token.getRole().toString().charAt(0) +
                    token.getRole().toString().substring(1).toLowerCase();

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(token.getEmail());
            msg.setSubject("Invitation to Join JavaBite as " + roleDisplay);
            msg.setText(
                    "Hello " + token.getName() + ",\n\n" +
                            "You have been invited to join JavaBite Restaurant as a " + roleDisplay + ".\n\n" +
                            "To complete your registration, please click the link below:\n\n" +
                            "➤ Registration Link: " + link + "\n\n" +
                            "Important Details:\n" +
                            "• Role: " + roleDisplay + "\n" +
                            "• Email: " + token.getEmail() + "\n" +
                            "• Link Expires: " + expiryTime + "\n" +
                            "• Invited By: " + token.getInvitedByAdmin() + "\n\n" +
                            "Steps to Register:\n" +
                            "1. Click the registration link above\n" +
                            "2. Set your password\n" +
                            "3. Complete your profile\n" +
                            "4. Start using the system immediately\n\n" +
                            "If you didn't expect this invitation, please ignore this email.\n\n" +
                            "Welcome to the JavaBite Team!\n" +
                            "Best regards,\n" +
                            "JavaBite Admin Team"
            );

            mailSender.send(msg);
            log.info("Invitation email sent successfully to: {}", token.getEmail());
            log.info("Registration link: {}", link);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", token.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to send invitation email", e);
        }
    }

    // Debug method to check all tokens
    public void listAllTokens() {
        log.info("=== LISTING ALL INVITE TOKENS ===");
        long count = inviteRepo.count();
        log.info("Total tokens in database: {}", count);

        if (count == 0) {
            log.warn("No tokens found in database!");
            return;
        }

        inviteRepo.findAll().forEach(token -> {
            log.info("Token: {}, Email: {}, Used: {}, Expires: {}, Role: {}",
                    token.getToken(), token.getEmail(), token.isUsed(),
                    token.getExpiresAt(), token.getRole());
        });
        log.info("=== END TOKEN LIST ===");
    }
}