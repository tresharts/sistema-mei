# Regras do banco - Fase 1

## Tabela usuarios
- email deve ser único
- senha não deve ser salva em texto puro
- timestamps obrigatórios

## Tabela movimentacoes
- toda movimentação pertence a um usuário
- tipo deve ser RECEITA ou DESPESA
- origem deve ser PESSOAL ou EMPRESARIAL
- valor deve ser maior que zero
- data_movimentacao obrigatória
