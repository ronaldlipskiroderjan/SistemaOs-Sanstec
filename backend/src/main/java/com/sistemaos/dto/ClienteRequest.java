package com.sistemaos.dto;

import jakarta.validation.constraints.NotBlank;

public record ClienteRequest(
        @NotBlank String nome,
        String cpfCnpj,
        String telefone,
        String email,
        String observacoes
) {}
