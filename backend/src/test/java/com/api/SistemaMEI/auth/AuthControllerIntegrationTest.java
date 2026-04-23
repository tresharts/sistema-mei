package com.api.SistemaMEI.auth;

import com.api.SistemaMEI.IntegrationTestBase;
import com.api.SistemaMEI.categoria.CategoriaRepository;
import com.api.SistemaMEI.usuario.Usuario;
import com.api.SistemaMEI.usuario.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "AUTH_REFRESH_COOKIE_SECURE=true",
    "AUTH_REFRESH_COOKIE_SAME_SITE=None",
    "AUTH_REFRESH_COOKIE_PATH=/api/auth",
    "FRONTEND_URL=https://sistemamei.vercel.app",
    "CORS_ORIGIN=https://sistemamei.vercel.app"
})
class AuthControllerIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    @BeforeEach
    void limparBanco() {
        refreshTokenRepository.deleteAll();
        categoriaRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void deveRegistrarUsuarioERetornarCookieDeRefreshCompativelComProxyPublicado() throws Exception {
        RegisterRequest request = new RegisterRequest("Maria", "maria@teste.com", "senha123");

        MvcResult result = mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.acessToken").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").doesNotExist())
            .andExpect(jsonPath("$.nome").value("Maria"))
            .andReturn();

        String setCookie = refreshTokenCookie(result);

        assertCookieCompativelComProxy(setCookie);
        assertTrue(refreshTokenRepository.count() > 0);
    }

    @Test
    void deveLogarEEmitirCookieDeRefreshNoPathPublicado() throws Exception {
        salvarUsuario("Maria", "maria@teste.com", "senha123");
        LoginRequest request = new LoginRequest("maria@teste.com", "senha123");

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.acessToken").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").doesNotExist())
            .andReturn();

        String setCookie = refreshTokenCookie(result);
        assertCookieCompativelComProxy(setCookie);
    }

    @Test
    void deveRetornar422AoLogarComCredenciaisInvalidas() throws Exception {
        salvarUsuario("Maria", "maria@teste.com", "senha123");
        LoginRequest request = new LoginRequest("maria@teste.com", "senha-errada");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.detail").value("Invalid email or password"));
    }

    @Test
    void deveRotacionarRefreshTokenQuandoRecebeCookieNoPathPublicado() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com", "senha123");
        RefreshToken tokenAtual = refreshTokenRepository.save(tokenService.generateRefreshToken(usuario));

        MvcResult result = mockMvc.perform(post("/auth/refresh")
                .cookie(new Cookie("refreshToken", tokenAtual.getToken())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.acessToken").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").doesNotExist())
            .andReturn();

        String setCookie = refreshTokenCookie(result);
        String novoToken = extractCookieValue(setCookie);

        assertCookieCompativelComProxy(setCookie);
        assertNotEquals(tokenAtual.getToken(), novoToken);
        assertFalse(refreshTokenRepository.findByToken(tokenAtual.getToken()).isPresent());
        assertTrue(refreshTokenRepository.findByToken(novoToken).isPresent());
        assertEquals(1, refreshTokenRepository.count());
    }

    @Test
    void deveRetornar422QuandoRefreshNaoRecebeCookieNemBody() throws Exception {
        mockMvc.perform(post("/auth/refresh"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.detail").value("Refresh token is required"));
    }

    @Test
    void deveRetornar422QuandoRegistrarEmailDuplicado() throws Exception {
        salvarUsuario("Maria", "maria@teste.com", "senha123");
        RegisterRequest request = new RegisterRequest("Maria", "maria@teste.com", "senha123");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.detail").value("Email already in use"));
    }

    @Test
    void deveRetornar422QuandoRefreshRecebeTokenInvalidoNoBody() throws Exception {
        String body = """
            {
              "refreshToken": "token-invalido"
            }
            """;

        mockMvc.perform(post("/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.detail").value("Invalid refresh token"));
    }

    @Test
    void deveRetornar422QuandoRefreshRecebeTokenExpiradoNoCookie() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com", "senha123");
        RefreshToken expirado = RefreshToken.builder()
            .token("refresh-expirado")
            .usuario(usuario)
            .expiresAt(java.time.Instant.now().minusSeconds(60))
            .build();
        refreshTokenRepository.save(expirado);

        mockMvc.perform(post("/auth/refresh")
                .cookie(new Cookie("refreshToken", expirado.getToken())))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.detail").value("Token expired, please login again"));
    }

    @Test
    void devePriorizarRefreshTokenEnviadoNoBody() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com", "senha123");
        RefreshToken tokenNoBody = refreshTokenRepository.save(tokenService.generateRefreshToken(usuario));
        RefreshToken tokenNoCookie = refreshTokenRepository.save(tokenService.generateRefreshToken(usuario));

        String body = """
            {
              "refreshToken": "%s"
            }
            """.formatted(tokenNoBody.getToken());

        MvcResult result = mockMvc.perform(post("/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .cookie(new Cookie("refreshToken", tokenNoCookie.getToken())))
            .andExpect(status().isOk())
            .andReturn();

        String novoToken = extractCookieValue(refreshTokenCookie(result));

        assertFalse(refreshTokenRepository.findByToken(tokenNoBody.getToken()).isPresent());
        assertTrue(refreshTokenRepository.findByToken(tokenNoCookie.getToken()).isPresent());
        assertTrue(refreshTokenRepository.findByToken(novoToken).isPresent());
    }

    @Test
    void deveFazerLogoutELimparCookieNoMesmoPathPublicado() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com", "senha123");
        RefreshToken refreshToken = refreshTokenRepository.save(tokenService.generateRefreshToken(usuario));

        MvcResult result = mockMvc.perform(delete("/auth/logout")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .cookie(new Cookie("refreshToken", refreshToken.getToken())))
            .andExpect(status().isNoContent())
            .andReturn();

        String setCookie = refreshTokenCookie(result);

        assertTrue(setCookie.contains("refreshToken="));
        assertTrue(setCookie.contains("Path=/api/auth"));
        assertTrue(setCookie.contains("Max-Age=0"));
        assertTrue(setCookie.contains("Secure"));
        assertTrue(setCookie.contains("HttpOnly"));
        assertTrue(setCookie.contains("SameSite=None"));
        assertEquals(0, refreshTokenRepository.count());
    }

    @Test
    void devePermitirLogoutSemAutenticacaoNemCookie() throws Exception {
        MvcResult result = mockMvc.perform(delete("/auth/logout"))
            .andExpect(status().isNoContent())
            .andReturn();

        String setCookie = refreshTokenCookie(result);

        assertTrue(setCookie.contains("Path=/api/auth"));
        assertTrue(setCookie.contains("Max-Age=0"));
    }

    private Usuario salvarUsuario(String nome, String email, String senha) {
        Usuario usuario = Usuario
            .builder()
            .nome(nome)
            .email(email)
            .senha(passwordEncoder.encode(senha))
            .build();

        return usuarioRepository.save(usuario);
    }

    private String bearerToken(Usuario usuario) {
        return "Bearer " + tokenService.generateAcessToken(usuario);
    }

    private String refreshTokenCookie(MvcResult result) {
        return result.getResponse()
            .getHeaders(HttpHeaders.SET_COOKIE)
            .stream()
            .filter(cookie -> cookie.startsWith("refreshToken="))
            .findFirst()
            .orElseThrow();
    }

    private String extractCookieValue(String setCookie) {
        String prefix = "refreshToken=";
        int start = setCookie.indexOf(prefix) + prefix.length();
        int end = setCookie.indexOf(';', start);
        return setCookie.substring(start, end);
    }

    private void assertCookieCompativelComProxy(String setCookie) {
        assertTrue(setCookie.startsWith("refreshToken="));
        assertTrue(setCookie.contains("Path=/api/auth"));
        assertTrue(setCookie.contains("Secure"));
        assertTrue(setCookie.contains("HttpOnly"));
        assertTrue(setCookie.contains("SameSite=None"));
    }
}
