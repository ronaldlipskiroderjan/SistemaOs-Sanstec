package com.sistemaos.service;

import com.sistemaos.dto.DashboardResumoResponse;
import com.sistemaos.dto.OrdemServicoResponse;
import com.sistemaos.entity.OrdemServico;
import com.sistemaos.repository.OrdemServicoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final OrdemServicoRepository ordemServicoRepository;
    private final OrdemServicoService ordemServicoService;

    public DashboardService(OrdemServicoRepository ordemServicoRepository,
                            OrdemServicoService ordemServicoService) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.ordemServicoService = ordemServicoService;
    }

    public DashboardResumoResponse resumo() {
        long abertas = ordemServicoRepository.countByStatus(OrdemServico.StatusOS.ABERTA);
        long aprovadas = ordemServicoRepository.countByStatus(OrdemServico.StatusOS.APROVADA);
        long naoAprovadas = ordemServicoRepository.countByStatus(OrdemServico.StatusOS.NAO_APROVADA);
        long fechadas = ordemServicoRepository.countByStatus(OrdemServico.StatusOS.FECHADA);

        List<OrdemServicoResponse> recentes = ordemServicoRepository.findAllWithJoins()
                .stream()
                .limit(10)
                .map(ordemServicoService::toResumoResponsePublic)
                .collect(Collectors.toList());

        return new DashboardResumoResponse(abertas, aprovadas, naoAprovadas, fechadas, recentes);
    }
}
