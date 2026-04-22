package com.api.SistemaMEI.auth;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthCookieServiceTest {

    private AuthCookieService service;

    @BeforeEach
    void setUp() {
        service = new AuthCookieService();
        ReflectionTestUtils.setField(service, "cookieSecure", true);
        ReflectionTestUtils.setField(service, "cookieSameSite", "None");
        ReflectionTestUtils.setField(service, "cookiePath", "/api/auth");
        ReflectionTestUtils.setField(service, "cookieMaxAgeDays", 30L);
        ReflectionTestUtils.setField(service, "cookieDomain", "");
    }

    @Test
    void deveAdicionarCookieDeRefreshComConfiguracaoCompativelComProxy() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        service.addRefreshTokenCookie(response, "token-de-teste");

        String setCookie = response.getHeader("Set-Cookie");

        assertTrue(setCookie.startsWith("refreshToken=token-de-teste"));
        assertTrue(setCookie.contains("Path=/api/auth"));
        assertTrue(setCookie.contains("Max-Age=2592000"));
        assertTrue(setCookie.contains("Secure"));
        assertTrue(setCookie.contains("HttpOnly"));
        assertTrue(setCookie.contains("SameSite=None"));
        assertFalse(setCookie.contains("Domain="));
    }

    @Test
    void deveLimparCookieDeRefreshMantendoMesmoPath() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        service.clearRefreshTokenCookie(response);

        String setCookie = response.getHeader("Set-Cookie");

        assertTrue(setCookie.startsWith("refreshToken="));
        assertTrue(setCookie.contains("Path=/api/auth"));
        assertTrue(setCookie.contains("Max-Age=0"));
        assertTrue(setCookie.contains("Secure"));
        assertTrue(setCookie.contains("HttpOnly"));
        assertTrue(setCookie.contains("SameSite=None"));
    }

    @Test
    void deveExtrairRefreshTokenQuandoCookieExiste() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(
            new Cookie("qualquer", "valor"),
            new Cookie("refreshToken", "token-valido")
        );

        Optional<String> refreshToken = service.extractRefreshToken(request);

        assertTrue(refreshToken.isPresent());
        assertEquals("token-valido", refreshToken.orElseThrow());
    }

    @Test
    void naoDeveExtrairRefreshTokenQuandoCookieNaoExisteOuEstaEmBranco() {
        MockHttpServletRequest requestSemCookie = new MockHttpServletRequest();
        MockHttpServletRequest requestComCookieEmBranco = new MockHttpServletRequest();
        requestComCookieEmBranco.setCookies(new Cookie("refreshToken", " "));

        assertTrue(service.extractRefreshToken(requestSemCookie).isEmpty());
        assertTrue(service.extractRefreshToken(requestComCookieEmBranco).isEmpty());
    }
}
