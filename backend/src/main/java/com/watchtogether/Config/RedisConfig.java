package com.watchtogether.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

// com.watchtogether.Config/RedisRepoConfig.java
@Configuration
@EnableRedisRepositories(basePackages = "com.watchtogether.Repository.redis") // ⭐ FIX: Chữ R hoa
public class RedisConfig {
}
