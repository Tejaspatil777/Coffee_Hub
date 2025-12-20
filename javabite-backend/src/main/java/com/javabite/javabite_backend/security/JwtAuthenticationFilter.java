package com.javabite.javabite_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userService;

    public JwtAuthenticationFilter(JwtProvider jwtProvider, CustomUserDetailsService userService) {
        this.jwtProvider = jwtProvider;
        this.userService = userService;
    }

    // ✅ UPDATED: Add /api/admin/staff/invites to the shouldNotFilter list
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        System.out.println("JWT Filter - Checking path: " + path + ", Method: " + method);

        // Skip JWT filter for these public endpoints
        return path.startsWith("/api/auth") ||
                path.startsWith("/images") ||
                path.equals("/invite/validate") ||
                (path.startsWith("/invite/") && request.getMethod().equals("GET")) ||
                path.startsWith("/health") ||
                path.startsWith("/actuator/health") ||
                method.equals("OPTIONS");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain
    ) throws ServletException, IOException {

        String header = req.getHeader("Authorization");
        String path = req.getServletPath();

        System.out.println("JWT Filter - Processing: " + path);
        System.out.println("JWT Filter - Authorization header present: " + (header != null));

        // The logic below only runs if shouldNotFilter returns false (i.e., on protected routes)
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            System.out.println("JWT Filter - Token found, length: " + token.length());

            try {
                // 1. Extract email and ROLE from token
                String email = jwtProvider.getEmailFromToken(token);
                String role = jwtProvider.getRoleFromToken(token);

                System.out.println("JWT Filter - Extracted email: " + email);
                System.out.println("JWT Filter - Extracted role: " + role);

                UserDetails userDetails = userService.loadUserByUsername(email);

                // 2. Convert role string from JWT to authority
                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority("ROLE_" + role);

                // 3. Create authentication object
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                List.of(authority)
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);

                System.out.println("JWT Filter - Authentication successful for: " + email);

            } catch (Exception e) {
                System.err.println("JWT Filter - Authentication failed: " + e.getMessage());
                e.printStackTrace();
                SecurityContextHolder.clearContext();
                // Send 401 response for invalid tokens
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token: " + e.getMessage());
                return;
            }
        } else {
            // No Authorization header found

            // Check if this is a protected route that requires authentication
            if (isProtectedRoute(path) && !isPublicRoute(path)) {
                System.err.println("JWT Filter - No JWT token found for protected route: " + path);
                SecurityContextHolder.clearContext();
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
                return;
            } else {
                System.out.println("JWT Filter - No token but route is public: " + path);
            }
        }

        chain.doFilter(req, res);
    }

    private boolean isProtectedRoute(String path) {
        // Routes that require authentication
        return path.startsWith("/api/admin/") ||
                path.startsWith("/api/chef/") ||
                path.startsWith("/api/waiter/") ||
                path.startsWith("/api/customer/") ||
                path.startsWith("/api/orders/") ||
                path.startsWith("/booking/");
    }

    private boolean isPublicRoute(String path) {
        // Public routes within protected prefixes
        return path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/invite/validate") ||
                path.equals("/api/auth/staff-register") ||
                path.startsWith("/api/auth/forgot-password");
    }
}