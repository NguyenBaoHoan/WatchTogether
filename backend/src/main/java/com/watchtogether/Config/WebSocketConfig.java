package com.watchtogether.Config;

// import java.util.List;
// import java.util.Map;

import org.springframework.context.annotation.Configuration;
// import org.springframework.http.server.ServerHttpRequest;
// import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
// import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
// import org.springframework.web.socket.server.HandshakeInterceptor;

import com.watchtogether.Handler.NativeWebSocketHandler;
// import com.watchtogether.Service.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSocketMessageBroker // ⭐ Bật STOMP support
@RequiredArgsConstructor
@Slf4j
@EnableWebSocket // ⭐ Bật native WebSocket support

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer, WebSocketConfigurer {

    // ⭐ COMMENT: Bỏ JWT dependency để WebSocket hoạt động độc lập
    // private final JwtService jwtService;
    private final NativeWebSocketHandler nativeHandler;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Định nghĩa broker nội bộ dùng để gửi thông điệp đến client
        // /topic → gửi broadcast chung (ví dụ gửi cho cả room)
        // /queue → gửi riêng cho từng user
        config.enableSimpleBroker("/topic");

        // Các endpoint client gửi lên server phải bắt đầu bằng /app
        config.setApplicationDestinationPrefixes("/app");

    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // ⭐ Định nghĩa endpoint kết nối WebSocket - KHÔNG CẦN JWT
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // cho phép mọi origin
                // .addInterceptors(new WebSocketHandshakeInterceptor()) // ⭐ COMMENT: Bỏ JWT
                // interceptor
                .withSockJS(); // bật SockJS fallback (phòng khi browser không hỗ trợ WS)

        log.info("✅ WebSocket STOMP endpoint registered at /ws (No JWT required)");
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // ⭐ Native WebSocket handler - KHÔNG CẦN JWT
        registry.addHandler(nativeHandler, "/ws-native")
                // .addInterceptors(new WebSocketHandshakeInterceptor()) // ⭐ COMMENT: Bỏ JWT
                // interceptor
                .setAllowedOrigins("*"); // Allow all for testing

        log.info("✅ Native WebSocket handler registered at /ws-native (No JWT required)");
    }

    // ⭐⭐⭐ COMMENT: Bỏ JWT HandshakeInterceptor - Uncomment nếu muốn bật lại JWT
    // validation ⭐⭐⭐
    /*
     * // 🔐
     * // Interceptor xác thực JWT
     * // khi handshake bắt đầu
     * public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {
     * 
     * @Override
     * public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse
     * response,
     * WebSocketHandler wsHandler, Map<String, Object> attributes) {
     * try {
     * // 1) Thử header Authorization
     * String authHeader = request.getHeaders().getFirst("Authorization");
     * String token = null;
     * if (authHeader != null && authHeader.startsWith("Bearer ")) {
     * token = authHeader.substring(7);
     * } else {
     * // 2) Thử cookie header
     * List<String> cookieHeaders = request.getHeaders().get("cookie");
     * if (cookieHeaders != null) {
     * for (String cookieHeader : cookieHeaders) {
     * // cookieHeader ví dụ: "WT_ACCESS_TOKEN=xx; other=yy"
     * String tokenCandidate = parseCookie(cookieHeader, "WT_ACCESS_TOKEN");
     * if (tokenCandidate != null) {
     * token = tokenCandidate;
     * break;
     * }
     * }
     * }
     * }
     * 
     * if (token != null && jwtService.validateToken(token)) {
     * String participantId = jwtService.extractParticipantId(token);
     * String roomId = jwtService.extractRoomId(token);
     * attributes.put("participantId", participantId);
     * attributes.put("roomId", roomId);
     * log.info("✅ WebSocket handshake success: participant {} joined room {}",
     * participantId, roomId);
     * return true;
     * }
     * log.warn("❌ WebSocket handshake failed: Missing or invalid token");
     * return false;
     * } catch (Exception e) {
     * log.error("🚨 Error during WebSocket handshake", e);
     * return false;
     * }
     * }
     * 
     * @Override
     * public void afterHandshake(ServerHttpRequest request, ServerHttpResponse
     * response,
     * WebSocketHandler wsHandler, Exception exception) {
     * // No-op: can add logging or cleanup here if needed
     * }
     * 
     * // helper parse cookie string
     * private String parseCookie(String cookieHeader, String name) {
     * String[] pairs = cookieHeader.split(";");
     * for (String p : pairs) {
     * String[] kv = p.trim().split("=", 2);
     * if (kv.length == 2 && kv[0].equals(name)) {
     * return kv[1];
     * }
     * }
     * return null;
     * }
     * }
     */
}
