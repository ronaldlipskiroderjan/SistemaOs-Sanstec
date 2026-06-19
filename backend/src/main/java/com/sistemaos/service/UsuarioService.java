package com.sistemaos.service;

import com.sistemaos.dto.UsuarioRequest;
import com.sistemaos.dto.UsuarioResponse;
import com.sistemaos.dto.UsuarioUpdateRequest;
import com.sistemaos.entity.Usuario;
import com.sistemaos.exception.BusinessException;
import com.sistemaos.exception.ResourceNotFoundException;
import com.sistemaos.repository.OrdemServicoRepository;
import com.sistemaos.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final OrdemServicoRepository ordemServicoRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          OrdemServicoRepository ordemServicoRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.ordemServicoRepository = ordemServicoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar(String roleStr) {
        List<Usuario> usuarios;
        if (roleStr != null && !roleStr.isBlank()) {
            Usuario.Role role;
            try {
                role = Usuario.Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Role inválida: " + roleStr);
            }
            usuarios = usuarioRepository.findByRoleOrderByNomeAsc(role);
        } else {
            usuarios = usuarioRepository.findAllByOrderByNomeAsc();
        }
        return usuarios.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(UUID id) {
        return toResponse(usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id)));
    }

    public UsuarioResponse criar(UsuarioRequest req) {
        if (usuarioRepository.existsByEmail(req.email())) {
            throw new BusinessException("E-mail já cadastrado: " + req.email());
        }
        Usuario.Role role;
        try {
            role = Usuario.Role.valueOf(req.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Role inválida: " + req.role());
        }

        Usuario u = new Usuario();
        u.setNome(req.nome());
        u.setEmail(req.email());
        u.setSenhaHash(passwordEncoder.encode(req.senha()));
        u.setRole(role);
        u.setTelefone(req.telefone());
        u.setAtivo(true);

        return toResponse(usuarioRepository.save(u));
    }

    public UsuarioResponse atualizar(UUID id, UsuarioUpdateRequest req) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        u.setNome(req.nome());
        if (req.telefone() != null) u.setTelefone(req.telefone());
        if (req.ativo() != null) u.setAtivo(req.ativo());

        return toResponse(usuarioRepository.save(u));
    }

    public UsuarioResponse toggleAtivo(UUID id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
        u.setAtivo(!u.isAtivo());
        return toResponse(usuarioRepository.save(u));
    }

    public void deletar(UUID id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
        if (u.getRole() == Usuario.Role.ADMIN) {
            throw new BusinessException("Não é possível excluir um administrador.");
        }
        long totalOs = ordemServicoRepository.countByTecnicoId(id);
        if (totalOs > 0) {
            throw new BusinessException(
                "Técnico possui " + totalOs + " OS vinculada(s). Desative-o em vez de excluir.");
        }
        usuarioRepository.delete(u);
    }

    private UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(
                u.getId(), u.getNome(), u.getEmail(),
                u.getRole().name(), u.getTelefone(),
                u.isAtivo(), u.getCriadoEm()
        );
    }
}
