package com.sistemaos.repository;

import com.sistemaos.entity.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, UUID> {

    @Query("""
            SELECT o FROM OrdemServico o
            LEFT JOIN FETCH o.cliente
            LEFT JOIN FETCH o.tecnico
            ORDER BY o.dataAbertura DESC
            """)
    List<OrdemServico> findAllWithJoins();

    @Query("""
            SELECT DISTINCT o FROM OrdemServico o
            LEFT JOIN FETCH o.cliente
            LEFT JOIN FETCH o.tecnico
            LEFT JOIN FETCH o.historico h
            LEFT JOIN FETCH h.usuario
            WHERE o.id = :id
            """)
    Optional<OrdemServico> findByIdWithDetails(UUID id);

    @Query(value = "SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0) FROM ordens_servico", nativeQuery = true)
    int findMaxNumero();

    long countByTecnicoId(UUID tecnicoId);

    long countByClienteId(UUID clienteId);

    long countByStatus(OrdemServico.StatusOS status);

    @Query("""
            SELECT o FROM OrdemServico o
            LEFT JOIN FETCH o.cliente
            LEFT JOIN FETCH o.tecnico
            WHERE o.tecnico.id = :tecnicoId
            ORDER BY o.dataAbertura DESC
            """)
    List<OrdemServico> findByTecnicoIdWithJoins(@Param("tecnicoId") UUID tecnicoId);

    @Query("""
            SELECT DISTINCT o FROM OrdemServico o
            LEFT JOIN FETCH o.cliente
            LEFT JOIN FETCH o.tecnico
            LEFT JOIN FETCH o.historico h
            LEFT JOIN FETCH h.usuario
            WHERE o.tecnico.id = :tecnicoId
            AND o.status NOT IN ('FECHADA', 'NAO_APROVADA')
            ORDER BY o.dataAbertura DESC
            """)
    List<OrdemServico> findAtivasByTecnicoId(@Param("tecnicoId") UUID tecnicoId);
}
