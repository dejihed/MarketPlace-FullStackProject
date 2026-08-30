package com.marketplace.dto;

import com.marketplace.model.ProductImage;
import lombok.Getter;

@Getter
public class ProductImageDTO {
    private Long id;
    private String imageUrl;

    public ProductImageDTO(ProductImage image) {
        this.id = image.getId();
        this.imageUrl = image.getImageUrl(); // already contains /uploads/filename
    }
}
