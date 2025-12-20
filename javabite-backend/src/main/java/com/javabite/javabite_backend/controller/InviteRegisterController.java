package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.model.InviteToken;
import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.InviteTokenRepository;
import com.javabite.javabite_backend.repository.UserRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth/staff")
@RequiredArgsConstructor
public class InviteRegisterController {

    private final InviteTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final BCryptPasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerStaff(@RequestParam String token,
                                           @RequestBody StaffRegisterRequest req) {

        InviteToken invite = tokenRepo.findByToken(token).orElse(null);

        if (invite == null)
            return ResponseEntity.badRequest().body("Invalid token");

        if (invite.isUsed())
            return ResponseEntity.badRequest().body("Invitation already used");

        if (invite.getExpiresAt().isBefore(Instant.now()))
            return ResponseEntity.badRequest().body("Invitation expired");

        // Create staff user
        User user = new User();
        user.setName(invite.getName());
        user.setEmail(invite.getEmail());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole(invite.getRole()); // CHEF or WAITER
        user.setEnabled(true);
        user.setCreatedAt(Instant.now());

        userRepo.save(user);

        // Mark invitation as used
        invite.setUsed(true);
        tokenRepo.save(invite);

        return ResponseEntity.ok("Staff registered successfully");
    }

    @Data
    static class StaffRegisterRequest {
        private String password;
    }
}
