package com.sistemaos.service;

import com.sistemaos.dto.ClienteRequest;
import com.sistemaos.dto.ClienteResponse;
import com.sistemaos.entity.Cliente;
import com.sistemaos.exception.BusinessException;
import com.sistemaos.exception.ResourceNotFoundException;
import com.sistemaos.repository.ClienteRepository;
import com.sistemaos.repository.OrdemServicoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final OrdemServicoRepository ordemServicoRepository;

    public ClienteService(ClienteRepository clienteRepository, OrdemServicoRepository ordemServicoRepository) {
        this.clienteRepository = clienteRepository;
        this.ordemServicoRepository = ordemServicoRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar(String busca) {
        String termo = busca == null ? "" : busca.trim();
        return clienteRepository.search(termo)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorId(UUID id) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        return toResponse(c);
    }

    public ClienteResponse criar(ClienteRequest req) {
        Cliente c = new Cliente();
        aplicarRequest(req, c);
        return toResponse(clienteRepository.save(c));
    }

    public ClienteResponse atualizar(UUID id, ClienteRequest req) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        aplicarRequest(req, c);
        return toResponse(clienteRepository.save(c));
    }

    public void deletar(UUID id) {
        clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        if (ordemServicoRepository.countByClienteId(id) > 0) {
            throw new BusinessException("Não é possível excluir um cliente que possui ordens de serviço.");
        }
        clienteRepository.deleteById(id);
    }

    private void aplicarRequest(ClienteRequest req, Cliente c) {
        c.setNome(req.nome());
        c.setCpfCnpj(req.cpfCnpj());
        c.setTelefone(req.telefone());
        c.setEmail(req.email());
        c.setObservacoes(req.observacoes());
    }

    private ClienteResponse toResponse(Cliente c) {
        return new ClienteResponse(
                c.getId(), c.getNome(), c.getCpfCnpj(), c.getTelefone(),
                c.getEmail(), c.getObservacoes(), c.getCriadoEm()
        );
    }
}
