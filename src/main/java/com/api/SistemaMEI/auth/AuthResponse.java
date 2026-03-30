package com.api.SistemaMEI.auth;

public record AuthResponse(
    String acessToken,
    String refreshToken,
    String nome,
    String email
) {}
