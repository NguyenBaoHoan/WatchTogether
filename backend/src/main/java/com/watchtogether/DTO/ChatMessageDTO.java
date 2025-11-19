package com.watchtogether.DTO;

import lombok.Data;
import com.watchtogether.Entity.jpa.ChatMessage.MessageType;

@Data
public class ChatMessageDTO {
    private MessageType type;
    private String content;
    private String sender; // Tên người gửi (String) từ Frontend
    private String roomId; // ID phòng (String) từ Frontend
}