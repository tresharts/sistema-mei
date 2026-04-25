package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MovimentacaoRequest(

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    BigDecimal valor,

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    String descricao,

    @NotNull(message = "Data é obrigatória")
    LocalDate data,

    LocalDate dataVencimento,

    @NotNull(message = "Tipo é obrigatório")
    TipoMovimentacao tipo,

    @NotNull(message = "Classificação é obrigatória")
    ClassificacaoFinanceira classificacao,

    @NotNull(message = "Status é obrigatório")
    StatusMovimentacao status,

    @NotNull(message = "Categoria é obrigatória")
    UUID categoriaId
) {}
