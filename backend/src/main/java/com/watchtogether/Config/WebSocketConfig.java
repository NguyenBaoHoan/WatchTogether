package com.watchtogether.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint để client kết nối WebSocket, "/ws" là endpoint
        registry.addEndpoint("/ws");
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();

    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry)
    {
        // client sent to server
        registry.setApplicationDestinationPrefixes("/app");
        // distination prefix for server sent message to client
        registry.enableSimpleBroker("/topic");
    }
}
