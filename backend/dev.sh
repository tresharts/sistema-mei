#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE="${1:-run}"

if [ "$#" -gt 1 ]; then
  echo "Uso: ./dev.sh [test|teste]"
  exit 1
fi

run_maven() {
  local mvn_args=("$@")

  if [ -x "./mvnw" ]; then
    if ./mvnw "${mvn_args[@]}"; then
      return 0
    fi

    echo "Maven Wrapper falhou."
  fi

  if [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* || "$(uname -s)" == CYGWIN* ]]; then
    if [ -f "./mvnw.cmd" ] && command -v cmd.exe >/dev/null 2>&1; then
      echo "Tentando Maven Wrapper do Windows..."
      if cmd.exe //c mvnw.cmd "${mvn_args[@]}"; then
        return 0
      fi
      echo "Maven Wrapper do Windows falhou."
    fi
  fi

  if command -v mvn >/dev/null 2>&1; then
    echo "Tentando usar Maven instalado no sistema..."
    mvn "${mvn_args[@]}"
    return $?
  fi

  echo "Nao foi possivel executar Maven."
  echo "Verifique sua conexao com repo.maven.apache.org, limpe o cache em ~/.m2/wrapper/dists ou instale o comando 'mvn'."
  return 1
}

cleanup_backend_port() {
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti:8080 2>/dev/null || true)"

    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 2>/dev/null || true
    fi

    return 0
  fi

  if command -v fuser >/dev/null 2>&1; then
    fuser -k 8080/tcp >/dev/null 2>&1 || true
    return 0
  fi

  echo "Aviso: nao encontrei lsof/fuser para liberar a porta 8080 automaticamente."
}

if [ "$MODE" = "test" ] || [ "$MODE" = "teste" ]; then
  run_maven test
  exit 0
fi

if [ "$MODE" != "run" ]; then
  echo "Modo invalido: $MODE"
  echo "Uso: ./dev.sh [test|teste]"
  exit 1
fi

load_env_file() {
  local env_file="$1"

  if [ ! -f "$env_file" ]; then
    return 0
  fi

  while IFS= read -r raw_line || [ -n "$raw_line" ]; do
    local line="$raw_line"
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"

    if [ -z "$line" ] || [[ "$line" == \#* ]]; then
      continue
    fi

    if [[ "$line" != *=* ]]; then
      continue
    fi

    local key="${line%%=*}"
    local value="${line#*=}"

    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    value="${value#"${value%%[![:space:]]*}"}"

    if [[ "$value" =~ ^\".*\"$ ]] || [[ "$value" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "$key=$value"
  done < "$env_file"
}

reset_h2_if_configured() {
  local reset_flag="${H2_RESET_ON_START:-false}"

  # Aceita true/TRUE/True.
  if [ "${reset_flag,,}" != "true" ]; then
    return 0
  fi

  if [[ "${DB_URL}" != jdbc:h2:file:* ]]; then
    echo "H2 reset habilitado, mas DB_URL nao aponta para jdbc:h2:file. Ignorando reset."
    return 0
  fi

  local db_path="${DB_URL#jdbc:h2:file:}"
  db_path="${db_path%%;*}"

  if [ -z "$db_path" ]; then
    echo "Nao foi possivel determinar o caminho do arquivo H2 para reset."
    return 0
  fi

  if [[ "$db_path" != /* ]]; then
    db_path="$SCRIPT_DIR/$db_path"
  fi

  echo "Resetando banco H2 local: ${db_path}.mv.db"
  rm -f "${db_path}.mv.db" "${db_path}.trace.db"
}

# Carrega variaveis de ambiente no mesmo formato do fluxo local.
# Base: .env (segredos locais). Override: dev.env (ajustes de desenvolvimento).
ENV_BASE_FILE="$SCRIPT_DIR/.env"
ENV_OVERRIDE_FILE="$SCRIPT_DIR/dev.env"

if [ ! -f "$ENV_BASE_FILE" ] && [ ! -f "$ENV_OVERRIDE_FILE" ]; then
  echo "Arquivo de ambiente nao encontrado."
  echo "Esperado: $ENV_BASE_FILE e/ou $ENV_OVERRIDE_FILE"
  exit 1
fi

load_env_file "$ENV_BASE_FILE"
load_env_file "$ENV_OVERRIDE_FILE"

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

reset_h2_if_configured

# Limpa a porta 8080 caso esteja ocupada.
cleanup_backend_port

run_maven spring-boot:run
