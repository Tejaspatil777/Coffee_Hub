package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.InviteToken;
import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.InviteTokenRepository;
import com.javabite.javabite_backend.repository.UserRepository;
import com.javabite.javabite_backend.service.InviteService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/staff")
@RequiredArgsConstructor
public class AdminStaffController {

    private final InviteService inviteService;
    private final InviteTokenRepository tokenRepo;
    private final UserRepository userRepository; // ✅ Added for registered staff

    // -----------------------------------------------------------
    // 1. INVITE NEW STAFF (CREATE INVITATION)
    // -----------------------------------------------------------
    @PostMapping("/invite")
    public ResponseEntity<?> inviteStaff(@RequestBody InviteRequest req, Authentication authentication) {
        try {
            System.out.println("=== ADMIN STAFF INVITE REQUEST ===");
            System.out.println("Admin: " + authentication.getName());
            System.out.println("Request: " + req);

            // Get current admin from security context
            String adminEmail = authentication.getName();

            if (adminEmail == null || adminEmail.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Admin authentication required"));
            }

            // Check if user already exists (already registered)
            if (userRepository.findByEmail(req.getEmail()).isPresent()) {
                System.err.println("User already registered: " + req.getEmail());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Staff member with email " + req.getEmail() + " is already registered.");
                return ResponseEntity.badRequest().body(error);
            }

            InviteToken token = inviteService.createInvite(
                    req.getName(),
                    req.getEmail(),
                    Role.valueOf(req.getRole().toUpperCase()),
                    adminEmail
            );

            Map<String, Object> response = new HashMap<>();
            response.put("id", token.getId());
            response.put("token", token.getToken());
            response.put("expiresAt", token.getExpiresAt());
            response.put("email", token.getEmail());
            response.put("name", token.getName());
            response.put("role", token.getRole().name());
            response.put("invitedByAdmin", token.getInvitedByAdmin());
            response.put("createdAt", token.getCreatedAt());
            response.put("message", "Invitation sent to " + token.getEmail());

            System.out.println("Invite created successfully: " + token.getId());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Server error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // -----------------------------------------------------------
    // 2. GET ALL PENDING INVITES (NOT YET USED)
    // -----------------------------------------------------------
    @GetMapping("/invites")
    public ResponseEntity<?> getAllInvites(Authentication authentication) {
        try {
            System.out.println("=== GET ALL PENDING INVITES ===");
            System.out.println("Admin: " + authentication.getName());

            // Get only UNUSED invites (pending)
            List<InviteToken> invites = tokenRepo.findAllByUsedFalse();

            // Convert to DTO for frontend
            List<Map<String, Object>> response = invites.stream()
                    .map(invite -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", invite.getId());
                        map.put("token", invite.getToken());
                        map.put("email", invite.getEmail());
                        map.put("name", invite.getName());
                        map.put("role", invite.getRole().name());
                        map.put("invitedByAdmin", invite.getInvitedByAdmin());
                        map.put("expiresAt", invite.getExpiresAt());
                        map.put("createdAt", invite.getCreatedAt());
                        map.put("used", invite.isUsed());
                        return map;
                    })
                    .collect(Collectors.toList());

            System.out.println("Found " + response.size() + " pending invites");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error loading invites: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load invites: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // -----------------------------------------------------------
    // 3. GET ALL REGISTERED STAFF (ACTUAL USERS)
    // -----------------------------------------------------------
    @GetMapping("/registered")
    public ResponseEntity<?> getRegisteredStaff(Authentication authentication) {
        try {
            System.out.println("=== GET REGISTERED STAFF ===");
            System.out.println("Admin: " + authentication.getName());

            // Get all users from database
            List<User> allUsers = userRepository.findAll();

            System.out.println("Total users in database: " + allUsers.size());

            // Filter for CHEFs and WAITERS only (not ADMIN or CUSTOMER)
            List<Map<String, Object>> registeredStaff = allUsers.stream()
                    .filter(user -> {
                        boolean isStaff = user.getRole() == Role.CHEF || user.getRole() == Role.WAITER;
                        if (isStaff) {
                            System.out.println("Found staff: " + user.getEmail() + " - " + user.getRole());
                        }
                        return isStaff;
                    })
                    .map(user -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", user.getId());
                        map.put("email", user.getEmail());
                        map.put("name", user.getName());
                        map.put("role", user.getRole().name());
                        map.put("enabled", user.isEnabled());
                        map.put("createdAt", user.getCreatedAt());
                        return map;
                    })
                    .collect(Collectors.toList());

            System.out.println("Found " + registeredStaff.size() + " registered staff members");

            return ResponseEntity.ok(Map.of(
                    "staff", registeredStaff,
                    "count", registeredStaff.size()
            ));

        } catch (Exception e) {
            System.err.println("Error loading registered staff: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load registered staff: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // -----------------------------------------------------------
    // 4. GET REGISTERED CHEFS ONLY
    // -----------------------------------------------------------
    @GetMapping("/registered/chefs")
    public ResponseEntity<?> getRegisteredChefs(Authentication authentication) {
        try {
            System.out.println("=== GET REGISTERED CHEFS ===");

            List<User> allUsers = userRepository.findAll();

            List<Map<String, Object>> chefs = allUsers.stream()
                    .filter(user -> user.getRole() == Role.CHEF)
                    .map(user -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", user.getId());
                        map.put("email", user.getEmail());
                        map.put("name", user.getName());
                        map.put("enabled", user.isEnabled());
                        map.put("createdAt", user.getCreatedAt());
                        return map;
                    })
                    .collect(Collectors.toList());

            System.out.println("Found " + chefs.size() + " registered chefs");

            return ResponseEntity.ok(Map.of(
                    "chefs", chefs,
                    "count", chefs.size()
            ));

        } catch (Exception e) {
            System.err.println("Error loading chefs: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load chefs: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // -----------------------------------------------------------
    // 5. GET REGISTERED WAITERS ONLY
    // -----------------------------------------------------------
    @GetMapping("/registered/waiters")
    public ResponseEntity<?> getRegisteredWaiters(Authentication authentication) {
        try {
            System.out.println("=== GET REGISTERED WAITERS ===");

            List<User> allUsers = userRepository.findAll();

            List<Map<String, Object>> waiters = allUsers.stream()
                    .filter(user -> user.getRole() == Role.WAITER)
                    .map(user -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", user.getId());
                        map.put("email", user.getEmail());
                        map.put("name", user.getName());
                        map.put("enabled", user.isEnabled());
                        map.put("createdAt", user.getCreatedAt());
                        return map;
                    })
                    .collect(Collectors.toList());

            System.out.println("Found " + waiters.size() + " registered waiters");

            return ResponseEntity.ok(Map.of(
                    "waiters", waiters,
                    "count", waiters.size()
            ));

        } catch (Exception e) {
            System.err.println("Error loading waiters: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load waiters: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // -----------------------------------------------------------
    // 6. GET DASHBOARD STATISTICS
    // -----------------------------------------------------------
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            System.out.println("=== GET DASHBOARD STATS ===");

            List<User> allUsers = userRepository.findAll();

            long chefs = allUsers.stream().filter(u -> u.getRole() == Role.CHEF).count();
            long waiters = allUsers.stream().filter(u -> u.getRole() == Role.WAITER).count();
            long customers = allUsers.stream().filter(u -> u.getRole() == Role.CUSTOMER).count();
            long admins = allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count();
            long totalStaff = chefs + waiters;

            // Count pending invites
            long pendingInvites = tokenRepo.findAllByUsedFalse().size();

            System.out.println("Stats: Chefs=" + chefs + ", Waiters=" + waiters +
                    ", Customers=" + customers + ", PendingInvites=" + pendingInvites);

            return ResponseEntity.ok(Map.of(
                    "chefs", chefs,
                    "waiters", waiters,
                    "customers", customers,
                    "admins", admins,
                    "totalStaff", totalStaff,
                    "pendingInvites", pendingInvites,
                    "totalUsers", allUsers.size()
            ));

        } catch (Exception e) {
            System.err.println("Error loading stats: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load stats: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // -----------------------------------------------------------
    // 7. DELETE INVITE
    // -----------------------------------------------------------
    @DeleteMapping("/invite/{id}")
    public ResponseEntity<?> deleteInvite(@PathVariable String id, Authentication authentication) {
        try {
            System.out.println("=== DELETE INVITE ===");
            System.out.println("Admin: " + authentication.getName());
            System.out.println("Deleting invite ID: " + id);

            if (!tokenRepo.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            tokenRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Invite deleted successfully"));
        } catch (Exception e) {
            System.err.println("Error deleting invite: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete invite: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------------
    // 8. DEBUG ENDPOINT - GET ALL DATA
    // -----------------------------------------------------------
    @GetMapping("/debug")
    public ResponseEntity<?> debugAllData(Authentication authentication) {
        try {
            System.out.println("=== DEBUG ALL DATA ===");

            // Get all users
            List<User> allUsers = userRepository.findAll();
            List<Map<String, Object>> usersList = allUsers.stream()
                    .map(user -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", user.getId());
                        map.put("email", user.getEmail());
                        map.put("name", user.getName());
                        map.put("role", user.getRole().name());
                        map.put("enabled", user.isEnabled());
                        map.put("createdAt", user.getCreatedAt());
                        return map;
                    })
                    .collect(Collectors.toList());

            // Get all invites
            List<InviteToken> allInvites = tokenRepo.findAll();
            List<Map<String, Object>> invitesList = allInvites.stream()
                    .map(invite -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", invite.getId());
                        map.put("email", invite.getEmail());
                        map.put("name", invite.getName());
                        map.put("role", invite.getRole().name());
                        map.put("used", invite.isUsed());
                        map.put("token", invite.getToken());
                        map.put("expiresAt", invite.getExpiresAt());
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "users", usersList,
                    "invites", invitesList,
                    "userCount", usersList.size(),
                    "inviteCount", invitesList.size()
            ));

        } catch (Exception e) {
            System.err.println("Debug error: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Debug failed: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------------
    // DTO CLASSES
    // -----------------------------------------------------------
    @Data
    static class InviteRequest {
        private String name;
        private String email;
        private String role;

        @Override
        public String toString() {
            return "InviteRequest{name='" + name + "', email='" + email + "', role='" + role + "'}";
        }
    }
}