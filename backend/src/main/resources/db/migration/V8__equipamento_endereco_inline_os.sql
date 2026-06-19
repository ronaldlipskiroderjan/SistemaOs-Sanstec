-- Equipamento e endereço de serviço passam a ser campos inline na OS.
-- Cliente fica apenas com dados pessoais.

-- 1. Remover colunas FK de ordens_servico (derruba as constraints automaticamente)
ALTER TABLE ordens_servico DROP COLUMN IF EXISTS equipamento_id;
ALTER TABLE ordens_servico DROP COLUMN IF EXISTS endereco_servico_id;

-- 2. Remover endereco_id de clientes
ALTER TABLE clientes DROP COLUMN IF EXISTS endereco_id;

-- 3. Agora enderecos e equipamentos não têm mais referências externas → drop
DROP TABLE IF EXISTS equipamentos;
DROP TABLE IF EXISTS enderecos;

-- 4. Adicionar campos de equipamento inline na OS
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS equipamento_tipo        VARCHAR(30);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS equipamento_marca       VARCHAR(100);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS equipamento_modelo      VARCHAR(100);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS equipamento_numero_serie VARCHAR(100);

-- 5. Adicionar campos de endereço de serviço inline na OS
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_logradouro  VARCHAR(200);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_numero       VARCHAR(20);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_complemento VARCHAR(100);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_bairro       VARCHAR(100);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_cidade       VARCHAR(100);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_estado       VARCHAR(2);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_cep          VARCHAR(9);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_latitude     DECIMAL(10,8);
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS servico_longitude    DECIMAL(11,8);
