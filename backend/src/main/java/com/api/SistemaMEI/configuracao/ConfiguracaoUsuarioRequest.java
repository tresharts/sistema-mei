package com.api.SistemaMEI.configuracao;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ConfiguracaoUsuarioRequest(
    @NotNull(message = "Valor do DAS é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor do DAS deve ser maior que zero")
    @DecimalMax(value = "1000000.00", message = "Valor do DAS deve ser menor ou igual a 1000000.00")
    @Digits(integer = 10, fraction = 2, message = "Valor do DAS deve ter no máximo 2 casas decimais")
    BigDecimal valorDas,

    @Size(max = 120, message = "Nome do negócio deve ter no máximo 120 caracteres")
    String nomeNegocio,

    @Size(max = 120, message = "Atividade deve ter no máximo 120 caracteres")
    String atividade,

    @NotNull(message = "Preferência de lembrete do DAS é obrigatória")
    Boolean lembreteDasAtivo,

    @NotNull(message = "Preferência de resumo diário é obrigatória")
    Boolean resumoDiarioAtivo
) {}
