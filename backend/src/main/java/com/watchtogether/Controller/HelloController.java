package com.watchtogether.Controller;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.Data;

@RestController
@Data

public class HelloController {

    private final SimpMessagingTemplate messagingTemplate;

    private final DataSource dataSource;


    @GetMapping("/hello")
    public String hello() {
        return "Hello, World!";
    }

    @GetMapping("/db-check")
    public String check() throws SQLException {
        try (Connection c = dataSource.getConnection()) {
            return c.isValid(2) ? "DB: OK" : "DB: FAIL";
        }
    }

    @MessageMapping("/test") // nhận từ /app/test
    public void handleTestMessage(String message) {
        System.out.println("📥 Received from client: " + message);
        messagingTemplate.convertAndSend("/topic/test", "Server echo: " + message);
    }
}