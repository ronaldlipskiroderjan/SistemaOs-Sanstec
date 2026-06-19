package com.sistemaos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrdemServicoResponse(
        UUID id,
        String numero,
        UUID clienteId,
        String clienteNome,
        String clienteTelefone,
        String equipamentoTipo,
        String equipamentoMarca,
        String equipamentoModelo,
        UUID tecnicoId,
        String tecnicoNome,
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
        String status,
        BigDecimal valorOrcamento,
        LocalDateTime dataAbertura,
        LocalDateTime dataAgendamento,
        LocalDateTime dataFechamento,
        List<StatusHistoricoResponse> historico
) {}
