package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.exception.ResourceNotFoundException;
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
            categoria.isPadrao()
        );
    }

    public Page<CategoriaResponse> listar(Usuario usuario, TipoMovimentacao tipo, Pageable pageable) {
        Page<Categoria> categorias;

        if (tipo != null) {
            categorias = repository.findByUsuarioAndTipo(usuario, tipo, pageable);
        } else {
            categorias = repository.findByUsuario(usuario, pageable);
        }

        return categorias.map(this::toResponse);
    }

    @Transactional
    public void criarCategoriasPadrao(Usuario usuario) {
        List<Categoria> categoriasPadrao = List.of(
            novaCategoriaPadrao("Vendas", TipoMovimentacao.RECEITA, usuario),
            novaCategoriaPadrao("Servicos", TipoMovimentacao.RECEITA, usuario),
            novaCategoriaPadrao("Material", TipoMovimentacao.DESPESA, usuario),
            novaCategoriaPadrao("Transporte", TipoMovimentacao.DESPESA, usuario),
            novaCategoriaPadrao("Embalagem", TipoMovimentacao.DESPESA, usuario)
        );

        repository.saveAll(categoriasPadrao);
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request, Usuario usuario) {
        String nome = request.nome().trim();

        boolean existe = repository.existsByUsuarioAndTipoAndNomeIgnoreCase(
            usuario,
            request.tipo(),
            nome
        );

        if (existe) {
            throw new BusinessRuleException("Já existe categoria com este nome para esse tipo");
        }

        Categoria categoria = Categoria
            .builder()
            .nome(nome)
            .tipo(request.tipo())
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

        if (mudouNome || mudouTipo) {
            boolean existe = repository.existsByUsuarioAndTipoAndNomeIgnoreCase(
                usuario,
                request.tipo(),
                nome
            );

            if (existe) {
                throw new BusinessRuleException("Já existe categoria com este nome para esse tipo");
            }
        }

        categoria.setNome(nome);
        categoria.setTipo(request.tipo());

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

    private Categoria novaCategoriaPadrao(String nome, TipoMovimentacao tipo, Usuario usuario) {
        return Categoria
            .builder()
            .nome(nome)
            .tipo(tipo)
            .padrao(true)
            .usuario(usuario)
            .build();
    }
}
