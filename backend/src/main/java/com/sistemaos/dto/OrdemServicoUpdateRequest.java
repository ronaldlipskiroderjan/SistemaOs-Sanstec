package com.sistemaos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrdemServicoUpdateRequest(
        UUID tecnicoId,
        String equipamentoTipo,
        String equipamentoMarca,
        String equipamentoModelo,
        String servicoLogradouro,
        String servicoNumero,
        String servicoComplemento,
        String servicoBairro,
        String servicoCidade,
        String servicoEstado,
        String servicoCep,
        BigDecimal servicoLatitude,
        BigDecimal servicoLongitude,
        String descricaoProblema,
        String diagnostico,
        BigDecimal valorOrcamento,
        LocalDateTime dataAgendamento
) {}
