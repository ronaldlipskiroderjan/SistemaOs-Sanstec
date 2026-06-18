CREATE TABLE equipamentos (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id   UUID        NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo         VARCHAR(30) NOT NULL CHECK (tipo IN ('MAQUINA_LAVAR', 'GELADEIRA', 'SECADORA', 'LAVA_LOUCA', 'OUTRO')),
    marca        VARCHAR(100),
    modelo       VARCHAR(100),
    numero_serie VARCHAR(100)
);

CREATE INDEX idx_equipamentos_cliente ON equipamentos(cliente_id);
