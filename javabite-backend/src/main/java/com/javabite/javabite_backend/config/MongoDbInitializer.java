package com.javabite.javabite_backend.config;

import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;

@Configuration
@RequiredArgsConstructor
public class MongoDbInitializer {

    private final BCryptPasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            // Check if admin user exists
            if (userRepository.findByEmail("admin@javabite.com").isEmpty()) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@javabite.com");
                admin.setPasswordHash(passwordEncoder.encode("Admin1234"));
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);
                admin.setCreatedAt(Instant.now());
                admin.setUpdatedAt(Instant.now());

                userRepository.save(admin);
                System.out.println("Admin user created successfully!");
            } else {
                System.out.println("Admin user already exists.");
            }
        };
    }
}