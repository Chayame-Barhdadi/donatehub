package com.donatehub.controllers;

import com.donatehub.models.DonationItem;
import com.donatehub.models.ItemStatus;
import com.donatehub.services.DonationItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class DonationItemController {

    private final DonationItemService itemService;
    private final com.donatehub.repositories.UserRepository userRepository;

    public DonationItemController(DonationItemService itemService, com.donatehub.repositories.UserRepository userRepository) {
        this.itemService = itemService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<DonationItem> createItem(@RequestBody DonationItem item, java.security.Principal principal) {
        if (principal != null) {
            com.donatehub.models.User user = userRepository.findByEmail(principal.getName()).orElse(null);
            item.setUser(user);
        }
        DonationItem createdItem = itemService.createItem(item);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonationItem> updateItem(@PathVariable Long id, @RequestBody DonationItem itemDetails, java.security.Principal principal) {
        DonationItem item = itemService.getItemById(id);
        if (principal != null) {
            com.donatehub.models.User user = userRepository.findByEmail(principal.getName()).orElse(null);
            if (user != null && !item.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        item.setTitle(itemDetails.getTitle());
        item.setDescription(itemDetails.getDescription());
        item.setCategory(itemDetails.getCategory());
        item.setCity(itemDetails.getCity());
        if (itemDetails.getImageUrl() != null) {
            item.setImageUrl(itemDetails.getImageUrl());
        }
        DonationItem updatedItem = itemService.createItem(item); // createItem uses save() which does update if ID exists
        return ResponseEntity.ok(updatedItem);
    }

    @GetMapping
    public ResponseEntity<List<DonationItem>> getAllItems(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category) {
        List<DonationItem> items = itemService.searchItems(city, category);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationItem> getItemById(@PathVariable Long id) {
        DonationItem item = itemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DonationItem> updateItemStatus(
            @PathVariable Long id,
            @RequestParam ItemStatus status) {
        DonationItem updatedItem = itemService.updateItemStatus(id, status);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
