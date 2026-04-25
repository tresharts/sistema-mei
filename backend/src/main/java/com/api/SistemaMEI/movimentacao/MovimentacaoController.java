package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/movimentacoes")
@RequiredArgsConstructor
public class MovimentacaoController {

    private final MovimentacaoService service;

    @PostMapping
    public ResponseEntity<MovimentacaoResponse> criar(
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody MovimentacaoRequest request
    ) {
        return ResponseEntity.status(201).body(service.criar(request, usuario));
    }

    @GetMapping
    public ResponseEntity<Page<MovimentacaoResponse>> listar(
        @AuthenticationPrincipal Usuario usuario,
        @RequestParam(required = false) LocalDate dataInicio,
        @RequestParam(required = false) LocalDate dataFim,
        @RequestParam(required = false) TipoMovimentacao tipo,
        @RequestParam(required = false) StatusMovimentacao status,
        @RequestParam(required = false) ClassificacaoFinanceira classificacao,
        @RequestParam(required = false) UUID categoriaId,
        @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(
            service.listar(
                usuario,
                dataInicio,
                dataFim,
                tipo,
                status,
                classificacao,
                categoriaId,
                pageable
            )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimentacaoResponse> editar(
        @PathVariable UUID id,
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody MovimentacaoRequest request
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

    @PatchMapping("/{id}/status")
    public ResponseEntity<MovimentacaoResponse> atualizarStatus(
        @PathVariable UUID id,
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody AtualizarStatusMovimentacaoRequest request
    ) {
        return ResponseEntity.ok(service.atualizarStatus(id, request, usuario));
    }
}
