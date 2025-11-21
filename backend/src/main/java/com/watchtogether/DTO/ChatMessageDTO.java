package com.watchtogether.DTO;

import lombok.Data;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.watchtogether.Entity.jpa.ChatMessage.MessageType;

@Data
public class ChatMessageDTO {
    private MessageType type;
    private String content;
    private String sender; // Tên người gửi (String) từ Frontend
    private String roomId; // ID phòng (String) từ Frontend
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp; // Thời gian gửi tin nhắn (String) từ Frontend

}