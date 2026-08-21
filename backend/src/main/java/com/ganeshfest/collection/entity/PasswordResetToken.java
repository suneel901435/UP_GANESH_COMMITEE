package com.ganeshfest.collection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * One-time-use token issued when an admin requests a password reset via
 * "Forgot password?" on the admin login page. The raw token (not a hash of
 * it) is what gets emailed and put in the reset link - this is a low-stakes
 * internal admin tool, not a bank, so we keep it simple. Each row is
 * consumed (used = true) the moment it's successfully used to set a new
 * password, and is never reused after that even if the link is clicked
 * again before it expires.
 */
@Entity
@Table(name = "password_reset_token")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Long adminUserId;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    private boolean used = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
