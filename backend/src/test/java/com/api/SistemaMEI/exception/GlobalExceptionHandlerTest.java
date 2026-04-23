package com.api.SistemaMEI.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(new TestController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void deveRetornar404ParaResourceNotFoundException() throws Exception {
        mockMvc.perform(get("/test/resource-not-found"))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.title").value("Recurso não encontrado"))
            .andExpect(jsonPath("$.detail").value("Categoria não encontrada"));
    }

    @Test
    void deveRetornar422ParaBusinessRuleException() throws Exception {
        mockMvc.perform(get("/test/business-rule"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.status").value(422))
            .andExpect(jsonPath("$.title").value("Violação de regra de negócio"))
            .andExpect(jsonPath("$.detail").value("Já existe categoria com este nome para esse tipo"));
    }

    @Test
    void deveRetornar400ComListaDeErrosParaMethodArgumentNotValidException() throws Exception {
        String request = """
            {
              "nome": "   ",
              "tipo": null
            }
            """;

        mockMvc.perform(post("/test/validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.title").value("Dados inválidos"))
            .andExpect(jsonPath("$.detail").value("Erro de validação nos dados enviados"))
            .andExpect(jsonPath("$.erros", hasSize(2)))
            .andExpect(jsonPath("$.erros[0]").exists())
            .andExpect(jsonPath("$.erros[1]").exists());
    }

    @Test
    void deveRetornar500ParaExcecaoGenerica() throws Exception {
        mockMvc.perform(get("/test/generic"))
            .andExpect(status().isInternalServerError())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.status").value(500))
            .andExpect(jsonPath("$.title").value("Erro no servidor"))
            .andExpect(jsonPath("$.detail").value("Ocorreu um erro inesperado"));
    }

    @RestController
    static class TestController {

        @GetMapping("/test/resource-not-found")
        void resourceNotFound() {
            throw new ResourceNotFoundException("Categoria não encontrada");
        }

        @GetMapping("/test/business-rule")
        void businessRule() {
            throw new BusinessRuleException("Já existe categoria com este nome para esse tipo");
        }

        @PostMapping("/test/validation")
        void validation(@Valid @RequestBody TestRequest request) {
        }

        @GetMapping("/test/generic")
        void generic() {
            throw new IllegalStateException("boom");
        }
    }

    record TestRequest(
        @JsonProperty("nome")
        @NotBlank(message = "não deve estar em branco")
        String nome,

        @JsonProperty("tipo")
        @NotNull(message = "não deve ser nulo")
        String tipo
    ) {
    }
}
