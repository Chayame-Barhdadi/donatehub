package com.donatehub.services;

import com.donatehub.exceptions.ResourceNotFoundException;
import com.donatehub.models.DonationItem;
import com.donatehub.models.ItemStatus;
import com.donatehub.repositories.DonationItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DonationItemService {

    private final DonationItemRepository itemRepository;

    public DonationItemService(DonationItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Transactional
    public DonationItem createItem(DonationItem item) {
        if (item.getStatus() == null) {
            item.setStatus(ItemStatus.AVAILABLE);
        }
        return itemRepository.save(item);
    }

    public List<DonationItem> getAllItems() {
        return itemRepository.findAll();
    }

    public DonationItem getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
    }

    @Transactional
    public DonationItem updateItemStatus(Long id, ItemStatus newStatus) {
        DonationItem item = getItemById(id);
        item.setStatus(newStatus);
        return itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Item not found with id: " + id);
        }
        itemRepository.deleteById(id);
    }
}
