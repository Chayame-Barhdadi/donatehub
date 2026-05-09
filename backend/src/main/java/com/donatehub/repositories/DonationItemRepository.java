package com.donatehub.repositories;

import com.donatehub.models.DonationItem;
import com.donatehub.models.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationItemRepository extends JpaRepository<DonationItem, Long> {
    List<DonationItem> findByStatus(ItemStatus status);
    List<DonationItem> findByCity(String city);
    List<DonationItem> findByCategory(String category);
    List<DonationItem> findByTitleContainingIgnoreCase(String title);
    List<DonationItem> findByCityAndCategory(String city, String category);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DISTINCT i.* FROM items i WHERE " +
            "i.status = 'AVAILABLE' AND " +
            "(:city IS NULL OR LOWER(i.city) = LOWER(:city)) AND (" +
            "EXISTS (SELECT 1 FROM UNNEST(string_to_array(:keywords, ' ')) k WHERE " +
            "LOWER(i.title) LIKE LOWER(CONCAT('%', k, '%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%', k, '%')) OR " +
            "LOWER(i.category) LIKE LOWER(CONCAT('%', k, '%'))))", nativeQuery = true)
    List<DonationItem> searchFlexible(String city, String keywords);
}
