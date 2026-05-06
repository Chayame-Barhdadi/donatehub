package com.donatehub.controllers;

import com.donatehub.models.DonationItem;
import com.donatehub.models.ItemInterest;
import com.donatehub.models.User;
import com.donatehub.repositories.DonationItemRepository;
import com.donatehub.repositories.ItemInterestRepository;
import com.donatehub.repositories.UserRepository;
import com.donatehub.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interests")
public class InterestController {

    private final ItemInterestRepository interestRepository;
    private final DonationItemRepository itemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public InterestController(ItemInterestRepository interestRepository, DonationItemRepository itemRepository, UserRepository userRepository, NotificationService notificationService) {
        this.interestRepository = interestRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @PostMapping("/item/{itemId}")
    @Transactional
    public ResponseEntity<?> toggleInterest(@PathVariable Long itemId, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        DonationItem item = itemRepository.findById(itemId).orElse(null);
        
        if (item == null || user == null) return ResponseEntity.notFound().build();

        var existing = interestRepository.findByUserIdAndItemId(user.getId(), itemId);
        if (existing.isPresent()) {
            interestRepository.delete(existing.get());
            return ResponseEntity.ok(java.util.Map.of("message", "Intérêt retiré."));
        } else {
            ItemInterest interest = new ItemInterest();
            interest.setUser(user);
            interest.setItem(item);
            interestRepository.save(interest);

            // Créer une notification pour le donneur
            if (!item.getUser().getId().equals(user.getId())) {
                String msg = user.getName() + " est intéressé(e) par votre objet : " + item.getTitle();
                notificationService.createNotification(item.getUser(), user, msg, "INTEREST", itemId);
            }

            return ResponseEntity.ok(java.util.Map.of("message", "Intérêt ajouté."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<List<DonationItem>> getMyInterests(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        List<DonationItem> items = interestRepository.findByUserId(user.getId())
                .stream()
                .map(ItemInterest::getItem)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(items);
    }
}
