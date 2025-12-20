package com.javabite.javabite_backend.controller;

import com.javabite.javabite_backend.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/image")
public class ImageUploadController {

    private final ImageStorageService imageStorageService;

    // This URL: /api/admin/image/upload is what your React code calls
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Ask the service to save the file
            String publicUrl = imageStorageService.store(file);

            // 2. Send the URL back to the frontend
            return ResponseEntity.ok(Map.of("url", publicUrl));

        } catch (IOException e) {
            // This sends the "Failed to upload image. Please check the backend endpoint." error
            System.err.println("File upload failed: " + e.getMessage());
            return ResponseEntity
                    .status(500)
                    .body(Map.of("message", "Failed to upload image: " + e.getMessage()));
        }
    }
}