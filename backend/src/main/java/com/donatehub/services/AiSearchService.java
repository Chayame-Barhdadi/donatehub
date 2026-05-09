package com.donatehub.services;

import com.donatehub.dto.AiItemDTO;
import com.donatehub.models.DonationItem;
import com.donatehub.models.ItemStatus;
import com.donatehub.repositories.DonationItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiSearchService {

    private final DonationItemRepository itemRepository;

    public AiSearchService(DonationItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<AiItemDTO> searchItemsForAi(String city, String category, String query) {
        List<DonationItem> items;

        // Si on a une ville et une catégorie détectée, on essaie d'abord un mix
        // Mais on privilégie désormais la recherche par mot-clé (query) si elle existe
        String searchQuery = (query != null && !query.isEmpty()) ? query : category;

        if (searchQuery != null && !searchQuery.isEmpty()) {
            items = itemRepository.searchFlexible(city, searchQuery);
        } else if (city != null && !city.isEmpty()) {
            items = itemRepository.findByCity(city);
        } else {
            items = itemRepository.findAll();
        }

        return items.stream()
                .filter(item -> item.getStatus() == ItemStatus.AVAILABLE)
                .limit(6) // Augmenté légèrement pour plus de choix
                .map(item -> new AiItemDTO(
                        item.getId(),
                        item.getTitle(),
                        item.getCategory(),
                        item.getCity(),
                        item.getImageUrl()
                ))
                .collect(Collectors.toList());
    }
}
