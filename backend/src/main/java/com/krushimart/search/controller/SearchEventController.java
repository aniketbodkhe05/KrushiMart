package com.krushimart.search.controller;

import com.krushimart.search.dto.SearchEventRequest;
import com.krushimart.search.dto.SearchEventResponse;
import com.krushimart.search.service.SearchEventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search-events")
public class SearchEventController {

    private final SearchEventService searchEventService;

    public SearchEventController(SearchEventService searchEventService) {
        this.searchEventService = searchEventService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SearchEventResponse record(@Valid @RequestBody SearchEventRequest request) {
        return searchEventService.record(request);
    }
}
