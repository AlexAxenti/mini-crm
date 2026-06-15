package com.alexaxenti.events_service_springboot.events.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

public record CreateEventRequest(
        @NotBlank String type,
        @NotBlank String entityType,
        @NotBlank String entityId,
        Map<String, Object> meta
) {
}
