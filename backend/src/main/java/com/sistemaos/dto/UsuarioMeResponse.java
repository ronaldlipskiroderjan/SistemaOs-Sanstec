package com.sistemaos.dto;

import java.util.UUID;

public record UsuarioMeResponse(
        UUID id,
        String nome,
        String email,
        String role,
        String telefone
) {}
