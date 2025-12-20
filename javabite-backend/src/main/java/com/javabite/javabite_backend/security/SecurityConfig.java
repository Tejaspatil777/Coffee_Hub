package com.javabite.javabite_backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userService;
    private final JwtProvider jwtProvider;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(CustomUserDetailsService userService,
                          JwtProvider jwtProvider,
                          CorsConfigurationSource corsConfigurationSource) {
        this.userService = userService;
        this.jwtProvider = jwtProvider;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(jwtProvider, userService);

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                .authorizeHttpRequests(auth -> auth
                        // PUBLIC — authentication routes
                        .requestMatchers("/api/auth/**").permitAll()

                        // PUBLIC — invite validation endpoint
                        .requestMatchers("/api/auth/invite/validate").permitAll()

                        // ✅✅✅ CRITICAL FIX: Allow menu endpoints publicly
                        .requestMatchers("/api/menu/**").permitAll()
                        .requestMatchers("/menu/**").permitAll()

                        // PUBLIC — product images
                        .requestMatchers("/images/**").permitAll()

                        // PUBLIC — health check
                        .requestMatchers("/health", "/actuator/health").permitAll()

                        // ✅ Allow CUSTOMER and ADMIN to access booking endpoints
                        .requestMatchers("/booking/**").hasAnyAuthority("ROLE_CUSTOMER", "ROLE_ADMIN")

                        // ADMIN ONLY
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                        // CHEF ONLY
                        .requestMatchers("/api/chef/**").hasAuthority("ROLE_CHEF")

                        // WAITER ONLY
                        .requestMatchers("/api/waiter/**").hasAuthority("ROLE_WAITER")

                        // CUSTOMER ONLY
                        .requestMatchers("/api/orders/**").hasAuthority("ROLE_CUSTOMER")

                        // EVERYTHING ELSE REQUIRES AUTHENTICATION
                        .anyRequest().authenticated()
                )

                .sessionManagement(sess ->
                        sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}