package com.sistemaos.dto;

import java.util.UUID;

public record LoginResponse(
        String token,
        UUID id,
        String nome,
        String role
) {}
