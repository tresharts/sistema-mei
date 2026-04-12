#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$ROOT_DIR/.dev"
PID_DIR="$STATE_DIR/pids"
LOG_DIR="$STATE_DIR/logs"

BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"
BACKEND_LOG_FILE="$LOG_DIR/backend.log"
FRONTEND_LOG_FILE="$LOG_DIR/frontend.log"

MODE="${1:-up}"

usage() {
  echo "Uso: ./dev.sh [up|down|status]"
}

ensure_state_dirs() {
  mkdir -p "$PID_DIR" "$LOG_DIR"
}

is_pid_running() {
  local pid_file="$1"

  if [ ! -f "$pid_file" ]; then
    return 1
  fi

  local pid
  pid="$(cat "$pid_file" 2>/dev/null || true)"

  if [ -z "$pid" ]; then
    return 1
  fi

  kill -0 "$pid" 2>/dev/null
}

cleanup_stale_pid() {
  local pid_file="$1"
  if [ -f "$pid_file" ] && ! is_pid_running "$pid_file"; then
    rm -f "$pid_file"
  fi
}

start_backend() {
  cleanup_stale_pid "$BACKEND_PID_FILE"

  if is_pid_running "$BACKEND_PID_FILE"; then
    echo "Backend ja esta em execucao (PID $(cat "$BACKEND_PID_FILE"))."
    return
  fi

  if [ ! -x "$ROOT_DIR/backend/dev.sh" ]; then
    echo "Script do backend nao encontrado ou sem permissao de execucao: backend/dev.sh"
    exit 1
  fi

  echo "Subindo backend..."
  nohup bash -lc "cd \"$ROOT_DIR/backend\" && ./dev.sh" >>"$BACKEND_LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" >"$BACKEND_PID_FILE"

  sleep 2
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "Falha ao subir backend. Ultimas linhas de log:"
    tail -n 30 "$BACKEND_LOG_FILE" || true
    rm -f "$BACKEND_PID_FILE"
    exit 1
  fi

  echo "Backend iniciado (PID $pid)."
}

start_frontend() {
  cleanup_stale_pid "$FRONTEND_PID_FILE"

  if is_pid_running "$FRONTEND_PID_FILE"; then
    echo "Frontend ja esta em execucao (PID $(cat "$FRONTEND_PID_FILE"))."
    return
  fi

  local run_cmd
  if [ -f "$ROOT_DIR/frontend/pnpm-lock.yaml" ] && command -v pnpm >/dev/null 2>&1; then
    run_cmd="pnpm dev"
  else
    run_cmd="npm run dev"
  fi

  echo "Subindo frontend com '$run_cmd'..."
  nohup bash -lc "cd \"$ROOT_DIR/frontend\" && $run_cmd" >>"$FRONTEND_LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" >"$FRONTEND_PID_FILE"

  sleep 2
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "Falha ao subir frontend. Ultimas linhas de log:"
    tail -n 30 "$FRONTEND_LOG_FILE" || true
    rm -f "$FRONTEND_PID_FILE"
    exit 1
  fi

  echo "Frontend iniciado (PID $pid)."
}

stop_service() {
  local name="$1"
  local pid_file="$2"

  cleanup_stale_pid "$pid_file"

  if [ ! -f "$pid_file" ]; then
    echo "$name nao esta em execucao."
    return
  fi

  local pid
  pid="$(cat "$pid_file")"

  echo "Parando $name (PID $pid)..."
  kill "$pid" 2>/dev/null || true

  for _ in {1..20}; do
    if kill -0 "$pid" 2>/dev/null; then
      sleep 0.2
    else
      break
    fi
  done

  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true
  fi

  rm -f "$pid_file"
  echo "$name parado."
}

print_status() {
  cleanup_stale_pid "$BACKEND_PID_FILE"
  cleanup_stale_pid "$FRONTEND_PID_FILE"

  if is_pid_running "$BACKEND_PID_FILE"; then
    echo "Backend: rodando (PID $(cat "$BACKEND_PID_FILE")) em http://localhost:8080"
  else
    echo "Backend: parado"
  fi

  if is_pid_running "$FRONTEND_PID_FILE"; then
    echo "Frontend: rodando (PID $(cat "$FRONTEND_PID_FILE")) em http://localhost:5173"
  else
    echo "Frontend: parado"
  fi

  echo "Logs:"
  echo "  - $BACKEND_LOG_FILE"
  echo "  - $FRONTEND_LOG_FILE"
}

main() {
  if [ "$#" -gt 1 ]; then
    usage
    exit 1
  fi

  ensure_state_dirs

  case "$MODE" in
    up)
      start_backend
      start_frontend
      print_status
      ;;
    down)
      stop_service "Frontend" "$FRONTEND_PID_FILE"
      stop_service "Backend" "$BACKEND_PID_FILE"
      ;;
    status)
      print_status
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
