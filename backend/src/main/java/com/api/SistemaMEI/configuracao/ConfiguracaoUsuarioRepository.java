package com.api.SistemaMEI.configuracao;

import com.api.SistemaMEI.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConfiguracaoUsuarioRepository extends JpaRepository<ConfiguracaoUsuario, UUID> {

    Optional<ConfiguracaoUsuario> findByUsuario(Usuario usuario);
}
