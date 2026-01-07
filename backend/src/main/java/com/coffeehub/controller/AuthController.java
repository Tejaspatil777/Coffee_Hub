package com.coffeehub.controller;

import com.coffeehub.dto.request.AcceptInvitationRequest;
import com.coffeehub.dto.request.LoginRequest;
import com.coffeehub.dto.request.RegisterRequest;
import com.coffeehub.dto.response.ApiResponse;
import com.coffeehub.dto.response.AuthResponse;
import com.coffeehub.entity.StaffInvitation;
import com.coffeehub.entity.User;
import com.coffeehub.repository.StaffInvitationRepository;
import com.coffeehub.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private StaffInvitationRepository invitationRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login request for user: {}", loginRequest.getEmail());

        try {
            AuthResponse authResponse = authService.login(loginRequest);
            return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
        } catch (Exception e) {
            logger.error("Login failed for user: {}", loginRequest.getEmail(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("Register request for user: {}", registerRequest.getEmail());

        try {
            AuthResponse authResponse = authService.register(registerRequest);
            return ResponseEntity.ok(ApiResponse.success("Registration successful", authResponse));
        } catch (Exception e) {
            logger.error("Registration failed for user: {}", registerRequest.getEmail(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String refreshToken) {
        logger.info("Refresh token request");

        try {
            AuthResponse authResponse = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
        } catch (Exception e) {
            logger.error("Token refresh failed", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Token refresh failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam String refreshToken) {
        logger.info("Logout request");

        try {
            authService.logout(refreshToken);
            return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
        } catch (Exception e) {
            logger.error("Logout failed", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Logout failed: " + e.getMessage()));
        }
    }

    @GetMapping("/validate-invitation")
    public ResponseEntity<ApiResponse<StaffInvitationInfo>> validateInvitation(@RequestParam String token) {
        logger.info("Validating invitation token: {}", token);

        try {
            StaffInvitation invitation = invitationRepository.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

            if (!invitation.isValid()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invitation has expired or is no longer valid"));
            }

            StaffInvitationInfo info = new StaffInvitationInfo(
                    invitation.getEmail(),
                    invitation.getRole().toString(),
                    invitation.getMessage(),
                    invitation.getExpiresAt().toString()
            );

            return ResponseEntity.ok(ApiResponse.success("Invitation is valid", info));
        } catch (Exception e) {
            logger.error("Invitation validation failed for token: {}", token, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid invitation: " + e.getMessage()));
        }
    }

    @PostMapping("/accept-invitation")
    public ResponseEntity<ApiResponse<AuthResponse>> acceptInvitation(@Valid @RequestBody AcceptInvitationRequest request) {
        logger.info("Accept invitation request with token: {}", request.getToken());

        try {
            // Find and validate invitation
            StaffInvitation invitation = invitationRepository.findByToken(request.getToken())
                    .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

            if (!invitation.isValid()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invitation has expired or is no longer valid"));
            }

            // Create registration request from invitation
            RegisterRequest registerRequest = new RegisterRequest();
            String[] nameParts = request.getName().split(" ", 2);
            registerRequest.setFirstName(nameParts[0]);
            registerRequest.setLastName(nameParts.length > 1 ? nameParts[1] : nameParts[0]);
            registerRequest.setEmail(invitation.getEmail());
            registerRequest.setPassword(request.getPassword());
            registerRequest.setRole(invitation.getRole());

            // Register the user
            AuthResponse authResponse = authService.register(registerRequest);

            // Mark invitation as accepted
            invitation.setStatus(StaffInvitation.InvitationStatus.ACCEPTED);
            invitation.setAcceptedAt(java.time.LocalDateTime.now());
            invitationRepository.save(invitation);

            logger.info("Invitation accepted successfully for: {}", invitation.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Registration successful. You can now login with your credentials.", authResponse));
        } catch (Exception e) {
            logger.error("Accept invitation failed for token: {}", request.getToken(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to accept invitation: " + e.getMessage()));
        }
    }

    // Inner class for invitation info response
    public static class StaffInvitationInfo {
        public String email;
        public String role;
        public String message;
        public String expiresAt;

        public StaffInvitationInfo(String email, String role, String message, String expiresAt) {
            this.email = email;
            this.role = role;
            this.message = message;
            this.expiresAt = expiresAt;
        }
    }
}