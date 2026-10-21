package com.krushimart.matching.client;

import com.krushimart.matching.dto.AiHealthResponse;
import com.krushimart.matching.dto.MatchRequest;
import com.krushimart.matching.dto.MatchResponse;
import com.krushimart.matching.dto.NormalizeRequest;
import com.krushimart.matching.dto.NormalizeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class AiClient {

    private final RestClient restClient;
    private final boolean enabled;

    public AiClient(@Value("${app.ai.base-url:http://localhost:8000}") String baseUrl,
                    @Value("${app.ai.enabled:true}") boolean enabled) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(1500);
        factory.setReadTimeout(4000);
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public AiHealthResponse health() {
        if (!enabled) {
            throw new RestClientException("AI service is disabled by configuration");
        }
        return restClient.get().uri("/health").retrieve().body(AiHealthResponse.class);
    }

    public NormalizeResponse normalize(NormalizeRequest request) {
        if (!enabled) {
            throw new RestClientException("AI service is disabled by configuration");
        }
        return restClient.post().uri("/normalize").body(request).retrieve().body(NormalizeResponse.class);
    }

    public MatchResponse match(MatchRequest request) {
        if (!enabled) {
            throw new RestClientException("AI service is disabled by configuration");
        }
        return restClient.post().uri("/match").body(request).retrieve().body(MatchResponse.class);
    }
}
