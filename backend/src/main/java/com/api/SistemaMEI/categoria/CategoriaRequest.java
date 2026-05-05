package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 120)
    String nome,

    @NotNull(message = "Tipo é obrigatório")
    TipoMovimentacao tipo,

    @NotNull(message = "Classificação é obrigatória")
    ClassificacaoFinanceira classificacao
) {}
