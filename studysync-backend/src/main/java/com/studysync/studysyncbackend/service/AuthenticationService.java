package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.AuthenticationRequest;
import com.studysync.studysyncbackend.dto.AuthenticationResponse;
import com.studysync.studysyncbackend.dto.RegisterRequest;
import com.studysync.studysyncbackend.model.Role;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final UserActivityService userActivityService;

        public AuthenticationResponse register(RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new IllegalStateException("Email already in use");
                }

                var user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                                .build();

                userRepository.save(user);
                userActivityService.logActivity(user.getId()); // Log initial activity

                var jwtToken = jwtService.generateToken(user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .id(user.getId())
                                .username(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found after authentication"));

                userActivityService.logActivity(user.getId()); // Log daily login

                var jwtToken = jwtService.generateToken(user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .id(user.getId())
                                .username(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }
}