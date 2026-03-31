# backend

API HTTP do Dude Course, construída com **Fastify** seguindo o padrão **MVC** em Node.js 24 + TypeScript.

Faz parte do monorepo `dude-course`. Consulte o [README raiz](../README.md) para o setup completo do projeto.

---

## ⚙️ Variáveis de Ambiente

O backend requer um arquivo `.env` na pasta `backend/` com as variáveis abaixo. Sem ele, o servidor **não inicia** (valida via Zod no startup).

### Setup rápido

```bash
# Na raiz do projeto ou dentro de backend/
cp backend/.env.example backend/.env
```

Em seguida, edite `backend/.env` e ajuste os valores para o seu ambiente local:

```dotenv
# Conexão MySQL local (ajuste user/password conforme seu docker-compose)
DATABASE_URL=mysql://root:root@localhost:3306/dude_course

# Chave para assinar JWT tokens (mínimo 32 caracteres)
JWT_SECRET=local-dev-secret-key-minimum-32-characters-long

# Porta do servidor
PORT=3001

# Ambiente (development habilita Swagger UI)
NODE_ENV=development

# Nível de log (debug mostra mais detalhes)
LOG_LEVEL=info

# CORS — origin do frontend
CORS_ORIGIN=http://localhost:3000
```

> ⚠️ **Erro comum**: `Invalid environment variables: DATABASE_URL: expected string, received undefined`
> Isso significa que o arquivo `.env` não existe ou não foi encontrado. Verifique que ele está em `backend/.env` (não na raiz do monorepo).

### Referência de variáveis

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | URL de conexão MySQL (Prisma) | ✅ |
| `JWT_SECRET` | Chave secreta para assinatura de tokens (mín. 32 chars) | ✅ |
| `PORT` | Porta do servidor (padrão: `3001`) | ✅ |
| `NODE_ENV` | Ambiente de execução (`development`, `staging`, `production`) | ✅ |
| `LOG_LEVEL` | Nível de log do Pino (`info`, `debug`, `warn`, `error`) | ✅ |
| `CORS_ORIGIN` | Origem permitida pelo CORS (ex.: `http://localhost:3000`) | ✅ |
| `NEW_RELIC_ENABLED` | Ativa o agente New Relic (`true`/`false`) | ❌ opcional |
| `NEW_RELIC_APP_NAME` | Nome da aplicação no New Relic | ❌ opcional |
| `NEW_RELIC_LICENSE_KEY` | License key do New Relic | ❌ opcional |

---

## 📜 Scripts

| Script | Comando | Descrição |
|--------|---------|----------|
| `dev` | `tsx watch src/server.ts` | Inicia o servidor com hot-reload |
| `build` | `tsc` | Compila TypeScript para `dist/` |
| `start` | `node dist/server.js` | Inicia o servidor compilado (produção) |
| `test` | `vitest run` | Roda os testes unitários |
| `test:watch` | `vitest` | Roda os testes em modo watch |
| `test:coverage` | `vitest run --coverage` | Roda os testes com cobertura |
| `lint` | `tsc --noEmit` | Verifica erros de tipagem TypeScript |

---

## 🚀 Como Rodar Isolado

```bash
pnpm --filter backend dev
```

> Certifique-se de que o MySQL está rodando (via `pnpm dev:db` na raiz) e que `backend/.env` está configurado.

---

## 📖 Swagger UI (dev/staging)

A API possui uma interface interativa Swagger UI gerada automaticamente a partir dos schemas das rotas.

**Disponível apenas quando** `NODE_ENV=development`, `staging` ou `test`. **Não é registrada em produção.**

### Como acessar

1. Inicie o servidor: `pnpm --filter backend dev`
2. Acesse no navegador: **http://localhost:3001/documentation**

### Autenticação

1. Faça login via `POST /api/v1/auth/login` para obter um access token
2. Na Swagger UI, clique no botão **Authorize** (🔓)
3. Informe: `Bearer <seu_token>`
4. Agora os endpoints protegidos poderão ser testados diretamente

### Endpoints disponíveis

| Endpoint | Descrição |
|----------|-----------|
| `/documentation` | Swagger UI (interface interativa) |
| `/documentation/json` | OpenAPI 3.x spec em JSON |
