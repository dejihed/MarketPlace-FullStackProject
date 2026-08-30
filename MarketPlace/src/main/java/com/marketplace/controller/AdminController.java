package com.marketplace.controller;

import com.marketplace.dto.ProductDTO;
import com.marketplace.dto.UserDTO;
import com.marketplace.model.User;
import com.marketplace.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;


    @GetMapping("/check")
    public ResponseEntity<Boolean> isAdmin(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok("ADMIN".equalsIgnoreCase(user.getRole()));
    }


    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(adminService.getStatistics());
    }


    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProductsAdmin(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProductAdmin(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }
        adminService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}