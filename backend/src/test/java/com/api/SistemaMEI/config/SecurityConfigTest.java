package com.api.SistemaMEI.config;

import com.api.SistemaMEI.auth.AuthCookieService;
import com.api.SistemaMEI.auth.AuthResponse;
import com.api.SistemaMEI.auth.AuthService;
import com.api.SistemaMEI.auth.SecurityFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Mock
    private SecurityFilter securityFilter;

    @Mock
    private AuthService authService;

    @Mock
    private AuthCookieService authCookieService;

    @Mock
    private Authentication authentication;

    private SecurityConfig securityConfig;

    @BeforeEach
    void setUp() {
        securityConfig = new SecurityConfig(securityFilter, authService, authCookieService);
        ReflectionTestUtils.setField(securityConfig, "frontendUrl", "https://sistemamei.vercel.app");
    }

    @Test
    void deveAdicionarCookieERedirecionarParaGoogleCallbackAposLoginSocial() throws Exception {
        OAuth2User oAuth2User = new DefaultOAuth2User(
            List.of(),
            Map.of("email", "maria@teste.com", "name", "Maria"),
            "email"
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        AuthResponse authResponse = new AuthResponse("access", "refresh-social", "Maria", "maria@teste.com");
        AuthenticationSuccessHandler handler = securityConfig.googleOAuthSuccessHandler();

        when(authentication.getPrincipal()).thenReturn(oAuth2User);
        when(authService.loginWithGoogle("maria@teste.com", "Maria")).thenReturn(authResponse);

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(authService).loginWithGoogle("maria@teste.com", "Maria");
        verify(authCookieService).addRefreshTokenCookie(response, "refresh-social");
        assertEquals("https://sistemamei.vercel.app/google-callback", response.getRedirectedUrl());
    }
}
