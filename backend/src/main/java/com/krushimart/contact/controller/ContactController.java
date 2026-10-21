package com.krushimart.contact.controller;

import com.krushimart.contact.dto.ContactCard;
import com.krushimart.contact.service.ContactService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping("/seller/{productId}")
    public ContactCard sellerContact(@PathVariable Long productId) {
        return contactService.forProduct(productId);
    }
}
