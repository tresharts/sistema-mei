package com.api.SistemaMEI.notificacao;

import com.api.SistemaMEI.dashboard.AlertaResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Centraliza as regras dos alertas passivos do sistema.
 *
 * Alerta passivo significa: o sistema nao envia push, email ou WhatsApp.
 * Ele apenas calcula o que precisa ser exibido quando a usuaria abre o dashboard.
 */
@Service
public class AlertaService {

    private static final int DIA_VENCIMENTO_DAS = 20;
    private static final int DIAS_ANTES_ALERTA_DAS = 3;

    /**
     * Monta todos os alertas do dashboard em uma unica lista.
     *
     * O DashboardService ja calcula alguns numeros financeiros, como a quantidade
     * de contas atrasadas. Por isso recebemos esse valor por parametro e evitamos
     * fazer outra consulta no banco so para montar a mensagem.
     */
    public List<AlertaResponse> listarAlertasDashboard(
        LocalDate hoje,
        long quantidadeContasAReceberAtrasadas
    ) {
        List<AlertaResponse> alertas = new ArrayList<>();

        criarAlertaContasAReceberAtrasadas(quantidadeContasAReceberAtrasadas)
            .ifPresent(alertas::add);

        criarAlertaDas(hoje)
            .ifPresent(alertas::add);

        return alertas;
    }

    /**
     * Se nao existe conta atrasada, nao existe alerta.
     * Se existe uma ou mais, criamos uma mensagem simples para o dashboard.
     */
    private Optional<AlertaResponse> criarAlertaContasAReceberAtrasadas(long quantidade) {
        if (quantidade <= 0) {
            return Optional.empty();
        }

        String titulo = quantidade == 1
            ? "Voce tem 1 conta atrasada"
            : "Voce tem " + quantidade + " contas atrasadas";

        String mensagem = quantidade == 1
            ? "Confira o valor que ainda nao foi recebido."
            : "Confira os valores que ainda nao foram recebidos.";

        return Optional.of(new AlertaResponse(
            TipoAlerta.CONTAS_A_RECEBER_ATRASADAS.name(),
            titulo,
            mensagem,
            quantidade,
            SeveridadeAlerta.DANGER.name(),
            null
        ));
    }

    /**
     * O DAS vence todo dia 20.
     *
     * A regra do MVP e mostrar o alerta somente quando estiver perto:
     * dia 17, 18, 19 ou no proprio dia 20.
     */
    private Optional<AlertaResponse> criarAlertaDas(LocalDate hoje) {
        LocalDate vencimento = calcularProximoVencimentoDas(hoje);
        long diasRestantes = ChronoUnit.DAYS.between(hoje, vencimento);

        if (diasRestantes > DIAS_ANTES_ALERTA_DAS) {
            return Optional.empty();
        }

        String titulo = switch ((int) diasRestantes) {
            case 0 -> "DAS vence hoje";
            case 1 -> "DAS vence amanha";
            default -> "DAS vence em " + diasRestantes + " dias";
        };

        return Optional.of(new AlertaResponse(
            TipoAlerta.DAS_PROXIMO_VENCIMENTO.name(),
            titulo,
            "Nao esqueca de pagar o DAS mensal.",
            diasRestantes,
            SeveridadeAlerta.WARNING.name(),
            vencimento
        ));
    }

    /**
     * Descobre qual vencimento do DAS deve ser considerado.
     *
     * Ate o dia 20, o vencimento e o dia 20 do mes atual.
     * Depois do dia 20, passamos a olhar para o dia 20 do mes seguinte.
     */
    private LocalDate calcularProximoVencimentoDas(LocalDate hoje) {
        LocalDate vencimentoMesAtual = hoje.withDayOfMonth(DIA_VENCIMENTO_DAS);

        if (hoje.isAfter(vencimentoMesAtual)) {
            return vencimentoMesAtual.plusMonths(1);
        }

        return vencimentoMesAtual;
    }
}
