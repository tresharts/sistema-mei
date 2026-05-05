package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.categoria.Categoria;
import com.api.SistemaMEI.categoria.CategoriaRepository;
import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.exception.ResourceNotFoundException;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
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
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovimentacaoServiceTest {

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private MovimentacaoService service;

    @Test
    void deveCriarReceitaRecebida() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Vendas",
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            categoria.getId(),
            null
        );

        when(categoriaRepository.findByIdAndUsuario(categoria.getId(), usuario))
            .thenReturn(Optional.of(categoria));
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(invocation -> {
            Movimentacao movimentacao = invocation.getArgument(0);
            movimentacao.setId(UUID.randomUUID());
            return movimentacao;
        });

        MovimentacaoResponse response = service.criar(request, usuario);

        assertEquals(request.valor(), response.valor());
        assertEquals("Venda no cartao", response.descricao());
        assertEquals(TipoMovimentacao.RECEITA, response.tipo());
        assertEquals(StatusMovimentacao.RECEBIDO, response.status());
        assertEquals(categoria.getId(), response.categoriaId());
        assertEquals("Vendas", response.categoriaNome());
    }

    @Test
    void deveLancarExcecaoQuandoReceitaUsarStatusDeDespesa() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Vendas",
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.PAGO,
            categoria.getId(),
            null
        );

        assertThrows(BusinessRuleException.class, () -> service.criar(request, usuario));
        verify(categoriaRepository, never()).findByIdAndUsuario(any(), any());
        verify(movimentacaoRepository, never()).save(any(Movimentacao.class));
    }

    @Test
    void deveLancarExcecaoQuandoDespesaUsarStatusDeReceita() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Material",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.RECEBIDO,
            categoria.getId(),
            null
        );

        assertThrows(BusinessRuleException.class, () -> service.criar(request, usuario));
        verify(categoriaRepository, never()).findByIdAndUsuario(any(), any());
        verify(movimentacaoRepository, never()).save(any(Movimentacao.class));
    }

    @Test
    void deveLancarExcecaoQuandoMovimentacaoPendenteNaoTemVencimento() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Material",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR,
            categoria.getId(),
            null
        );

        assertThrows(BusinessRuleException.class, () -> service.criar(request, usuario));
        verify(categoriaRepository, never()).findByIdAndUsuario(any(), any());
        verify(movimentacaoRepository, never()).save(any(Movimentacao.class));
    }

    @Test
    void deveLancarExcecaoQuandoCategoriaNaoPertenceAoUsuario() {
        Usuario usuario = novoUsuario();
        UUID categoriaId = UUID.randomUUID();
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            categoriaId,
            null
        );

        when(categoriaRepository.findByIdAndUsuario(categoriaId, usuario))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.criar(request, usuario));
        verify(movimentacaoRepository, never()).save(any(Movimentacao.class));
    }

    @Test
    void deveLancarExcecaoQuandoCategoriaTemTipoDiferenteDaMovimentacao() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Material",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            categoria.getId(),
            null
        );

        when(categoriaRepository.findByIdAndUsuario(categoria.getId(), usuario))
            .thenReturn(Optional.of(categoria));

        assertThrows(BusinessRuleException.class, () -> service.criar(request, usuario));
        verify(movimentacaoRepository, never()).save(any(Movimentacao.class));
    }

    @Test
    void deveLancarExcecaoQuandoCategoriaTemClassificacaoDiferenteDaMovimentacao() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Alimentacao",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO,
            categoria.getId(),
            null
        );

        when(categoriaRepository.findByIdAndUsuario(categoria.getId(), usuario))
            .thenReturn(Optional.of(categoria));

        assertThrows(BusinessRuleException.class, () -> service.criar(request, usuario));
        verify(movimentacaoRepository, never()).save(any(Movimentacao.class));
    }

    @Test
    void deveListarComFiltrosEMapearResponse() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Vendas",
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        Movimentacao movimentacao = novaMovimentacao(
            usuario,
            categoria,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            null
        );
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate dataInicio = LocalDate.of(2026, 4, 1);
        LocalDate dataFim = LocalDate.of(2026, 4, 30);

        when(movimentacaoRepository.buscarComFiltros(
            usuario,
            dataInicio,
            dataFim,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            ClassificacaoFinanceira.EMPRESARIAL,
            categoria.getId(),
            pageable
        )).thenReturn(new PageImpl<>(List.of(movimentacao), pageable, 1));

        Page<MovimentacaoResponse> response = service.listar(
            usuario,
            dataInicio,
            dataFim,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            ClassificacaoFinanceira.EMPRESARIAL,
            categoria.getId(),
            pageable
        );

        assertEquals(1, response.getTotalElements());
        assertEquals(movimentacao.getId(), response.getContent().getFirst().id());
        assertEquals("Vendas", response.getContent().getFirst().categoriaNome());
    }

    @Test
    void deveEditarMovimentacaoDoUsuario() {
        Usuario usuario = novoUsuario();
        Categoria categoriaAntiga = novaCategoria(
            usuario,
            "Material",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        Categoria categoriaNova = novaCategoria(
            usuario,
            "Transporte",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        Movimentacao movimentacao = novaMovimentacao(
            usuario,
            categoriaAntiga,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR,
            LocalDate.of(2026, 4, 30)
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO,
            categoriaNova.getId(),
            null
        );

        when(movimentacaoRepository.findByIdAndUsuario(movimentacao.getId(), usuario))
            .thenReturn(Optional.of(movimentacao));
        when(categoriaRepository.findByIdAndUsuario(categoriaNova.getId(), usuario))
            .thenReturn(Optional.of(categoriaNova));
        when(movimentacaoRepository.save(movimentacao)).thenReturn(movimentacao);

        MovimentacaoResponse response = service.editar(movimentacao.getId(), request, usuario);

        assertEquals(StatusMovimentacao.PAGO, response.status());
        assertEquals(categoriaNova.getId(), response.categoriaId());
        assertEquals("Transporte", response.categoriaNome());
        assertEquals("Venda no cartao", response.descricao());
    }

    @Test
    void deveExcluirApenasMovimentacaoDoUsuario() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Vendas",
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        Movimentacao movimentacao = novaMovimentacao(
            usuario,
            categoria,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            null
        );

        when(movimentacaoRepository.findByIdAndUsuario(movimentacao.getId(), usuario))
            .thenReturn(Optional.of(movimentacao));

        service.excluir(movimentacao.getId(), usuario);

        verify(movimentacaoRepository).delete(movimentacao);
    }

    @Test
    void deveLancarExcecaoQuandoExcluirMovimentacaoDeOutroUsuario() {
        Usuario usuario = novoUsuario();
        UUID movimentacaoId = UUID.randomUUID();

        when(movimentacaoRepository.findByIdAndUsuario(movimentacaoId, usuario))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.excluir(movimentacaoId, usuario));
        verify(movimentacaoRepository, never()).delete(any(Movimentacao.class));
    }

    @Test
    void deveAtualizarStatus() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Material",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        Movimentacao movimentacao = novaMovimentacao(
            usuario,
            categoria,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR,
            LocalDate.of(2026, 4, 30)
        );
        AtualizarStatusMovimentacaoRequest request = new AtualizarStatusMovimentacaoRequest(
            StatusMovimentacao.PAGO
        );

        when(movimentacaoRepository.findByIdAndUsuario(movimentacao.getId(), usuario))
            .thenReturn(Optional.of(movimentacao));
        when(movimentacaoRepository.save(movimentacao)).thenReturn(movimentacao);

        MovimentacaoResponse response = service.atualizarStatus(movimentacao.getId(), request, usuario);

        assertEquals(StatusMovimentacao.PAGO, response.status());
    }

    @Test
    void deveLancarExcecaoAoAtualizarStatusPendenteSemVencimento() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Vendas",
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL
        );
        Movimentacao movimentacao = novaMovimentacao(
            usuario,
            categoria,
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            null
        );
        AtualizarStatusMovimentacaoRequest request = new AtualizarStatusMovimentacaoRequest(
            StatusMovimentacao.A_RECEBER
        );

        when(movimentacaoRepository.findByIdAndUsuario(movimentacao.getId(), usuario))
            .thenReturn(Optional.of(movimentacao));

        assertThrows(
            BusinessRuleException.class,
            () -> service.atualizarStatus(movimentacao.getId(), request, usuario)
        );
        verify(movimentacaoRepository, never()).save(any(Movimentacao.class));
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

    private Categoria novaCategoria(
        Usuario usuario,
        String nome,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao
    ) {
        Categoria categoria = Categoria
            .builder()
            .nome(nome)
            .tipo(tipo)
            .classificacao(classificacao)
            .padrao(false)
            .usuario(usuario)
            .build();
        categoria.setId(UUID.randomUUID());
        return categoria;
    }

    private MovimentacaoRequest novoRequest(
        TipoMovimentacao tipo,
        StatusMovimentacao status,
        UUID categoriaId,
        LocalDate dataVencimento
    ) {
        return new MovimentacaoRequest(
            BigDecimal.valueOf(150),
            "  Venda no cartao  ",
            LocalDate.of(2026, 4, 24),
            dataVencimento,
            tipo,
            ClassificacaoFinanceira.EMPRESARIAL,
            status,
            categoriaId
        );
    }

    private Movimentacao novaMovimentacao(
        Usuario usuario,
        Categoria categoria,
        TipoMovimentacao tipo,
        StatusMovimentacao status,
        LocalDate dataVencimento
    ) {
        Movimentacao movimentacao = Movimentacao
            .builder()
            .valor(BigDecimal.valueOf(150))
            .descricao("Venda no cartao")
            .data(LocalDate.of(2026, 4, 24))
            .dataVencimento(dataVencimento)
            .tipo(tipo)
            .classificacao(ClassificacaoFinanceira.EMPRESARIAL)
            .status(status)
            .categoria(categoria)
            .usuario(usuario)
            .build();
        movimentacao.setId(UUID.randomUUID());
        return movimentacao;
    }
}
