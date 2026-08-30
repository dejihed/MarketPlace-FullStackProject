package com.marketplace.service;

import com.marketplace.dto.ProductDTO;
import com.marketplace.model.Favorite;
import com.marketplace.model.Product;
import com.marketplace.model.User;
import com.marketplace.repository.FavoriteRepository;
import com.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    public List<ProductDTO> getFavorites(User user) {
        return favoriteRepository.findByUser(user)
                .stream()
                .map(favorite -> new ProductDTO(favorite.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(User user, Long productId) {

        if (favoriteRepository.existsByUserAndProductId(user, productId)) {
            return;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProduct(product);

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(User user, Long productId) {
        favoriteRepository.deleteByUserAndProductId(user, productId);
    }

    public boolean isFavorite(User user, Long productId) {
        return favoriteRepository.existsByUserAndProductId(user, productId);
    }
}