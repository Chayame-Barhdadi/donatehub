package com.donatehub.repositories;

import com.donatehub.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByItemIdOrderByCreatedAtAsc(Long itemId);
}
