package com.api.SistemaMEI.movimentacao;

import com.api.SistemaMEI.IntegrationTestBase;
import com.api.SistemaMEI.auth.RefreshTokenRepository;
import com.api.SistemaMEI.auth.TokenService;
import com.api.SistemaMEI.categoria.Categoria;
import com.api.SistemaMEI.categoria.CategoriaRepository;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
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

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class MovimentacaoControllerIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MovimentacaoRepository movimentacaoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private TokenService tokenService;

    @BeforeEach
    void limparBanco() {
        movimentacaoRepository.deleteAll();
        categoriaRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void deveCriarReceitaRecebida() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA);
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.RECEITA,
            StatusMovimentacao.RECEBIDO,
            categoria,
            null
        );

        mockMvc.perform(post("/movimentacoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.valor").value(150.0))
            .andExpect(jsonPath("$.descricao").value("Venda no cartao"))
            .andExpect(jsonPath("$.tipo").value("RECEITA"))
            .andExpect(jsonPath("$.status").value("RECEBIDO"))
            .andExpect(jsonPath("$.categoriaId").value(categoria.getId().toString()))
            .andExpect(jsonPath("$.categoriaNome").value("Vendas"));
    }

    @Test
    void deveCriarDespesaAPagarComVencimento() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Material", TipoMovimentacao.DESPESA);
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR,
            categoria,
            LocalDate.of(2026, 4, 30)
        );

        mockMvc.perform(post("/movimentacoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.tipo").value("DESPESA"))
            .andExpect(jsonPath("$.status").value("A_PAGAR"))
            .andExpect(jsonPath("$.dataVencimento").value("2026-04-30"));
    }

    @Test
    void deveRetornar422QuandoCriarDespesaAPagarSemVencimento() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Material", TipoMovimentacao.DESPESA);
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR,
            categoria,
            null
        );

        mockMvc.perform(post("/movimentacoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.detail").value("Data de vencimento é obrigatória para movimentações pendentes"));
    }

    @Test
    void deveRetornar400QuandoCriarMovimentacaoInvalida() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        String request = """
            {
              "valor": 0,
              "descricao": "   ",
              "data": null,
              "tipo": null,
              "classificacao": null,
              "status": null,
              "categoriaId": null
            }
            """;

        mockMvc.perform(post("/movimentacoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.title").value("Dados inválidos"))
            .andExpect(jsonPath("$.erros", hasSize(7)));
    }

    @Test
    void deveRetornar400QuandoValorUltrapassarTeto() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA);
        String request = """
            {
              "valor": 1000000.01,
              "descricao": "Venda acima do limite",
              "data": "2026-04-24",
              "tipo": "RECEITA",
              "classificacao": "EMPRESARIAL",
              "status": "RECEBIDO",
              "categoriaId": "%s"
            }
            """.formatted(categoria.getId());

        mockMvc.perform(post("/movimentacoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.title").value("Dados inválidos"))
            .andExpect(jsonPath("$.erros[0]").value("valor: Valor deve ser menor ou igual a R$ 1.000.000,00"));
    }

    @Test
    void deveListarSomenteMovimentacoesDoUsuarioAutenticado() throws Exception {
        Usuario usuarioA = salvarUsuario("Maria", "maria@teste.com");
        Usuario usuarioB = salvarUsuario("Joao", "joao@teste.com");
        Categoria categoriaA = salvarCategoria(usuarioA, "Vendas", TipoMovimentacao.RECEITA);
        Categoria categoriaB = salvarCategoria(usuarioB, "Vendas", TipoMovimentacao.RECEITA);

        salvarMovimentacao(usuarioA, categoriaA, TipoMovimentacao.RECEITA, StatusMovimentacao.RECEBIDO, "Venda A");
        salvarMovimentacao(usuarioB, categoriaB, TipoMovimentacao.RECEITA, StatusMovimentacao.RECEBIDO, "Venda B");

        mockMvc.perform(get("/movimentacoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuarioA)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].descricao").value("Venda A"));
    }

    @Test
    void deveFiltrarPorPeriodoTipoEStatus() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria receita = salvarCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA);
        Categoria despesa = salvarCategoria(usuario, "Material", TipoMovimentacao.DESPESA);

        salvarMovimentacao(usuario, receita, TipoMovimentacao.RECEITA, StatusMovimentacao.RECEBIDO, "Venda Abril");
        salvarMovimentacao(usuario, receita, TipoMovimentacao.RECEITA, StatusMovimentacao.A_RECEBER, "Venda Pendente");
        salvarMovimentacao(usuario, despesa, TipoMovimentacao.DESPESA, StatusMovimentacao.PAGO, "Compra");

        mockMvc.perform(get("/movimentacoes")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .param("dataInicio", "2026-04-01")
                .param("dataFim", "2026-04-30")
                .param("tipo", "RECEITA")
                .param("status", "RECEBIDO"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].descricao").value("Venda Abril"));
    }

    @Test
    void deveEditarMovimentacaoDoProprioUsuario() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Material", TipoMovimentacao.DESPESA);
        Movimentacao movimentacao = salvarMovimentacao(
            usuario,
            categoria,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR,
            "Compra antiga"
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO,
            categoria,
            null
        );

        mockMvc.perform(put("/movimentacoes/{id}", movimentacao.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.descricao").value("Venda no cartao"))
            .andExpect(jsonPath("$.status").value("PAGO"));
    }

    @Test
    void deveRetornar404AoEditarMovimentacaoDeOutroUsuario() throws Exception {
        Usuario usuarioA = salvarUsuario("Maria", "maria@teste.com");
        Usuario usuarioB = salvarUsuario("Joao", "joao@teste.com");
        Categoria categoriaA = salvarCategoria(usuarioA, "Material", TipoMovimentacao.DESPESA);
        Categoria categoriaB = salvarCategoria(usuarioB, "Material", TipoMovimentacao.DESPESA);
        Movimentacao movimentacao = salvarMovimentacao(
            usuarioB,
            categoriaB,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO,
            "Compra"
        );
        MovimentacaoRequest request = novoRequest(
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO,
            categoriaA,
            null
        );

        mockMvc.perform(put("/movimentacoes/{id}", movimentacao.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuarioA))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Movimentação não encontrada"));
    }

    @Test
    void deveExcluirMovimentacaoDoProprioUsuario() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Material", TipoMovimentacao.DESPESA);
        Movimentacao movimentacao = salvarMovimentacao(
            usuario,
            categoria,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO,
            "Compra"
        );

        mockMvc.perform(delete("/movimentacoes/{id}", movimentacao.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario)))
            .andExpect(status().isNoContent());

        assertFalse(movimentacaoRepository.findById(movimentacao.getId()).isPresent());
    }

    @Test
    void deveRetornar404AoExcluirMovimentacaoDeOutroUsuario() throws Exception {
        Usuario usuarioA = salvarUsuario("Maria", "maria@teste.com");
        Usuario usuarioB = salvarUsuario("Joao", "joao@teste.com");
        Categoria categoria = salvarCategoria(usuarioB, "Material", TipoMovimentacao.DESPESA);
        Movimentacao movimentacao = salvarMovimentacao(
            usuarioB,
            categoria,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.PAGO,
            "Compra"
        );

        mockMvc.perform(delete("/movimentacoes/{id}", movimentacao.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuarioA)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Movimentação não encontrada"));

        assertTrue(movimentacaoRepository.findById(movimentacao.getId()).isPresent());
    }

    @Test
    void deveAtualizarStatus() throws Exception {
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Categoria categoria = salvarCategoria(usuario, "Material", TipoMovimentacao.DESPESA);
        Movimentacao movimentacao = salvarMovimentacao(
            usuario,
            categoria,
            TipoMovimentacao.DESPESA,
            StatusMovimentacao.A_PAGAR,
            "Compra"
        );
        AtualizarStatusMovimentacaoRequest request = new AtualizarStatusMovimentacaoRequest(
            StatusMovimentacao.PAGO
        );

        mockMvc.perform(patch("/movimentacoes/{id}/status", movimentacao.getId())
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PAGO"));
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

    private Categoria salvarCategoria(Usuario usuario, String nome, TipoMovimentacao tipo) {
        Categoria categoria = Categoria
            .builder()
            .nome(nome)
            .tipo(tipo)
            .classificacao(ClassificacaoFinanceira.EMPRESARIAL)
            .padrao(false)
            .usuario(usuario)
            .build();

        return categoriaRepository.save(categoria);
    }

    private Movimentacao salvarMovimentacao(
        Usuario usuario,
        Categoria categoria,
        TipoMovimentacao tipo,
        StatusMovimentacao status,
        String descricao
    ) {
        Movimentacao movimentacao = Movimentacao
            .builder()
            .valor(BigDecimal.valueOf(150))
            .descricao(descricao)
            .data(LocalDate.of(2026, 4, 24))
            .dataVencimento(status == StatusMovimentacao.A_PAGAR ? LocalDate.of(2026, 4, 30) : null)
            .tipo(tipo)
            .classificacao(ClassificacaoFinanceira.EMPRESARIAL)
            .status(status)
            .categoria(categoria)
            .usuario(usuario)
            .build();

        return movimentacaoRepository.save(movimentacao);
    }

    private MovimentacaoRequest novoRequest(
        TipoMovimentacao tipo,
        StatusMovimentacao status,
        Categoria categoria,
        LocalDate dataVencimento
    ) {
        return new MovimentacaoRequest(
            BigDecimal.valueOf(150),
            "  Venda no cartao  ",
            LocalDate.of(2026, 4, 24),
            dataVencimento,
            tipo,
            ClassificacaoFinanceira.EMPRESARIAL,
            status,
            categoria.getId()
        );
    }

    private String bearerToken(Usuario usuario) {
        return "Bearer " + tokenService.generateAcessToken(usuario);
    }
}
