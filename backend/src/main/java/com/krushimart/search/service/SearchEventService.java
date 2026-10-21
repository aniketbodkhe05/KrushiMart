package com.krushimart.search.service;

import com.krushimart.product.service.ProductService;
import com.krushimart.search.dto.SearchEventRequest;
import com.krushimart.search.dto.SearchEventResponse;
import com.krushimart.search.entity.SearchEvent;
import com.krushimart.search.repository.SearchEventRepository;
import com.krushimart.security.CurrentUserService;
import com.krushimart.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class SearchEventService {

    private final SearchEventRepository searchEventRepository;
    private final ProductService productService;
    private final CurrentUserService currentUserService;

    public SearchEventService(SearchEventRepository searchEventRepository,
                              ProductService productService,
                              CurrentUserService currentUserService) {
        this.searchEventRepository = searchEventRepository;
        this.productService = productService;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public SearchEventResponse record(SearchEventRequest request) {
        long matches = productService.countAvailable(request.query(), request.category(), request.region());
        User user = currentUserService.currentUserOrNull();

        SearchEvent event = new SearchEvent();
        event.setUser(user);
        event.setQuery(request.query().trim());
        event.setCategory(request.category());
        event.setRegion(request.region() == null || request.region().isBlank()
                ? null : request.region().trim());
        event.setLanguage(request.language() == null ? "en" : request.language());
        event.setMatched(matches > 0);
        event.setResultCount((int) matches);
        event.setCreatedAt(Instant.now());
        searchEventRepository.save(event);

        String message = matches > 0
                ? "Matching listings are available"
                : "No matching listing is available right now. You can submit a request so farmers can respond.";
        return new SearchEventResponse(event.getId(), event.isMatched(), event.getResultCount(), message);
    }
}
