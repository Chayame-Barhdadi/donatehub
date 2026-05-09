package com.donatehub.services;

import com.donatehub.exceptions.ResourceNotFoundException;
import com.donatehub.models.User;
import com.donatehub.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateProfile(String email, User updatedData) {
        User user = getUserByEmail(email);
        if (updatedData.getName() != null && !updatedData.getName().isBlank()) {
            user.setName(updatedData.getName());
        }
        if (updatedData.getCity() != null && !updatedData.getCity().isBlank()) {
            user.setCity(updatedData.getCity());
        }
        // Email change: check uniqueness
        if (updatedData.getEmail() != null && !updatedData.getEmail().isBlank()
                && !updatedData.getEmail().equals(email)) {
            if (userRepository.findByEmail(updatedData.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Cet email est déjà utilisé.");
            }
            user.setEmail(updatedData.getEmail());
        }
        if (updatedData.getAvatarColor() != null) {
            user.setAvatarColor(updatedData.getAvatarColor());
        }
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
