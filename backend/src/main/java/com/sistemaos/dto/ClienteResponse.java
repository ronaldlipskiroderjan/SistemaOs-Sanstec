package com.sistemaos.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClienteResponse(
        UUID id,
        String nome,
        String cpfCnpj,
        String telefone,
        String email,
        String observacoes,
        LocalDateTime criadoEm
) {}
