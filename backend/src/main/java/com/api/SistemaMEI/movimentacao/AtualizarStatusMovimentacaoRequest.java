package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusMovimentacaoRequest(

    @NotNull(message = "Status e obrigatorio")
    StatusMovimentacao status
) {}
