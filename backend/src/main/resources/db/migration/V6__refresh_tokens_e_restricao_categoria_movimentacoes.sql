CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY,
    criado_em TIMESTAMP(6) NOT NULL,
    atualizado_em TIMESTAMP(6) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    usuario_id UUID NOT NULL,
    CONSTRAINT fk_refresh_tokens_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario_id
    ON refresh_tokens (usuario_id);

ALTER TABLE movimentacoes
    DROP CONSTRAINT IF EXISTS fk_movimentacao_categoria;

ALTER TABLE movimentacoes
    ADD CONSTRAINT fk_movimentacao_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias (id);
