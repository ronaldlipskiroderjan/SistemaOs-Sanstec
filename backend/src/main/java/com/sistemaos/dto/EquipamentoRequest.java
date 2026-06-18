package com.sistemaos.dto;

import jakarta.validation.constraints.NotBlank;

public record EquipamentoRequest(
        @NotBlank String tipo,
        String marca,
        String modelo,
        String numeroSerie
) {}
