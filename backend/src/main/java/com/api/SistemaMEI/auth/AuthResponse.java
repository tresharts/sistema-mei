package com.api.SistemaMEI.auth;

public record AuthResponse(
    String acessToken,
    String refreshToken,
    String nome,
    String email,
    String newRefreshToken
) {
    public AuthResponse(String acessToken, String refreshToken, String nome, String email) {
        this(acessToken, refreshToken, nome, email, null);
    }
}
