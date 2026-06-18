package com.sistemaos.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ClienteResponse(
        UUID id,
        String nome,
        String cpfCnpj,
        String telefone,
        String email,
        EnderecoResponse endereco,
        String observacoes,
        LocalDateTime criadoEm,
        List<EquipamentoResponse> equipamentos
) {}
