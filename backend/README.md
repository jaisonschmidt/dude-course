# backend

API HTTP do Dude Course, construída com **Fastify** seguindo o padrão **MVC** em Node.js 24 + TypeScript.

Faz parte do monorepo `dude-course`. Consulte o [README raiz](../README.md) para o setup completo do projeto.

---

## ⚙️ Variáveis de Ambiente

Copie o arquivo de exemplo antes de rodar:

```bash
cp .env.example .env
```

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
