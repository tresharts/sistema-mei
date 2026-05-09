package com.api.SistemaMEI.configuracao;

import com.api.SistemaMEI.usuario.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/configuracoes")
@RequiredArgsConstructor
public class ConfiguracaoUsuarioController {

    private final ConfiguracaoUsuarioService service;

    @GetMapping
    public ResponseEntity<ConfiguracaoUsuarioResponse> buscar(
        @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(service.buscar(usuario));
    }

    @PutMapping
    public ResponseEntity<ConfiguracaoUsuarioResponse> atualizar(
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody ConfiguracaoUsuarioRequest request
    ) {
        return ResponseEntity.ok(service.atualizar(request, usuario));
    }
}
