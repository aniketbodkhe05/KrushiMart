package com.krushimart.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.krushimart.notification.entity.Notification;
import com.krushimart.notification.entity.NotificationType;
import com.krushimart.notification.repository.NotificationRepository;
import com.krushimart.user.entity.User;
import com.krushimart.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ApiErrorHandlingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    void protectedRoutesRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").isNotEmpty());

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void invalidTokensAreTreatedAsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void invalidRegistrationReturnsFieldDetails() throws Exception {
        String body = """
                {
                  "fullName": "A",
                  "phone": "12345",
                  "password": "short",
                  "role": "FARMER",
                  "region": "",
                  "preferredCategories": ["SEEDS"]
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details[?(@.field == 'phone')]").exists())
                .andExpect(jsonPath("$.details[?(@.field == 'password')]").exists());
    }

    @Test
    void nullPreferredCategoryElementsAreRejected() throws Exception {
        ObjectNode body = objectMapper.createObjectNode()
                .put("fullName", "Null Category User")
                .put("phone", "9222200001")
                .put("password", "password123")
                .put("role", "FARMER")
                .put("region", "Pune");
        ArrayNode categories = body.putArray("preferredCategories");
        categories.addNull();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void duplicatePhoneReturnsConflict() throws Exception {
        register("Duplicate User", "9222200002", "FARMER", "Pune", List.of("SEEDS"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload("Duplicate User", "9222200002", "FARMER", "Pune", List.of())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    void invalidCredentialsReturnUnauthorized() throws Exception {
        register("Login User", "9222200003", "FARMER", "Pune", List.of("SEEDS"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"phone": "9222200003", "password": "wrong-password"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"phone": "9222299999", "password": "password123"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void roleAndOwnershipAreEnforced() throws Exception {
        Session owner = register("Owner Farmer", "9222200004", "FARMER", "Pune", List.of("MACHINERY"));
        Session otherFarmer = register("Other Farmer", "9222200005", "FARMER", "Pune", List.of("MACHINERY"));
        Session customer = register("Market Customer", "9222200006", "CUSTOMER", "Pune", List.of());

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + customer.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Customer Listing").toString()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        MvcResult created = mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + owner.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Owner Listing").toString()))
                .andExpect(status().isCreated())
                .andReturn();
        long productId = objectMapper.readTree(created.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(put("/api/products/{id}", productId)
                        .header("Authorization", "Bearer " + otherFarmer.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Stolen Listing").toString()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(put("/api/products/{id}", productId)
                        .header("Authorization", "Bearer " + owner.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload("Updated Owner Listing").toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Owner Listing"));
    }

    @Test
    void missingResourcesReturnNotFound() throws Exception {
        Session customer = register("Missing Customer", "9222200007", "CUSTOMER", "Pune", List.of());

        mockMvc.perform(get("/api/products/{id}", 999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        mockMvc.perform(get("/api/requests/{id}", 999999)
                        .header("Authorization", "Bearer " + customer.token()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        mockMvc.perform(get("/api/does-not-exist")
                        .header("Authorization", "Bearer " + customer.token()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void malformedAndInvalidInputReturnBadRequest() throws Exception {
        Session farmer = register("Validation Farmer", "9222200008", "FARMER", "Pune", List.of("SEEDS"));

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + farmer.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));

        ObjectNode invalidEnum = productPayload("Invalid Enum Listing");
        invalidEnum.put("category", "NOT_A_CATEGORY");
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + farmer.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidEnum.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));

        ObjectNode excessivePrice = productPayload("Excessive Price Listing");
        excessivePrice.put("price", 10000000000.00);
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + farmer.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(excessivePrice.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        mockMvc.perform(get("/api/products").param("category", "NOT_A_CATEGORY"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));

        mockMvc.perform(get("/api/products/not-a-number"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    void requestWorkflowAndNotificationOwnershipAreEnforced() throws Exception {
        Session customer = register("Request Customer", "9222200009", "CUSTOMER", "Nashik", List.of());
        Session otherCustomer = register("Other Customer", "9222200010", "CUSTOMER", "Nashik", List.of());
        Session farmer = register("Nashik Farmer", "9222200011", "FARMER", "Nashik", List.of("MACHINERY"));

        MvcResult created = mockMvc.perform(post("/api/requests")
                        .header("Authorization", "Bearer " + customer.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Need a mini tiller",
                                  "description": "Looking for a mini tiller in working condition.",
                                  "category": "MACHINERY",
                                  "region": "Nashik",
                                  "quantity": 1,
                                  "unit": "PIECE",
                                  "language": "en"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        long requestId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/requests/mine")
                        .header("Authorization", "Bearer " + customer.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(requestId));

        mockMvc.perform(get("/api/requests/{id}", requestId)
                        .header("Authorization", "Bearer " + customer.token()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/requests/{id}", requestId)
                        .header("Authorization", "Bearer " + otherCustomer.token()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/api/requests/{id}", requestId)
                        .header("Authorization", "Bearer " + farmer.token()))
                .andExpect(status().isOk());

        User otherUser = userRepository.findById(otherCustomer.userId()).orElseThrow();
        Notification notification = new Notification();
        notification.setUser(otherUser);
        notification.setType(NotificationType.SYSTEM);
        notification.setTitle("Account notice");
        notification.setMessage("This belongs to the other customer only.");
        notification.setCreatedAt(Instant.now());
        Notification saved = notificationRepository.save(notification);

        mockMvc.perform(patch("/api/notifications/{id}/read", saved.getId())
                        .header("Authorization", "Bearer " + customer.token()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        mockMvc.perform(patch("/api/notifications/{id}/read", saved.getId())
                        .header("Authorization", "Bearer " + otherCustomer.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));
    }

    private Session register(String name, String phone, String role, String region,
                             List<String> categories) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload(name, phone, role, region, categories)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.get("token").asText()).isNotBlank();
        return new Session(body.get("token").asText(), body.get("user").get("id").asLong());
    }

    private String registerPayload(String name, String phone, String role, String region,
                                   List<String> categories) throws Exception {
        ObjectNode body = objectMapper.createObjectNode()
                .put("fullName", name)
                .put("phone", phone)
                .put("password", "password123")
                .put("role", role)
                .put("region", region)
                .put("notifyOptIn", true);
        ArrayNode values = body.putArray("preferredCategories");
        categories.forEach(values::add);
        return objectMapper.writeValueAsString(body);
    }

    private ObjectNode productPayload(String title) {
        return objectMapper.createObjectNode()
                .put("title", title)
                .put("description", "A useful agricultural listing in good working condition.")
                .put("category", "MACHINERY")
                .put("price", 45000.00)
                .put("quantityAvailable", 1)
                .put("unit", "PIECE")
                .put("listingStatus", "ACTIVE")
                .put("language", "en")
                .put("region", "Pune");
    }

    private record Session(String token, long userId) {
    }
}
