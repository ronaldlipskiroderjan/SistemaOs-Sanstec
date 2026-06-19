package com.sistemaos.dto;

import java.util.List;

public record DashboardResumoResponse(
        long totalAbertas,
        long totalAprovadas,
        long totalNaoAprovadas,
        long totalFechadas,
        List<OrdemServicoResponse> recentes
) {}
