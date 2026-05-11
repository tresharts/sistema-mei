package com.api.SistemaMEI.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final Map<String, String> PROTECTED_ENDPOINTS = Map.of(
        "POST /auth/login", "login",
        "POST /auth/register", "register",
        "POST /auth/refresh", "refresh"
    );

    @Value("${auth.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${auth.rate-limit.max-attempts:20}")
    private int maxAttempts;

    @Value("${auth.rate-limit.window:PT1M}")
    private Duration window;

    private final Map<String, AttemptWindow> attempts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {

        String endpoint = endpointKey(request);
        if (!enabled || endpoint == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Instant now = Instant.now();
        cleanupExpired(now);

        AttemptWindow attemptWindow = increment(request, endpoint, now);
        if (attemptWindow.count().get() > maxAttempts) {
            reject(response, attemptWindow, now);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private AttemptWindow increment(HttpServletRequest request, String endpoint, Instant now) {
        String key = clientIp(request) + ":" + endpoint;
        Duration effectiveWindow = effectiveWindow();

        return attempts.compute(key, (ignored, current) -> {
            if (current == null || !current.expiresAt().isAfter(now)) {
                return new AttemptWindow(new AtomicInteger(1), now.plus(effectiveWindow));
            }

            current.count().incrementAndGet();
            return current;
        });
    }

    private void reject(HttpServletResponse response, AttemptWindow attemptWindow, Instant now)
        throws IOException {
        long retryAfterSeconds = Math.max(1, Duration.between(now, attemptWindow.expiresAt()).toSeconds());

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.getWriter().write("""
            {"title":"Muitas tentativas","detail":"Muitas tentativas. Tente novamente em alguns minutos.","status":429}
            """);
    }

    private String endpointKey(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return PROTECTED_ENDPOINTS.get(request.getMethod() + " " + path);
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private Duration effectiveWindow() {
        if (window == null || window.isZero() || window.isNegative()) {
            return Duration.ofMinutes(1);
        }

        return window;
    }

    private void cleanupExpired(Instant now) {
        attempts.entrySet().removeIf(entry -> !entry.getValue().expiresAt().isAfter(now));
    }

    private record AttemptWindow(AtomicInteger count, Instant expiresAt) {
    }
}
