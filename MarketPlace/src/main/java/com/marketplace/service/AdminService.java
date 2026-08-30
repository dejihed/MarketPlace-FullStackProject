package com.marketplace.service;

import com.marketplace.dto.ProductDTO;
import com.marketplace.dto.UserDTO;
import com.marketplace.model.Product;
import com.marketplace.model.ProductImage;
import com.marketplace.model.User;
import com.marketplace.repository.FavoriteRepository;
import com.marketplace.repository.ProductImageRepository;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final FavoriteRepository favoriteRepository;

    private static final String UPLOAD_DIR =
            "C:/Users/dejih/OneDrive/Desktop/MarketPlace/MarketPlace/uploads";

    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalFavorites = favoriteRepository.count();

        List<Product> allProducts = productRepository.findAll();
        Map<String, Long> categoryStats = allProducts.stream()
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));

        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("totalFavorites", totalFavorites);
        stats.put("categoryBreakdown", categoryStats);

        return stats;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        favoriteRepository.deleteAllByUserId(userId);

        List<Product> userProducts = productRepository.findBySeller(user);

        for (Product product : userProducts) {
            favoriteRepository.deleteAllByProductId(product.getId());
            for (ProductImage img : product.getImages()) {
                deleteImageFile(img.getImageUrl());
            }
            productImageRepository.deleteAll(product.getImages());
        }
        productRepository.deleteAll(userProducts);
        userRepository.delete(user);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        favoriteRepository.deleteAllByProductId(productId);
        for (ProductImage img : product.getImages()) {
            deleteImageFile(img.getImageUrl());
        }
        productImageRepository.deleteAll(product.getImages());
        productRepository.delete(product);
    }

    private void deleteImageFile(String imageUrl) {
        try {
            String fileName = imageUrl.replace("/uploads/", "");
            File file = new File(UPLOAD_DIR + "/" + fileName);
            if (file.exists()) {
                file.delete();
            }
        } catch (Exception e) {
            System.err.println("Failed to delete image: " + imageUrl);
        }
    }
}