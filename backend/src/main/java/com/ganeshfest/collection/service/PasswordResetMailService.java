package com.ganeshfest.collection.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the "reset your password" email. Kept as a thin wrapper around
 * JavaMailSender so AuthController doesn't need to know about mail-specific
 * types, and so the from-address / link-building logic lives in one place.
 */
@Service
public class PasswordResetMailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    // Base URL of the deployed admin frontend, e.g. https://ganeshfest.example/admin
    // Override with APP_FRONTEND_ADMIN_URL in production - defaults to the
    // local Vite dev server so this works out of the box for local dev.
    @Value("${app.frontend.admin-url}")
    private String adminFrontendUrl;

    public PasswordResetMailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetEmail(String toEmail, String name, String token) {
        String resetLink = adminFrontendUrl.replaceAll("/$", "") + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Reset your Ganesh Fest admin password");
        message.setText(
                "Hi " + name + ",\n\n" +
                        "We received a request to reset your admin password for the Ganesh Fest collection app.\n\n" +
                        "Click the link below to set a new password (valid for 30 minutes):\n" +
                        resetLink + "\n\n" +
                        "If you didn't request this, you can safely ignore this email - your password will stay unchanged.\n\n" +
                        "- Ganesh Fest Committee"
        );
        mailSender.send(message);
    }
}
