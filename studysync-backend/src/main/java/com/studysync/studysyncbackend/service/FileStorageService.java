package com.studysync.studysyncbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Normalize file name
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unnamed_file";
        }
        String fileName = StringUtils.cleanPath(originalFileName);

        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // Strict File Type Validation (MIME type & Extension)
            String contentType = file.getContentType();
            // Expanded whitelist to include common course materials
            List<String> allowedMimeTypes = List.of("image/jpeg", "image/png", "image/jpg", "video/mp4",
                    "application/pdf");
            if (contentType == null || !allowedMimeTypes.contains(contentType)) {
                throw new IllegalArgumentException("Invalid file type. Allowed: images (jpeg, png), video (mp4), pdf.");
            }

            String fileExtension = "";
            int i = fileName.lastIndexOf('.');
            if (i > 0) {
                fileExtension = fileName.substring(i + 1).toLowerCase();
            }
            List<String> allowedExtensions = List.of("jpg", "jpeg", "png", "mp4", "pdf");
            if (!allowedExtensions.contains(fileExtension)) {
                throw new IllegalArgumentException("Invalid file extension. Allowed: jpg, jpeg, png, mp4, pdf.");
            }

            // Generate unique filename
            String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
}
