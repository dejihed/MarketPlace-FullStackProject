package com.marketplace.dto;

import com.marketplace.model.User;
import lombok.Getter;

@Getter
public class SellerDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;

    public SellerDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
    }
}
