package com.sistemaos.controller;

import com.sistemaos.dto.UsuarioMeResponse;
import com.sistemaos.dto.UsuarioRequest;
import com.sistemaos.dto.UsuarioResponse;
import com.sistemaos.dto.UsuarioUpdateRequest;
import com.sistemaos.entity.Usuario;
import com.sistemaos.repository.UsuarioRepository;
import com.sistemaos.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/tecnicos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioMeResponse>> tecnicos() {
        List<UsuarioMeResponse> lista = usuarioRepository
                .findByRoleAndAtivoTrue(Usuario.Role.TECNICO)
                .stream()
                .map(u -> new UsuarioMeResponse(
                        u.getId(), u.getNome(), u.getEmail(),
                        u.getRole().name(), u.getTelefone()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> listar(
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(usuarioService.listar(role));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> criar(@RequestBody @Valid UsuarioRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.criar(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable UUID id,
            @RequestBody @Valid UsuarioUpdateRequest req) {
        return ResponseEntity.ok(usuarioService.atualizar(id, req));
    }

    @PatchMapping("/{id}/ativo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> toggleAtivo(@PathVariable UUID id) {
        return ResponseEntity.ok(usuarioService.toggleAtivo(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
