package com.api.SistemaMEI.dashboard;

import java.time.LocalDate;

public record AlertaResponse(
    String tipo,
    String titulo,
    String mensagem,
    Long quantidade,
    String severidade,
    LocalDate dataReferencia
) {}
