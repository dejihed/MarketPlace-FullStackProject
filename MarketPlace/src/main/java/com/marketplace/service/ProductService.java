package com.marketplace.service;

import com.marketplace.dto.ProductDTO;
import com.marketplace.model.Product;
import com.marketplace.model.ProductImage;
import com.marketplace.model.User;
import com.marketplace.repository.FavoriteRepository;
import com.marketplace.repository.ProductImageRepository;
import com.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final FavoriteRepository favoriteRepository;

    private static final String UPLOAD_DIR =
            "C:/Users/dejih/OneDrive/Desktop/MarketPlace/MarketPlace/uploads";

    /* ================= CREATE ================= */

    public ProductDTO createProduct(
            String title,
            String description,
            Double price,
            String address,
            String category,
            MultipartFile[] images,
            User seller
    ) throws IOException {

        Product product = new Product();
        product.setTitle(title);
        product.setDescription(description);
        product.setPrice(price);
        product.setAddress(address);
        product.setCategory(category);
        product.setSeller(seller);

        product = productRepository.save(product);

        File uploadDirectory = new File(UPLOAD_DIR);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }

        List<ProductImage> productImages = new ArrayList<>();

        for (MultipartFile file : images) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File destination = new File(uploadDirectory, fileName);
            file.transferTo(destination);

            ProductImage image = new ProductImage();
            image.setImageUrl("/uploads/" + fileName);
            image.setProduct(product);

            productImages.add(image);
        }

        productImageRepository.saveAll(productImages);
        product.setImages(productImages);

        return new ProductDTO(product);
    }

    /* ================= READ ================= */

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    /* ================= SEARCH & FILTER ================= */

    public List<ProductDTO> searchProducts(String search, String category, String address) {
        List<Product> products = productRepository.findAll();

        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            products = products.stream()
                    .filter(p -> p.getTitle().toLowerCase().contains(searchLower) ||
                            p.getDescription().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }

        if (category != null && !category.trim().isEmpty()) {
            products = products.stream()
                    .filter(p -> p.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        if (address != null && !address.trim().isEmpty()) {
            String addressLower = address.toLowerCase();
            products = products.stream()
                    .filter(p -> p.getAddress().toLowerCase().contains(addressLower))
                    .collect(Collectors.toList());
        }

        return products.stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    public ProductDTO getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return new ProductDTO(product);
    }

    /* ================= UPDATE ================= */

    public ProductDTO updateProductWithImages(
            Long productId,
            String title,
            String description,
            Double price,
            String address,
            String category,
            List<Long> existingImages,
            MultipartFile[] images,
            User user
    ) throws IOException {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to edit this product");
        }

        product.setTitle(title);
        product.setDescription(description);
        product.setPrice(price);
        product.setAddress(address);
        product.setCategory(category);

        List<ProductImage> imagesToDelete = product.getImages()
                .stream()
                .filter(img -> existingImages == null || !existingImages.contains(img.getId()))
                .toList();

        for (ProductImage img : imagesToDelete) {
            String fileName = img.getImageUrl().replace("/uploads/", "");
            File file = new File(UPLOAD_DIR + "/" + fileName);
            if (file.exists()) file.delete();
            productImageRepository.delete(img);
            product.getImages().remove(img);
        }

        if (images != null && images.length > 0) {
            File uploadDirectory = new File(UPLOAD_DIR);
            if (!uploadDirectory.exists()) uploadDirectory.mkdirs();

            List<ProductImage> newImagesList = new ArrayList<>();
            for (MultipartFile file : images) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                File destination = new File(uploadDirectory, fileName);
                file.transferTo(destination);

                ProductImage newImage = new ProductImage();
                newImage.setImageUrl("/uploads/" + fileName);
                newImage.setProduct(product);
                newImagesList.add(newImage);
            }

            productImageRepository.saveAll(newImagesList);
            product.getImages().addAll(newImagesList);
        }

        productRepository.save(product);
        return new ProductDTO(product);
    }

    /* ================= DELETE ================= */

    @Transactional
    public void deleteProduct(Long id, User user) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        favoriteRepository.deleteAllByProductId(id);

        for (ProductImage img : product.getImages()) {
            String fileName = img.getImageUrl().replace("/uploads/", "");
            File file = new File(UPLOAD_DIR + "/" + fileName);
            if (file.exists()) {
                file.delete();
            }
        }

        productImageRepository.deleteAll(product.getImages());

        productRepository.delete(product);
    }

    /* ================= MY PRODUCTS ================= */

    public List<ProductDTO> getMyProducts(User user) {
        return productRepository.findBySeller(user)
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    /* ================= DELETE IMAGE ================= */

    public void deleteImage(Long imageId, User user) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        Product product = image.getProduct();

        if (!product.getSeller().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to delete this image");
        }

        String fileName = image.getImageUrl().replace("/uploads/", "");
        File file = new File(UPLOAD_DIR + "/" + fileName);
        if (file.exists()) {
            file.delete();
        }

        productImageRepository.delete(image);
    }
}