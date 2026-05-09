package com.api.SistemaMEI.configuracao;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ConfiguracaoUsuarioResponse(
    UUID id,
    String nomeUsuario,
    String emailUsuario,
    String nomeNegocio,
    String atividade,
    BigDecimal valorDas,
    boolean lembreteDasAtivo,
    boolean resumoDiarioAtivo,
    LocalDateTime atualizadoEm
) {}
