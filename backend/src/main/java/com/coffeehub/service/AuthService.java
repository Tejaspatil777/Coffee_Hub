package com.coffeehub.service;

import com.coffeehub.dto.request.LoginRequest;
import com.coffeehub.dto.request.RegisterRequest;
import com.coffeehub.dto.response.AuthResponse;
import com.coffeehub.dto.response.UserResponse;
import com.coffeehub.entity.RefreshToken;
import com.coffeehub.entity.User;
import com.coffeehub.exception.ValidationException;
import com.coffeehub.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public AuthResponse login(LoginRequest loginRequest) {
        logger.info("Attempting login for user: {}", loginRequest.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userService.findByEmail(loginRequest.getEmail());
            UserDetails userDetails = userService.loadUserByUsername(user.getEmail());
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // Save refresh token
            saveRefreshToken(user, refreshToken);

            logger.info("User logged in successfully: {}", loginRequest.getEmail());

            return new AuthResponse(
                    accessToken,
                    refreshToken,
                    "Bearer",
                    jwtService.getRefreshExpirationMs(),
                    UserResponse.fromUser(user)
            );

        } catch (Exception e) {
            logger.error("Login failed for user: {}", loginRequest.getEmail(), e);
            throw new ValidationException("Invalid email or password");
        }
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        logger.info("Registering new user: {}", registerRequest.getEmail());

        if (userService.existsByEmail(registerRequest.getEmail())) {
            throw new ValidationException("Email is already taken");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setRole(registerRequest.getRole());

        User savedUser = userService.createUser(user);

        // Generate tokens
        String accessToken = jwtService.generateToken(userService.loadUserByUsername(savedUser.getEmail()));
        String refreshToken = jwtService.generateRefreshToken(userService.loadUserByUsername(savedUser.getEmail()));

        // Save refresh token
        saveRefreshToken(savedUser, refreshToken);

        logger.info("User registered successfully: {}", registerRequest.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getRefreshExpirationMs(),
                UserResponse.fromUser(savedUser)
        );
    }

    public AuthResponse refreshToken(String refreshToken) {
        logger.info("Refreshing token");

        if (!jwtService.validateToken(refreshToken)) {
            throw new ValidationException("Invalid refresh token");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ValidationException("Refresh token not found"));

        if (storedToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new ValidationException("Refresh token expired");
        }

        User user = storedToken.getUser();
        String newAccessToken = jwtService.generateToken(userService.loadUserByUsername(user.getEmail()));
        String newRefreshToken = jwtService.generateRefreshToken(userService.loadUserByUsername(user.getEmail()));

        // Update refresh token
        refreshTokenRepository.delete(storedToken);
        saveRefreshToken(user, newRefreshToken);

        logger.info("Token refreshed successfully for user: {}", user.getEmail());

        return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                jwtService.getRefreshExpirationMs(),
                UserResponse.fromUser(user)
        );
    }

    public void logout(String refreshToken) {
        logger.info("Logging out user");

        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);

        SecurityContextHolder.clearContext();
        logger.info("User logged out successfully");
    }

    private void saveRefreshToken(User user, String refreshToken) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(refreshToken);
        // Convert milliseconds to seconds for plusSeconds
        long expirySeconds = jwtService.getRefreshExpirationMs() / 1000;
        token.setExpiryDate(LocalDateTime.now().plusSeconds(expirySeconds));
        refreshTokenRepository.save(token);
    }

    public void cleanupExpiredTokens() {
        logger.info("Cleaning up expired refresh tokens");
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
}