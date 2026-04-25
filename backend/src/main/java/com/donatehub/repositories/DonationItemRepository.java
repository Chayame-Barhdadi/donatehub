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
}
