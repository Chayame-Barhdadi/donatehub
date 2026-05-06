package com.donatehub.controllers;

import com.donatehub.models.Notification;
import com.donatehub.models.User;
import com.donatehub.repositories.UserRepository;
import com.donatehub.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
}
