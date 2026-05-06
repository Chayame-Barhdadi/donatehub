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
        DonationItem item1 = new DonationItem(null, "Vieux Canapé", "Canapé en bon état, un peu usé.", "Meubles", "Casablanca", ItemStatus.AVAILABLE, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400", user1);
        DonationItem item2 = new DonationItem(null, "Livre Java", "Livre pour apprendre Spring Boot.", "Livres", "Rabat", ItemStatus.RESERVED, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400", user1);

        // Create Items for Bob
        DonationItem item3 = new DonationItem(null, "Vélo enfant", "Vélo bleu pour enfant de 5-7 ans.", "Sport", "Marrakech", ItemStatus.AVAILABLE, "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400", user2);
        DonationItem item4 = new DonationItem(null, "Lampe vintage", "Lampe de bureau des années 70.", "Décoration", "Tanger", ItemStatus.GIVEN, "https://images.unsplash.com/photo-1507473884658-c70b6559b362?auto=format&fit=crop&q=80&w=400", user2);

        DonationItem item5 = new DonationItem(null, "T-shirt Coton", "T-shirt en coton bio.", "Vêtements", "Fès", ItemStatus.AVAILABLE, "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400", user1);
        DonationItem item6 = new DonationItem(null, "Micro-ondes", "Micro-ondes presque neuf.", "Électronique", "Agadir", ItemStatus.AVAILABLE, "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=400", user2);

        itemRepository.saveAll(Arrays.asList(item1, item2, item3, item4, item5, item6));

        System.out.println("Data Seeding completed successfully!");
    }
}
