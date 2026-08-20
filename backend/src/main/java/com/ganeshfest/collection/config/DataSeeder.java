package com.ganeshfest.collection.config;

import com.ganeshfest.collection.entity.AdminUser;
import com.ganeshfest.collection.enums.Role;
import com.ganeshfest.collection.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;

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

    @Value("${app.upload.dir}")
    private String uploadDir;

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

        // Printed on every boot on purpose - if velam paata photos ever look
        // broken again, check this path first and confirm the image files
        // actually exist here.
        File dir = new File(uploadDir);
        System.out.println(">>> Velam paata photos are stored at: " + dir.getAbsolutePath()
                + " (exists: " + dir.exists() + ")");
    }
}
