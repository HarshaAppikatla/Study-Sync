package com.studysync.studysyncbackend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;

@Service
public class PdfVerificationService {

    private static final String[] DISALLOWED_CREATORS = {
            "canva", "photoshop", "gimp", "illustrator", "inkscape", "paint.net"
    };

    /**
     * Inspects PDF for graphics software tampering signatures in metadata.
     */
    public boolean isPdfTampered(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {

            PDDocumentInformation info = document.getDocumentInformation();
            if (info == null) return false;

            String creator = info.getCreator() != null ? info.getCreator().toLowerCase() : "";
            String producer = info.getProducer() != null ? info.getProducer().toLowerCase() : "";

            for (String disallowed : DISALLOWED_CREATORS) {
                if (creator.contains(disallowed) || producer.contains(disallowed)) {
                    return true; // Tampering detected
                }
            }

            return false;
        } catch (Exception e) {
            return true; // Fail safe on corrupted PDF
        }
    }

    /**
     * Checks if PDF contains an official cryptographic digital signature.
     */
    public boolean hasDigitalSignature(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {

            return !document.getSignatureDictionaries().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Computes SHA-256 Hash of uploaded file to prevent duplicate uploads.
     */
    public String calculateFileHash(MultipartFile file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(file.getBytes());
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
