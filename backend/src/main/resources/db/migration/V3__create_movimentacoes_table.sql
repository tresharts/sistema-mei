CREATE TABLE IF NOT EXISTS movimentacoes (
    id UUID PRIMARY KEY,
    criado_em TIMESTAMP(6) NOT NULL,
    atualizado_em TIMESTAMP(6) NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    data_vencimento DATE,
    tipo VARCHAR(20) NOT NULL,
    classificacao VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    categoria_id UUID NOT NULL,
    usuario_id UUID NOT NULL,

    CONSTRAINT fk_movimentacao_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
    CONSTRAINT fk_movimentacao_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT chk_movimentacoes_valor_positivo
        CHECK (valor > 0)
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_id
    ON movimentacoes (usuario_id);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_data
    ON movimentacoes (usuario_id, data);

CREATE INDEX IF NOT EXISTS idx_movimentacao_categoria_id
    ON movimentacoes (categoria_id);