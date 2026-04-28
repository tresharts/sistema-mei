package com.api.SistemaMEI.notificacao;

import com.api.SistemaMEI.dashboard.AlertaResponse;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AlertaServiceTest {

    private final AlertaService service = new AlertaService();

    @Test
    void naoDeveCriarAlertaDeContaAtrasadaQuandoQuantidadeForZero() {
        List<AlertaResponse> alertas = service.listarAlertasDashboard(
            LocalDate.of(2026, 4, 10),
            0
        );

        assertTrue(alertas.isEmpty());
    }

    @Test
    void deveCriarAlertaDeContaAtrasadaQuandoQuantidadeForMaiorQueZero() {
        List<AlertaResponse> alertas = service.listarAlertasDashboard(
            LocalDate.of(2026, 4, 10),
            2
        );

        assertEquals(1, alertas.size());
        assertEquals(TipoAlerta.CONTAS_A_RECEBER_ATRASADAS.name(), alertas.getFirst().tipo());
        assertEquals("Voce tem 2 contas atrasadas", alertas.getFirst().titulo());
        assertEquals(2L, alertas.getFirst().quantidade());
        assertEquals(SeveridadeAlerta.DANGER.name(), alertas.getFirst().severidade());
    }

    @Test
    void deveCriarAlertaDeDasTresDiasAntesDoVencimento() {
        List<AlertaResponse> alertas = service.listarAlertasDashboard(
            LocalDate.of(2026, 4, 17),
            0
        );

        assertEquals(1, alertas.size());
        assertEquals(TipoAlerta.DAS_PROXIMO_VENCIMENTO.name(), alertas.getFirst().tipo());
        assertEquals("DAS vence em 3 dias", alertas.getFirst().titulo());
        assertEquals(3L, alertas.getFirst().quantidade());
        assertEquals(LocalDate.of(2026, 4, 20), alertas.getFirst().dataReferencia());
    }

    @Test
    void deveCriarAlertaDeDasNoDiaDoVencimento() {
        List<AlertaResponse> alertas = service.listarAlertasDashboard(
            LocalDate.of(2026, 4, 20),
            0
        );

        assertEquals(1, alertas.size());
        assertEquals("DAS vence hoje", alertas.getFirst().titulo());
        assertEquals(0L, alertas.getFirst().quantidade());
        assertEquals(SeveridadeAlerta.WARNING.name(), alertas.getFirst().severidade());
    }

    @Test
    void naoDeveCriarAlertaDeDasAntesDaJanelaDeTresDias() {
        List<AlertaResponse> alertas = service.listarAlertasDashboard(
            LocalDate.of(2026, 4, 16),
            0
        );

        assertTrue(alertas.isEmpty());
    }

    @Test
    void deveConsiderarVencimentoDoMesSeguinteQuandoDiaVinteJaPassou() {
        List<AlertaResponse> alertas = service.listarAlertasDashboard(
            LocalDate.of(2026, 4, 21),
            0
        );

        assertTrue(alertas.isEmpty());
    }
}
