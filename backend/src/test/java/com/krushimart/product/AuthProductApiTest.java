package com.krushimart.product;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthProductApiTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registrationAuthenticationAuthorizationAndSearchWork() throws Exception {
        String farmerToken = register("API Farmer", "9111111111", "FARMER");

        String productJson = """
                {
                  "title": "UniqueRadishSeed Pack",
                  "description": "Fresh radish seed pack for the winter season.",
                  "category": "SEEDS",
                  "price": 120,
                  "quantityAvailable": 10,
                  "unit": "KG",
                  "listingStatus": "ACTIVE",
                  "language": "en",
                  "region": "Pune"
                }
                """;

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.sellerId").isNumber());

        mockMvc.perform(get("/api/products")
                        .param("q", "UniqueRadishSeed")
                        .param("available", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].title").value("UniqueRadishSeed Pack"));

        String customerToken = register("API Customer", "9111111112", "CUSTOMER");
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));

        mockMvc.perform(get("/api/products")
                        .param("q", "no-such-product-xyz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    private String register(String name, String phone, String role) throws Exception {
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "fullName", name,
                "phone", phone,
                "password", "password",
                "role", role,
                "region", "Pune",
                "preferredCategories", role.equals("FARMER")
                        ? java.util.List.of("SEEDS") : java.util.List.of()
        ));
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("token").asText();
    }
}
