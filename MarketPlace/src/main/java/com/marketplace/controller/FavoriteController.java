package com.marketplace.controller;

import com.marketplace.dto.ProductDTO;
import com.marketplace.model.User;
import com.marketplace.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getFavorites(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(favoriteService.getFavorites(user));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addFavorite(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        favoriteService.addFavorite(user, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        favoriteService.removeFavorite(user, productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> isFavorite(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(favoriteService.isFavorite(user, productId));
    }
}