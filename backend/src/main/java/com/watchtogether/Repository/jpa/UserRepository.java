package com.watchtogether.Repository.jpa;

import com.watchtogether.Entity.jpa.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    // Tìm user bằng email (dùng cho login và kiểm tra trùng lặp khi register)
    Optional<User> findByEmail(String email);

    // Kiểm tra xem email đã tồn tại chưa
    boolean existsByEmail(String email);
    Optional<User> findByName(String name);
    boolean existsByName(String name);
}