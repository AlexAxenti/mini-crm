package com.alexaxenti.events_service_springboot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "events")
public record EventsProperties(
        String apiKey,
        String commKey,
        String supabaseUrl
) {
    public String normalizedSupabaseUrl() {
        if (supabaseUrl == null || supabaseUrl.isBlank()) {
            throw new IllegalStateException("SUPABASE_URL is not configured");
        }

        return supabaseUrl.replaceAll("/$", "");
    }
}
