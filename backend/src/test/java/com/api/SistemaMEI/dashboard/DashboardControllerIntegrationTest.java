package com.api.SistemaMEI.dashboard;

import com.api.SistemaMEI.IntegrationTestBase;
import com.api.SistemaMEI.auth.RefreshTokenRepository;
import com.api.SistemaMEI.auth.TokenService;
import com.api.SistemaMEI.categoria.Categoria;
import com.api.SistemaMEI.categoria.CategoriaRepository;
import com.api.SistemaMEI.financeiro.ClassificacaoFinanceira;
import com.api.SistemaMEI.financeiro.StatusMovimentacao;
import com.api.SistemaMEI.financeiro.TipoMovimentacao;
import com.api.SistemaMEI.movimentacao.Movimentacao;
import com.api.SistemaMEI.movimentacao.MovimentacaoRepository;
import com.api.SistemaMEI.usuario.Usuario;
import com.api.SistemaMEI.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class DashboardControllerIntegrationTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

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
        categoriaRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void deveRetornarResumoDoUsuarioAutenticado() throws Exception {
        LocalDate hoje = LocalDate.now();
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Usuario outroUsuario = salvarUsuario("Joao", "joao@teste.com");
        Categoria vendas = salvarCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA);
        Categoria material = salvarCategoria(usuario, "Material", TipoMovimentacao.DESPESA);
        Categoria vendasOutroUsuario = salvarCategoria(outroUsuario, "Vendas", TipoMovimentacao.RECEITA);

        salvarMovimentacao(
            usuario,
            vendas,
            BigDecimal.valueOf(1000),
            hoje,
            null,
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.RECEBIDO,
            "Venda recebida"
        );
        salvarMovimentacao(
            usuario,
            material,
            BigDecimal.valueOf(250),
            hoje,
            null,
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.PAGO,
            "Compra paga"
        );
        salvarMovimentacao(
            usuario,
            vendas,
            BigDecimal.valueOf(400),
            hoje,
            hoje.minusDays(2),
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.A_RECEBER,
            "Venda atrasada"
        );
        salvarMovimentacao(
            usuario,
            material,
            BigDecimal.valueOf(120),
            hoje,
            hoje.plusDays(5),
            TipoMovimentacao.DESPESA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.A_PAGAR,
            "Conta a pagar"
        );
        salvarMovimentacao(
            outroUsuario,
            vendasOutroUsuario,
            BigDecimal.valueOf(9999),
            hoje,
            null,
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.RECEBIDO,
            "Venda de outro usuario"
        );

        mockMvc.perform(get("/dashboard/resumo")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.saldoAtual").value(750.0))
            .andExpect(jsonPath("$.lucroEmpresarialMes").value(750.0))
            .andExpect(jsonPath("$.totalAReceber").value(400.0))
            .andExpect(jsonPath("$.totalAPagar").value(120.0))
            .andExpect(jsonPath("$.vendasHoje").value(1000.0))
            .andExpect(jsonPath("$.quantidadeContasAReceberAtrasadas").value(1))
            .andExpect(jsonPath("$.alertas", hasSize(0)));
    }

    @Test
    void deveListarContasAtrasadasDoUsuarioAutenticado() throws Exception {
        LocalDate hoje = LocalDate.now();
        Usuario usuario = salvarUsuario("Maria", "maria@teste.com");
        Usuario outroUsuario = salvarUsuario("Joao", "joao@teste.com");
        Categoria vendas = salvarCategoria(usuario, "Vendas", TipoMovimentacao.RECEITA);
        Categoria vendasOutroUsuario = salvarCategoria(outroUsuario, "Vendas", TipoMovimentacao.RECEITA);

        salvarMovimentacao(
            usuario,
            vendas,
            BigDecimal.valueOf(300),
            hoje,
            hoje.minusDays(3),
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.A_RECEBER,
            "Venda atrasada"
        );
        salvarMovimentacao(
            usuario,
            vendas,
            BigDecimal.valueOf(500),
            hoje,
            hoje.plusDays(3),
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.A_RECEBER,
            "Venda futura"
        );
        salvarMovimentacao(
            outroUsuario,
            vendasOutroUsuario,
            BigDecimal.valueOf(700),
            hoje,
            hoje.minusDays(4),
            TipoMovimentacao.RECEITA,
            ClassificacaoFinanceira.EMPRESARIAL,
            StatusMovimentacao.A_RECEBER,
            "Venda atrasada de outro usuario"
        );

        mockMvc.perform(get("/dashboard/contas-atrasadas")
                .header(HttpHeaders.AUTHORIZATION, bearerToken(usuario))
                .param("sort", "dataVencimento,asc"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].descricao").value("Venda atrasada"))
            .andExpect(jsonPath("$.content[0].valor").value(300.0))
            .andExpect(jsonPath("$.content[0].dataVencimento").value(hoje.minusDays(3).toString()))
            .andExpect(jsonPath("$.content[0].diasAtraso").value(3))
            .andExpect(jsonPath("$.content[0].categoriaNome").value("Vendas"))
            .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void deveRedirecionarParaLoginGoogleQuandoBuscarResumoSemAutenticacao() throws Exception {
        mockMvc.perform(get("/dashboard/resumo"))
            .andExpect(status().is3xxRedirection())
            .andExpect(header().string(HttpHeaders.LOCATION, containsString("/oauth2/authorization/google")));
    }

    private Usuario salvarUsuario(String nome, String email) {
        return usuarioRepository.save(Usuario
            .builder()
            .nome(nome)
            .email(email)
            .senha("123456")
            .build());
    }

    private Categoria salvarCategoria(Usuario usuario, String nome, TipoMovimentacao tipo) {
        return categoriaRepository.save(Categoria
            .builder()
            .nome(nome)
            .tipo(tipo)
            .padrao(false)
            .usuario(usuario)
            .build());
    }

    private Movimentacao salvarMovimentacao(
        Usuario usuario,
        Categoria categoria,
        BigDecimal valor,
        LocalDate data,
        LocalDate dataVencimento,
        TipoMovimentacao tipo,
        ClassificacaoFinanceira classificacao,
        StatusMovimentacao status,
        String descricao
    ) {
        return movimentacaoRepository.save(Movimentacao
            .builder()
            .valor(valor)
            .descricao(descricao)
            .data(data)
            .dataVencimento(dataVencimento)
            .tipo(tipo)
            .classificacao(classificacao)
            .status(status)
            .categoria(categoria)
            .usuario(usuario)
            .build());
    }

    private String bearerToken(Usuario usuario) {
        return "Bearer " + tokenService.generateAcessToken(usuario);
    }
}
