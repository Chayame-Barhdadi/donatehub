package com.donatehub.controllers;

import com.donatehub.models.Role;
import com.donatehub.models.User;
import com.donatehub.repositories.UserRepository;
import com.donatehub.services.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email déjà utilisé");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Assign default role
        user.getRoles().add(Role.USER);
        
        User savedUser = userRepository.save(user);
        
        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRoles());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", savedUser);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            User user = userOpt.get();
            String token = jwtService.generateToken(user.getEmail(), user.getRoles());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body("Identifiants invalides");
    }
}
