package com.marketplace.controller;

import com.marketplace.dto.ProductDTO;
import com.marketplace.model.User;
import com.marketplace.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProductController {

    private final ProductService productService;

    /* ================= CREATE ================= */

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam String address,
            @RequestParam String category,
            @RequestParam("images") MultipartFile[] images,
            Authentication authentication
    ) throws IOException {

        User seller = (User) authentication.getPrincipal();
        return ResponseEntity.ok(
                productService.createProduct(title, description, price, address, category, images, seller)
        );
    }

    /* ================= READ ================= */

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String address
    ) {
        return ResponseEntity.ok(productService.searchProducts(search, category, address));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    /* ================= MY PRODUCTS ================= */

    @GetMapping("/my")
    public ResponseEntity<List<ProductDTO>> getMyProducts(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(productService.getMyProducts(user));
    }


    /* ================= UPDATE ================= */

    @PutMapping("/{id}/edit")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam String address,
            @RequestParam String category,
            @RequestParam(value = "existingImages", required = false) List<Long> existingImages,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            Authentication authentication
    ) throws IOException {

        User user = (User) authentication.getPrincipal();

        ProductDTO updatedProduct = productService.updateProductWithImages(
                id, title, description, price, address, category, existingImages, images, user
        );

        return ResponseEntity.ok(updatedProduct);
    }




    /* ================= DELETE ================= */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        productService.deleteProduct(id, user);
        return ResponseEntity.noContent().build();
    }

    /* ================= DELETE IMAGE ================= */

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long imageId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        productService.deleteImage(imageId, user);
        return ResponseEntity.noContent().build();
    }

}