CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_tipo
    ON movimentacoes (usuario_id, tipo);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_status
    ON movimentacoes (usuario_id, status);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_classificacao
    ON movimentacoes (usuario_id, classificacao);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_categoria
    ON movimentacoes (usuario_id, categoria_id);
