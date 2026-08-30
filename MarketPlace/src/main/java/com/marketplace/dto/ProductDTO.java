package com.marketplace.dto;

import com.marketplace.model.Product;
import com.marketplace.model.ProductImage;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
public class ProductDTO {

    private Long id;
    private String title;
    private String description;
    private Double price;
    private String address;
    private String category;
    private SellerDTO seller;
    private List<String> images;
    private List<Long> imageIds;

    public ProductDTO(Product product) {
        this.id = product.getId();
        this.title = product.getTitle();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.address = product.getAddress();
        this.category = product.getCategory();
        this.seller = new SellerDTO(product.getSeller());
        this.images = product.getImages()
                .stream()
                .map(ProductImage::getImageUrl)
                .toList();
        this.imageIds = product.getImages()
                .stream()
                .map(ProductImage::getId)
                .toList();
    }
}