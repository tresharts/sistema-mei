package com.api.SistemaMEI.dashboard;

import com.api.SistemaMEI.notificacao.AlertaResponse;

import java.math.BigDecimal;
import java.util.List;

public record ResumoResponse(
    BigDecimal saldoAtual,
    BigDecimal lucroEmpresarialMes,
    BigDecimal totalAReceber,
    BigDecimal totalAPagar,
    BigDecimal vendasHoje,
    long quantidadeContasAReceberAtrasadas,
    List<AlertaResponse> alertas
) {}
