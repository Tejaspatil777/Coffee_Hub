// Inside your test package, e.g., com.javabite.javabite_backend.config.TestMailConfig.java
package com.javabite.javabite_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

// This ensures Spring always has a JavaMailSender bean during tests.
@Configuration
public class TestMailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        // Return a mock implementation or simply the base implementation 
        // which won't attempt a real connection if not fully configured.
        return new JavaMailSenderImpl();
    }
}