package com.watchtogether.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
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
                                                // Cho phép mọi người truy cập API tạo và tham gia phòng mà không cần
                                                // đăng nhập.
                                                .requestMatchers("/api/rooms/**").permitAll()
                                                .requestMatchers("/ws", "/ws/**").permitAll()
                                                .requestMatchers("/ws-native", "/ws-native/**").permitAll()
                                                .anyRequest().authenticated())

                                // Cấu hình không tạo session, vì mỗi request sẽ gửi kèm JWT (stateless).
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
                return http.build();
        }
}