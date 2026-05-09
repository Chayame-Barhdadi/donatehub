package com.donatehub.services;

import com.donatehub.models.User;
import com.donatehub.repositories.CommentRepository;
import com.donatehub.repositories.DonationItemRepository;
import com.donatehub.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DonationItemRepository itemRepository;
    private final CommentRepository commentRepository;

    public AdminService(UserRepository userRepository, DonationItemRepository itemRepository, CommentRepository commentRepository) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.commentRepository = commentRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

    @Transactional
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
