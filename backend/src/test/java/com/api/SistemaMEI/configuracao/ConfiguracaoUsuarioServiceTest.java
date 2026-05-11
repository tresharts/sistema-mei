package com.api.SistemaMEI.configuracao;

import com.api.SistemaMEI.usuario.Usuario;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConfiguracaoUsuarioServiceTest {

    @Mock
    private ConfiguracaoUsuarioRepository repository;

    @InjectMocks
    private ConfiguracaoUsuarioService service;

    @Test
    void deveCriarConfiguracaoPadraoQuandoNaoExistir() {
        Usuario usuario = novoUsuario();

        when(repository.findByUsuario(usuario)).thenReturn(Optional.empty());
        when(repository.save(any(ConfiguracaoUsuario.class))).thenAnswer(invocation -> {
            ConfiguracaoUsuario configuracao = invocation.getArgument(0);
            configuracao.setId(UUID.randomUUID());
            return configuracao;
        });

        ConfiguracaoUsuarioResponse response = service.buscar(usuario);

        assertEquals(new BigDecimal("72.00"), response.valorDas());
        assertTrue(response.lembreteDasAtivo());
        assertEquals(20, response.diaLembreteDas());
        assertFalse(response.resumoDiarioAtivo());
        assertEquals(usuario.getNome(), response.nomeUsuario());
        assertEquals(usuario.getEmail(), response.emailUsuario());
        verify(repository).save(any(ConfiguracaoUsuario.class));
    }

    @Test
    void deveAtualizarConfiguracaoExistente() {
        Usuario usuario = novoUsuario();
        ConfiguracaoUsuario configuracao = novaConfiguracao(usuario);
        ConfiguracaoUsuarioRequest request = new ConfiguracaoUsuarioRequest(
            new BigDecimal("85.5"),
            "  Atelie Florescer  ",
            "  Artesa individual  ",
            false,
            15,
            true
        );

        when(repository.findByUsuario(usuario)).thenReturn(Optional.of(configuracao));
        when(repository.save(configuracao)).thenReturn(configuracao);

        ConfiguracaoUsuarioResponse response = service.atualizar(request, usuario);

        assertEquals(new BigDecimal("85.50"), response.valorDas());
        assertEquals("Atelie Florescer", response.nomeNegocio());
        assertEquals("Artesa individual", response.atividade());
        assertFalse(response.lembreteDasAtivo());
        assertEquals(15, response.diaLembreteDas());
        assertTrue(response.resumoDiarioAtivo());
    }

    @Test
    void deveNormalizarTextosEmBrancoParaNulo() {
        Usuario usuario = novoUsuario();
        ConfiguracaoUsuario configuracao = novaConfiguracao(usuario);
        ConfiguracaoUsuarioRequest request = new ConfiguracaoUsuarioRequest(
            new BigDecimal("72.00"),
            "   ",
            null,
            true,
            20,
            false
        );

        when(repository.findByUsuario(usuario)).thenReturn(Optional.of(configuracao));
        when(repository.save(configuracao)).thenReturn(configuracao);

        ConfiguracaoUsuarioResponse response = service.atualizar(request, usuario);

        assertNull(response.nomeNegocio());
        assertNull(response.atividade());
    }

    private Usuario novoUsuario() {
        Usuario usuario = Usuario
            .builder()
            .nome("Maria")
            .email("maria@teste.com")
            .senha("senha")
            .build();
        usuario.setId(UUID.randomUUID());
        return usuario;
    }

    private ConfiguracaoUsuario novaConfiguracao(Usuario usuario) {
        ConfiguracaoUsuario configuracao = ConfiguracaoUsuario
            .builder()
            .valorDas(new BigDecimal("72.00"))
            .nomeNegocio("Negocio antigo")
            .atividade("Atividade antiga")
            .lembreteDasAtivo(true)
            .diaLembreteDas(20)
            .resumoDiarioAtivo(false)
            .usuario(usuario)
            .build();
        configuracao.setId(UUID.randomUUID());
        return configuracao;
    }
}
