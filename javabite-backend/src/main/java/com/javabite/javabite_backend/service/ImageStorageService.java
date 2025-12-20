package com.javabite.javabite_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageStorageService {

    // Saves files to a folder named 'images' in your project directory
    @Value("${file.upload-dir:./images}")
    private String uploadDir;

    // Base URL needed to form the public link
    @Value("${server.base-url:http://localhost:8080}")
    private String baseUrl;

    private final Path storageLocation;

    public ImageStorageService(@Value("${file.upload-dir:./images}") String uploadDir) throws IOException {
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        if (!Files.exists(this.storageLocation)) {
            // Creates the 'images' folder if it doesn't exist
            Files.createDirectories(this.storageLocation);
        }
    }

    /**
     * Stores a file and returns the public URL.
     */
    public String store(MultipartFile file) throws IOException {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        // Creates a unique name (UUID) for the file to prevent overwrites
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        try {
            if (file.isEmpty()) {
                throw new IOException("Failed to store empty file " + originalFilename);
            }

            Path targetLocation = this.storageLocation.resolve(uniqueFilename);
            // Save the file to the 'images' folder
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Returns the full URL that the frontend needs: http://localhost:8080/images/unique-filename.jpg
            return baseUrl + "/images/" + uniqueFilename;

        } catch (IOException ex) {
            throw new IOException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }
}