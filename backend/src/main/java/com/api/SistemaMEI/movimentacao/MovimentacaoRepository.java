package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, UUID> {

    Optional<Movimentacao> findByIdAndUsuario(UUID id, Usuario usuario);

    @Query("""
        SELECT m
        FROM Movimentacao m
        WHERE m.usuario = :usuario
        AND (:dataInicio IS NULL OR m.data >= :dataInicio)
        AND (:dataFim IS NULL OR m.data <= :dataFim)
        AND (:tipo IS NULL OR m.tipo = :tipo)
        AND (:status IS NULL OR m.status = :status)
        AND (:classificacao IS NULL OR m.classificacao = :classificacao)
        AND (:categoriaId IS NULL OR m.categoria.id = :categoriaId)
    """)
    Page<Movimentacao> buscarComFiltros(
        Usuario usuario,
        LocalDate dataInicio,
        LocalDate dataFim,
        TipoMovimentacao tipo,
        StatusMovimentacao status,
        ClassificacaoFinanceira classificacao,
        UUID categoriaId,
        Pageable pageable
    );

    @Query("""
        SELECT COALESCE(SUM(m.valor), 0)
        FROM Movimentacao m
        WHERE m.usuario = :usuario
        AND m.tipo = :tipo
        AND m.status = :status
        AND (:classificacao IS NULL OR m.classificacao = :classificacao)
    """)
    BigDecimal somaPorUsuarioTipoStatusEClassificacao(
        @Param("usuario") Usuario usuario,
        @Param("tipo") TipoMovimentacao tipo,
        @Param("status") StatusMovimentacao status,
        @Param("classificacao") ClassificacaoFinanceira classificacao
    );

    @Query("""
        SELECT COALESCE(SUM(m.valor), 0)
        FROM Movimentacao m
        WHERE m.usuario = :usuario
        AND m.tipo = :tipo
        AND m.status = :status
        AND (:classificacao IS NULL OR m.classificacao = :classificacao)
        AND m.data >= :dataInicio
        AND m.data <= :dataFim
    """)
    BigDecimal somaPorUsuarioTipoStatusClassificacaoEPeriodo(
        @Param("usuario") Usuario usuario,
        @Param("tipo") TipoMovimentacao tipo,
        @Param("status") StatusMovimentacao status,
        @Param("classificacao") ClassificacaoFinanceira classificacao,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim
    );

    @Query("""
        SELECT COALESCE(SUM(m.valor), 0)
        FROM Movimentacao m
        WHERE m.usuario = :usuario
        AND m.tipo = :tipo
        AND m.classificacao = :classificacao
        AND m.status = :status
        AND m.data >= :dataInicio
        AND m.data <= :dataFim
    """)
    BigDecimal somaPorUsuarioTipoClassificacaoStatusEPeriodo(
        @Param("usuario") Usuario usuario,
        @Param("tipo") TipoMovimentacao tipo,
        @Param("classificacao") ClassificacaoFinanceira classificacao,
        @Param("status") StatusMovimentacao status,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim
    );

    @Query("""
        SELECT COUNT(m)
        FROM Movimentacao m
        WHERE m.usuario = :usuario
        AND m.tipo = :tipo
        AND m.status = :status
        AND (:classificacao IS NULL OR m.classificacao = :classificacao)
        AND m.dataVencimento < :dataVencimento
    """)
    long contarAtrasadasPorClassificacao(
        Usuario usuario,
        TipoMovimentacao tipo,
        StatusMovimentacao status,
        ClassificacaoFinanceira classificacao,
        LocalDate dataVencimento
    );

    @Query("""
        SELECT m
        FROM Movimentacao m
        WHERE m.usuario = :usuario
        AND m.tipo = :tipo
        AND m.status = :status
        AND (:classificacao IS NULL OR m.classificacao = :classificacao)
        AND m.dataVencimento < :dataVencimento
    """)
    Page<Movimentacao> buscarAtrasadasPorClassificacao(
        Usuario usuario,
        TipoMovimentacao tipo,
        StatusMovimentacao status,
        ClassificacaoFinanceira classificacao,
        LocalDate dataVencimento,
        Pageable pageable
    );
}
