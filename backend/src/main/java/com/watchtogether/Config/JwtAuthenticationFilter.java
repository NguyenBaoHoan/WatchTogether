package com.watchtogether.Config;

import com.watchtogether.Entity.jpa.User;
import com.watchtogether.Repository.jpa.UserRepository;
import com.watchtogether.Service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT Authentication Filter
 * Filter này chạy TRƯỚC mỗi request để:
 * 1. Lấy JWT token từ Authorization header
 * 2. Validate token
 * 3. Load User từ database
 * 4. Set Authentication vào SecurityContext
 * 
 * Sau khi filter này chạy, Spring Security sẽ biết user đã authenticated
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        log.debug("Processing request to: {}", requestURI);

        // 1. Lấy Authorization header
        final String authHeader = request.getHeader("Authorization");
        log.debug("Authorization header: {}", authHeader != null ? "Bearer ***" : "null");

        // 2. Kiểm tra header có tồn tại và bắt đầu với "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No valid Authorization header found, proceeding without authentication");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 3. Lấy token (bỏ "Bearer " prefix)
            final String jwt = authHeader.substring(7);
            log.debug("Extracted JWT token (length: {})", jwt.length());

            // 4. Extract email từ token
            String email = jwtService.extractClaim(jwt, claims -> claims.get("email", String.class));
            log.debug("Extracted email from token: {}", email);

            // 5. Nếu có email và chưa authenticated
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("Email found and no existing authentication, proceeding with validation");

                // 6. Validate token
                boolean isValidToken = jwtService.validateToken(jwt);
                log.debug("Token validation result: {}", isValidToken);

                if (isValidToken) {
                    // 7. Load User từ database
                    User user = userRepository.findByEmail(email).orElse(null);
                    log.debug("User found in database: {}", user != null ? user.getEmail() : "null");

                    if (user != null) {
                        // 8. Tạo Authentication object với User entity
                        UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                user, // Principal (đối tượng User)
                                null, // Credentials (không cần vì đã có token)
                                Collections.emptyList() // Authorities/Roles (rỗng vì chưa dùng)
                            );

                        authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        // 9. ⭐ QUAN TRỌNG: Set Authentication vào SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("Successfully set authentication for user: {}", email);
                    } else {
                        log.warn("User not found in database for email: {}", email);
                    }
                } else {
                    log.warn("Token validation failed for email: {}", email);
                }
            } else {
                if (email == null) {
                    log.debug("No email found in token");
                } else {
                    log.debug("User already authenticated");
                }
            }
        } catch (Exception e) {
            // Log lỗi nhưng không block request
            log.error("Cannot set user authentication: {}", e.getMessage(), e);
        }

        // 10. Tiếp tục filter chain
        filterChain.doFilter(request, response);
    }
}
