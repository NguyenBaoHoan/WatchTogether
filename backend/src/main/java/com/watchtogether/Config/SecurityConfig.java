package com.watchtogether.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
                this.jwtAuthFilter = jwtAuthFilter;
        }

        /**
         * Password encoder bean cho việc mã hoá/kiểm tra mật khẩu.
         */
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http,
                        // qualifier to specify the CORS configuration bean
                        @Qualifier("corsConfigurationSource") CorsConfigurationSource corsSource) throws Exception {
                http
                                // Use the specific CorsConfigurationSource bean
                                .cors(cors -> cors.configurationSource(corsSource))
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(authz -> authz
                                                // Cho phép preflight request
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                // Cho phép các API xác thực không cần login (trừ /account)
                                                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register",
                                                                "/api/v1/auth/refresh", "/api/v1/auth/logout")
                                                .permitAll()
                                                // Cho phép mọi người truy cập API tạo và tham gia phòng mà không cần
                                                // đăng nhập.
                                                .requestMatchers("/api/rooms/**").permitAll()
                                                .requestMatchers("/").permitAll()
                                                .requestMatchers("/ws", "/ws/**").permitAll()
                                                .requestMatchers("/ws-native", "/ws-native/**").permitAll()

                                                // /account cần access token
                                                .requestMatchers("/api/v1/auth/account").authenticated()
                                                .anyRequest().authenticated())

                                // Cấu hình không tạo session, vì mỗi request sẽ gửi kèm JWT (stateless).
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                // ⭐ QUAN TRỌNG: Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }
}