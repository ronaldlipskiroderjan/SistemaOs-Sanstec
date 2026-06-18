package com.sistemaos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public record ClienteRequest(
        @NotBlank String nome,
        String cpfCnpj,
        String telefone,
        String email,
        @Valid EnderecoRequest endereco,
        String observacoes
) {}
