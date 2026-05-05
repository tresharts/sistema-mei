package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.IntegrationTestBase;
import com.api.SistemaMEI.auth.TokenService;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
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

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class CategoriaControllerIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenService tokenService;

    @BeforeEach
    void limparBanco() {
        categoriaRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void deveCriarCategoriaParaUsuarioAutenticado() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        CategoriaRequest request = novaRequest("Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL);

        mockMvc.perform(post("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.nome").value("Mercado"))
            .andExpect(jsonPath("$.tipo").value("DESPESA"))
            .andExpect(jsonPath("$.classificacao").value("PESSOAL"))
            .andExpect(jsonPath("$.padrao").value(false));
    }

    @Test
    void deveRetornar422QuandoCriarCategoriaDuplicada() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);

        CategoriaRequest request = novaRequest("mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL);

        mockMvc.perform(post("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.detail").value("Já existe categoria com este nome para esse tipo e classificação"));
    }

    @Test
    void deveRetornar400QuandoCriarCategoriaInvalida() throws Exception {
        String request = """
	            {
	              "nome": "   ",
	              "tipo": null,
	              "classificacao": null
	            }
	            """;

        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");

        mockMvc.perform(post("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.title").value("Dados inválidos"))
            .andExpect(jsonPath("$.erros", hasSize(3)));
    }

    @Test
    void deveListarSomenteCategoriasDoUsuarioAutenticado() throws Exception {
        Usuario usuarioA = salvarUsuario("Maria", "maria@teste.com");
        Usuario usuarioB = salvarUsuario("Joao", "joao@teste.com");

        salvarCategoria(usuarioA, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);
        salvarCategoria(usuarioB, "Frete", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.EMPRESARIAL, false);

        mockMvc.perform(get("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuarioA)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].nome").value("Mercado"));
    }

    @Test
    void deveFiltrarCategoriasPorTipo() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");

        salvarCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA, ClassificacaoFinanceira.EMPRESARIAL, false);
        salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);

        mockMvc.perform(get("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .param("tipo", "RECEITA"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].tipo").value("RECEITA"))
            .andExpect(jsonPath("$.content[0].nome").value("Vendas"));
    }

    @Test
    void deveFiltrarCategoriasPorClassificacao() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");

        salvarCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA, ClassificacaoFinanceira.EMPRESARIAL, false);
        salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);

        mockMvc.perform(get("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .param("classificacao", "PESSOAL"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].classificacao").value("PESSOAL"))
            .andExpect(jsonPath("$.content[0].nome").value("Mercado"));
    }

    @Test
    void deveListarCategoriasSemFiltroComEstruturaDePaginacao() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");

        salvarCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA, ClassificacaoFinanceira.EMPRESARIAL, false);
        salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);

        mockMvc.perform(get("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .param("page", "0")
                .param("size", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.size").value(1))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void deveRedirecionarParaLoginGoogleQuandoListarCategoriasSemAutenticacao() throws Exception {
        mockMvc.perform(get("/categorias"))
            .andExpect(status().is3xxRedirection())
            .andExpect(header().string(HttpHeaders.LOCATION, containsString("/oauth2/authorization/google")));
    }

    @Test
    void deveRedirecionarParaLoginGoogleQuandoCriarCategoriaSemAutenticacao() throws Exception {
        CategoriaRequest request = novaRequest("Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL);

        mockMvc.perform(post("/categorias")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().is3xxRedirection())
            .andExpect(header().string(HttpHeaders.LOCATION, containsString("/oauth2/authorization/google")));
    }

    @Test
    void deveEditarCategoriaDoProprioUsuario() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);
        CategoriaRequest request = novaRequest("Alimentacao", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL);

        mockMvc.perform(put("/categorias/{id}", categoria.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Alimentacao"))
            .andExpect(jsonPath("$.tipo").value("DESPESA"))
            .andExpect(jsonPath("$.classificacao").value("PESSOAL"));
    }

    @Test
    void deveNormalizarEspacosAoCriarCategoria() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        CategoriaRequest request = novaRequest("  Mercado  ", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL);

        mockMvc.perform(post("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.nome").value("Mercado"));
    }

    @Test
    void deveRetornar422QuandoCriarCategoriaDuplicadaAposNormalizacaoDeEspacos() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);
        CategoriaRequest request = novaRequest("  Mercado  ", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL);

        mockMvc.perform(post("/categorias")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.detail").value("Já existe categoria com este nome para esse tipo e classificação"));
    }

    @Test
    void deveNormalizarEspacosAoEditarCategoria() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);
        CategoriaRequest request = novaRequest("  Alimentacao  ", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL);

        mockMvc.perform(put("/categorias/{id}", categoria.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Alimentacao"));
    }

    @Test
    void deveRetornar400QuandoEditarCategoriaComRequestInvalida() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);
        String request = """
	            {
	              "nome": "   ",
	              "tipo": null,
	              "classificacao": null
	            }
	            """;

        mockMvc.perform(put("/categorias/{id}", categoria.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.title").value("Dados inválidos"))
            .andExpect(jsonPath("$.erros", hasSize(3)));
    }

    @Test
    void deveRedirecionarParaLoginGoogleQuandoEditarCategoriaSemAutenticacao() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);
        CategoriaRequest request = novaRequest("Alimentacao", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL);

        mockMvc.perform(put("/categorias/{id}", categoria.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().is3xxRedirection())
            .andExpect(header().string(HttpHeaders.LOCATION, containsString("/oauth2/authorization/google")));
    }

    @Test
    void deveRetornar404AoEditarCategoriaDeOutroUsuario() throws Exception {
        Usuario usuarioA = salvarUsuario("Maria", "maria@teste.com");
        Usuario usuarioB = salvarUsuario("Joao", "joao@teste.com");
        Categoria categoria = salvarCategoria(usuarioB, "Frete", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.EMPRESARIAL, false);
        CategoriaRequest request = novaRequest("Transporte", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.EMPRESARIAL);

        mockMvc.perform(put("/categorias/{id}", categoria.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuarioA))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Categoria não encontrada"));
    }

    @Test
    void deveExcluirCategoriaNaoPadraoDoUsuarioAutenticado() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);

        mockMvc.perform(delete("/categorias/{id}", categoria.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario)))
            .andExpect(status().isNoContent());

        assertFalse(categoriaRepository.findById(categoria.getId()).isPresent());
    }

    @Test
    void deveRetornar422AoExcluirCategoriaPadrao() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Material", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.EMPRESARIAL, true);

        mockMvc.perform(delete("/categorias/{id}", categoria.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.detail").value("Categoria padrão não pode ser excluída"));

        assertTrue(categoriaRepository.findById(categoria.getId()).isPresent());
    }

    @Test
    void deveRetornar404AoExcluirCategoriaDeOutroUsuario() throws Exception {
        Usuario usuarioA = salvarUsuario("Maria", "maria@teste.com");
        Usuario usuarioB = salvarUsuario("Joao", "joao@teste.com");
        Categoria categoria = salvarCategoria(usuarioB, "Frete", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.EMPRESARIAL, false);

        mockMvc.perform(delete("/categorias/{id}", categoria.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuarioA)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Categoria não encontrada"));

        assertTrue(categoriaRepository.findById(categoria.getId()).isPresent());
    }

    @Test
    void deveRedirecionarParaLoginGoogleQuandoExcluirCategoriaSemAutenticacao() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Mercado", TipoMovimentacao.DESPESA, ClassificacaoFinanceira.PESSOAL, false);

        mockMvc.perform(delete("/categorias/{id}", categoria.getId()))
            .andExpect(status().is3xxRedirection())
            .andExpect(header().string(HttpHeaders.LOCATION, containsString("/oauth2/authorization/google")));
    }

    private Usuario salvarUsuario(String nome, String email) {
        Usuario usuario = Usuario
            .builder()
            .nome(nome)
            .email(email)
            .senha("senha123")
            .build();

        return usuarioRepository.save(usuario);
    }

    private Categoria salvarCategoria(
        Usuario usuario,
        String nome,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao,
        boolean padrao
    ) {
        Categoria categoria = Categoria
            .builder()
            .nome(nome)
            .tipo(tipo)
            .classificacao(classificacao)
            .padrao(padrao)
            .usuario(usuario)
            .build();

        return categoriaRepository.save(categoria);
    }

    private String bearerToken(Usuario usuario) {
        return "Bearer " + tokenService.generateAcessToken(usuario);
    }

    private CategoriaRequest novaRequest(
        String nome,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao
    ) {
        return new CategoriaRequest(nome, tipo, classificacao);
    }
}
