# 🛠️ Local Setup

Este documento descreve como preparar e executar o projeto **Dude Course** localmente.

Referências:
- Visão geral: `README.md`
- Estrutura do repositório: `docs/project-structure.md`
- API: `docs/api-spec.md`
- Banco: `docs/database.md`

---

## ✅ Pré-requisitos

### Ferramentas

- **Node.js 24** (LTS)
- **pnpm** (gerenciador de pacotes — monorepo workspaces)
- **MySQL 8.0** (local ou via Docker)
- **Docker + Docker Compose** (recomendado para MySQL)
- **Git**

### Opcional (recomendado)
- **New Relic** agent para Node.js (APM em staging/prod)

---

## 📦 Clonar o repositório

```bash
git clone <repo-url>
cd dude-course
```

---

## 📦 Instalar dependências (raiz do monorepo)

```bash
pnpm install
```

Isso instala dependências de todos os pacotes: `backend/`, `frontend/`, `database/`, `integration-tests/`.

---

## 🗄️ Banco de dados

### Opção A) Docker (recomendado)

```bash
docker compose up -d
```

O `docker-compose.yml` na raiz sobe:
- MySQL 8.0 na porta **3306**
- Banco `dude_course` criado automaticamente

### Opção B) MySQL local instalado

1. Inicie o MySQL
2. Crie o banco:

```sql
CREATE DATABASE dude_course CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## ⚙️ Variáveis de ambiente

### Backend

Crie `backend/.env` baseado em `backend/.env.example`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (Prisma)
DATABASE_URL="mysql://root:root@localhost:3306/dude_course"

# Auth
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# New Relic (opcional em dev)
NEW_RELIC_ENABLED=false
NEW_RELIC_APP_NAME=dude-course-api
NEW_RELIC_LICENSE_KEY=
```

### Frontend

Crie `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Alternativamente, copie de `frontend/.env.example`.

### Database

Crie `database/.env` baseado em `database/.env.example`:

```env
DATABASE_URL=mysql://root:root@localhost:3306/dude_course
```

---

## 🗄️ Prisma (migrations e schema)

```bash
cd database

# Gerar Prisma Client
pnpm db:generate

# Rodar migrations (apenas em desenvolvimento local)
pnpm db:migrate:dev

# Rodar seed
pnpm db:seed
```

> ⚠️ **`migrate dev` é exclusivo de desenvolvimento local.** Nunca use este comando em CI, staging ou produção — ele pode resetar dados. Em todos os outros ambientes, use `prisma migrate deploy`.

### Banco de testes isolado (para rodar `integration-tests/` localmente)

Os testes de integração usam um banco separado para não contaminar dados de desenvolvimento. Crie-o uma única vez:

```sql
CREATE DATABASE dude_course_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Crie o arquivo `integration-tests/.env` baseado em `integration-tests/.env.example`:

```env
DATABASE_URL=mysql://root:root@localhost:3306/dude_course_test
```

---

## 🔧 Backend

```bash
cd backend
pnpm dev
```

Backend disponível em `http://localhost:3001`.

---

## 🌐 Frontend

```bash
cd frontend
pnpm dev
```

Frontend disponível em `http://localhost:3000`.

---

## ✅ Verificar

- Backend health: `http://localhost:3001/health`
- Frontend: `http://localhost:3000`

---

## 🛡️ Validação local pré-CI

O projeto possui um comando `validate` que espelha as verificações feitas pela pipeline de CI. Ele é executado automaticamente no hook `pre-push`, mas pode ser rodado manualmente a qualquer momento:

```bash
pnpm validate
```

O comando executa em sequência:
1. **`pnpm lint`** — type-check de todos os pacotes do monorepo (`backend`, `frontend`, `integration-tests`, `database`)
2. **`pnpm --filter backend test`** — testes unitários do backend

### O que isso previne?

| Problema | Detecção | Exemplo |
|----------|----------|---------|
| Erro de compilação em qualquer pacote | `pnpm lint` (tsc --noEmit) | Import de símbolo inexistente em `integration-tests/` |
| Teste unitário quebrando | `pnpm --filter backend test` | Mock desatualizado após refactor de service |
| Type mismatch entre pacotes | `pnpm lint` em todos | DTO alterado no backend mas não no integration-tests |

### Testes de integração locais (opcional)

Testes de integração requerem backend + MySQL rodando. Para rodar localmente:

```bash
# 1. Subir MySQL e backend
pnpm dev:db
pnpm dev:backend

# 2. Rodar testes de integração
RUN_INTEGRATION_TESTS=true DATABASE_URL_TEST=mysql://root:root@localhost:3306/dude_course_test \
  pnpm --filter integration-tests test
```

> **Nota**: A variável `DATABASE_URL_TEST` pode ser definida no arquivo `integration-tests/.env`. Se não existir, o helper aceita `DATABASE_URL` como fallback.

### Regra de ouro

> **Se `pnpm validate` passa localmente, a CI não deve falhar por erros de compilação ou testes unitários.**
>
> Falhas de CI que escapam ao `validate` local indicam que o hook precisa ser estendido — abra uma issue se isso acontecer.

## 📦 Scripts úteis (raiz do monorepo)

```bash
# Instalar tudo
pnpm install

# Subir MySQL local via Docker
pnpm dev:db

# Dev — backend + frontend juntos (se configurado no root package.json)
pnpm dev

# Subir backend ou frontend isoladamente
pnpm dev:backend
pnpm dev:frontend

# Rodar testes unitários do backend
pnpm --filter backend test

# Rodar testes de integração
pnpm --filter integration-tests test

# Lint
pnpm --filter backend lint
pnpm --filter frontend lint
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro de conexão com MySQL | Verificar se MySQL/Docker está rodando e `DATABASE_URL` no `.env` |
| Porta 3001 em uso | Alterar `PORT` no `backend/.env` |
| Porta 3000 em uso | Parar outro processo Next.js ou alterar porta |
| Migrations falham | Verificar se o banco `dude_course` existe e credenciais estão corretas |
| Prisma Client desatualizado | Rodar `pnpm db:generate` no pacote `database/` |
| JWT inválido | Verificar `JWT_SECRET` no backend `.env` |
| `pnpm install` falha | Verificar versão do pnpm e Node.js 24 |

---

## 📁 Arquivos base criados no bootstrap

O setup inicial do projeto assume a existência destes arquivos raiz:

- `package.json`
- `pnpm-workspace.yaml`
- `docker-compose.yml`
- `.editorconfig`
- `.gitignore`
- `.nvmrc`

Também são esperados arquivos de exemplo de ambiente em:

- `backend/.env.example`
- `frontend/.env.example`
- `database/.env.example`
