package com.sistemaos.config;

import com.sistemaos.entity.Usuario;
import com.sistemaos.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String adminEmail = "ronald@dev.com";
        try {
            if (!usuarioRepository.existsByEmail(adminEmail)) {
                Usuario admin = new Usuario();
                admin.setNome("Administrador");
                admin.setEmail(adminEmail);
                admin.setSenhaHash(passwordEncoder.encode("3010"));
                admin.setRole(Usuario.Role.ADMIN);
                admin.setAtivo(true);
                usuarioRepository.save(admin);
                log.info("Admin seed criado: {}", adminEmail);
            } else {
                log.info("Admin já existe no banco: {}", adminEmail);
            }
        } catch (Exception e) {
            log.error("Falha ao criar admin seed: {}", e.getMessage(), e);
        }
    }
}
