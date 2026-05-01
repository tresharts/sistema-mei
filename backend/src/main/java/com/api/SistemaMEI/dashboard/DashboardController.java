package com.api.SistemaMEI.dashboard;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;

    @GetMapping("/resumo")
    public ResponseEntity<ResumoResponse> buscarResumo(
        @AuthenticationPrincipal Usuario usuario,
        @RequestParam(required = false) ClassificacaoFinanceira classificacao
    ) {
        return ResponseEntity.ok(service.buscarResumo(usuario, classificacao));
    }

    @GetMapping("/contas-atrasadas")
    public ResponseEntity<Page<ContaAtrasadaResponse>> listarContasAtrasadas(
        @AuthenticationPrincipal Usuario usuario,
        @RequestParam(required = false) ClassificacaoFinanceira classificacao,
        @PageableDefault(size = 5) Pageable pageable
    ) {
        return ResponseEntity.ok(service.listarContasAtrasadas(usuario, classificacao, pageable));
    }
}
