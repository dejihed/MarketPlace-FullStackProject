package com.marketplace.repository;

import com.marketplace.model.Favorite;
import com.marketplace.model.Product;
import com.marketplace.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUser(User user);

    boolean existsByUserAndProductId(User user, Long productId);

    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.user = :user AND f.product.id = :productId")
    void deleteByUserAndProductId(@Param("user") User user, @Param("productId") Long productId);

    // Delete all favorites for a product (used when deleting a product)
    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.product.id = :productId")
    void deleteAllByProductId(@Param("productId") Long productId);

    // Delete all favorites by a user (used when deleting a user)
    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}