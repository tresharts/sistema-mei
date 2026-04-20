package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.financeiro.TipoMovimentacao;

import java.util.UUID;

public record CategoriaResponse (
    UUID id,
    String nome,
    TipoMovimentacao tipo,
    boolean padrao
) {}
