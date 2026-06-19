CREATE TABLE status_historico (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_servico_id UUID        NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    status_anterior  VARCHAR(20) CHECK (status_anterior IN ('ABERTA', 'APROVADA', 'NAO_APROVADA', 'FECHADA')),
    status_novo      VARCHAR(20) NOT NULL
                         CHECK (status_novo IN ('ABERTA', 'APROVADA', 'NAO_APROVADA', 'FECHADA')),
    usuario_id       UUID        REFERENCES usuarios(id) ON DELETE SET NULL,
    observacao       TEXT,
    criado_em        TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_historico_os ON status_historico(ordem_servico_id);
