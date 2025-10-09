package com.watchtogether.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.watchtogether.Entity.jpa.Participant;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    // Lấy giá trị từ file application.properties
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    // Hàm tạo token từ thông tin của một participant
    public String generateToken(Participant participant) {
        // "Claims" là các thông tin chúng ta muốn lưu trong token
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", participant.getRole());
        claims.put("roomId", participant.getRoomId());
        claims.put("displayName", participant.getDisplayName());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(participant.getId()) // Subject thường là ID của người dùng/participant
                .setIssuedAt(new Date(System.currentTimeMillis())) // Thời gian phát hành
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs)) // Thời gian hết hạn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Ký token bằng thuật toán HS256
                .compact();
    }

    // Hàm helper để tạo key ký từ chuỗi secret
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
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

    // Getter chi tiết từ payload JWT
    public String extractParticipantId(String token) {
        return extractClaim(token, claims -> claims.get("participantId", String.class));
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
}
