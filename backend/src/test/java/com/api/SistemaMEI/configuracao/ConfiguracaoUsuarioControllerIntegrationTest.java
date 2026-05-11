package com.api.SistemaMEI.configuracao;

import com.api.SistemaMEI.IntegrationTestBase;
import com.api.SistemaMEI.auth.RefreshTokenRepository;
import com.api.SistemaMEI.auth.TokenService;
import com.api.SistemaMEI.categoria.CategoriaRepository;
import com.api.SistemaMEI.movimentacao.MovimentacaoRepository;
import com.api.SistemaMEI.usuario.Usuario;
import com.api.SistemaMEI.usuario.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ConfiguracaoUsuarioControllerIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ConfiguracaoUsuarioRepository configuracaoUsuarioRepository;

    @Autowired
    private MovimentacaoRepository movimentacaoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenService tokenService;

    @BeforeEach
    void limparBanco() {
        movimentacaoRepository.deleteAll();
        configuracaoUsuarioRepository.deleteAll();
        categoriaRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void deveCriarConfiguracaoPadraoAoBuscarPelaPrimeiraVez() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");

        mockMvc.perform(get("/configuracoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nomeUsuario").value("Maria"))
            .andExpect(jsonPath("$.emailUsuario").value("maria@teste.com"))
            .andExpect(jsonPath("$.valorDas").value(72.00))
            .andExpect(jsonPath("$.lembreteDasAtivo").value(true))
            .andExpect(jsonPath("$.diaLembreteDas").value(20))
            .andExpect(jsonPath("$.resumoDiarioAtivo").value(false));

        assertEquals(1, configuracaoUsuarioRepository.count());
    }

    @Test
    void deveAtualizarConfiguracaoDoUsuarioAutenticado() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        ConfiguracaoUsuarioRequest request = new ConfiguracaoUsuarioRequest(
            new BigDecimal("89.90"),
            "  Atelie Florescer  ",
            "  Artesa individual  ",
            false,
            12,
            true
        );

        mockMvc.perform(put("/configuracoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.valorDas").value(89.90))
            .andExpect(jsonPath("$.nomeNegocio").value("Atelie Florescer"))
            .andExpect(jsonPath("$.atividade").value("Artesa individual"))
            .andExpect(jsonPath("$.lembreteDasAtivo").value(false))
            .andExpect(jsonPath("$.diaLembreteDas").value(12))
            .andExpect(jsonPath("$.resumoDiarioAtivo").value(true));

        ConfiguracaoUsuario configuracao = configuracaoUsuarioRepository
            .findByUsuario(usuario)
            .orElseThrow();

        assertEquals(new BigDecimal("89.90"), configuracao.getValorDas());
        assertEquals("Atelie Florescer", configuracao.getNomeNegocio());
        assertEquals("Artesa individual", configuracao.getAtividade());
        assertFalse(configuracao.isLembreteDasAtivo());
        assertEquals(12, configuracao.getDiaLembreteDas());
        assertTrue(configuracao.isResumoDiarioAtivo());
    }

    @Test
    void deveRetornar400QuandoAtualizarComDadosInvalidos() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        String request = """
            {
              "valorDas": -1,
              "nomeNegocio": "%s",
              "atividade": "Atividade",
              "lembreteDasAtivo": null,
              "diaLembreteDas": 0,
              "resumoDiarioAtivo": true
            }
            """.formatted("a".repeat(121));

        mockMvc.perform(put("/configuracoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Dados inválidos"))
            .andExpect(jsonPath("$.erros", hasSize(4)));
    }

    @Test
    void deveRedirecionarParaLoginGoogleQuandoBuscarConfiguracoesSemAutenticacao() throws Exception {
        mockMvc.perform(get("/configuracoes"))
            .andExpect(status().is3xxRedirection())
            .andExpect(header().string(HttpHeaders.LOCATION, containsString("/oauth2/authorization/google")));
    }

    private Usuario salvarUsuario(String nome, String email) {
        Usuario usuario = Usuario
            .builder()
            .nome(nome)
            .email(email)
            .senha("senha")
            .build();

        return usuarioRepository.save(usuario);
    }

    private String bearerToken(Usuario usuario) {
        return "Bearer " + tokenService.generateAcessToken(usuario);
    }
}
