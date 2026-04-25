package com.donatehub.config;

import com.donatehub.models.DonationItem;
import com.donatehub.models.ItemStatus;
import com.donatehub.models.Role;
import com.donatehub.models.User;
import com.donatehub.repositories.DonationItemRepository;
import com.donatehub.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DonationItemRepository itemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, DonationItemRepository itemRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // Create Users
        User user1 = new User(null, "Alice", "alice@example.com", "Casablanca", passwordEncoder.encode("password123"));
        user1.getRoles().add(Role.USER);

        User user2 = new User(null, "Bob", "bob@example.com", "Rabat", passwordEncoder.encode("password123"));
        user2.getRoles().add(Role.USER);
        user2.getRoles().add(Role.ADMIN);
        
        userRepository.saveAll(Arrays.asList(user1, user2));

        // Create Items for Alice
        DonationItem item1 = new DonationItem(null, "Vieux Canapé", "Canapé en bon état, un peu usé.", "Meubles", "Paris", ItemStatus.AVAILABLE, user1);
        DonationItem item2 = new DonationItem(null, "Livre Java", "Livre pour apprendre Spring Boot.", "Livres", "Paris", ItemStatus.RESERVED, user1);

        // Create Items for Bob
        DonationItem item3 = new DonationItem(null, "Vélo enfant", "Vélo bleu pour enfant de 5-7 ans.", "Sport", "Lyon", ItemStatus.AVAILABLE, user2);
        DonationItem item4 = new DonationItem(null, "Lampe vintage", "Lampe de bureau des années 70.", "Décoration", "Lyon", ItemStatus.GIVEN, user2);

        itemRepository.saveAll(Arrays.asList(item1, item2, item3, item4));

        System.out.println("Data Seeding completed successfully!");
    }
}
