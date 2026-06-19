package com.sistemaos.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record MudarStatusRequest(
        @NotBlank String novoStatus,
        String observacao,
        BigDecimal valorOrcamento
) {}
