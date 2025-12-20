package com.javabite.javabite_backend.security;

import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("CustomUserDetailsService - Loading user: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.err.println("User not found with email: " + email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        if (!user.isEnabled()) {
            System.err.println("User account is disabled: " + email);
            throw new UsernameNotFoundException("User account is disabled");
        }

        System.out.println("CustomUserDetailsService - Found user: " + user.getName() + " with role: " + user.getRole());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}