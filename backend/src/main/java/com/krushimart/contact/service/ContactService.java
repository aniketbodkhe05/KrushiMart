package com.krushimart.contact.service;

import com.krushimart.contact.dto.ContactCard;
import com.krushimart.product.entity.Product;
import com.krushimart.product.service.ProductService;
import com.krushimart.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {

    private final ProductService productService;

    public ContactService(ProductService productService) {
        this.productService = productService;
    }

    @Transactional(readOnly = true)
    public ContactCard forProduct(Long productId) {
        Product product = productService.requireProduct(productId);
        User seller = product.getSeller();
        boolean visible = product.isAvailable() && seller.isContactVisible();
        return new ContactCard(
                product.getId(),
                seller.getId(),
                seller.getFullName(),
                visible ? seller.getPhone() : null,
                seller.getRegion(),
                visible,
                visible
                        ? "The seller has opted in to share this phone number for inquiries about this listing. "
                          + "Use it only for this product and do not redistribute it."
                        : "The seller has not made contact details visible for this listing, or the listing is no longer available."
        );
    }
}
