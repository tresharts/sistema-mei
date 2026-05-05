ALTER TABLE categorias
    ADD COLUMN IF NOT EXISTS classificacao VARCHAR(20);

UPDATE categorias
SET classificacao = 'EMPRESARIAL'
WHERE classificacao IS NULL;

ALTER TABLE categorias
    ALTER COLUMN classificacao SET NOT NULL;

ALTER TABLE categorias
    DROP CONSTRAINT IF EXISTS uk_categorias_usuario_tipo_nome;

ALTER TABLE categorias
    ADD CONSTRAINT uk_categorias_usuario_tipo_classificacao_nome
    UNIQUE (usuario_id, tipo, classificacao, nome);

CREATE INDEX IF NOT EXISTS idx_categorias_usuario_tipo_classificacao
    ON categorias (usuario_id, tipo, classificacao);

ALTER TABLE movimentacoes
    ADD CONSTRAINT chk_movimentacoes_valor_teto
    CHECK (valor <= 1000000.00);
