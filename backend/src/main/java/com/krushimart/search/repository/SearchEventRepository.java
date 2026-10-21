package com.krushimart.search.repository;

import com.krushimart.search.entity.SearchEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface SearchEventRepository extends JpaRepository<SearchEvent, Long> {

    List<SearchEvent> findByCreatedAtAfter(Instant after);
}
