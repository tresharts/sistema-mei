ALTER TABLE IF EXISTS movimentacoes
DROP CONSTRAINT IF EXISTS fk_movimentacao_categoria;

ALTER TABLE IF EXISTS movimentacoes
ADD CONSTRAINT fk_movimentacao_categoria
FOREIGN KEY (categoria_id)
REFERENCES categorias (id);
