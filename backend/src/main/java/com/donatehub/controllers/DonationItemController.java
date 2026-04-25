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

    public DonationItemController(DonationItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<DonationItem> createItem(@RequestBody DonationItem item) {
        DonationItem createdItem = itemService.createItem(item);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DonationItem>> getAllItems() {
        List<DonationItem> items = itemService.getAllItems();
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
