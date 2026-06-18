package com.sistemaos.service;

import com.sistemaos.dto.*;
import com.sistemaos.entity.Cliente;
import com.sistemaos.entity.Endereco;
import com.sistemaos.entity.Equipamento;
import com.sistemaos.exception.ResourceNotFoundException;
import com.sistemaos.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar(String busca) {
        String termo = busca == null ? "" : busca.trim();
        return clienteRepository.search(termo)
                .stream()
                .sorted(Comparator.comparing(Cliente::getNome))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorId(UUID id) {
        Cliente c = clienteRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        return toResponse(c);
    }

    public ClienteResponse criar(ClienteRequest req) {
        Cliente c = new Cliente();
        aplicarRequest(req, c);
        return toResponse(clienteRepository.save(c));
    }

    public ClienteResponse atualizar(UUID id, ClienteRequest req) {
        Cliente c = clienteRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        aplicarRequest(req, c);
        return toResponse(clienteRepository.save(c));
    }

    public EquipamentoResponse adicionarEquipamento(UUID clienteId, EquipamentoRequest req) {
        Cliente c = clienteRepository.findByIdWithDetails(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", clienteId));

        Equipamento e = new Equipamento();
        e.setCliente(c);
        e.setTipo(Equipamento.TipoEquipamento.valueOf(req.tipo()));
        e.setMarca(req.marca());
        e.setModelo(req.modelo());
        e.setNumeroSerie(req.numeroSerie());

        c.getEquipamentos().add(e);
        clienteRepository.save(c);

        return toEquipamentoResponse(e);
    }

    private void aplicarRequest(ClienteRequest req, Cliente c) {
        c.setNome(req.nome());
        c.setCpfCnpj(req.cpfCnpj());
        c.setTelefone(req.telefone());
        c.setEmail(req.email());
        c.setObservacoes(req.observacoes());

        if (req.endereco() != null) {
            Endereco end = c.getEndereco() != null ? c.getEndereco() : new Endereco();
            EnderecoRequest er = req.endereco();
            end.setLogradouro(er.logradouro());
            end.setNumero(er.numero());
            end.setComplemento(er.complemento());
            end.setBairro(er.bairro());
            end.setCidade(er.cidade());
            end.setEstado(er.estado());
            end.setCep(er.cep());
            end.setLatitude(er.latitude());
            end.setLongitude(er.longitude());
            c.setEndereco(end);
        } else {
            c.setEndereco(null);
        }
    }

    private ClienteResponse toResponse(Cliente c) {
        EnderecoResponse endResp = null;
        if (c.getEndereco() != null) {
            Endereco e = c.getEndereco();
            endResp = new EnderecoResponse(
                    e.getId(), e.getLogradouro(), e.getNumero(), e.getComplemento(),
                    e.getBairro(), e.getCidade(), e.getEstado(), e.getCep(),
                    e.getLatitude(), e.getLongitude()
            );
        }

        List<EquipamentoResponse> equips = c.getEquipamentos().stream()
                .map(this::toEquipamentoResponse)
                .collect(Collectors.toList());

        return new ClienteResponse(
                c.getId(), c.getNome(), c.getCpfCnpj(), c.getTelefone(),
                c.getEmail(), endResp, c.getObservacoes(), c.getCriadoEm(), equips
        );
    }

    private EquipamentoResponse toEquipamentoResponse(Equipamento e) {
        return new EquipamentoResponse(
                e.getId(),
                e.getTipo().name(),
                e.getMarca(),
                e.getModelo(),
                e.getNumeroSerie()
        );
    }
}
