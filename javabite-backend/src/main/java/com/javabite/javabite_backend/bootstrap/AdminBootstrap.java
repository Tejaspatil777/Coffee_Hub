package com.javabite.javabite_backend.bootstrap;



import com.javabite.javabite_backend.model.User;
import com.javabite.javabite_backend.model.Role;
import com.javabite.javabite_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.Instant;

@Component
public class AdminBootstrap implements ApplicationRunner {

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrap(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminPassword == null) {
            System.out.println("Admin credentials not provided - skipping bootstrap.");
            return;
        }
        userRepo.findByEmail(adminEmail).ifPresentOrElse(u -> {
            System.out.println("Admin already exists: " + adminEmail);
        }, () -> {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setName("Admin");
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            admin.setCreatedAt(Instant.now());
            userRepo.save(admin);
            System.out.println("Admin created: " + adminEmail);
        });
    }
}
