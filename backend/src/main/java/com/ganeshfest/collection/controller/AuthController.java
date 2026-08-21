package com.ganeshfest.collection.controller;

import com.ganeshfest.collection.dto.ForgotPasswordRequest;
import com.ganeshfest.collection.dto.LoginRequest;
import com.ganeshfest.collection.dto.LoginResponse;
import com.ganeshfest.collection.dto.MessageResponse;
import com.ganeshfest.collection.dto.ResetPasswordRequest;
import com.ganeshfest.collection.entity.AdminUser;
import com.ganeshfest.collection.repository.AdminUserRepository;
import com.ganeshfest.collection.security.JwtUtil;
import com.ganeshfest.collection.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetService passwordResetService;

    public AuthController(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil, PasswordResetService passwordResetService) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        AdminUser user = adminUserRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }

    // Always returns the same generic message whether or not the email
    // matches an admin account - this deliberately avoids leaking which
    // emails are registered as admins. If it matches, an email with a
    // one-time reset link (valid 30 minutes) is sent before responding.
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.getEmail());
        return ResponseEntity.ok(MessageResponse.builder()
                .message("If that email is registered, a password reset link has been sent.")
                .build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Password reset successfully. You can now log in with your new password.")
                .build());
    }
}
