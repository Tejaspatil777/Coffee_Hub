package com.javabite.javabite_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

// ... (existing imports and class definition)

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // ... (Your existing CORS code)
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    // ⭐ NEW METHOD: Add this to serve local images
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps requests starting with /images/** to the 'images' folder in the project root.
        // This MUST match the path used in ImageStorageService (which returns baseURL + "/images/" + filename)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:./images/");
    }
}