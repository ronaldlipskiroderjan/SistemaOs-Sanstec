CREATE TABLE enderecos (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    logradouro  VARCHAR(200)  NOT NULL,
    numero      VARCHAR(20)   NOT NULL,
    complemento VARCHAR(100),
    bairro      VARCHAR(100)  NOT NULL,
    cidade      VARCHAR(100)  NOT NULL,
    estado      CHAR(2)       NOT NULL,
    cep         VARCHAR(9)    NOT NULL,
    latitude    DECIMAL(10,8),
    longitude   DECIMAL(11,8)
);
