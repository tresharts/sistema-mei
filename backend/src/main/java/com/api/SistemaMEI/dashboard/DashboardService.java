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
    public ResumoResponse buscarResumo(Usuario usuario) {
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMes = hoje.withDayOfMonth(1);
        LocalDate fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth());

        BigDecimal saldoAtual = calcularSaldoAtual(usuario);
        BigDecimal lucroEmpresarialMes = calcularLucroEmpresarialMes(usuario, inicioMes, fimMes);

        BigDecimal totalAReceber = movimentacaoRepository.somaPorUsuarioTipoEStatus(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.A_RECEBER
        );

        BigDecimal totalAPagar = movimentacaoRepository.somaPorUsuarioTipoEStatus(
            usuario,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR
        );

        BigDecimal vendasHoje = movimentacaoRepository.somaPorUsuarioTipoClassificacaoStatusEPeriodo(
            usuario,
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.RECEBIDO,
            hoje,
            hoje
        );

        long quantidadeContasAReceberAtrasadas =
            movimentacaoRepository.countByUsuarioAndTipoAndStatusAndDataVencimentoBefore(
                usuario,
                TipoMovimentacao.RECEITA,
                StatusMovimentacao.A_RECEBER,
                hoje
            );

        return new ResumoResponse(
            saldoAtual,
            lucroEmpresarialMes,
            totalAReceber,
            totalAPagar,
            vendasHoje,
            quantidadeContasAReceberAtrasadas,
            alertaService.listarAlertasDashboard(hoje, quantidadeContasAReceberAtrasadas)
        );
    }

    @Transactional(readOnly = true)
    public Page<ContaAtrasadaResponse> listarContasAtrasadas(Usuario usuario, Pageable pageable) {
        LocalDate hoje = LocalDate.now();

        return movimentacaoRepository
            .findByUsuarioAndTipoAndStatusAndDataVencimentoBefore(
                usuario,
                TipoMovimentacao.RECEITA,
                StatusMovimentacao.A_RECEBER,
                hoje,
                pageable
            )
            .map(movimentacao -> toContaAtrasadaResponse(movimentacao, hoje));
    }

    private BigDecimal calcularSaldoAtual(Usuario usuario) {
        BigDecimal receitasRecebidas = movimentacaoRepository.somaPorUsuarioTipoEStatus(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO
        );

        BigDecimal despesasPagas = movimentacaoRepository.somaPorUsuarioTipoEStatus(
            usuario,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO
        );

        return receitasRecebidas.subtract(despesasPagas);
    }

    private BigDecimal calcularLucroEmpresarialMes(
        Usuario usuario,
        LocalDate inicioMes,
        LocalDate fimMes
    ) {
        BigDecimal receitasEmpresariaisRecebidas =
            movimentacaoRepository.somaPorUsuarioTipoClassificacaoStatusEPeriodo(
                usuario,
                TipoMovimentacao.RECEITA,
                ClassificacaoFinanceira.EMPRESARIAL,
                StatusMovimentacao.RECEBIDO,
                inicioMes,
                fimMes
            );

        BigDecimal despesasEmpresariaisPagas =
            movimentacaoRepository.somaPorUsuarioTipoClassificacaoStatusEPeriodo(
                usuario,
                TipoMovimentacao.DESPESA,
                ClassificacaoFinanceira.EMPRESARIAL,
                StatusMovimentacao.PAGO,
                inicioMes,
                fimMes
            );

        return receitasEmpresariaisRecebidas.subtract(despesasEmpresariaisPagas);
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
