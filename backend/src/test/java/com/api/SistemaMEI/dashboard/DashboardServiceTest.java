package com.api.SistemaMEI.dashboard;

import com.api.SistemaMEI.categoria.Categoria;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.movimentacao.Movimentacao;
import com.api.SistemaMEI.movimentacao.MovimentacaoRepository;
import com.api.SistemaMEI.notificacao.AlertaResponse;
import com.api.SistemaMEI.notificacao.AlertaService;
import com.api.SistemaMEI.notificacao.SeveridadeAlerta;
import com.api.SistemaMEI.notificacao.TipoAlerta;
import com.api.SistemaMEI.usuario.Usuario;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @Mock
    private AlertaService alertaService;

    @InjectMocks
    private DashboardService service;

    @Test
    void deveBuscarResumoComValoresCalculados() {
        Usuario usuario = novoUsuario();
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMes = hoje.withDayOfMonth(1);
        LocalDate fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth());

        when(movimentacaoRepository.somaPorUsuarioTipoEStatus(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO
        )).thenReturn(BigDecimal.valueOf(1000));
        when(movimentacaoRepository.somaPorUsuarioTipoEStatus(
            usuario,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO
        )).thenReturn(BigDecimal.valueOf(250));
        when(movimentacaoRepository.somaPorUsuarioTipoClassificacaoStatusEPeriodo(
            usuario,
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.RECEBIDO,
            inicioMes,
            fimMes
        )).thenReturn(BigDecimal.valueOf(900));
        when(movimentacaoRepository.somaPorUsuarioTipoClassificacaoStatusEPeriodo(
            usuario,
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.PAGO,
            inicioMes,
            fimMes
        )).thenReturn(BigDecimal.valueOf(300));
        when(movimentacaoRepository.somaPorUsuarioTipoEStatus(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.A_RECEBER
        )).thenReturn(BigDecimal.valueOf(400));
        when(movimentacaoRepository.somaPorUsuarioTipoEStatus(
            usuario,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR
        )).thenReturn(BigDecimal.valueOf(120));
        when(movimentacaoRepository.somaPorUsuarioTipoClassificacaoStatusEPeriodo(
            usuario,
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.RECEBIDO,
            hoje,
            hoje
        )).thenReturn(BigDecimal.valueOf(180));
        when(movimentacaoRepository.countByUsuarioAndTipoAndStatusAndDataVencimentoBefore(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.A_RECEBER,
            hoje
        )).thenReturn(2L);
        when(alertaService.listarAlertasAtivos(hoje, 2L))
            .thenReturn(List.of(new AlertaResponse(
                TipoAlerta.CONTAS_A_RECEBER_ATRASADAS.name(),
                "Voce tem 2 contas atrasadas",
                "Confira os valores que ainda nao foram recebidos.",
                2L,
                SeveridadeAlerta.DANGER.name(),
                null
            )));

        ResumoResponse response = service.buscarResumo(usuario);

        assertEquals(BigDecimal.valueOf(750), response.saldoAtual());
        assertEquals(BigDecimal.valueOf(600), response.lucroEmpresarialMes());
        assertEquals(BigDecimal.valueOf(400), response.totalAReceber());
        assertEquals(BigDecimal.valueOf(120), response.totalAPagar());
        assertEquals(BigDecimal.valueOf(180), response.vendasHoje());
        assertEquals(2, response.quantidadeContasAReceberAtrasadas());
        assertEquals(1, response.alertas().size());
        assertEquals(
            TipoAlerta.CONTAS_A_RECEBER_ATRASADAS.name(),
            response.alertas().getFirst().tipo()
        );
    }

    @Test
    void deveListarContasAtrasadasMapeandoResponse() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA);
        LocalDate hoje = LocalDate.now();
        LocalDate vencimento = hoje.minusDays(4);
        Pageable pageable = PageRequest.of(0, 5);
        Movimentacao movimentacao = novaMovimentacao(
            usuario,
            categoria,
            BigDecimal.valueOf(320),
            vencimento,
            "Venda atrasada"
        );

        when(movimentacaoRepository.findByUsuarioAndTipoAndStatusAndDataVencimentoBefore(
            usuario,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.A_RECEBER,
            hoje,
            pageable
        )).thenReturn(new PageImpl<>(List.of(movimentacao), pageable, 1));

        Page<ContaAtrasadaResponse> response = service.listarContasAtrasadas(usuario, pageable);

        assertEquals(1, response.getTotalElements());
        assertEquals(movimentacao.getId(), response.getContent().getFirst().id());
        assertEquals("Venda atrasada", response.getContent().getFirst().descricao());
        assertEquals(BigDecimal.valueOf(320), response.getContent().getFirst().valor());
        assertEquals(vencimento, response.getContent().getFirst().dataVencimento());
        assertEquals(4, response.getContent().getFirst().diasAtraso());
        assertEquals("Vendas", response.getContent().getFirst().categoriaNome());
    }

    private Usuario novoUsuario() {
        Usuario usuario = Usuario
            .builder()
            .nome("Usuario Teste")
            .email(UUID.randomUUID() + "@teste.com")
            .senha("123456")
            .build();
        usuario.setId(UUID.randomUUID());
        return usuario;
    }

    private Categoria novaCategoria(Usuario usuario, String nome, TipoMovimentacao tipo) {
        Categoria categoria = Categoria
            .builder()
            .nome(nome)
            .tipo(tipo)
            .padrao(false)
            .usuario(usuario)
            .build();
        categoria.setId(UUID.randomUUID());
        return categoria;
    }

    private Movimentacao novaMovimentacao(
        Usuario usuario,
        Categoria categoria,
        BigDecimal valor,
        LocalDate dataVencimento,
        String descricao
    ) {
        Movimentacao movimentacao = Movimentacao
            .builder()
            .valor(valor)
            .descricao(descricao)
            .data(LocalDate.now())
            .dataVencimento(dataVencimento)
            .tipo(TipoMovimentacao.RECEITA)
            .classificacao(ClassificacaoFinanceira.EMPRESARIAL)
            .status(StatusMovimentacao.A_RECEBER)
            .categoria(categoria)
            .usuario(usuario)
            .build();
        movimentacao.setId(UUID.randomUUID());
        return movimentacao;
    }
}
