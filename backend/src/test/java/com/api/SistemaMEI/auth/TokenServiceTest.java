package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.usuario.Usuario;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TokenServiceTest {

    private TokenService service;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        service = new TokenService();
        ReflectionTestUtils.setField(service, "secret", "jwt-secret-de-teste");

        usuario = Usuario.builder()
            .nome("Maria")
            .email("maria@teste.com")
            .senha("senha")
            .build();
        usuario.setId(UUID.randomUUID());
    }

    @Test
    void deveGerarAccessTokenValidoComSubjectDoUsuario() {
        String token = service.generateAcessToken(usuario);

        assertNotNull(token);
        assertTrue(token.contains("."));
        assertEquals(usuario.getId().toString(), service.validateToken(token));
    }

    @Test
    void deveLancarExcecaoAoValidarTokenInvalido() {
        assertThrows(JWTVerificationException.class, () -> service.validateToken("token-invalido"));
    }

    @Test
    void deveGerarRefreshTokenComUsuarioEDadosBasicos() {
        RefreshToken refreshToken = service.generateRefreshToken(usuario);

        assertNotNull(refreshToken.getToken());
        assertEquals(usuario, refreshToken.getUsuario());
        assertTrue(refreshToken.getExpiresAt().isAfter(java.time.Instant.now()));
    }
}
