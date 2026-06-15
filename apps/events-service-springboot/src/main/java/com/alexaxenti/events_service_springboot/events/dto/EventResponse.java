package com.alexaxenti.events_service_springboot.events.dto;

import java.time.Instant;
import java.util.Map;

public record EventResponse(
        String id,
        String userId,
        String type,
        String entityType,
        String entityId,
        Instant createdAt,
        Map<String, Object> meta
) {
}
