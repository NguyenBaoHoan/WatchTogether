package com.watchtogether.Config;

import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.watchtogether.Handler.NativeWebSocketHandler;
import com.watchtogether.Service.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSocketMessageBroker // ⭐ Bật STOMP support
@RequiredArgsConstructor
@Slf4j
@EnableWebSocket // ⭐ Bật native WebSocket support

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer, WebSocketConfigurer {

    private final JwtService jwtService;
    private final NativeWebSocketHandler nativeHandler;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Định nghĩa broker nội bộ dùng để gửi thông điệp đến client
        // /topic → gửi broadcast chung (ví dụ gửi cho cả room)
        // /queue → gửi riêng cho từng user
        config.enableSimpleBroker("/topic", "/queue");

        // Các endpoint client gửi lên server phải bắt đầu bằng /app
        config.setApplicationDestinationPrefixes("/app");

        // Đường dẫn gửi riêng đến từng user (gắn với convertAndSendToUser)
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Định nghĩa endpoint kết nối WebSocket chính: /ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // cho phép mọi origin
                .addInterceptors(new WebSocketHandshakeInterceptor()) // thêm bước xác thực JWT
                .withSockJS(); // bật SockJS fallback (phòng khi browser không hỗ trợ WS)
    }

    @Override

    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(nativeHandler, "/ws-native")
                .addInterceptors(new WebSocketHandshakeInterceptor()) // thêm bước xác thực JWT
                .setAllowedOrigins("*"); // Allow all for testing
    }

    // 🔐
    // Interceptor xác thực JWT
    // khi handshake bắt đầu

    @RequiredArgsConstructor
    public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {
        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                WebSocketHandler wsHandler, Map<String, Object> attributes) {
            try {
                String authHeader = request.getHeaders().getFirst("Authorization");
                // Header JWT dạng: Bearer <token>
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);

                    // Xác thực token hợp lệ
                    if (jwtService.validateToken(token)) {
                        // Trích xuất participantId và roomId từ JWT
                        String participantId = jwtService.extractParticipantId(token);
                        String roomId = jwtService.extractRoomId(token);

                        // Lưu vào session attributes để các Controller có thể lấy lại
                        attributes.put("participantId", participantId);
                        attributes.put("roomId", roomId);

                        log.info("✅ WebSocket handshake success: participant {} joined room {}",
                                participantId, roomId);
                        return true;
                    }
                }
                log.warn("❌ WebSocket handshake failed: Missing or invalid token");
                return false;
            } catch (Exception e) {
                log.error("🚨 Error during WebSocket handshake", e);
                return false;
            }
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                WebSocketHandler wsHandler, Exception exception) {
            // Không cần xử lý sau handshake
        }
    }
}
