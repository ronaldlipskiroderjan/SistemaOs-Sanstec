package com.sistemaos.controller;

import com.sistemaos.dto.*;
import com.sistemaos.service.OrdemServicoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ordens")
public class OrdemServicoController {

    private final OrdemServicoService ordemServicoService;

    public OrdemServicoController(OrdemServicoService ordemServicoService) {
        this.ordemServicoService = ordemServicoService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrdemServicoResponse>> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID clienteId,
            @RequestParam(required = false) UUID tecnicoId) {
        return ResponseEntity.ok(ordemServicoService.listar(status, clienteId, tecnicoId));
    }

    @GetMapping("/minhas")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<List<OrdemServicoResponse>> minhas(Authentication auth) {
        return ResponseEntity.ok(ordemServicoService.listarMinhas(auth.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<OrdemServicoResponse> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(ordemServicoService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrdemServicoResponse> criar(
            @RequestBody @Valid OrdemServicoRequest req,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ordemServicoService.criar(req, auth.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrdemServicoResponse> atualizar(
            @PathVariable UUID id,
            @RequestBody @Valid OrdemServicoUpdateRequest req) {
        return ResponseEntity.ok(ordemServicoService.atualizar(id, req));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<OrdemServicoResponse> mudarStatus(
            @PathVariable UUID id,
            @RequestBody @Valid MudarStatusRequest req,
            Authentication auth) {
        return ResponseEntity.ok(ordemServicoService.mudarStatus(id, req, auth.getName()));
    }
}
