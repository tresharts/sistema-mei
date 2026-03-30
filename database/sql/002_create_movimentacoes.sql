CREATE TABLE movimentacoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    origem VARCHAR(20) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    data_movimentacao DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimentacoes_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

    CONSTRAINT ck_movimentacoes_tipo
        CHECK (tipo IN ('RECEITA', 'DESPESA')),

    CONSTRAINT ck_movimentacoes_origem
        CHECK (origem IN ('PESSOAL', 'EMPRESARIAL')),

    CONSTRAINT ck_movimentacoes_valor
        CHECK (valor > 0)
);
