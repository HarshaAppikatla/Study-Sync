package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.NotificationDto;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.UserRepository;
import com.studysync.studysyncbackend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<NotificationDto> notifications = notificationService.getUserNotifications(user.getId());
        long unreadCount = notificationService.getUnreadCount(user.getId());

        return ResponseEntity.ok(Map.of(
                "notifications", notifications,
                "unreadCount", unreadCount
        ));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
