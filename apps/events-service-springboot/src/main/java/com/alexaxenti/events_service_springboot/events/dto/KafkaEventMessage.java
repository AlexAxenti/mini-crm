package com.alexaxenti.events_service_springboot.events.dto;

import java.util.Map;

public record KafkaEventMessage(
        String type,
        String entityType,
        String entityId,
        String userId,
        Map<String, Object> meta
) {
}
