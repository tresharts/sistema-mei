#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE="${1:-run}"

if [ "$#" -gt 1 ]; then
  echo "Uso: ./dev.sh [test|teste]"
  exit 1
fi

if [ "$MODE" = "test" ] || [ "$MODE" = "teste" ]; then
  ./mvnw test
  exit 0
fi

if [ "$MODE" != "run" ]; then
  echo "Modo invalido: $MODE"
  echo "Uso: ./dev.sh [test|teste]"
  exit 1
fi

# Carrega variaveis de ambiente no mesmo formato do fluxo local.
# Prioridade: dev.env (se existir), depois .env.
ENV_FILE="$SCRIPT_DIR/dev.env"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE="$SCRIPT_DIR/.env"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo de ambiente nao encontrado."
  echo "Esperado: $SCRIPT_DIR/dev.env ou $SCRIPT_DIR/.env"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# Valida variaveis obrigatorias para evitar falha tardia durante o boot.
required_vars=(
  DB_URL
  DB_USERNAME
  CORS_ORIGIN
  JWT_SECRET
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
)

for var_name in "${required_vars[@]}"; do
  if [ -z "${!var_name:-}" ]; then
    echo "Variavel obrigatoria ausente no arquivo de ambiente: $var_name"
    exit 1
  fi
done

# Em bancos nao-H2, a senha precisa existir.
if [[ "${DB_URL}" != jdbc:h2* ]] && [ -z "${DB_PASSWORD:-}" ]; then
  echo "Variavel obrigatoria ausente no arquivo de ambiente: DB_PASSWORD"
  exit 1
fi

# Limpa a porta 8080 caso esteja ocupada.
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

./mvnw spring-boot:run
