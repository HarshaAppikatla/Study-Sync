package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.AuthenticationRequest;
import com.studysync.studysyncbackend.dto.AuthenticationResponse;
import com.studysync.studysyncbackend.dto.RegisterRequest;
import com.studysync.studysyncbackend.dto.RegisterRequest;
import com.studysync.studysyncbackend.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // Marks this class as a REST controller
@RequestMapping("/api/auth") // Base path for all endpoints in this controller
@RequiredArgsConstructor // Lombok creates constructor with final fields
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    /**
     * Endpoint for user registration.
     * Accepts registration details in the request body.
     *
     * @param request The RegisterRequest DTO containing user details.
     * @return ResponseEntity containing the AuthenticationResponse (JWT token).
     */
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        // Call the register method in AuthenticationService
        AuthenticationResponse response = authenticationService.register(request);
        // Return the response with HTTP status OK (200)
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint for user authentication (login).
     * Accepts login credentials in the request body.
     *
     * @param request The AuthenticationRequest DTO containing email and password.
     * @return ResponseEntity containing the AuthenticationResponse (JWT token).
     */
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Valid @RequestBody AuthenticationRequest request) {
        // Call the authenticate method in AuthenticationService
        AuthenticationResponse response = authenticationService.authenticate(request);
        // Return the response with HTTP status OK (200)
        return ResponseEntity.ok(response);
    }
}