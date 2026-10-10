package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.NotificationDto;
import com.studysync.studysyncbackend.model.Notification;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public NotificationDto sendNotification(User user, String title, String message, String type, String link) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = mapToDto(saved);

        // Real-time Push via WebSocket
        try {
            // Push to user-destination: /user/{email}/queue/notifications
            messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/notifications", dto);
            // Also push to topic fallback: /topic/user.{userId}.notifications
            messagingTemplate.convertAndSend("/topic/user." + user.getId() + ".notifications", dto);
            log.info("Sent real-time notification to user {}: {}", user.getEmail(), title);
        } catch (Exception e) {
            log.error("Failed to dispatch WebSocket notification to user {}: {}", user.getEmail(), e.getMessage());
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .link(n.getLink())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
