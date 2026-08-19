package com.ganeshfest.collection.config;

import com.ganeshfest.collection.entity.AdminUser;
import com.ganeshfest.collection.enums.Role;
import com.ganeshfest.collection.repository.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates a default SUPERADMIN on first boot so you have a way to log in.
 * Email: admin@ganeshfest.local  Password: Admin@123
 * CHANGE THIS PASSWORD immediately after first login (or delete this seeder
 * once you've created your real admin users).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminUserRepository.findByEmail("admin@ganeshfest.local").isEmpty()) {
            AdminUser admin = AdminUser.builder()
                    .name("Committee Admin")
                    .email("admin@ganeshfest.local")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(Role.SUPERADMIN)
                    .build();
            adminUserRepository.save(admin);
            System.out.println(">>> Default admin created: admin@ganeshfest.local / Admin@123 - CHANGE THIS PASSWORD");
        }
    }
}
