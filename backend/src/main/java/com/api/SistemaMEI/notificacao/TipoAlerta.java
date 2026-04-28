package com.api.SistemaMEI.notificacao;

/**
 * Tipos de alerta que podem aparecer no dashboard.
 *
 * Usar enum evita strings soltas no codigo e facilita o frontend
 * a tratar cada alerta por tipo.
 */
public enum TipoAlerta {
    CONTAS_A_RECEBER_ATRASADAS,
    DAS_PROXIMO_VENCIMENTO
}
