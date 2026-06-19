package com.sistemaos.repository;

import com.sistemaos.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Usuario> findByRoleAndAtivoTrue(Usuario.Role role);
    List<Usuario> findAllByOrderByNomeAsc();
    List<Usuario> findByRoleOrderByNomeAsc(Usuario.Role role);
}
