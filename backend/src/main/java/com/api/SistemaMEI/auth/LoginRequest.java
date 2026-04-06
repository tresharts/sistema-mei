package com.api.SistemaMEI.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(
        regexp = "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$",
        message = "Email must have a valid domain (e.g. .com, .com.br)"
    )
    String email,

    @NotBlank(message = "Password is required")
    String senha
) {}
