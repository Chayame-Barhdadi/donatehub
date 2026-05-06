package com.donatehub.services;

import org.springframework.stereotype.Service;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");

    public FileStorageService() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    public String saveBase64Image(String base64Content) {
        if (base64Content == null || !base64Content.contains(",")) {
            return base64Content;
        }

        try {
            // Extraire les données pures
            String[] parts = base64Content.split(",");
            String extension = "jpg";
            if (parts[0].contains("png")) extension = "png";
            else if (parts[0].contains("gif")) extension = "gif";
            
            byte[] imageBytes = Base64.getDecoder().decode(parts[1]);
            
            String filename = UUID.randomUUID().toString() + "." + extension;
            Path filePath = root.resolve(filename);
            
            Files.write(filePath, imageBytes);
            
            // Retourner l'URL relative
            return "/uploads/" + filename;
        } catch (Exception e) {
            System.err.println("Error saving image: " + e.getMessage());
            return base64Content;
        }
    }
}
