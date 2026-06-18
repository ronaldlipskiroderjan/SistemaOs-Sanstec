package com.sistemaos.dto;

import java.util.UUID;

public record EquipamentoResponse(
        UUID id,
        String tipo,
        String marca,
        String modelo,
        String numeroSerie
) {}
