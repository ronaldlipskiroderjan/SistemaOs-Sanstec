package com.sistemaos.service;

import com.sistemaos.dto.*;
import com.sistemaos.entity.*;
import com.sistemaos.exception.BusinessException;
import com.sistemaos.exception.ResourceNotFoundException;
import com.sistemaos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrdemServicoService {

    private final OrdemServicoRepository ordemServicoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    public OrdemServicoService(OrdemServicoRepository ordemServicoRepository,
                               ClienteRepository clienteRepository,
                               UsuarioRepository usuarioRepository) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<OrdemServicoResponse> listar(String statusStr, UUID clienteId, UUID tecnicoId) {
        OrdemServico.StatusOS status = null;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                status = OrdemServico.StatusOS.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Status inválido: " + statusStr);
            }
        }
        final OrdemServico.StatusOS statusFinal = status;

        return ordemServicoRepository.findAllWithJoins()
                .stream()
                .filter(o -> statusFinal == null || o.getStatus() == statusFinal)
                .filter(o -> clienteId == null || o.getCliente().getId().equals(clienteId))
                .filter(o -> tecnicoId == null || (o.getTecnico() != null && o.getTecnico().getId().equals(tecnicoId)))
                .map(this::toResumoResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrdemServicoResponse buscarPorId(UUID id) {
        OrdemServico os = ordemServicoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrdemServico", id));
        return toResponse(os);
    }

    public OrdemServicoResponse criar(OrdemServicoRequest req, String emailAdmin) {
        Cliente cliente = clienteRepository.findById(req.clienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", req.clienteId()));

        OrdemServico os = new OrdemServico();
        os.setNumero(gerarNumero());
        os.setCliente(cliente);
        os.setDescricaoProblema(req.descricaoProblema());
        os.setValorOrcamento(req.valorOrcamento());
        os.setDataAgendamento(req.dataAgendamento());
        os.setStatus(OrdemServico.StatusOS.ABERTA);

        aplicarEquipamento(os, req.equipamentoTipo(), req.equipamentoMarca(), req.equipamentoModelo());
        aplicarEndereco(os, req.servicoLogradouro(), req.servicoNumero(), req.servicoComplemento(),
                req.servicoBairro(), req.servicoCidade(), req.servicoEstado(), req.servicoCep(),
                req.servicoLatitude(), req.servicoLongitude());

        if (req.tecnicoId() != null) {
            usuarioRepository.findById(req.tecnicoId()).ifPresent(os::setTecnico);
        }

        Usuario admin = usuarioRepository.findByEmail(emailAdmin).orElse(null);
        StatusHistorico hist = new StatusHistorico();
        hist.setOrdemServico(os);
        hist.setStatusAnterior(null);
        hist.setStatusNovo(OrdemServico.StatusOS.ABERTA);
        hist.setUsuario(admin);
        hist.setObservacao("OS criada");
        os.getHistorico().add(hist);

        return toResponse(ordemServicoRepository.save(os));
    }

    public OrdemServicoResponse atualizar(UUID id, OrdemServicoUpdateRequest req) {
        OrdemServico os = ordemServicoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrdemServico", id));

        os.setDescricaoProblema(req.descricaoProblema());
        os.setDiagnostico(req.diagnostico());
        os.setValorOrcamento(req.valorOrcamento());
        os.setDataAgendamento(req.dataAgendamento());

        aplicarEquipamento(os, req.equipamentoTipo(), req.equipamentoMarca(), req.equipamentoModelo());
        aplicarEndereco(os, req.servicoLogradouro(), req.servicoNumero(), req.servicoComplemento(),
                req.servicoBairro(), req.servicoCidade(), req.servicoEstado(), req.servicoCep(),
                req.servicoLatitude(), req.servicoLongitude());

        if (req.tecnicoId() != null) {
            usuarioRepository.findById(req.tecnicoId()).ifPresent(os::setTecnico);
        } else {
            os.setTecnico(null);
        }

        return toResponse(ordemServicoRepository.save(os));
    }

    @Transactional(readOnly = true)
    public List<OrdemServicoResponse> listarMinhas(String emailTecnico) {
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", emailTecnico));
        return ordemServicoRepository.findAtivasByTecnicoId(tecnico.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrdemServicoResponse mudarStatus(UUID id, MudarStatusRequest req, String emailUsuario) {
        OrdemServico os = ordemServicoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrdemServico", id));

        OrdemServico.StatusOS novoStatus;
        try {
            novoStatus = OrdemServico.StatusOS.valueOf(req.novoStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status inválido: " + req.novoStatus());
        }

        validarTransicao(os.getStatus(), novoStatus);

        if (novoStatus == OrdemServico.StatusOS.APROVADA) {
            if (req.valorOrcamento() == null || req.valorOrcamento().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Informe o valor do orçamento para aprovar a OS.");
            }
            os.setValorOrcamento(req.valorOrcamento());
        }

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario).orElse(null);

        StatusHistorico hist = new StatusHistorico();
        hist.setOrdemServico(os);
        hist.setStatusAnterior(os.getStatus());
        hist.setStatusNovo(novoStatus);
        hist.setUsuario(usuario);
        hist.setObservacao(req.observacao());

        os.setStatus(novoStatus);
        if (novoStatus == OrdemServico.StatusOS.FECHADA) {
            os.setDataFechamento(LocalDateTime.now());
        }
        os.getHistorico().add(hist);

        return toResponse(ordemServicoRepository.save(os));
    }

    private void validarTransicao(OrdemServico.StatusOS atual, OrdemServico.StatusOS novo) {
        boolean valida = switch (atual) {
            case ABERTA -> novo == OrdemServico.StatusOS.APROVADA || novo == OrdemServico.StatusOS.NAO_APROVADA;
            case APROVADA -> novo == OrdemServico.StatusOS.FECHADA;
            default -> false;
        };
        if (!valida) {
            throw new BusinessException("Transição inválida: " + atual.name() + " → " + novo.name());
        }
    }

    private void aplicarEquipamento(OrdemServico os, String tipo, String marca, String modelo) {
        os.setEquipamentoTipo(tipo);
        os.setEquipamentoMarca(marca);
        os.setEquipamentoModelo(modelo);
    }

    private void aplicarEndereco(OrdemServico os, String logradouro, String numero, String complemento,
                                  String bairro, String cidade, String estado, String cep,
                                  java.math.BigDecimal lat, java.math.BigDecimal lng) {
        os.setServicoLogradouro(logradouro);
        os.setServicoNumero(numero);
        os.setServicoComplemento(complemento);
        os.setServicoBairro(bairro);
        os.setServicoCidade(cidade);
        os.setServicoEstado(estado);
        os.setServicoCep(cep);
        os.setServicoLatitude(lat);
        os.setServicoLongitude(lng);
    }

    private String gerarNumero() {
        int max = ordemServicoRepository.findMaxNumero();
        return String.format("%04d", max + 1);
    }

    public OrdemServicoResponse toResumoResponsePublic(OrdemServico o) {
        return toResumoResponse(o);
    }

    private OrdemServicoResponse toResumoResponse(OrdemServico o) {
        return new OrdemServicoResponse(
                o.getId(), o.getNumero(),
                o.getCliente().getId(), o.getCliente().getNome(), o.getCliente().getTelefone(),
                o.getEquipamentoTipo(), o.getEquipamentoMarca(), o.getEquipamentoModelo(),
                o.getTecnico() != null ? o.getTecnico().getId() : null,
                o.getTecnico() != null ? o.getTecnico().getNome() : null,
                o.getServicoLogradouro(), o.getServicoNumero(), o.getServicoComplemento(),
                o.getServicoBairro(), o.getServicoCidade(), o.getServicoEstado(), o.getServicoCep(),
                o.getServicoLatitude(), o.getServicoLongitude(),
                o.getDescricaoProblema(), o.getDiagnostico(), o.getStatus().name(),
                o.getValorOrcamento(),
                o.getDataAbertura(), o.getDataAgendamento(), o.getDataFechamento(),
                List.of()
        );
    }

    private OrdemServicoResponse toResponse(OrdemServico o) {
        List<StatusHistoricoResponse> hist = o.getHistorico().stream()
                .sorted(Comparator.comparing(StatusHistorico::getCriadoEm))
                .map(h -> new StatusHistoricoResponse(
                        h.getId(),
                        h.getStatusAnterior() != null ? h.getStatusAnterior().name() : null,
                        h.getStatusNovo().name(),
                        h.getUsuario() != null ? h.getUsuario().getId() : null,
                        h.getUsuario() != null ? h.getUsuario().getNome() : null,
                        h.getObservacao(),
                        h.getCriadoEm()
                ))
                .collect(Collectors.toList());

        return new OrdemServicoResponse(
                o.getId(), o.getNumero(),
                o.getCliente().getId(), o.getCliente().getNome(), o.getCliente().getTelefone(),
                o.getEquipamentoTipo(), o.getEquipamentoMarca(), o.getEquipamentoModelo(),
                o.getTecnico() != null ? o.getTecnico().getId() : null,
                o.getTecnico() != null ? o.getTecnico().getNome() : null,
                o.getServicoLogradouro(), o.getServicoNumero(), o.getServicoComplemento(),
                o.getServicoBairro(), o.getServicoCidade(), o.getServicoEstado(), o.getServicoCep(),
                o.getServicoLatitude(), o.getServicoLongitude(),
                o.getDescricaoProblema(), o.getDiagnostico(), o.getStatus().name(),
                o.getValorOrcamento(),
                o.getDataAbertura(), o.getDataAgendamento(), o.getDataFechamento(),
                hist
        );
    }
}
