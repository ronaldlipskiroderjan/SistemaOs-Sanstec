package com.sistemaos.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String nome,
        String email,
        String role,
        String telefone,
        boolean ativo,
        LocalDateTime criadoEm
) {}
