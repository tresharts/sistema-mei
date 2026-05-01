package com.api.SistemaMEI.dashboard;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.movimentacao.Movimentacao;
import com.api.SistemaMEI.movimentacao.MovimentacaoRepository;
import com.api.SistemaMEI.notificacao.AlertaService;
import com.api.SistemaMEI.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final AlertaService alertaService;

    @Transactional(readOnly = true)
    public ResumoResponse buscarResumo(Usuario usuario, ClassificacaoFinanceira classificacao) {
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMes = hoje.withDayOfMonth(1);
        LocalDate fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth());

        BigDecimal saldoAtual = calcularSaldoAtual(usuario, classificacao);
        BigDecimal lucroEmpresarialMes = calcularLucroPorClassificacaoMes(
            usuario,
            classificacao != null ? classificacao : ClassificacaoFinanceira.EMPRESARIAL,
            inicioMes,
            fimMes
        );

        BigDecimal totalAReceber = movimentacaoRepository.somaPorUsuarioTipoStatusEClassificacao(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.A_RECEBER,
            classificacao
        );

        BigDecimal totalAPagar = movimentacaoRepository.somaPorUsuarioTipoStatusEClassificacao(
            usuario,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR,
            classificacao
        );

        BigDecimal vendasHoje = movimentacaoRepository.somaPorUsuarioTipoStatusClassificacaoEPeriodo(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            classificacao != null ? classificacao : ClassificacaoFinanceira.EMPRESARIAL,
            hoje,
            hoje
        );

        long quantidadeContasAReceberAtrasadas =
            movimentacaoRepository.contarAtrasadasPorClassificacao(
                usuario,
                TipoMovimentacao.RECEITA,
                StatusMovimentacao.A_RECEBER,
                classificacao,
                hoje
            );

        return new ResumoResponse(
            saldoAtual,
            lucroEmpresarialMes,
            totalAReceber,
            totalAPagar,
            vendasHoje,
            quantidadeContasAReceberAtrasadas,
            alertaService.listarAlertasAtivos(hoje, quantidadeContasAReceberAtrasadas)
        );
    }

    @Transactional(readOnly = true)
    public Page<ContaAtrasadaResponse> listarContasAtrasadas(
        Usuario usuario,
        ClassificacaoFinanceira classificacao,
        Pageable pageable
    ) {
        LocalDate hoje = LocalDate.now();

        return movimentacaoRepository
            .buscarAtrasadasPorClassificacao(
                usuario,
                TipoMovimentacao.RECEITA,
                StatusMovimentacao.A_RECEBER,
                classificacao,
                hoje,
                pageable
            )
            .map(movimentacao -> toContaAtrasadaResponse(movimentacao, hoje));
    }

    private BigDecimal calcularSaldoAtual(Usuario usuario, ClassificacaoFinanceira classificacao) {
        BigDecimal receitasRecebidas = movimentacaoRepository.somaPorUsuarioTipoStatusEClassificacao(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            classificacao
        );

        BigDecimal despesasPagas = movimentacaoRepository.somaPorUsuarioTipoStatusEClassificacao(
            usuario,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO,
            classificacao
        );

        return receitasRecebidas.subtract(despesasPagas);
    }

    private BigDecimal calcularLucroPorClassificacaoMes(
        Usuario usuario,
        ClassificacaoFinanceira classificacao,
        LocalDate inicioMes,
        LocalDate fimMes
    ) {
        BigDecimal receitasRecebidas =
            movimentacaoRepository.somaPorUsuarioTipoClassificacaoStatusEPeriodo(
                usuario,
                TipoMovimentacao.RECEITA,
                classificacao,
                StatusMovimentacao.RECEBIDO,
                inicioMes,
                fimMes
            );

        BigDecimal despesasPagas =
            movimentacaoRepository.somaPorUsuarioTipoClassificacaoStatusEPeriodo(
                usuario,
                TipoMovimentacao.DESPESA,
                classificacao,
                StatusMovimentacao.PAGO,
                inicioMes,
                fimMes
            );

        return receitasRecebidas.subtract(despesasPagas);
    }

    private ContaAtrasadaResponse toContaAtrasadaResponse(Movimentacao movimentacao, LocalDate hoje) {
        long diasAtraso = ChronoUnit.DAYS.between(movimentacao.getDataVencimento(), hoje);

        return new ContaAtrasadaResponse(
            movimentacao.getId(),
            movimentacao.getDescricao(),
            movimentacao.getValor(),
            movimentacao.getDataVencimento(),
            diasAtraso,
            movimentacao.getCategoria().getNome()
        );
    }
}
