package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    @Query("""
        SELECT c
        FROM Categoria c
        WHERE c.usuario = :usuario
        AND (:tipo IS NULL OR c.tipo = :tipo)
        AND (:classificacao IS NULL OR c.classificacao = :classificacao)
    """)
    Page<Categoria> buscarComFiltros(
        Usuario usuario,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao,
        Pageable pageable
    );

    Page<Categoria> findByUsuario(Usuario usuario, Pageable pageable);
    Optional<Categoria> findByIdAndUsuario(UUID id, Usuario usuario);
    boolean existsByUsuarioAndTipoAndClassificacaoAndNomeIgnoreCase(
        Usuario usuario,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao,
        String nome
    );
}
