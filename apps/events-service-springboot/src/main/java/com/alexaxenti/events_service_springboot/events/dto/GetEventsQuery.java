package com.alexaxenti.events_service_springboot.events.dto;

import jakarta.validation.constraints.Pattern;

public record GetEventsQuery(
        String type,
        String entityType,
        String entityId,
        @Pattern(regexp = "asc|desc", message = "order must be either asc or desc")
        String order
) {
    public String sortDirection() {
        return order == null ? "desc" : order;
    }
}
