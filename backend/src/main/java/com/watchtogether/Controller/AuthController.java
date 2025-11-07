package com.watchtogether.Controller;

import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties.Jwt;

import com.watchtogether.Service.AuthService;
import com.watchtogether.Service.JwtService;

public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;
    private final CookieUtil cookieUtil;

    
    
}
