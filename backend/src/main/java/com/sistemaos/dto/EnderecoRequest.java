package com.sistemaos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record EnderecoRequest(
        @NotBlank String logradouro,
        @NotBlank String numero,
        String complemento,
        @NotBlank String bairro,
        @NotBlank String cidade,
        @NotBlank @Size(min = 2, max = 2) String estado,
        @NotBlank String cep,
        BigDecimal latitude,
        BigDecimal longitude
) {}
