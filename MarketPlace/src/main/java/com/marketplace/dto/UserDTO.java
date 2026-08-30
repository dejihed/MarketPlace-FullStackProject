package com.marketplace.dto;

import com.marketplace.model.User;
import lombok.Getter;

@Getter
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;

    public UserDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
    }
}