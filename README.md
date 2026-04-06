# Sistema MEI

Aplicacao web para gestao financeira de microempreendedores (MEI), com frontend em React/Vite e backend em Spring Boot.  
No fluxo de desenvolvimento local atual, o backend roda com H2 para facilitar testes e execucao rapida sem Docker.

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

### 1) Backend (H2)

No backend existe um script para padronizar execucao:

```bash
cd backend
./dev.sh
```

Esse comando:

- carrega variaveis de `backend/dev.env` (prioridade) ou `backend/.env`
- valida variaveis obrigatorias
- libera a porta `8080` se estiver ocupada
- sobe a API com `spring-boot:run`

### 2) Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Se voce usa `pnpm`, pode trocar por:

```bash
pnpm install
pnpm dev --host 0.0.0.0 --port 5173
```

## Variaveis de ambiente

### Backend

Arquivo padrao de desenvolvimento: `backend/dev.env`  
(versionado para facilitar onboarding local com H2)

Exemplo atual:

```env
DB_URL=jdbc:h2:file:./target/sistemamei-dev;MODE=PostgreSQL;DATABASE_TO_UPPER=false;DB_CLOSE_DELAY=-1
DB_USERNAME=sa
DB_PASSWORD=
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=dev-jwt-secret-local
GOOGLE_CLIENT_ID=dev-google-client-id
GOOGLE_CLIENT_SECRET=dev-google-client-secret
```

### Frontend

Arquivo: `frontend/.env`

Para desenvolvimento local, configure a API local:

```env
VITE_API_URL=http://localhost:8080
```

Importante: nao use aspas nem espaco extra apos `=`.

## Testes

Para rodar todos os testes do backend:

```bash
cd backend
./dev.sh teste
```

Alias aceito:

```bash
./dev.sh test
```

## Enderecos locais

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- H2 Console (quando habilitado): `http://localhost:8080/h2-console`
