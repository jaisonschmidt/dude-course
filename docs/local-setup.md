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
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

---

## 🗄️ Prisma (migrations e schema)

```bash
cd database

# Gerar Prisma Client
pnpm prisma generate

# Rodar migrations
pnpm prisma migrate dev

# Rodar seed (quando disponível)
pnpm prisma db seed
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

## 📦 Scripts úteis (raiz do monorepo)

```bash
# Instalar tudo
pnpm install

# Dev — backend + frontend juntos (se configurado no root package.json)
pnpm dev

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
| Prisma Client desatualizado | Rodar `pnpm prisma generate` no pacote `database/` |
| JWT inválido | Verificar `JWT_SECRET` no backend `.env` |
| `pnpm install` falha | Verificar versão do pnpm e Node.js 24 |
