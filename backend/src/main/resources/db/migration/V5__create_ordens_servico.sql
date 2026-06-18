CREATE TABLE ordens_servico (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    numero               VARCHAR(20)   NOT NULL UNIQUE,
    cliente_id           UUID          NOT NULL REFERENCES clientes(id),
    equipamento_id       UUID          REFERENCES equipamentos(id) ON DELETE SET NULL,
    tecnico_id           UUID          REFERENCES usuarios(id) ON DELETE SET NULL,
    endereco_servico_id  UUID          REFERENCES enderecos(id) ON DELETE SET NULL,
    descricao_problema   TEXT          NOT NULL,
    diagnostico          TEXT,
    status               VARCHAR(20)   NOT NULL DEFAULT 'ABERTA'
                             CHECK (status IN ('ABERTA', 'APROVADA', 'NAO_APROVADA', 'FECHADA')),
    valor_orcamento      DECIMAL(10,2),
    valor_final          DECIMAL(10,2),
    data_abertura        TIMESTAMP     NOT NULL DEFAULT now(),
    data_agendamento     TIMESTAMP,
    data_fechamento      TIMESTAMP
);

CREATE INDEX idx_os_status   ON ordens_servico(status);
CREATE INDEX idx_os_tecnico  ON ordens_servico(tecnico_id);
CREATE INDEX idx_os_cliente  ON ordens_servico(cliente_id);
