package com.watchtogether.Controller;

import org.springframework.messaging.simp.SimpMessageSendingOperations;

import com.watchtogether.Service.ChatService;
import com.watchtogether.Service.UserService;

public class ChatController {
    
    private ChatService chatService;
    private UserService userService;
    private SimpMessageSendingOperations messagingTemplate;

    public ChatController(ChatService chatService, UserService userService,
            SimpMessageSendingOperations messagingTemplate) {
        this.chatService = chatService;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }
    
}
