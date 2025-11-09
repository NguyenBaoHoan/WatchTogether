package com.watchtogether.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Data;
import lombok.val;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.watchtogether.Entity.jpa.Participant;
import com.watchtogether.Entity.jpa.User;
import com.watchtogether.Repository.jpa.UserRepository;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
@Data
public class JwtService {

    // Lấy giá trị từ file application.properties
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Value("${jwt.participant-expiration-ms}")
    private long participantTokenExpirationMs;

    private final UserRepository userRepository;

    public JwtService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Hàm tạo token từ thông tin của một participant
    public String generateParticipantToken(Participant participant) {
        // "Claims" là các thông tin chúng ta muốn lưu trong token
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", participant.getRole());
        claims.put("roomId", participant.getRoomId());
        claims.put("displayName", participant.getDisplayName());
        claims.put("type", "participant"); // Phân biệt loại token

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(participant.getId()) // Subject thường là ID của người dùng/participant
                .setIssuedAt(new Date(System.currentTimeMillis())) // Thời gian phát hành
                .setExpiration(new Date(System.currentTimeMillis() + participantTokenExpirationMs)) // Thời gian hết hạn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Ký token bằng thuật toán HS256
                .compact();
    }

    public String generateUserAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("name", user.getName());
        claims.put("email", user.getEmail());
        claims.put("type", "access"); // Phân biệt loại token

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId()) // Subject là User ID
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs)) // Hạn ngắn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateUserRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh"); // Phân biệt loại token

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId()) // Subject là User ID
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs)) // Hạn dài
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // === HÀM TIỆN ÍCH (HELPER) ===
    
    // Hàm helper để tạo key ký từ chuỗi secret
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    // Getter chi tiết từ payload JWT
    public String extractParticipantId(String token) {
        // ⭐ Lấy từ Subject (vì generateToken đặt participant.getId() vào subject)
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRoomId(String token) {
        return extractClaim(token, claims -> claims.get("roomId", String.class));
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }
    
    // Cả UserId và ParticipantId đều được lưu trong Subject
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // === XÁC THỰC VÀ ĐỌC TOKEN ===

    public User validateRefreshTokenAndGetUser(String token) throws Exception {
        Claims claims = extractAllClaims(token);
        String type = claims.get("type", String.class);
        if (!"refresh".equals(type) || isTokenExpired(token)) {
            throw new Exception("Invalid or expired refresh token");
        }
        String userId = extractUserId(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found for refresh token"));
    }

    // 🔒 Kiểm tra token hợp lệ
    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.error("JWT validation failed", e);
            return false;
        }
    }

}
