package com.coffeehub.service;

import com.coffeehub.dto.request.LoginRequest;
import com.coffeehub.dto.request.RegisterRequest;
import com.coffeehub.entity.User;
import com.coffeehub.exception.ValidationException;
import com.coffeehub.repository.RefreshTokenRepository;
import com.coffeehub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;  // <-- REQUIRED FIX


    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setRole(User.Role.CUSTOMER);
    }

    @Test
    void register_ShouldSuccess_WhenValidRequest() {
        when(userService.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userService.createUser(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        var response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        verify(userService).createUser(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        when(userService.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThrows(ValidationException.class, () -> authService.register(registerRequest));
    }

    @Test
    void login_ShouldSuccess_WhenValidCredentials() {

        when(authenticationManager.authenticate(any())).thenReturn(mock(Authentication.class));

        when(userService.findByEmail(loginRequest.getEmail())).thenReturn(user);
        when(jwtService.generateToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        var response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
    }
}