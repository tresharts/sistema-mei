package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.exception.ResourceNotFoundException;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.StreamSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository repository;

    @InjectMocks
    private CategoriaService service;

    @Test
    @SuppressWarnings("unchecked")
    void deveCriarCategoriasPadraoParaNovoUsuario() {
        Usuario usuario = novoUsuario();
        ArgumentCaptor<Iterable<Categoria>> categoriasCaptor = ArgumentCaptor.forClass(Iterable.class);

        service.criarCategoriasPadrao(usuario);

        verify(repository).saveAll(categoriasCaptor.capture());

        List<Categoria> categorias = StreamSupport
            .stream(categoriasCaptor.getValue().spliterator(), false)
            .toList();

        assertEquals(11, categorias.size());
        assertTrue(categorias.stream().allMatch(Categoria::isPadrao));
        assertTrue(categorias.stream().allMatch(categoria -> categoria.getUsuario().equals(usuario)));
        assertEquals(
            List.of(
                "Vendas",
                "Servicos",
                "Material",
                "Transporte",
                "Embalagem",
                "Salario",
                "Freelance",
                "Alimentacao",
                "Moradia",
                "Saude",
                "Lazer"
            ),
            categorias.stream().map(Categoria::getNome).toList()
        );
        assertEquals(5, categorias.stream()
            .filter(categoria -> categoria.getClassificacao() == ClassificacaoFinanceira.EMPRESARIAL)
            .count());
        assertEquals(6, categorias.stream()
            .filter(categoria -> categoria.getClassificacao() == ClassificacaoFinanceira.PESSOAL)
            .count());
    }

    @Test
    @SuppressWarnings("unchecked")
    void naoDeveDuplicarCategoriasPadraoJaExistentes() {
        Usuario usuario = novoUsuario();
        ArgumentCaptor<Iterable<Categoria>> categoriasCaptor = ArgumentCaptor.forClass(Iterable.class);

        when(repository.existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(
            usuario,
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            "Vendas"
        )).thenReturn(true);

        service.criarCategoriasPadrao(usuario);

        verify(repository).saveAll(categoriasCaptor.capture());

        List<Categoria> categorias = StreamSupport
            .stream(categoriasCaptor.getValue().spliterator(), false)
            .toList();

        assertEquals(10, categorias.size());
        assertFalse(categorias.stream().anyMatch(categoria -> categoria.getNome().equals("Vendas")));
    }

    @Test
    void deveCriarCategoriaComPadraoFalse() {
        Usuario usuario = novoUsuario();
        CategoriaRequest request = new CategoriaRequest(
            "  Mercado  ",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL
        );

        when(repository.existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(
            usuario,
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL,
            "Mercado"
        ))
            .thenReturn(false);
        when(repository.save(any(Categoria.class))).thenAnswer(invocation -> {
            Categoria categoria = invocation.getArgument(0);
            categoria.setId(UUID.randomUUID());
            return categoria;
        });

        CategoriaResponse response = service.criar(request, usuario);

        assertNotNull(response.id());
        assertEquals("Mercado", response.nome());
        assertEquals(TipoMovimentacao.DESPESA, response.tipo());
        assertEquals(ClassificacaoFinanceira.PESSOAL, response.classificacao());
        assertFalse(response.padrao());
    }

    @Test
    void deveLancarExcecaoQuandoCriarCategoriaDuplicada() {
        Usuario usuario = novoUsuario();
        CategoriaRequest request = new CategoriaRequest(
            "Mercado",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL
        );

        when(repository.existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(
            usuario,
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL,
            "Mercado"
        ))
            .thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> service.criar(request, usuario));
        verify(repository, never()).save(any(Categoria.class));
    }

    @Test
    void naoDeveValidarDuplicidadeQuandoNomeETipoNaoMudamNaEdicao() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Mercado",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL,
            false
        );
        CategoriaRequest request = new CategoriaRequest(
            "  mercado  ",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL
        );

        when(repository.findByIdAndUsuario(categoria.getId(), usuario)).thenReturn(Optional.of(categoria));
        when(repository.save(categoria)).thenReturn(categoria);

        CategoriaResponse response = service.editar(categoria.getId(), request, usuario);

        assertEquals("mercado", response.nome());
        verify(repository, never()).existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(any(), any(), any(), any());
    }

    @Test
    void deveLancarExcecaoQuandoEditarCategoriaComNomeDuplicado() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Mercado",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL,
            false
        );
        CategoriaRequest request = new CategoriaRequest(
            "Alimentacao",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL
        );

        when(repository.findByIdAndUsuario(categoria.getId(), usuario)).thenReturn(Optional.of(categoria));
        when(repository.existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(
            usuario,
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.PESSOAL,
            "Alimentacao"
        ))
            .thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> service.editar(categoria.getId(), request, usuario));
        verify(repository, never()).save(any(Categoria.class));
    }

    @Test
    void deveLancarExcecaoQuandoExcluirCategoriaPadrao() {
        Usuario usuario = novoUsuario();
        Categoria categoria = novaCategoria(
            usuario,
            "Material",
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL,
            true
        );

        when(repository.findByIdAndUsuario(categoria.getId(), usuario)).thenReturn(Optional.of(categoria));

        assertThrows(BusinessRuleException.class, () -> service.excluir(categoria.getId(), usuario));
        verify(repository, never()).delete(any(Categoria.class));
    }

    @Test
    void deveLancarExcecaoQuandoCategoriaNaoExisteParaExclusao() {
        Usuario usuario = novoUsuario();
        UUID categoriaId = UUID.randomUUID();

        when(repository.findByIdAndUsuario(categoriaId, usuario)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.excluir(categoriaId, usuario));
        verify(repository, never()).delete(any(Categoria.class));
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
        ClassificacaoFinanceira classificacao,
        boolean padrao
    ) {
        Categoria categoria = Categoria
            .builder()
            .nome(nome)
            .tipo(tipo)
            .classificacao(classificacao)
            .padrao(padrao)
            .usuario(usuario)
            .build();
        categoria.setId(UUID.randomUUID());
        return categoria;
    }
}
