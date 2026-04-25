package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record MovimentacaoResponse(
    UUID id,
    BigDecimal valor,
    String descricao,
    LocalDate data,
    LocalDate dataVencimento,
    TipoMovimentacao tipo,
    ClassificacaoFinanceira classificacao,
    StatusMovimentacao status,
    UUID categoriaId,
    String categoriaNome,
    LocalDateTime criadoEm,
    LocalDateTime atualizadoEm
) {}
