package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable; // For dynamic destinations
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor; // To access session attributes or user info
import org.springframework.stereotype.Controller;
// import org.springframework.web.bind.annotation.RestController; // Use @Controller for WebSockets

@Controller // Use @Controller, not @RestController, for WebSocket message handling
@RequiredArgsConstructor
public class ChatController {

    // You might inject services here later if needed (e.g., to save messages)

    /**
     * Handles incoming chat messages sent to '/app/chat.sendMessage/{roomId}'.
     * Broadcasts the message to all subscribers of '/topic/public/{roomId}'.
     *
     * @param chatMessage The message payload from the client.
     * @param roomId      The dynamic room identifier from the destination path.
     * @return The received chat message, which will be broadcast.
     */
    @MessageMapping("/chat.sendMessage/{roomId}") // Where clients send messages
    @SendTo("/topic/public/{roomId}") // Where the message is broadcasted to subscribers
    public ChatMessageDto sendMessage(
            @Payload ChatMessageDto chatMessage,
            @DestinationVariable String roomId // Extract roomId from the path
    ) {
        // Here you could potentially:
        // 1. Add server-side timestamp.
        // 2. Save the message to the database.
        // 3. Perform moderation.
        System.out.println("Received message for room " + roomId + ": " + chatMessage); // Simple logging
        return chatMessage; // Return the message to be broadcast
    }

    /**
     * Handles notifications when a new user joins a chat room.
     * Sends a message to '/app/chat.addUser/{roomId}'.
     * Broadcasts the user joining message to all subscribers of '/topic/public/{roomId}'.
     *
     * @param chatMessage Message containing sender info (the user joining).
     * @param headerAccessor Accessor for message headers (contains session info).
     * @param roomId      The dynamic room identifier from the destination path.
     * @return The chat message indicating the user has joined.
     */
    @MessageMapping("/chat.addUser/{roomId}") // Where clients notify joining
    @SendTo("/topic/public/{roomId}") // Where the notification is broadcasted
    public ChatMessageDto addUser(
            @Payload ChatMessageDto chatMessage,
            SimpMessageHeaderAccessor headerAccessor,
            @DestinationVariable String roomId
    ) {
        // Add username to the WebSocket session attributes
        // We get the sender from the message payload itself
        if (headerAccessor.getSessionAttributes() != null && chatMessage.getSender() != null) {
            headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
            headerAccessor.getSessionAttributes().put("room_id", roomId);
            System.out.println(chatMessage.getSender() + " joined room " + roomId); // Simple logging
        } else {
             System.out.println("Could not add user to session for room " + roomId);
        }
        // Modify message content or type if needed before broadcasting
        // chatMessage.setContent(chatMessage.getSender() + " joined!");
        return chatMessage; // Broadcast the joining message
    }

    // TODO: Add logic/listener for user disconnect/leave events later
}