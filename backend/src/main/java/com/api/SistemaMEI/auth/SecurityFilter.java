package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.usuario.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null) {
            String userId = tokenService.validateToken(token);
            usuarioRepository
                .findById(UUID.fromString(userId))
                .ifPresent(usuario -> {
                    var authentication = new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        Collections.emptyList()
                    );
                    SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
                });
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }

        return header.replace("Bearer ", "");
    }
}
