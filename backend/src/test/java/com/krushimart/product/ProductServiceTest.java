package com.krushimart.product;

import com.krushimart.common.exception.ForbiddenException;
import com.krushimart.notification.service.NotificationService;
import com.krushimart.product.dto.ProductResponse;
import com.krushimart.product.dto.ProductWriteRequest;
import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.Product;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.entity.ProductUnit;
import com.krushimart.product.mapper.ProductMapper;
import com.krushimart.product.repository.ProductRepository;
import com.krushimart.product.service.ProductService;
import com.krushimart.user.entity.User;
import com.krushimart.user.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private NotificationService notificationService;

    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository, new ProductMapper(), notificationService);
    }

    @Test
    void customerCannotCreateListing() {
        User customer = user(3L, UserRole.CUSTOMER);

        assertThatThrownBy(() -> productService.create(customer, request()))
                .isInstanceOf(ForbiddenException.class);

        verify(productRepository, never()).save(any());
    }

    @Test
    void farmerCreatesAvailableListingAndMatchingRequestsAreNotified() {
        User farmer = user(1L, UserRole.FARMER);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(99L);
            return product;
        });

        ProductResponse response = productService.create(farmer, request());

        assertThat(response.id()).isEqualTo(99L);
        assertThat(response.available()).isTrue();
        assertThat(response.sellerId()).isEqualTo(1L);
        verify(notificationService).notifyMatchingRequesters(any(Product.class));
    }

    @Test
    void nonOwnerCannotUpdateListing() {
        User owner = user(1L, UserRole.FARMER);
        User otherFarmer = user(2L, UserRole.FARMER);
        Product product = new Product();
        product.setId(5L);
        product.setSeller(owner);
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.update(5L, otherFarmer, request()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void listingWithoutStockIsNotAvailable() {
        User farmer = user(1L, UserRole.FARMER);
        ProductWriteRequest request = new ProductWriteRequest(
                "Drip connector", "A useful connector for drip irrigation systems.",
                ProductCategory.IRRIGATION, BigDecimal.TEN, BigDecimal.ZERO,
                ProductUnit.PIECE, ListingStatus.ACTIVE, "en", "Nashik", null);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(100L);
            return product;
        });

        ProductResponse response = productService.create(farmer, request);

        assertThat(response.available()).isFalse();
        verify(notificationService, never()).notifyMatchingRequesters(any(Product.class));
    }

    private ProductWriteRequest request() {
        return new ProductWriteRequest(
                "Mini Tiller 7HP",
                "A well-maintained mini tiller suitable for small plots.",
                ProductCategory.MACHINERY,
                BigDecimal.valueOf(45000),
                BigDecimal.ONE,
                ProductUnit.PIECE,
                ListingStatus.ACTIVE,
                "en",
                "Nashik",
                null
        );
    }

    private User user(Long id, UserRole role) {
        User user = new User();
        user.setId(id);
        user.setFullName("Test " + role);
        user.setPhone("99999999" + id);
        user.setRole(role);
        user.setRegion("Nashik");
        return user;
    }
}
