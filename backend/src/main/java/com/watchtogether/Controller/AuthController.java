package com.watchtogether.Controller;

import com.watchtogether.Entity.jpa.User;
import com.watchtogether.Service.AuthService;
import com.watchtogether.Service.JwtService;
import com.watchtogether.util.CookieUtil;
import com.watchtogether.DTO.Request.ReqAuth;
import com.watchtogether.DTO.Response.ResAuth;
import com.watchtogether.DTO.Response.ErrorResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final CookieUtil cookieUtil;

    /**
     * Đăng ký
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody ReqAuth request) {
        try {
            User user = authService.register(request);
            return createAuthResponse(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), System.currentTimeMillis()));
        }
    }

    /**
     * Đăng nhập
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody ReqAuth request) {
        try {
            User user = authService.login(request);
            return createAuthResponse(user);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new ErrorResponse(e.getMessage(), System.currentTimeMillis()));
        }
    }

    /**
     * Helper tạo response (gồm accessToken và HttpOnly cookie)
     */
    private ResponseEntity<ResAuth> createAuthResponse(User user) {
        // 1. Tạo Access Token (gửi về JSON)
        String accessToken = jwtService.generateUserAccessToken(user);

        // 2. Tạo Refresh Token (gửi về HttpOnly Cookie)
        String refreshToken = jwtService.generateUserRefreshToken(user);

        // 3. Tạo Cookie
        ResponseCookie refreshTokenCookie = cookieUtil.createRefreshTokenCookie(
                refreshToken,
                jwtService.getRefreshTokenExpirationMs() / 1000 // Chuyển ms sang s
        );

        // 4. Tạo Response DTO
        ResAuth authResponse = ResAuth.builder()
                .accessToken(accessToken)
                .user(ResAuth.UserInfo.fromUser(user))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(authResponse);
    }

    /**
     * Làm mới Access Token
     * API này sẽ được interceptor của frontend tự động gọi
     */
    @GetMapping("/refresh")
    public ResponseEntity<ResAuth> refreshToken(HttpServletRequest request) {
        // 1. Lấy refresh token từ cookie
        String refreshToken = cookieUtil.getRefreshTokenFromCookie(request);
        if (refreshToken == null) {
            return ResponseEntity.status(401).body(null); // Không có token
        }

        try {
            // 2. Xác thực refresh token và lấy User
            User user = jwtService.validateRefreshTokenAndGetUser(refreshToken);

            // 3. Cấp Access Token mới
            String newAccessToken = jwtService.generateUserAccessToken(user);

            // 4. Tạo Response DTO (chỉ chứa access token mới)
            ResAuth authResponse = ResAuth.builder()
                    .accessToken(newAccessToken)
                    .user(ResAuth.UserInfo.fromUser(user))
                    .build();

            // Không cần set lại refresh cookie vì nó vẫn còn hạn
            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(null); // Refresh token không hợp lệ
        }
    }

    /**
     * Đăng xuất
     * Xóa HttpOnly cookie
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie clearCookie = cookieUtil.clearRefreshTokenCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
    }

    /**
     * Lấy thông tin user hiện tại (đã được xác thực bằng Access Token)
     */
    @GetMapping("/account")
    public ResponseEntity<ResAuth.UserInfo> getAccount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(null);
        }

        // TODO: Bạn cần implement JwtAuthenticationFilter để lấy user từ token
        return ResponseEntity.ok(null);
    }
}
