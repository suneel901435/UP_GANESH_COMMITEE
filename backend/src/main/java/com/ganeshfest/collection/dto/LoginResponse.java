package com.ganeshfest.collection.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponse {
    private String token;
    private String name;
    private String email;
    private String role;
}
