package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.categoria.CategoriaService;
import com.api.SistemaMEI.exception.BusinessRuleException;
import com.api.SistemaMEI.usuario.Usuario;
import com.api.SistemaMEI.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaService categoriaService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Email already in use");
        }

        Usuario usuario = Usuario
            .builder()
            .nome(request.nome())
            .email(request.email())
            .senha(passwordEncoder.encode(request.senha()))
            .build();

        Usuario usuarioSalvo = userRepository.save(usuario);
        categoriaService.criarCategoriasPadrao(usuarioSalvo);

        String acessToken = tokenService.generateAcessToken(usuarioSalvo);
        RefreshToken refreshToken = tokenService.generateRefreshToken(usuarioSalvo);
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
            acessToken,
            refreshToken.getToken(),
            usuarioSalvo.getNome(),
            usuarioSalvo.getEmail()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = userRepository
            .findByEmail(request.email())
            .orElseThrow(() -> new BusinessRuleException("Invalid email or password"));

        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new BusinessRuleException("Invalid email or password");
        }

        String acessToken = tokenService.generateAcessToken(usuario);
        RefreshToken refreshToken = tokenService.generateRefreshToken(usuario);
        refreshTokenRepository.save(refreshToken);
        return new AuthResponse(
            acessToken,
            refreshToken.getToken(),
            usuario.getNome(),
            usuario.getEmail()
        );
    }

    @Transactional
    public AuthResponse loginWithGoogle(String email, String nome) {
        Usuario usuario = userRepository
            .findByEmail(email)
            .orElseGet(() -> {
                Usuario novoUsuario = Usuario
                    .builder()
                    .nome(nome)
                    .email(email)
                    .senha(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .build();

                Usuario usuarioSalvo = userRepository.save(novoUsuario);
                categoriaService.criarCategoriasPadrao(usuarioSalvo);
                return usuarioSalvo;
            });


        String acessToken = tokenService.generateAcessToken(usuario);
        RefreshToken refreshToken = tokenService.generateRefreshToken(usuario);
        refreshTokenRepository.save(refreshToken);
        return new AuthResponse(
                acessToken,
                refreshToken.getToken(),
                usuario.getNome(),
                usuario.getEmail()
        );
    }

    @Transactional
    public AuthResponse refresh(String token) {
        RefreshToken refreshToken = refreshTokenRepository
            .findByToken(token)
            .orElseThrow(() -> new BusinessRuleException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new BusinessRuleException("Token expired, please login again");
        }

        Usuario usuario = refreshToken.getUsuario();
        String newAcessToken = tokenService.generateAcessToken(usuario);
        RefreshToken newRefreshToken = tokenService.generateRefreshToken(usuario);

        refreshTokenRepository.delete(refreshToken);
        refreshTokenRepository.save(newRefreshToken);

        return new AuthResponse(
            newAcessToken,
            newRefreshToken.getToken(),
            usuario.getNome(),
            usuario.getEmail()
        );
    }

    @Transactional
    public void logout(Usuario usuario) {
        refreshTokenRepository.deleteByUsuario(usuario);
    }

    @Transactional
    public void logoutByRefreshToken(String token) {
        if (!StringUtils.hasText(token)) {
            return;
        }

        refreshTokenRepository
            .findByToken(token)
            .ifPresent(refreshTokenRepository::delete);
    }
}
