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

Logs e PIDs ficam em `.dev/` (ignorado no Git).
No frontend, o script usa `pnpm dev` quando `pnpm` estiver instalado; caso contrario usa `npm run dev`.

### 2) Backend (H2)

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

### 3) Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Se voce usa `pnpm`, pode trocar por:

```bash
pnpm install
pnpm dev
```

Opcional:

- para expor na rede local (ex.: celular), rode com `--host 0.0.0.0`
- para escolher porta, use `--port <porta>`

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

Observacao sobre CORS local:

- o backend aceita `localhost` e `127.0.0.1` em qualquer porta local
- `CORS_ORIGIN`/`FRONTEND_URL` continuam uteis para definir origem principal em ambientes publicados

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

- Frontend: `http://localhost:5173` (padrao do Vite) ou outra porta local
- Backend: `http://localhost:8080`
- H2 Console (quando habilitado): `http://localhost:8080/h2-console`

## Deploy do frontend na Vercel

Como o frontend usa React Router com `BrowserRouter`, o projeto inclui `frontend/vercel.json` para reescrever qualquer rota para `index.html`.

O mesmo `vercel.json` tambem faz proxy da API publicada no Render por baixo do dominio da Vercel:

- `/api/(.*)` -> `https://sistema-mei.onrender.com/$1`
- `/oauth2/(.*)` -> `https://sistema-mei.onrender.com/oauth2/$1`
- `/login/oauth2/(.*)` -> `https://sistema-mei.onrender.com/login/oauth2/$1`

Esse proxy e intencional. Ele evita chamadas cross-site no navegador e permite que o cookie HttpOnly de refresh seja usado no fluxo publicado.

Na Vercel, configure:

- `Root Directory`: `frontend`
- `Build Command`: `pnpm build`
- `Output Directory`: `dist`
- `Install Command`: `pnpm install`

Variavel de ambiente do frontend em producao:

```env
VITE_API_URL=/api
```

Tambem e seguro nao configurar `VITE_API_URL` na Vercel, porque o frontend usa `/api` como fallback. Nao aponte `VITE_API_URL` diretamente para o Render em producao, pois isso contorna o proxy e volta a criar fluxo cross-site.

Ajustes necessarios no backend publicado:

- defina `FRONTEND_URL` com a URL final da Vercel, por exemplo `https://sistemamei.vercel.app`
- defina `CORS_ORIGIN` com a mesma URL da Vercel
- defina `AUTH_REFRESH_COOKIE_SECURE=true`
- defina `AUTH_REFRESH_COOKIE_PATH=/api/auth`
- mantenha `AUTH_REFRESH_COOKIE_DOMAIN` vazio, para o navegador associar o cookie ao dominio da Vercel
- use `AUTH_REFRESH_COOKIE_SAME_SITE=Lax` quando o acesso passar pelo proxy da Vercel
- se usar login com Google, configure os redirects autorizados para a URL publica da Vercel, incluindo `https://sistemamei.vercel.app/login/oauth2/code/google`

Variaveis recomendadas para o Render:

```env
FRONTEND_URL=https://sistemamei.vercel.app
CORS_ORIGIN=https://sistemamei.vercel.app
AUTH_REFRESH_COOKIE_SECURE=true
AUTH_REFRESH_COOKIE_PATH=/api/auth
AUTH_REFRESH_COOKIE_SAME_SITE=Lax
AUTH_REFRESH_COOKIE_DOMAIN=
JPA_DDL_AUTO=validate
```
