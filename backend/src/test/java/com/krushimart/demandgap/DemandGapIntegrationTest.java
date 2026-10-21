package com.krushimart.demandgap;

import com.krushimart.demandgap.entity.DemandOpportunity;
import com.krushimart.demandgap.repository.DemandOpportunityRepository;
import com.krushimart.demandgap.service.DemandGapService;
import com.krushimart.notification.entity.Notification;
import com.krushimart.notification.entity.NotificationType;
import com.krushimart.notification.repository.NotificationRepository;
import com.krushimart.product.dto.ProductWriteRequest;
import com.krushimart.product.entity.ListingStatus;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.product.entity.ProductUnit;
import com.krushimart.product.service.ProductService;
import com.krushimart.request.entity.ProductRequest;
import com.krushimart.request.entity.RequestStatus;
import com.krushimart.request.repository.ProductRequestRepository;
import com.krushimart.search.entity.SearchEvent;
import com.krushimart.search.repository.SearchEventRepository;
import com.krushimart.user.entity.User;
import com.krushimart.user.entity.UserRole;
import com.krushimart.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DemandGapIntegrationTest {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRequestRepository requestRepository;
    @Autowired
    private SearchEventRepository searchEventRepository;
    @Autowired
    private DemandOpportunityRepository opportunityRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private DemandGapService demandGapService;
    @Autowired
    private ProductService productService;

    @Test
    void duplicatesAreSuppressedAndQualifiedDemandNotifiesEligibleFarmers() {
        User farmer = saveUser("Demand Farmer", "9111100001", UserRole.FARMER, "Nashik", "MACHINERY");
        User customerOne = saveUser("Demand Customer One", "9111100002", UserRole.CUSTOMER, "Nashik", null);
        User customerTwo = saveUser("Demand Customer Two", "9111100003", UserRole.CUSTOMER, "Nashik", null);
        User customerThree = saveUser("Demand Customer Three", "9111100004", UserRole.CUSTOMER, "Nashik", null);

        saveRequest(customerOne, "Mini tiller needed", "MACHINERY");
        saveRequest(customerTwo, "Power tiller needed", "MACHINERY");
        saveRequest(customerThree, "Mini tiller wanted", "MACHINERY");

        saveSearch(customerOne, "mini tiller");
        saveSearch(customerOne, "mini tiller");
        saveSearch(customerTwo, "power tiller");

        demandGapService.refreshAndNotify();

        DemandOpportunity opportunity = opportunityRepository
                .findByCategoryAndRegionIgnoreCase(ProductCategory.MACHINERY, "Nashik")
                .orElseThrow();
        assertThat(opportunity.getDistinctRequesters()).isEqualTo(3);
        assertThat(opportunity.getUnmatchedSearches()).isEqualTo(2);
        assertThat(opportunity.getScore().doubleValue()).isGreaterThanOrEqualTo(30);

        List<Notification> farmerNotifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(farmer.getId());
        assertThat(farmerNotifications)
                .anyMatch(notification -> notification.getType() == NotificationType.DEMAND_OPPORTUNITY);

        ProductWriteRequest productRequest = new ProductWriteRequest(
                "Mini Tiller 7HP",
                "A second-hand mini tiller available for inspection in Nashik.",
                ProductCategory.MACHINERY,
                BigDecimal.valueOf(42000),
                BigDecimal.ONE,
                ProductUnit.PIECE,
                ListingStatus.ACTIVE,
                "en",
                "Nashik",
                null
        );
        productService.create(farmer, productRequest);

        List<Notification> requesterNotifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(customerOne.getId());
        assertThat(requesterNotifications)
                .anyMatch(notification -> notification.getType() == NotificationType.REQUEST_MATCH
                        && notification.getRelatedProductId() != null);
    }

    private User saveUser(String name, String phone, UserRole role, String region, String categories) {
        User user = new User();
        user.setFullName(name);
        user.setPhone(phone);
        user.setPasswordHash("$2b$10$W1lZEQKoFh6GlvDRTRu5Lev47oGLyAcJTqv0jzGeBD8Lik29eZj7S");
        user.setRole(role);
        user.setRegion(region);
        user.setPreferredCategories(categories);
        user.setNotifyOptIn(true);
        user.setContactVisible(true);
        user.setCreatedAt(Instant.now());
        return userRepository.save(user);
    }

    private void saveRequest(User requester, String title, String category) {
        ProductRequest request = new ProductRequest();
        request.setRequester(requester);
        request.setTitle(title);
        request.setDescription("A realistic request used to test deterministic demand scoring.");
        request.setCategory(ProductCategory.valueOf(category));
        request.setRegion("Nashik");
        request.setQuantity(BigDecimal.ONE);
        request.setUnit(ProductUnit.PIECE);
        request.setLanguage("en");
        request.setStatus(RequestStatus.OPEN);
        request.setCreatedAt(Instant.now().minusSeconds(3600));
        request.setUpdatedAt(Instant.now().minusSeconds(3600));
        requestRepository.save(request);
    }

    private void saveSearch(User user, String query) {
        SearchEvent event = new SearchEvent();
        event.setUser(user);
        event.setQuery(query);
        event.setCategory(ProductCategory.MACHINERY);
        event.setRegion("Nashik");
        event.setLanguage("en");
        event.setMatched(false);
        event.setResultCount(0);
        event.setCreatedAt(Instant.now().minusSeconds(1800));
        searchEventRepository.save(event);
    }
}
