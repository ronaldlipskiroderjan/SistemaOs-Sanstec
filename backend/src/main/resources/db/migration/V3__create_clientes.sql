CREATE TABLE clientes (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(150) NOT NULL,
    cpf_cnpj    VARCHAR(18)  UNIQUE,
    telefone    VARCHAR(20),
    email       VARCHAR(150),
    endereco_id UUID         REFERENCES enderecos(id) ON DELETE SET NULL,
    observacoes TEXT,
    criado_em   TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_clientes_nome     ON clientes(nome);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
