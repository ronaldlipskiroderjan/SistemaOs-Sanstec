CREATE TABLE usuarios (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome       VARCHAR(150) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'TECNICO')),
    telefone   VARCHAR(20),
    ativo      BOOLEAN      NOT NULL DEFAULT true,
    criado_em  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role  ON usuarios(role);
