package com.api.SistemaMEI.dashboard;

public record AlertaResponse(
    String tipo,
    String mensagem,
    long quantidade,
    String severidade
) {}
