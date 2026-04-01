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

Isso instala dependências de todos os pacotes: `backend/`, `frontend/`, `database/`, `integration-tests/`, `e2e/`.

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

---

## 🌱 Dados do Seed

O comando `db:seed` popula o banco com dados mínimos para desenvolvimento. Todos os dados são inseridos com `upsert`, portanto o seed é **idempotente** — pode ser rodado múltiplas vezes sem duplicar dados.

### Usuários criados

| Email | Senha | Role | Descrição |
|-------|-------|------|----------|
| `admin@dudecourse.local` | `Admin@123456` | `admin` | Usuário administrador com acesso ao painel admin |
| `learner@dudecourse.local` | `Learner@123456` | `learner` | Aluno de teste com matrícula e progresso |

### Cursos criados

| ID | Título | Status | Aulas |
|----|--------|--------|-------|
| 1 | Introdução ao TypeScript | `published` | 3 aulas |
| 2 | Node.js Avançado (Em breve) | `draft` | 0 aulas |

### Aulas do curso "Introdução ao TypeScript"

| Posição | Título | YouTube URL |
|---------|--------|-------------|
| 1 | O que é TypeScript? | `youtube.com/watch?v=zeCDuo74uzA` |
| 2 | Tipos básicos | `youtube.com/watch?v=ahCwqrYpIuM` |
| 3 | Interfaces e Types | `youtube.com/watch?v=crjIq7LEAYw` |

### Dados de progresso

- O `learner` está matriculado no curso 1
- A aula 1 ("O que é TypeScript?") está marcada como concluída (progresso: 33%)

---

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

## ✅ Verificação pós-setup

Após completar todos os passos anteriores, verifique que tudo está funcionando:

### Checklist rápido

- [ ] **Backend health**: acesse http://localhost:3001/health — deve retornar `{ "status": "ok" }`
- [ ] **Frontend**: acesse http://localhost:3000 — deve exibir a homepage com o curso "Introdução ao TypeScript"
- [ ] **Login como admin**: acesse http://localhost:3000/login → `admin@dudecourse.local` / `Admin@123456`
- [ ] **Painel admin**: após login admin, acesse http://localhost:3000/admin/courses — deve listar cursos
- [ ] **Login como aluno**: faça logout e logue com `learner@dudecourse.local` / `Learner@123456`
- [ ] **Dashboard**: acesse http://localhost:3000/dashboard — deve mostrar o curso matriculado com 33% de progresso
- [ ] **Swagger UI**: acesse http://localhost:3001/documentation — interface interativa da API

### Swagger UI (documentação interativa da API)

Disponível **apenas** em `NODE_ENV=development` ou `staging`.

| URL | Descrição |
|-----|----------|
| http://localhost:3001/documentation | Interface Swagger UI |
| http://localhost:3001/documentation/json | OpenAPI 3.x spec em JSON |

Para testar endpoints protegidos:
1. Execute `POST /api/v1/auth/login` com `{ "email": "admin@dudecourse.local", "password": "Admin@123456" }`
2. Copie o `accessToken` da resposta
3. Clique no botão **Authorize** (🔓) no topo da página
4. Informe: `Bearer <seu_token>`
5. Agora todos os endpoints protegidos podem ser testados diretamente

---

## 🧪 Rodar testes

### Testes unitários do backend

```bash
pnpm --filter backend test            # rodar todos
pnpm --filter backend test:watch       # modo watch
pnpm --filter backend test:coverage    # com relatório de cobertura
```

### Testes do frontend

```bash
pnpm --filter frontend test            # rodar todos (42 arquivos, 223 testes)
pnpm --filter frontend test:watch      # modo watch
pnpm --filter frontend test:coverage   # com relatório de cobertura
```

### Testes E2E (Playwright)

Os testes E2E requerem que backend + frontend + MySQL estejam rodando localmente.

#### Instalar browsers (apenas na primeira vez)

```bash
pnpm --filter e2e exec playwright install --with-deps chromium
```

#### Rodar testes E2E

```bash
pnpm e2e                # rodar todos (headless)
pnpm e2e:ui             # modo UI interativo do Playwright
pnpm e2e:headed         # rodar com browser visível
pnpm e2e:debug          # modo debug (Playwright Inspector)
```

> Para sobrescrever as variáveis padrão, crie `e2e/.env` com os valores desejados. Consulte [`e2e/README.md`](../e2e/README.md#environment-variables) para detalhes.

### Todos os testes do monorepo

```bash
pnpm test
```

> Isso roda testes de todos os pacotes que possuem o script `test`.

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

Testes de integração requerem MySQL + backend rodando **contra o banco de teste**.

> ⚠️ **Armadilha comum**: o backend e os testes de integração **devem apontar para o mesmo banco de dados**. Os testes fazem seed direto no DB via Prisma, enquanto a API lê desse mesmo DB. Se o backend estiver no `dude_course` e os testes no `dude_course_test`, os dados inseridos pelos seeds serão invisíveis para a API.

#### Passo a passo completo

```bash
# 1. Subir MySQL via Docker
pnpm dev:db

# 2. Criar banco de testes (apenas na primeira vez)
docker exec dude-course-mysql mysql -uroot -proot \
  -e "CREATE DATABASE IF NOT EXISTS dude_course_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Aplicar migrations no banco de testes
DATABASE_URL="mysql://root:root@localhost:3306/dude_course_test" \
  pnpm --filter database exec prisma migrate deploy

# 4. Iniciar backend apontando para o banco de TESTE
DATABASE_URL="mysql://root:root@localhost:3306/dude_course_test" \
  JWT_SECRET="test-secret-key-minimum-32-characters-long" \
  pnpm dev:backend

# 5. Em outro terminal, rodar testes de integração
RUN_INTEGRATION_TESTS=true \
  DATABASE_URL_TEST="mysql://root:root@localhost:3306/dude_course_test" \
  BACKEND_URL="http://localhost:3001" \
  pnpm --filter integration-tests test
```

> **Dica**: Após validar, reinicie o backend com `DATABASE_URL` apontando para `dude_course` para retomar o desenvolvimento normal.

> **Alternativa**: Crie `integration-tests/.env` baseado no `.env.example` para não precisar passar variáveis toda vez. O helper `db.ts` usa `DATABASE_URL_TEST` e aceita `DATABASE_URL` como fallback.

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
| Porta 3001 em uso | Alterar `PORT` no `backend/.env` ou `kill $(lsof -ti:3001)` |
| Porta 3000 em uso | Parar outro processo Next.js ou alterar porta |
| Migrations falham | Verificar se o banco `dude_course` existe e credenciais estão corretas |
| Prisma Client desatualizado | Rodar `pnpm db:generate` no pacote `database/` |
| JWT inválido | Verificar `JWT_SECRET` no backend `.env` |
| `pnpm install` falha | Verificar versão do pnpm e Node.js 24 |
| Integration tests: dados não aparecem na API | Backend e testes **devem usar o mesmo banco** (`dude_course_test`). Reinicie o backend com `DATABASE_URL` apontando para o banco de teste |
| Integration tests: seed insere mas API retorna vazio | Confirme que seeds usam `$executeRaw` (INSERT) e não `$queryRaw` (SELECT) — ver guidelines em `testing.instructions.md` |
| Integration tests: `LAST_INSERT_ID` retorna errado | MySQL retorna `bigint` — use `Number(rows[0]!.id)` para converter |
| E2E: browser não encontrado | Rodar `pnpm --filter e2e exec playwright install --with-deps chromium` |
| E2E: testes falham por timeout | Verificar se backend (`:3001`) e frontend (`:3000`) estão rodando |

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
