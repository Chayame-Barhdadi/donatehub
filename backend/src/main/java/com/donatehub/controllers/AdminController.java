package com.donatehub.controllers;

import com.donatehub.models.DonationItem;
import com.donatehub.models.User;
import com.donatehub.repositories.DonationItemRepository;
import com.donatehub.services.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {
    "http://localhost:4200",
    "http://YOUR_EC2_ELASTIC_IP:8085",
    "https://YOUR_CLOUDFRONT_ID.cloudfront.net"
})
public class AdminController {

    private final AdminService adminService;
    private final DonationItemRepository itemRepository;

    public AdminController(AdminService adminService, DonationItemRepository itemRepository) {
        this.adminService = adminService;
        this.itemRepository = itemRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/items")
    public ResponseEntity<List<DonationItem>> getAllItems() {
        return ResponseEntity.ok(itemRepository.findAll());
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        adminService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        adminService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
