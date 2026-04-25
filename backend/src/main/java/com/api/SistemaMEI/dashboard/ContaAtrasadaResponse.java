package com.api.SistemaMEI.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContaAtrasadaResponse(
    UUID id,
    String descricao,
    BigDecimal valor,
    LocalDate dataVencimento,
    long diasAtraso,
    String categoriaNome
) {}
