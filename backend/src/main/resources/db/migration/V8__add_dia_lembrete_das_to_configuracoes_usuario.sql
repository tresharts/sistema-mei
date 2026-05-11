ALTER TABLE configuracoes_usuario
ADD COLUMN dia_lembrete_das INTEGER NOT NULL DEFAULT 20;

ALTER TABLE configuracoes_usuario
ADD CONSTRAINT chk_configuracoes_dia_lembrete_das
CHECK (dia_lembrete_das >= 1 AND dia_lembrete_das <= 28);
