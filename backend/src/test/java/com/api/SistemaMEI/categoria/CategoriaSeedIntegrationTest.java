package com.api.SistemaMEI.categoria;

import com.api.SistemaMEI.IntegrationTestBase;
import com.api.SistemaMEI.auth.RefreshTokenRepository;
import com.api.SistemaMEI.auth.RegisterRequest;
import com.api.SistemaMEI.usuario.Usuario;
import com.api.SistemaMEI.usuario.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class CategoriaSeedIntegrationTest extends IntegrationTestBase {

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

    @BeforeEach
    void limparBanco() {
        refreshTokenRepository.deleteAll();
        categoriaRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void deveCriarCategoriasPadraoAoCadastrarNovoUsuario() throws Exception {
        RegisterRequest request = new RegisterRequest("Maria", "maria@teste.com", "senha123");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());

        Usuario usuario = usuarioRepository.findByEmail("maria@teste.com").orElseThrow();
        List<Categoria> categorias = categoriaRepository.findByUsuario(usuario, Pageable.unpaged()).getContent();

        assertEquals(5, categorias.size());
        assertTrue(categorias.stream().allMatch(Categoria::isPadrao));
        assertEquals(
            List.of("Embalagem", "Material", "Servicos", "Transporte", "Vendas"),
            categorias.stream().map(Categoria::getNome).sorted().toList()
        );
    }
}
