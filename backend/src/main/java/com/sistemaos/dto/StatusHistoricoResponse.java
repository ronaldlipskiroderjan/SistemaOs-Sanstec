package com.sistemaos.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record StatusHistoricoResponse(
        UUID id,
        String statusAnterior,
        String statusNovo,
        UUID usuarioId,
        String usuarioNome,
        String observacao,
        LocalDateTime criadoEm
) {}
