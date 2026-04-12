package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.usuario.Usuario;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class TokenService {

    @Value("${JWT_SECRET}")
    private String secret;

    public String generateAcessToken(Usuario usuario) {
        return JWT
            .create()
            .withIssuer("SistemaMEI")
            .withSubject(usuario.getId().toString())
            .withExpiresAt(Instant.now().plus(2, ChronoUnit.HOURS))
            .sign(Algorithm.HMAC256(secret));
    }

    public String validateToken(String token) {
        return JWT
            .require(Algorithm.HMAC256(secret))
            .withIssuer("SistemaMEI")
            .build()
            .verify(token)
            .getSubject();
    }

    public RefreshToken generateRefreshToken(Usuario usuario) {
        return RefreshToken
            .builder()
            .token(UUID.randomUUID().toString())
            .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
            .usuario(usuario)
            .build();
    }
}
