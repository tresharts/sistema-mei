package com.api.SistemaMEI.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Component
public class AuthCookieService {

    private static final String DEFAULT_COOKIE_NAME = "refreshToken";

    @Value("${auth.refresh-cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${auth.refresh-cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${auth.refresh-cookie.path:/auth}")
    private String cookiePath;

    @Value("${auth.refresh-cookie.max-age-days:30}")
    private long cookieMaxAgeDays;

    @Value("${auth.refresh-cookie.domain:}")
    private String cookieDomain;

    public void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = buildCookie(refreshToken, Duration.ofDays(cookieMaxAgeDays));
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = buildCookie("", Duration.ZERO);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public Optional<String> extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
            .filter(cookie -> DEFAULT_COOKIE_NAME.equals(cookie.getName()))
            .map(Cookie::getValue)
            .findFirst()
            .filter(value -> !value.isBlank());
    }

    private ResponseCookie buildCookie(String value, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(DEFAULT_COOKIE_NAME, value)
            .httpOnly(true)
            .secure(cookieSecure)
            .path(cookiePath)
            .sameSite(cookieSameSite)
            .maxAge(maxAge);

        if (!cookieDomain.isBlank()) {
            builder.domain(cookieDomain);
        }

        return builder.build();
    }
}
