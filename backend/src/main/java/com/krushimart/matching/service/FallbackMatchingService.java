package com.krushimart.matching.service;

import com.krushimart.matching.dto.MatchCandidate;
import com.krushimart.matching.dto.MatchRequest;
import com.krushimart.matching.dto.MatchResponse;
import com.krushimart.matching.dto.MatchResult;
import com.krushimart.matching.dto.NormalizeResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Deterministic matching used when the optional Python AI service is unavailable.
 * It normalizes common English/Hindi/Marathi agricultural terms and scores token overlap.
 */
@Service
public class FallbackMatchingService {

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "and", "are", "for", "from", "in", "is", "of", "on", "or", "the", "to", "with");

    private static final Map<String, String> SYNONYMS = new LinkedHashMap<>();

    static {
        SYNONYMS.put("tillar", "tiller");
        SYNONYMS.put("tillers", "tiller");
        SYNONYMS.put("rotary tiller", "tiller");
        SYNONYMS.put("power tiller", "tiller");
        SYNONYMS.put("paddy", "rice");
        SYNONYMS.put("khad", "fertilizer");
        SYNONYMS.put("khaad", "fertilizer");
        SYNONYMS.put("khadha", "fertilizer");
        SYNONYMS.put("beej", "seed");
        SYNONYMS.put("biyane", "seed");
        SYNONYMS.put("drip pipe", "irrigation pipe");
        SYNONYMS.put("farm pump", "irrigation pump");
        SYNONYMS.put("spray", "sprayer");
        SYNONYMS.put("kheti", "farming");
        SYNONYMS.put("krushi", "agriculture");
    }

    private static final Map<String, String> PHRASES = new LinkedHashMap<>();

    static {
        PHRASES.put("ठिबक सिंचन जोड", "drip irrigation connector");
        PHRASES.put("ठिबक सिंचन", "drip irrigation");
        PHRASES.put("मिनी टिलर", "mini tiller");
        PHRASES.put("पॉवर टिलर", "tiller");
        PHRASES.put("जैविक खाद", "organic fertilizer");
        PHRASES.put("सेंद्रिय खत", "organic fertilizer");
        PHRASES.put("ठिबक", "drip");
        PHRASES.put("सिंचन", "irrigation");
        PHRASES.put("जोड", "connector");
        PHRASES.put("जोडणी", "connector");
        PHRASES.put("खाद", "fertilizer");
        PHRASES.put("खत", "fertilizer");
        PHRASES.put("बियाणे", "seed");
        PHRASES.put("फवारणी", "sprayer");
        PHRASES.put("ट्रॅक्टर", "tractor");
        PHRASES.put("पंप", "pump");
        PHRASES.put("नांगर", "plough");
        PHRASES.put("कुदळ", "hoe");
        PHRASES.put("मशागत", "tillage");
        PHRASES.put("मिनी टिलर", "mini tiller");
        PHRASES.put("मिनी", "mini");
        PHRASES.put("टिलर", "tiller");
    }

    public NormalizeResponse normalize(String text) {
        String lower = text == null ? "" : text.trim().toLowerCase(Locale.ROOT);
        String language = guessLanguage(text);
        for (Map.Entry<String, String> phrase : PHRASES.entrySet()) {
            lower = lower.replace(phrase.getKey(), " " + phrase.getValue() + " ");
        }
        List<String> rawTokens = List.of(lower.split("[^\\p{L}\\p{N}]+"));
        LinkedHashSet<String> tokens = new LinkedHashSet<>();
        for (String raw : rawTokens) {
            String token = normalizeToken(raw);
            if (!token.isBlank() && !STOP_WORDS.contains(token)) {
                tokens.add(token);
            }
        }
        return new NormalizeResponse(
                text,
                String.join(" ", tokens),
                new ArrayList<>(tokens),
                language,
                "fallback"
        );
    }

    public MatchResponse match(MatchRequest request) {
        NormalizeResponse normalized = normalize(request.query());
        Set<String> queryTokens = new LinkedHashSet<>(normalized.tokens());
        double threshold = request.threshold() == null ? 0.60 : request.threshold();

        List<MatchResult> results = new ArrayList<>();
        for (MatchCandidate candidate : request.candidates()) {
            String candidateText = candidate.title()
                    + " " + (candidate.category() == null ? "" : candidate.category().name())
                    + " " + (candidate.description() == null ? "" : candidate.description());
            List<String> candidateTokens = normalize(candidateText).tokens();
            Set<String> candidateSet = new LinkedHashSet<>(candidateTokens);

            long overlap = queryTokens.stream().filter(candidateSet::contains).count();
            double queryCoverage = queryTokens.isEmpty() ? 0 : (double) overlap / queryTokens.size();
            double candidateCoverage = candidateSet.isEmpty() ? 0 : (double) overlap / candidateSet.size();
            double confidence = round(Math.min(1.0, queryCoverage * 0.75 + candidateCoverage * 0.25));

            boolean match = confidence >= threshold;
            String equivalence = match
                    ? "EQUIVALENT"
                    : confidence >= 0.35 ? "SIMILAR_NOT_EQUIVALENT" : "UNRELATED";
            String reason = match
                    ? "Query terms overlap strongly with the listing title/category (deterministic fallback)."
                    : confidence >= 0.35
                    ? "Some terms are related, but the listing does not look equivalent."
                    : "No meaningful product-term overlap was found.";

            results.add(new MatchResult(candidate.productId(), match, confidence, reason, equivalence));
        }
        results.sort(Comparator.comparingDouble(MatchResult::confidence).reversed());
        return new MatchResponse(normalized.normalized(), results, "fallback");
    }

    private String normalizeToken(String raw) {
        String token = raw == null ? "" : raw.trim();
        if (token.isBlank()) {
            return "";
        }
        String synonym = SYNONYMS.get(token);
        if (synonym != null) {
            token = synonym;
        }
        if (token.length() > 4 && token.endsWith("es")) {
            token = token.substring(0, token.length() - 2);
        } else if (token.length() > 3 && token.endsWith("s")) {
            token = token.substring(0, token.length() - 1);
        }
        return token;
    }

    private String guessLanguage(String text) {
        if (text == null) {
            return "en";
        }
        if (text.matches(".*[\\u0900-\\u097F].*")) {
            return text.matches(".*(ठिबक|सिंचन|बियाणे|खत|फवारणी|ट्रॅक्टर|कुदळ).*") ? "mr" : "hi";
        }
        return "en";
    }

    private double round(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }
}
