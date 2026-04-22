package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.categoria.CategoriaService;
import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.usuario.Usuario;
import com.api.SistemaMEI.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CategoriaService categoriaService;

    @InjectMocks
    private AuthService service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
            .nome("Maria")
            .email("maria@teste.com")
            .senha("senha-hash")
            .build();
        usuario.setId(UUID.randomUUID());
    }

    @Test
    void deveRegistrarUsuarioNovoECriarCategoriasPadrao() {
        RegisterRequest request = new RegisterRequest("Maria", "maria@teste.com", "senha123");
        RefreshToken refreshToken = novoRefreshToken("refresh-novo", usuario, false);

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.senha())).thenReturn("senha-hash");
        when(userRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario salvo = invocation.getArgument(0);
            salvo.setId(usuario.getId());
            return salvo;
        });
        when(tokenService.generateAcessToken(any(Usuario.class))).thenReturn("access-token");
        when(tokenService.generateRefreshToken(any(Usuario.class))).thenReturn(refreshToken);

        AuthResponse response = service.register(request);

        assertEquals("access-token", response.acessToken());
        assertEquals("refresh-novo", response.refreshToken());
        assertEquals("Maria", response.nome());
        assertEquals("maria@teste.com", response.email());
        verify(categoriaService).criarCategoriasPadrao(any(Usuario.class));
        verify(refreshTokenRepository).save(refreshToken);
    }

    @Test
    void deveLancarExcecaoAoRegistrarEmailDuplicado() {
        RegisterRequest request = new RegisterRequest("Maria", "maria@teste.com", "senha123");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> service.register(request));

        assertEquals("Email already in use", ex.getMessage());
        verify(userRepository, never()).save(any());
        verify(categoriaService, never()).criarCategoriasPadrao(any());
    }

    @Test
    void deveLogarComCredenciaisValidas() {
        LoginRequest request = new LoginRequest("maria@teste.com", "senha123");
        RefreshToken refreshToken = novoRefreshToken("refresh-login", usuario, false);

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(request.senha(), usuario.getSenha())).thenReturn(true);
        when(tokenService.generateAcessToken(usuario)).thenReturn("access-token");
        when(tokenService.generateRefreshToken(usuario)).thenReturn(refreshToken);

        AuthResponse response = service.login(request);

        assertEquals("access-token", response.acessToken());
        assertEquals("refresh-login", response.refreshToken());
        verify(refreshTokenRepository).save(refreshToken);
    }

    @Test
    void deveLancarExcecaoAoLogarComSenhaInvalida() {
        LoginRequest request = new LoginRequest("maria@teste.com", "senha-errada");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(request.senha(), usuario.getSenha())).thenReturn(false);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> service.login(request));

        assertEquals("Invalid email or password", ex.getMessage());
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void deveRotacionarRefreshTokenQuandoTokenValido() {
        RefreshToken tokenAtual = novoRefreshToken("refresh-antigo", usuario, false);
        RefreshToken novoToken = novoRefreshToken("refresh-novo", usuario, false);

        when(refreshTokenRepository.findByToken("refresh-antigo")).thenReturn(Optional.of(tokenAtual));
        when(tokenService.generateAcessToken(usuario)).thenReturn("access-token-novo");
        when(tokenService.generateRefreshToken(usuario)).thenReturn(novoToken);

        AuthResponse response = service.refresh("refresh-antigo");

        assertEquals("access-token-novo", response.acessToken());
        assertEquals("refresh-novo", response.refreshToken());
        verify(refreshTokenRepository).delete(tokenAtual);
        verify(refreshTokenRepository).save(novoToken);
    }

    @Test
    void deveRemoverTokenExpiradoEAvisarNovoLoginNoRefresh() {
        RefreshToken expirado = novoRefreshToken("refresh-expirado", usuario, true);
        when(refreshTokenRepository.findByToken("refresh-expirado")).thenReturn(Optional.of(expirado));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> service.refresh("refresh-expirado"));

        assertEquals("Token expired, please login again", ex.getMessage());
        verify(refreshTokenRepository).delete(expirado);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void deveCriarUsuarioNoLoginComGoogleQuandoNaoExistir() {
        RefreshToken refreshToken = novoRefreshToken("refresh-google", usuario, false);

        when(userRepository.findByEmail("maria@teste.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("senha-google");
        when(userRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario salvo = invocation.getArgument(0);
            salvo.setId(usuario.getId());
            return salvo;
        });
        when(tokenService.generateAcessToken(any(Usuario.class))).thenReturn("access-google");
        when(tokenService.generateRefreshToken(any(Usuario.class))).thenReturn(refreshToken);

        AuthResponse response = service.loginWithGoogle("maria@teste.com", "Maria");

        assertEquals("access-google", response.acessToken());
        assertEquals("refresh-google", response.refreshToken());
        verify(userRepository).save(any(Usuario.class));
        verify(categoriaService).criarCategoriasPadrao(any(Usuario.class));
        verify(refreshTokenRepository).save(refreshToken);
    }

    @Test
    void naoDeveCriarUsuarioNovamenteNoLoginComGoogleQuandoJaExistir() {
        RefreshToken refreshToken = novoRefreshToken("refresh-google", usuario, false);

        when(userRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(tokenService.generateAcessToken(usuario)).thenReturn("access-google");
        when(tokenService.generateRefreshToken(usuario)).thenReturn(refreshToken);

        AuthResponse response = service.loginWithGoogle(usuario.getEmail(), usuario.getNome());

        assertEquals("access-google", response.acessToken());
        assertEquals("refresh-google", response.refreshToken());
        verify(userRepository, never()).save(any());
        verify(categoriaService, never()).criarCategoriasPadrao(any());
        verify(refreshTokenRepository).save(refreshToken);
    }

    @Test
    void deveFazerLogoutPorUsuario() {
        service.logout(usuario);

        verify(refreshTokenRepository).deleteByUsuario(usuario);
    }

    @Test
    void deveFazerLogoutPorRefreshTokenQuandoTokenExiste() {
        RefreshToken refreshToken = novoRefreshToken("refresh-logout", usuario, false);
        when(refreshTokenRepository.findByToken("refresh-logout")).thenReturn(Optional.of(refreshToken));

        service.logoutByRefreshToken("refresh-logout");

        verify(refreshTokenRepository).findByToken("refresh-logout");
        verify(refreshTokenRepository).delete(refreshToken);
    }

    @Test
    void deveIgnorarLogoutPorRefreshTokenQuandoTokenForVazio() {
        service.logoutByRefreshToken(" ");
        service.logoutByRefreshToken(null);

        verify(refreshTokenRepository, never()).findByToken(any());
        verify(refreshTokenRepository, never()).delete(any());
    }

    private RefreshToken novoRefreshToken(String token, Usuario dono, boolean expirado) {
        return RefreshToken.builder()
            .token(token)
            .usuario(dono)
            .expiresAt(expirado
                ? Instant.now().minus(1, ChronoUnit.DAYS)
                : Instant.now().plus(30, ChronoUnit.DAYS))
            .build();
    }
}
