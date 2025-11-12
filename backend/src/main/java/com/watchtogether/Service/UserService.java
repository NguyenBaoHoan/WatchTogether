package com.watchtogether.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.watchtogether.Entity.jpa.User;
import com.watchtogether.Repository.jpa.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public User handleSaveUser(User user) {
        return userRepository.save(user);
    }

    public User fetchOneUser(String id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        return null;
    }
    public List<User> fetchAllUsers() {
        return userRepository.findAll();
    }
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }
}
