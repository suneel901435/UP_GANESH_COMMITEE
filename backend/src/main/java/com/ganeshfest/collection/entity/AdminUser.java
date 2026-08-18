package com.ganeshfest.collection.entity;

import com.ganeshfest.collection.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin_user")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.ADMIN;
}
