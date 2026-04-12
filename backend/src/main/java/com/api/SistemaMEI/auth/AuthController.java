package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.usuario.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final AuthCookieService authCookieService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest request,
        HttpServletResponse response) {
        AuthResponse authResponse = service.register(request);
        authCookieService.addRefreshTokenCookie(response, authResponse.refreshToken());

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(maskRefreshToken(authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response) {
        AuthResponse authResponse = service.login(request);
        authCookieService.addRefreshTokenCookie(response, authResponse.refreshToken());
        return ResponseEntity.ok(maskRefreshToken(authResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
        @Valid @RequestBody(required = false) RefreshRequest request,
        HttpServletRequest servletRequest,
        HttpServletResponse response) {
        String refreshToken = resolveRefreshToken(request, servletRequest);
        AuthResponse authResponse = service.refresh(refreshToken);
        authCookieService.addRefreshTokenCookie(response, authResponse.refreshToken());
        return ResponseEntity.ok(maskRefreshToken(authResponse));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<Void> logout(
        @AuthenticationPrincipal Usuario usuario,
        HttpServletRequest request,
        HttpServletResponse response) {
        authCookieService
            .extractRefreshToken(request)
            .ifPresent(service::logoutByRefreshToken);

        if (usuario != null) {
            service.logout(usuario);
        }

        authCookieService.clearRefreshTokenCookie(response);
        return ResponseEntity.noContent().build();
    }

    private String resolveRefreshToken(RefreshRequest request, HttpServletRequest servletRequest) {
        if (request != null && StringUtils.hasText(request.refreshToken())) {
            return request.refreshToken();
        }

        return authCookieService
            .extractRefreshToken(servletRequest)
            .orElseThrow(() -> new BusinessRuleException("Refresh token is required"));
    }

    private AuthResponse maskRefreshToken(AuthResponse response) {
        return new AuthResponse(
            response.acessToken(),
            null,
            response.nome(),
            response.email()
        );
    }
}
