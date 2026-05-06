package com.donatehub.repositories;

import com.donatehub.models.ItemInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ItemInterestRepository extends JpaRepository<ItemInterest, Long> {
    List<ItemInterest> findByUserId(Long userId);
    Optional<ItemInterest> findByUserIdAndItemId(Long userId, Long itemId);
    void deleteByUserIdAndItemId(Long userId, Long itemId);
}
