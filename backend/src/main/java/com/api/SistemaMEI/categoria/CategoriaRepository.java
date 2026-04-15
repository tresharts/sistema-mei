package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.usuario.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    Page<Categoria> findByUsuarioAndTipo(Usuario usuario, TipoMovimentacao tipo, Pageable pageable);
    Page<Categoria> findByUsuario(Usuario usuario, Pageable pageable);
    Optional<Categoria> findByIdAndUsuario(UUID id, Usuario usuario);
    boolean existsByUsuarioAndTipoAndNomeIgnoreCase(Usuario usuario, TipoMovimentacao tipo, String nome);
}
