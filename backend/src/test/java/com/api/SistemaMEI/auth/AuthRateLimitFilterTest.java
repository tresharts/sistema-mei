package com.api.SistemaMEI.auth;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class AuthRateLimitFilterTest {

    @Test
    void deveBloquearTentativasAcimaDoLimite() throws Exception {
        AuthRateLimitFilter filter = rateLimitFilter(2);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(loginRequest(), new MockHttpServletResponse(), chain);
        filter.doFilter(loginRequest(), new MockHttpServletResponse(), chain);

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(loginRequest(), response, chain);

        assertEquals(429, response.getStatus());
        assertTrue(response.getHeader(HttpHeaders.RETRY_AFTER) != null);
        assertTrue(response.getContentAsString().contains("Muitas tentativas"));
        verify(chain, times(2)).doFilter(
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any()
        );
    }

    @Test
    void deveIgnorarEndpointsForaDaAutenticacao() throws Exception {
        AuthRateLimitFilter filter = rateLimitFilter(1);
        FilterChain chain = mock(FilterChain.class);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/health");

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        verify(chain, times(1)).doFilter(
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any()
        );
    }

    private AuthRateLimitFilter rateLimitFilter(int maxAttempts) {
        AuthRateLimitFilter filter = new AuthRateLimitFilter();
        ReflectionTestUtils.setField(filter, "enabled", true);
        ReflectionTestUtils.setField(filter, "maxAttempts", maxAttempts);
        ReflectionTestUtils.setField(filter, "window", Duration.ofMinutes(1));
        return filter;
    }

    private MockHttpServletRequest loginRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/login");
        request.setRemoteAddr("203.0.113.10");
        return request;
    }
}
