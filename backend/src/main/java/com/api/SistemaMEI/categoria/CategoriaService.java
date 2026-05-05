package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.exception.ResourceNotFoundException;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository repository;

    private CategoriaResponse toResponse(Categoria categoria) {
        return new CategoriaResponse(
            categoria.getId(),
            categoria.getNome(),
            categoria.getTipo(),
            categoria.getClassificacao(),
            categoria.isPadrao()
        );
    }

    public Page<CategoriaResponse> listar(
        Usuario usuario,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao,
        Pageable pageable
    ) {
        return repository
            .buscarComFiltros(usuario, tipo, classificacao, pageable)
            .map(this::toResponse);
    }

    @Transactional
    public void criarCategoriasPadrao(Usuario usuario) {
        List<Categoria> categoriasPadrao = List.of(
            novaCategoriaPadrao("Vendas", TipoMovimentacao.RECEITA, ClassificacaoFinanceira.EMPRESARIAL, usuario),
            novaCategoriaPadrao("Servicos", TipoMovimentacao.RECEITA, ClassificacaoFinanceira.EMPRESARIAL, usuario),
            novaCategoriaPadrao("Material", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.EMPRESARIAL, usuario),
            novaCategoriaPadrao("Transporte", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.EMPRESARIAL, usuario),
            novaCategoriaPadrao("Embalagem", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.EMPRESARIAL, usuario),
            novaCategoriaPadrao("Salario", TipoMovimentacao.RECEITA, ClassificacaoFinanceira.PESSOAL, usuario),
            novaCategoriaPadrao("Freelance", TipoMovimentacao.RECEITA, ClassificacaoFinanceira.PESSOAL, usuario),
            novaCategoriaPadrao("Alimentacao", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, usuario),
            novaCategoriaPadrao("Moradia", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, usuario),
            novaCategoriaPadrao("Saude", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, usuario),
            novaCategoriaPadrao("Lazer", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, usuario)
        );

        List<Categoria> categoriasNovas = categoriasPadrao
            .stream()
            .filter(categoria -> !repository.existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(
                usuario,
                categoria.getTipo(),
                categoria.getClassificacao(),
                categoria.getNome()
            ))
            .toList();

        repository.saveAll(categoriasNovas);
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request, Usuario usuario) {
        String nome = request.nome().trim();

        boolean existe = repository.existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(
            usuario,
            request.tipo(),
            request.classificacao(),
            nome
        );

        if (existe) {
            throw new BusinessRuleException("Já existe categoria com este nome para esse tipo e classificação");
        }

        Categoria categoria = Categoria
            .builder()
            .nome(nome)
            .tipo(request.tipo())
            .classificacao(request.classificacao())
            .padrao(false)
            .usuario(usuario)
            .build();

        Categoria categoriaSalva = repository.save(categoria);
        return toResponse(categoriaSalva);
    }

    @Transactional
    public CategoriaResponse editar(UUID id, CategoriaRequest request, Usuario usuario) {
        Categoria categoria = repository
            .findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        String nome = request.nome().trim();

        boolean mudouNome = !categoria.getNome().equalsIgnoreCase(nome);
        boolean mudouTipo = categoria.getTipo() != request.tipo();
        boolean mudouClassificacao = categoria.getClassificacao() != request.classificacao();

        if (mudouNome || mudouTipo || mudouClassificacao) {
            boolean existe = repository.existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(
                usuario,
                request.tipo(),
                request.classificacao(),
                nome
            );

            if (existe) {
                throw new BusinessRuleException("Já existe categoria com este nome para esse tipo e classificação");
            }
        }

        categoria.setNome(nome);
        categoria.setTipo(request.tipo());
        categoria.setClassificacao(request.classificacao());

        Categoria categoriaSalva = repository.save(categoria);
        return toResponse(categoriaSalva);
    }

    @Transactional
    public void excluir(UUID id, Usuario usuario) {
        Categoria categoria = repository
            .findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        if (categoria.isPadrao()) {
            throw new BusinessRuleException("Categoria padrão não pode ser excluída");
        }

        repository.delete(categoria);
    }

    private Categoria novaCategoriaPadrao(
        String nome,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao,
        Usuario usuario
    ) {
        return Categoria
            .builder()
            .nome(nome)
            .tipo(tipo)
            .classificacao(classificacao)
            .padrao(true)
            .usuario(usuario)
            .build();
    }
}
