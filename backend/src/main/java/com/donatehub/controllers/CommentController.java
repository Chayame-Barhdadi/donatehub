package com.donatehub.controllers;

import com.donatehub.models.Comment;
import com.donatehub.models.DonationItem;
import com.donatehub.models.User;
import com.donatehub.repositories.CommentRepository;
import com.donatehub.repositories.DonationItemRepository;
import com.donatehub.repositories.UserRepository;
import com.donatehub.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items/{itemId}/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final DonationItemRepository itemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommentController(CommentRepository commentRepository, DonationItemRepository itemRepository, UserRepository userRepository, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long itemId) {
        return ResponseEntity.ok(commentRepository.findByItemIdOrderByCreatedAtAsc(itemId));
    }

    @PostMapping
    public ResponseEntity<?> addComment(@PathVariable Long itemId, @RequestBody Map<String, String> payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        DonationItem item = itemRepository.findById(itemId).orElse(null);
        
        if (item == null || user == null) return ResponseEntity.notFound().build();

        Comment comment = new Comment();
        comment.setText(payload.get("text"));
        comment.setAuthor(user);
        comment.setItem(item);

        Comment savedComment = commentRepository.save(comment);

        // 1. Notification pour le propriétaire de l'objet
        if (!item.getUser().getId().equals(user.getId())) {
            String msg = user.getName() + " a commenté votre objet : " + item.getTitle();
            notificationService.createNotification(item.getUser(), user, msg, "COMMENT", itemId);
        }

        // 2. Notification pour les personnes mentionnées (@Nom)
        String text = comment.getText();
        if (text != null && text.contains("@")) {
            // On cherche tous les utilisateurs impliqués dans ce post (auteur et commentateurs)
            // pour éviter de scanner toute la base de données
            List<Comment> itemComments = commentRepository.findByItemIdOrderByCreatedAtAsc(itemId);
            itemComments.stream()
                .map(Comment::getAuthor)
                .distinct()
                .filter(u -> !u.getId().equals(user.getId())) // Ne pas s'auto-notifier
                .filter(u -> !u.getId().equals(item.getUser().getId())) // Déjà notifié si c'est le proprio
                .forEach(u -> {
                    if (text.contains("@" + u.getName())) {
                        String msg = user.getName() + " vous a répondu sur l'objet : " + item.getTitle();
                        notificationService.createNotification(u, user, msg, "COMMENT", itemId);
                    }
                });
        }

        return ResponseEntity.ok(savedComment);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long itemId, @PathVariable Long commentId, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        Comment comment = commentRepository.findById(commentId).orElse(null);
        
        if (comment == null) return ResponseEntity.notFound().build();
        
        // Autoriser si propriétaire du commentaire, propriétaire de l'objet, ou ADMIN
        boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
        boolean isItemOwner = comment.getItem().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.name().equals("ADMIN"));
        
        if (isAuthor || isItemOwner || isAdmin) {
            commentRepository.delete(comment);
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.status(403).build();
    }
}
