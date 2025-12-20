package com.javabite.javabite_backend.service;

import com.javabite.javabite_backend.dto.InviteRegisterRequest;
import com.javabite.javabite_backend.model.InviteToken;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.security.JwtProvider;
import com.javabite.javabite_backend.repository.InviteTokenRepository;
import com.javabite.javabite_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class AuthService {

    private final InviteTokenRepository inviteTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AuthService(InviteTokenRepository inviteTokenRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtProvider jwtProvider) {
        this.inviteTokenRepository = inviteTokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    public Map<String, Object> registerStaff(InviteRegisterRequest req) {
        InviteToken invite = inviteTokenRepository.findByToken(req.token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (invite.isUsed()) throw new IllegalArgumentException("Invite already used");
        if (invite.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Invite expired");
        if (!invite.getEmail().equalsIgnoreCase(req.email)) throw new IllegalArgumentException("Email mismatch");

        User user = new User();
        user.setEmail(req.email);
        user.setName(req.name);
        user.setRole(invite.getRole());
        user.setPasswordHash(passwordEncoder.encode(req.password)); // ✅ FIXED: Changed from setPassword to setPasswordHash
        user.setEnabled(true);
        user.onCreate(); // Call the manual onCreate method

        userRepository.save(user);

        invite.setUsed(true);
        inviteTokenRepository.save(invite);

        String token = jwtProvider.generateToken(user.getEmail(),
                Map.of("role", user.getRole().name()));

        return Map.of(
                "message", "Registration successful",
                "email", user.getEmail(),
                "role", user.getRole(),
                "token", token
        );
    }
}