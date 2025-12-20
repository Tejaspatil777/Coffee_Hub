package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.dto.InviteRegisterRequest;
import com.javabite.javabite_backend.model.InviteToken;
import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.InviteTokenRepository;
import com.javabite.javabite_backend.repository.UserRepository;
import com.javabite.javabite_backend.security.JwtProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final InviteTokenRepository inviteTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AuthController(UserRepository userRepository,
                          InviteTokenRepository inviteTokenRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.inviteTokenRepository = inviteTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    // -----------------------------------------------------------
    // VALIDATE STAFF INVITE TOKEN (FIXED VERSION)
    // -----------------------------------------------------------
    @GetMapping("/invite/validate")
    public ResponseEntity<?> validateInvite(@RequestParam String token) {
        log.info("=== INVITE VALIDATION STARTED ===");
        log.info("Token received: {}", token);

        // 1. Trim and validate token
        token = token.trim();
        log.info("Token after trim: {}", token);

        if (token == null || token.isEmpty()) {
            log.error("Token is null or empty");
            return ResponseEntity.badRequest().body("Token is required");
        }

        // 2. Check token format (UUID)
        try {
            UUID uuid = UUID.fromString(token);
            log.info("Valid UUID format: {}", uuid);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for token: {}", token);
            log.error("UUID parsing error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid token format");
        }

        // 3. Debug: Count tokens in database
        long totalTokens = inviteTokenRepository.count();
        log.info("Total tokens in database: {}", totalTokens);

        // 4. Try to find the token
        log.info("Searching for token in database...");
        Optional<InviteToken> inviteOpt = inviteTokenRepository.findByToken(token);

        if (inviteOpt.isEmpty()) {
            log.error("Token not found in database: {}", token);

            // List first 10 tokens for debugging
            List<InviteToken> allTokens = inviteTokenRepository.findAll();
            log.info("Listing all tokens in database ({} found):", allTokens.size());

            if (allTokens.isEmpty()) {
                log.warn("Database is empty! No invite tokens found.");
            } else {
                allTokens.forEach(t -> {
                    log.info("  - Token: '{}', Email: {}, Used: {}, Expires: {}",
                            t.getToken(), t.getEmail(), t.isUsed(), t.getExpiresAt());
                });
            }

            return ResponseEntity.badRequest().body("Invalid token - Not found in database");
        }

        InviteToken invite = inviteOpt.get();
        log.info("Token found! Details:");
        log.info("  - ID: {}", invite.getId());
        log.info("  - Email: {}", invite.getEmail());
        log.info("  - Name: {}", invite.getName());
        log.info("  - Role: {}", invite.getRole());
        log.info("  - Used: {}", invite.isUsed());
        log.info("  - Expires At: {}", invite.getExpiresAt());
        log.info("  - Created At: {}", invite.getCreatedAt());
        log.info("  - Current Time: {}", Instant.now());

        // 5. Check if already used
        if (invite.isUsed()) {
            log.error("Token already used: {}", token);
            return ResponseEntity.badRequest().body("Invite already used");
        }

        // 6. Check if expired
        if (invite.getExpiresAt().isBefore(Instant.now())) {
            log.error("Token expired: {}", token);
            log.error("Expired at: {}, Current: {}", invite.getExpiresAt(), Instant.now());
            return ResponseEntity.badRequest().body("Invite expired");
        }

        log.info("=== TOKEN VALIDATION SUCCESSFUL ===");

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "email", invite.getEmail(),
                "name", invite.getName(),
                "role", invite.getRole().name()
        ));
    }

    // -----------------------------------------------------------
    // DEBUG ENDPOINT: Check MongoDB connection and tokens
    // -----------------------------------------------------------
    @GetMapping("/debug/tokens")
    public ResponseEntity<?> debugTokens() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Count all tokens
            long totalTokens = inviteTokenRepository.count();
            response.put("totalTokens", totalTokens);

            // Get all tokens with details
            List<InviteToken> allTokens = inviteTokenRepository.findAll();
            List<Map<String, Object>> tokensList = allTokens.stream()
                    .map(token -> {
                        Map<String, Object> tokenInfo = new HashMap<>();
                        tokenInfo.put("id", token.getId());
                        tokenInfo.put("token", token.getToken());
                        tokenInfo.put("email", token.getEmail());
                        tokenInfo.put("name", token.getName());
                        tokenInfo.put("role", token.getRole());
                        tokenInfo.put("used", token.isUsed());
                        tokenInfo.put("expiresAt", token.getExpiresAt());
                        tokenInfo.put("createdAt", token.getCreatedAt());
                        return tokenInfo;
                    })
                    .collect(Collectors.toList());

            response.put("tokens", tokensList);
            response.put("status", "SUCCESS");
            response.put("timestamp", Instant.now());
            response.put("database", "MongoDB");

        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            response.put("timestamp", Instant.now());
        }

        return ResponseEntity.ok(response);
    }

    // -----------------------------------------------------------
    // FIX: CREATE MISSING TOKEN ENDPOINT
    // -----------------------------------------------------------
    @PostMapping("/admin/fix-token")
    public ResponseEntity<?> fixMissingToken(@RequestBody Map<String, String> request) {
        try {
            // Get token from request or use the default one
            String missingToken = request.getOrDefault("token", "58b9ae14-0986-40f4-a9c2-c0b47843207a");
            String email = request.getOrDefault("email", "staff@example.com");
            String name = request.getOrDefault("name", "Staff Member");
            String roleStr = request.getOrDefault("role", "WAITER");

            Role role;
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                role = Role.WAITER;
            }

            log.info("Fixing missing token: {}", missingToken);

            // Check if token already exists
            Optional<InviteToken> existing = inviteTokenRepository.findByToken(missingToken);
            if (existing.isPresent()) {
                InviteToken token = existing.get();
                log.info("Token already exists in database");
                return ResponseEntity.ok(Map.of(
                        "message", "Token already exists",
                        "token", token.getToken(),
                        "email", token.getEmail(),
                        "used", token.isUsed(),
                        "expiresAt", token.getExpiresAt(),
                        "validateUrl", "http://localhost:8080/api/auth/invite/validate?token=" + missingToken
                ));
            }

            // Create the missing token
            InviteToken newToken = new InviteToken();
            newToken.setToken(missingToken);
            newToken.setEmail(email);
            newToken.setName(name);
            newToken.setRole(role);
            newToken.setUsed(false);
            newToken.setExpiresAt(Instant.now().plusSeconds(48 * 3600)); // 48 hours
            newToken.setInvitedByAdmin("admin@javabite.com");
            newToken.setCreatedAt(Instant.now());

            InviteToken saved = inviteTokenRepository.save(newToken);

            log.info("Token created successfully: ID={}", saved.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Token created successfully",
                    "token", saved.getToken(),
                    "id", saved.getId(),
                    "email", saved.getEmail(),
                    "role", saved.getRole().name(),
                    "validateUrl", "http://localhost:8080/api/auth/invite/validate?token=" + missingToken,
                    "frontendUrl", "http://localhost:5173/staff/register?token=" + missingToken,
                    "expiresAt", saved.getExpiresAt()
            ));

        } catch (Exception e) {
            log.error("Failed to fix token: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to create token",
                    "message", e.getMessage()
            ));
        }
    }

    // -----------------------------------------------------------
    // STAFF REGISTRATION VIA INVITE (CHEF/WAITER)
    // -----------------------------------------------------------
    @PostMapping("/staff-register")
    public ResponseEntity<?> registerStaff(@RequestBody InviteRegisterRequest req) {
        log.info("Staff registration attempt for email: {}", req.getEmail());

        // Trim the token
        String token = req.getToken().trim();

        InviteToken invite = inviteTokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.error("Token not found: {}", token);
                    return new IllegalArgumentException("Invalid token");
                });

        if (invite.isUsed()) {
            log.error("Token already used: {}", token);
            return ResponseEntity.badRequest().body("Invite already used");
        }

        if (invite.getExpiresAt().isBefore(Instant.now())) {
            log.error("Token expired: {}", token);
            return ResponseEntity.badRequest().body("Invite expired");
        }

        if (!invite.getEmail().equalsIgnoreCase(req.getEmail())) {
            log.error("Email mismatch. Invite: {}, Request: {}", invite.getEmail(), req.getEmail());
            return ResponseEntity.badRequest().body("Email does not match invite");
        }

        // Check if user already exists
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            log.error("User already exists: {}", req.getEmail());
            return ResponseEntity.badRequest().body("User with this email already exists");
        }

        // Create CHEF or WAITER user based on invite role
        User user = new User();
        user.setEmail(req.getEmail());
        user.setName(req.getName());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(invite.getRole());
        user.setEnabled(true);
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        // Mark invite as used
        invite.setUsed(true);
        inviteTokenRepository.save(invite);

        // Generate JWT for immediate login
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("name", user.getName());
        claims.put("email", user.getEmail());

        String jwt = jwtProvider.generateToken(user.getEmail(), claims);

        log.info("Staff registration successful for: {}", req.getEmail());

        return ResponseEntity.ok(Map.of(
                "message", "Staff registered successfully",
                "token", jwt,
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name()
        ));
    }

    // -----------------------------------------------------------
    // CUSTOMER REGISTRATION
    // -----------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody RegisterRequest req) {
        if (userRepository.findByEmail(req.email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use.");
        }

        User user = new User();
        user.setName(req.name);
        user.setEmail(req.email);
        user.setPasswordHash(passwordEncoder.encode(req.password));
        user.setRole(Role.CUSTOMER);
        user.setEnabled(true);
        user.setCreatedAt(Instant.now());

        userRepository.save(user);
        return ResponseEntity.ok("Customer registered successfully.");
    }

    // -----------------------------------------------------------
    // LOGIN (ALL ROLES: ADMIN, CUSTOMER, CHEF, WAITER)
    // -----------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest req) {
        Optional<User> userOpt = userRepository.findByEmail(req.email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        // Generate JWT with role claim
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("name", user.getName());
        claims.put("email", user.getEmail());

        String token = jwtProvider.generateToken(user.getEmail(), claims);

        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("email", user.getEmail());
        res.put("name", user.getName());
        res.put("role", user.getRole().name());

        return ResponseEntity.ok(res);
    }

    // --------------------------------------
    // DTO CLASSES
    // --------------------------------------
    public static class RegisterRequest {
        public String name;
        public String email;
        public String password;

        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPassword() { return password; }

        public void setName(String name) { this.name = name; }
        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        public String email;
        public String password;

        public String getEmail() { return email; }
        public String getPassword() { return password; }

        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }
}