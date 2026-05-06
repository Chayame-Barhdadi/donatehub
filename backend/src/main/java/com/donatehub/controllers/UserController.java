package com.donatehub.controllers;

import com.donatehub.models.User;
import com.donatehub.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/me — Retourne le profil de l'utilisateur connecté
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(user);
    }

    /**
     * PUT /api/users/me — Mise à jour du profil (nom, ville, email)
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody User updatedData, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            User updated = userService.updateProfile(principal.getName(), updatedData);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /api/users/me/password — Changement de mot de passe
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");
        if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Données invalides.");
        }
        try {
            userService.changePassword(principal.getName(), currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/users — Liste tous les utilisateurs (Admin only, pour les stats)
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
