package com.alexaxenti.events_service_springboot.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {
    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public Map<String, Object> getHealth() {
        Map<String, Object> response = new LinkedHashMap<>();

        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            response.put("status", "healthy");
            response.put("service", "events-service");
            response.put("timestamp", Instant.now().toString());
            response.put("database", "connected");
        } catch (Exception exception) {
            response.put("status", "unhealthy");
            response.put("service", "events-service");
            response.put("timestamp", Instant.now().toString());
            response.put("database", "disconnected");
            response.put("error", "Internal server error");
        }

        return response;
    }
}
