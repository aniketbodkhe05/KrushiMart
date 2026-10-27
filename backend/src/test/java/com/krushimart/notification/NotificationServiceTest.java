package com.krushimart.notification;

import com.krushimart.demandgap.entity.DemandOpportunity;
import com.krushimart.notification.entity.Notification;
import com.krushimart.notification.repository.NotificationRepository;
import com.krushimart.notification.service.NotificationService;
import com.krushimart.product.entity.Product;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.request.entity.ProductRequest;
import com.krushimart.request.repository.ProductRequestRepository;
import com.krushimart.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ProductRequestRepository requestRepository;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository, requestRepository);
    }

    @Test
    void requestMatchContentFitsDatabaseColumnLimits() {
        User seller = user(1L, "S".repeat(120));
        User requester = user(2L, "Requester");
        String longTitle = "Q".repeat(180);
        Product product = product(10L, longTitle, seller);
        ProductRequest request = request(20L, requester, longTitle);

        given(requestRepository.findByStatusAndCategoryAndRegionIgnoreCase(any(), any(), any()))
                .willReturn(List.of(request));
        given(notificationRepository.existsByUserIdAndTypeAndRelatedProductIdAndRelatedRequestId(
                        anyLong(), any(), anyLong(), anyLong()))
                .willReturn(false);

        notificationService.notifyMatchingRequesters(product);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());
        Notification notification = captor.getValue();
        assertThat(notification.getTitle().length()).isLessThanOrEqualTo(160);
        assertThat(notification.getMessage().length()).isLessThanOrEqualTo(500);
        assertThat(notification.getMessage()).endsWith("...");
    }

    @Test
    void demandOpportunityContentFitsDatabaseColumnLimits() {
        User farmer = user(3L, "Farmer");
        DemandOpportunity opportunity = new DemandOpportunity();
        opportunity.setId(30L);
        opportunity.setRegion("R".repeat(80));
        opportunity.setCategory(ProductCategory.SEEDS);
        opportunity.setScore(BigDecimal.valueOf(55).setScale(2));
        opportunity.setReason("X".repeat(500));

        given(notificationRepository.existsByUserIdAndTypeAndRelatedOpportunityId(
                        anyLong(), any(), anyLong()))
                .willReturn(false);

        notificationService.notifyDemandOpportunity(farmer, opportunity, 0);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());
        Notification notification = captor.getValue();
        assertThat(notification.getTitle().length()).isLessThanOrEqualTo(160);
        assertThat(notification.getMessage().length()).isLessThanOrEqualTo(500);
        assertThat(notification.getMessage()).endsWith("...");
    }

    private Product product(Long id, String title, User seller) {
        Product product = new Product();
        product.setId(id);
        product.setTitle(title);
        product.setSeller(seller);
        product.setRegion("Nashik");
        product.setCategory(ProductCategory.MACHINERY);
        return product;
    }

    private ProductRequest request(Long id, User requester, String title) {
        ProductRequest request = new ProductRequest();
        request.setId(id);
        request.setRequester(requester);
        request.setTitle(title);
        return request;
    }

    private User user(Long id, String fullName) {
        User user = new User();
        user.setId(id);
        user.setFullName(fullName);
        return user;
    }
}