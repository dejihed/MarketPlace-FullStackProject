package com.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String token;
}
