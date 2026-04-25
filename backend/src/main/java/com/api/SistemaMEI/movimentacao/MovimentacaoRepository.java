package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}
