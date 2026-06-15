package com.alexaxenti.events_service_springboot.security;

import com.alexaxenti.events_service_springboot.config.EventsProperties;
import com.nimbusds.jose.proc.JWSAlgorithmFamilyJWSKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.BadJWTException;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.time.Instant;
import java.util.Set;

@Component
public class EventsAuthFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(EventsAuthFilter.class);

    private final EventsProperties properties;
    private final ConfigurableJWTProcessor<SecurityContext> jwtProcessor;

    public EventsAuthFilter(EventsProperties properties) {
        this.properties = properties;
        this.jwtProcessor = createJwtProcessor(properties);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/events");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String apiKey = request.getHeader("x-api-key");
        if (apiKey == null || !apiKey.equals(properties.apiKey())) {
            LOGGER.warn("Unauthorized events request: invalid or missing x-api-key");
            unauthorized(request, response, "Access Unauthorized");
            return;
        }

        String token = request.getHeader("x-supabase-token");
        if (token == null || token.isBlank()) {
            LOGGER.warn("Unauthorized events request: missing x-supabase-token");
            unauthorized(request, response, "Supabase token is required");
            return;
        }

        if (HttpMethod.POST.matches(request.getMethod())) {
            String commKey = request.getHeader("x-comm-key");
            if (commKey == null || commKey.isBlank()) {
                LOGGER.warn("Unauthorized events request: missing x-comm-key");
                unauthorized(request, response, "Communication key required");
                return;
            }
            if (!commKey.equals(properties.commKey())) {
                LOGGER.warn("Unauthorized events request: invalid x-comm-key");
                unauthorized(request, response, "Invalid communication key");
                return;
            }
        }

        try {
            JWTClaimsSet claims = jwtProcessor.process(token, null);
            String userId = claims.getSubject();
            if (userId == null || userId.isBlank()) {
                LOGGER.warn("Unauthorized events request: token missing subject");
                unauthorized(request, response, "Invalid token: missing user ID");
                return;
            }

            request.setAttribute(AuthorizedUser.REQUEST_ATTRIBUTE, userId);
            filterChain.doFilter(request, response);
        } catch (BadJWTException exception) {
            String message = exception.getMessage() != null && exception.getMessage().toLowerCase().contains("expired")
                    ? "Token expired"
                    : "Invalid token";
            LOGGER.warn("Unauthorized events request: {}", message);
            unauthorized(request, response, message);
        } catch (Exception exception) {
            LOGGER.warn(
                    "Unauthorized events request: authentication failed: {}: {}",
                    exception.getClass().getSimpleName(),
                    exception.getMessage()
            );
            unauthorized(request, response, "Authentication failed");
        }
    }

    private static ConfigurableJWTProcessor<SecurityContext> createJwtProcessor(EventsProperties properties) {
        try {
            String supabaseUrl = properties.normalizedSupabaseUrl();
            DefaultJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
            processor.setJWSKeySelector(JWSAlgorithmFamilyJWSKeySelector.fromJWKSetURL(
                    URI.create(supabaseUrl + "/auth/v1/.well-known/jwks.json").toURL()
            ));
            processor.setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>(
                    new JWTClaimsSet.Builder().issuer(supabaseUrl + "/auth/v1").build(),
                    Set.of("sub")
            ));
            return processor;
        } catch (MalformedURLException exception) {
            throw new IllegalStateException("Invalid SUPABASE_URL", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to configure Supabase JWT verification", exception);
        }
    }

    private static void unauthorized(HttpServletRequest request, HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"statusCode\":401,\"message\":\"" + escape(message)
                + "\",\"path\":\"" + escape(request.getRequestURI())
                + "\",\"timestamp\":\"" + Instant.now() + "\"}");
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
