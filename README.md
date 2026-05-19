# BoraMEI

Aplicacao web para gestao financeira de microempreendedores (MEI), com frontend em React/Vite e backend em Spring Boot.  
No fluxo de desenvolvimento local atual, o backend roda com H2 para facilitar testes e execucao rapida sem Docker.

Link: boramei.vercel.app

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Java 21 + Spring Boot + Spring Security + JPA
- Banco local de desenvolvimento: H2

## Pre-requisitos

- Java 21
- Node.js 20+ (ou versao compativel com o projeto)
- npm ou pnpm

## Estrutura

- `frontend/`: aplicacao web
- `backend/`: API Spring Boot

## Desenvolvimento local

### 1) MVP rapido (frontend + backend)

Na raiz do projeto:

```bash
./dev.sh up
```

Comandos disponiveis:

```bash
./dev.sh up      # sobe backend + frontend em background
./dev.sh down    # derruba os dois servicos
./dev.sh status  # mostra status e caminhos dos logs
```
