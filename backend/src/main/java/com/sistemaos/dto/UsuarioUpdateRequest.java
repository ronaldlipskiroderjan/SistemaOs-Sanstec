package com.sistemaos.dto;

import jakarta.validation.constraints.NotBlank;

public record UsuarioUpdateRequest(
        @NotBlank String nome,
        String telefone,
        Boolean ativo
) {}
