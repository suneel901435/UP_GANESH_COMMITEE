package com.ganeshfest.collection.service;

import com.ganeshfest.collection.entity.AdminUser;
import com.ganeshfest.collection.entity.PasswordResetToken;
import com.ganeshfest.collection.repository.AdminUserRepository;
import com.ganeshfest.collection.repository.PasswordResetTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

/**
 * Owns the whole forgot/reset-password flow: minting a one-time token,
 * emailing it, validating it, and applying the new password. Kept separate
 * from AuthController so the controller stays a thin HTTP layer, matching
 * how AuditLogService is split out from the admin controllers.
 */
@Service
public class PasswordResetService {

    // How long a reset link stays valid before the admin has to request a new one.
    private static final long TOKEN_VALIDITY_MINUTES = 30;

    private final AdminUserRepository adminUserRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordResetMailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(AdminUserRepository adminUserRepository,
                                 PasswordResetTokenRepository resetTokenRepository,
                                 PasswordResetMailService mailService,
                                 PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.mailService = mailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Kicks off a reset for the given email if - and only if - it belongs to
     * an admin account. Deliberately never reveals whether the email
     * matched (the controller always returns the same generic message)
     * so this can't be used to enumerate valid admin emails.
     */
    @Transactional
    public void requestReset(String email) {
        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }
        AdminUser user = userOpt.get();

        // Invalidate any earlier outstanding links for this admin first, so
        // only the most recently requested link can ever be used.
        resetTokenRepository.deleteByAdminUserId(user.getId());

        String token = generateToken();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .adminUserId(user.getId())
                .expiresAt(LocalDateTime.now().plusMinutes(TOKEN_VALIDITY_MINUTES))
                .build();
        resetTokenRepository.save(resetToken);

        mailService.sendResetEmail(user.getEmail(), user.getName(), token);
    }

    /**
     * Validates the token and, if it's still good, sets the new password
     * and burns the token so it can't be replayed. Throws RuntimeException
     * on any failure - GlobalExceptionHandler turns that into a 404 with
     * the message below, which the frontend surfaces to the admin.
     */
    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new RuntimeException("This reset link is invalid. Please request a new one."));

        if (resetToken.isUsed()) {
            throw new RuntimeException("This reset link has already been used. Please request a new one.");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This reset link has expired. Please request a new one.");
        }

        AdminUser user = adminUserRepository.findById(resetToken.getAdminUserId())
                .orElseThrow(() -> new RuntimeException("This reset link is invalid. Please request a new one."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        adminUserRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
