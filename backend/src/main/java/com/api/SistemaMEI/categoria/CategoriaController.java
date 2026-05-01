package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService service;

    @GetMapping
    public ResponseEntity<Page<CategoriaResponse>> listar(
        @AuthenticationPrincipal Usuario usuario,
        @RequestParam(required = false) TipoMovimentacao tipo,
        @RequestParam(required = false) ClassificacaoFinanceira classificacao,
        @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(service.listar(usuario, tipo, classificacao, pageable));
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody CategoriaRequest request
    ) {
        return ResponseEntity.status(201).body(service.criar(request, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> editar(
        @PathVariable UUID id,
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody CategoriaRequest request
    ) {
        return ResponseEntity.ok(service.editar(id, request, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
        @PathVariable UUID id,
        @AuthenticationPrincipal Usuario usuario
    ) {
        service.excluir(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
