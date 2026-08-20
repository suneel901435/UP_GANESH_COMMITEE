package com.ganeshfest.collection.config;

import com.ganeshfest.collection.entity.AdminUser;
import com.ganeshfest.collection.entity.SponsorCategory;
import com.ganeshfest.collection.enums.Role;
import com.ganeshfest.collection.repository.AdminUserRepository;
import com.ganeshfest.collection.repository.SponsorCategoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;

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
    private final SponsorCategoryRepository sponsorCategoryRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public DataSeeder(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder,
                       SponsorCategoryRepository sponsorCategoryRepository) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.sponsorCategoryRepository = sponsorCategoryRepository;
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

        // Seed a starter set of sponsor categories on first boot only - admins
        // can rename, add to, or delete these freely afterwards from
        // Admin > Sponsor Categories. Never re-seeded once any row exists,
        // so it won't fight with an admin who's already customized the list.
        if (sponsorCategoryRepository.count() == 0) {
            List<SponsorCategory> defaults = List.of(
                    SponsorCategory.builder().categoryKey("vigraha_data").categoryLabel("Vigraha (Idol)").sortOrder(1).build(),
                    SponsorCategory.builder().categoryKey("laddu_data").categoryLabel("Laddu / Prasadam").sortOrder(2).build(),
                    SponsorCategory.builder().categoryKey("mandap_data").categoryLabel("Mandap").sortOrder(3).build(),
                    SponsorCategory.builder().categoryKey("lighting_data").categoryLabel("Lighting").sortOrder(4).build(),
                    SponsorCategory.builder().categoryKey("sound_data").categoryLabel("Sound System").sortOrder(5).build(),
                    SponsorCategory.builder().categoryKey("decoration_data").categoryLabel("Decoration").sortOrder(6).build(),
                    SponsorCategory.builder().categoryKey("general_data").categoryLabel("General").sortOrder(7).build()
            );
            sponsorCategoryRepository.saveAll(defaults);
            System.out.println(">>> Seeded " + defaults.size() + " default sponsor categories.");
        }

        // Printed on every boot on purpose - if velam paata photos ever look
        // broken again, check this path first and confirm the image files
        // actually exist here.
        File dir = new File(uploadDir);
        System.out.println(">>> Velam paata photos are stored at: " + dir.getAbsolutePath()
                + " (exists: " + dir.exists() + ")");
    }
}
