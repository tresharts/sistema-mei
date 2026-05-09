CREATE TABLE IF NOT EXISTS configuracoes_usuario (
    id UUID PRIMARY KEY,
    criado_em TIMESTAMP(6) NOT NULL,
    atualizado_em TIMESTAMP(6) NOT NULL,
    valor_das DECIMAL(12, 2) NOT NULL DEFAULT 72.00,
    nome_negocio VARCHAR(120),
    atividade VARCHAR(120),
    lembrete_das_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    resumo_diario_ativo BOOLEAN NOT NULL DEFAULT FALSE,
    usuario_id UUID NOT NULL UNIQUE,
    CONSTRAINT fk_configuracoes_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT chk_configuracoes_valor_das
        CHECK (valor_das > 0 AND valor_das <= 1000000.00)
);
