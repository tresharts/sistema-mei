package com.api.SistemaMEI.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Name is required")
    String nome,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(
        regexp = "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$",
        message = "Email must have a valid domain (e.g. .com, .com.br)"
    )
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres")
    String senha
) {}
