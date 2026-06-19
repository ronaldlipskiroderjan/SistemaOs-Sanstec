package com.sistemaos.repository;

import com.sistemaos.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {

    @Query("""
            SELECT c FROM Cliente c
            WHERE :busca = ''
               OR LOWER(c.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
               OR LOWER(COALESCE(c.cpfCnpj, '')) LIKE LOWER(CONCAT('%', :busca, '%'))
               OR COALESCE(c.telefone, '') LIKE CONCAT('%', :busca, '%')
            ORDER BY c.nome
            """)
    List<Cliente> search(@Param("busca") String busca);
}
