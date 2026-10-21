package com.krushimart.demandgap.scoring;

import java.math.BigDecimal;

public record DemandScoreResult(
        BigDecimal score,
        BigDecimal threshold,
        boolean qualified,
        String reason,
        int requestPoints,
        int requesterPoints,
        int searchPoints,
        int recencyBonus,
        int supplyPenalty
) {
}
