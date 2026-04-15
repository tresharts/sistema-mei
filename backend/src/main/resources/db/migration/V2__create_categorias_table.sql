CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY,
    criado_em TIMESTAMP(6) NOT NULL,
    atualizado_em TIMESTAMP(6) NOT NULL,
    nome VARCHAR(120) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    padrao BOOLEAN NOT NULL DEFAULT FALSE,
    usuario_id UUID NOT NULL,
    CONSTRAINT fk_categorias_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT uk_categorias_usuario_tipo_nome
        UNIQUE (usuario_id, tipo, nome)
);

CREATE INDEX IF NOT EXISTS idx_categorias_usuario_id
    ON categorias (usuario_id);

CREATE INDEX IF NOT EXISTS idx_categorias_usuario_tipo
    ON categorias (usuario_id, tipo);