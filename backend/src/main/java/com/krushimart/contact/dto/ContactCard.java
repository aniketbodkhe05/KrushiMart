package com.krushimart.contact.dto;

public record ContactCard(
        Long productId,
        Long sellerId,
        String sellerName,
        String phone,
        String region,
        boolean contactVisible,
        String consentNote
) {
}
