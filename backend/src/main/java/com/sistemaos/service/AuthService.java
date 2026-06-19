package com.sistemaos.service;

import com.sistemaos.dto.LoginRequest;
import com.sistemaos.dto.LoginResponse;
import com.sistemaos.dto.UsuarioMeResponse;
import com.sistemaos.entity.Usuario;
import com.sistemaos.exception.BusinessException;
import com.sistemaos.repository.UsuarioRepository;
import com.sistemaos.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioRepository usuarioRepository,
                       JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        log.debug("Tentativa de login: {}", request.email());
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.senha())
            );
            log.debug("Autenticação OK para: {}", auth.getName());

            Usuario usuario = usuarioRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

            String token = jwtTokenProvider.generate(usuario.getEmail(), usuario.getRole().name());
            log.debug("Token gerado para: {}", usuario.getEmail());
            return new LoginResponse(token, usuario.getId(), usuario.getNome(), usuario.getRole().name());
        } catch (Exception e) {
            log.debug("Falha no login [{}]: {}", e.getClass().getSimpleName(), e.getMessage());
            throw e;
        }
    }

    public UsuarioMeResponse me(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        return new UsuarioMeResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole().name(),
                usuario.getTelefone()
        );
    }
}
