// In your main Spring Boot application file (e.g., JavabiteBackendApplication.java)

package com.javabite.javabite_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync; // 💡 NEW IMPORT

@SpringBootApplication
@EnableAsync // 🔥 ADD THIS ANNOTATION
public class JavabiteBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavabiteBackendApplication.class, args);
    }
}