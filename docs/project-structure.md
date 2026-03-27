# 🗂️ Project Structure

Este documento define a **estrutura do repositório** e convenções de organização do código para o projeto **Dude Course**.

Objetivo:
- reduzir ambiguidade na criação de arquivos/pastas
- orientar contribuições humanas e assistidas por IA
- reforçar limites de camadas MVC (conforme `docs/architecture.md`)

Referências:
- `README.md`
- `docs/architecture.md`
- `docs/engineer-guidelines.md`
- `docs/ai/ai-context.md`
- `docs/agent-task-flow.md`

---

## 📦 Estrutura do repositório (top-level)

O projeto é um **monorepo pnpm workspaces** com 4 pacotes:

```
dude-course/
  README.md
  AGENTS.md
  CONTEXT_PACK.md
  pnpm-workspace.yaml
  package.json                # root — scripts globais, devDependencies compartilhadas

  .github/
    workflows/
      ci-backend.yml          # CI: backend + integration-tests (com MySQL efêmero)
      ci-frontend.yml         # CI: frontend (testes + lint)
      deploy-database.yml     # Deploy: prisma migrate deploy → HML → prod
      deploy-backend.yml      # Deploy: API → HML → prod
      deploy-frontend.yml     # Deploy: Next.js → HML → prod

  docs/
    architecture.md
    domain.md
    database.md
    api-spec.md
    engineer-guidelines.md
    observability.md
    security.md
    local-setup.md
    project-structure.md
    ai/
      ai-context.md
    agent-task-flow.md
    adr/
      0000-adr-template.md

  backend/                    # Pacote: API Fastify
    package.json
    tsconfig.json
    src/
    test/

  frontend/                   # Pacote: Next.js App Router
    package.json
    tsconfig.json
    src/

  database/                   # Pacote: Prisma schema, migrations, seeds
    package.json
    prisma/

  integration-tests/          # Pacote: testes de integração
    package.json
    test/
    helpers/
```

---

## 🧱 Backend (Fastify + TypeScript)

### Estrutura de pastas

```
backend/
  package.json
  tsconfig.json
  src/
    models/                   # entidades de domínio e tipos
      user.ts
      course.ts
      lesson.ts
      enrollment.ts
      lesson-progress.ts
      certificate.ts
    services/                 # lógica de negócio
      auth-service.ts
      course-service.ts
      lesson-service.ts
      enrollment-service.ts
      progress-service.ts
      certificate-service.ts
    controllers/              # handlers HTTP
      auth-controller.ts
      course-controller.ts
      lesson-controller.ts
      enrollment-controller.ts
      progress-controller.ts
      certificate-controller.ts
    repositories/             # acesso a dados (Prisma)
      user-repository.ts
      course-repository.ts
      lesson-repository.ts
      enrollment-repository.ts
      progress-repository.ts
      certificate-repository.ts
    routes/                   # definições de rotas Fastify
      auth-routes.ts
      course-routes.ts
      lesson-routes.ts
      enrollment-routes.ts
      progress-routes.ts
      certificate-routes.ts
      index.ts                # registra todas as rotas
    middlewares/               # auth, requestId, error handling
      auth-middleware.ts
      error-handler.ts
    dto/                      # schemas Zod e tipos request/response
      auth-dto.ts
      course-dto.ts
      lesson-dto.ts
      enrollment-dto.ts
      progress-dto.ts
      certificate-dto.ts
    plugins/                  # plugins Fastify
      request-id.ts
      cors.ts
    config/                   # configuração centralizada
      env.ts
    utils/                    # logger, helpers
      logger.ts
    server.ts                 # bootstrap do Fastify
  test/
    unit/
      services/              # testes unitários de services
      models/                # testes unitários de models
```

### Regras MVC
- **Models**: zero dependência de framework/DB. Regras de negócio puras.
- **Services**: lógica de negócio + orquestração. Dependem de interfaces de repositories.
- **Controllers**: handlers HTTP/DTOs — sem regra de negócio.
- **Repositories**: acesso a dados via Prisma. Implementam interfaces.
- **Routes**: vinculam paths a controllers — sem lógica.
- **Middlewares**: transversais (auth, error handling, requestId).

Detalhes completos em: `docs/architecture.md`.

---

## 🗄️ Database (Prisma)

```
database/
  package.json
  prisma/
    schema.prisma             # schema do banco (MySQL)
    migrations/               # migrations geradas pelo Prisma
  src/
    client.ts                 # Prisma Client singleton exportado
    seed.ts                   # script de seed
```

### Regras
- Schema é a fonte de verdade do banco (Prisma Migrate).
- Migrations são geradas automaticamente via `prisma migrate dev`.
- O pacote exporta o Prisma Client para uso no `backend/` e `integration-tests/`.

---

## 🧪 Integration Tests

```
integration-tests/
  package.json
  vitest.config.ts
  test/
    api/                      # testes de rotas com DB real
      auth.test.ts
      courses.test.ts
      enrollments.test.ts
      progress.test.ts
      certificates.test.ts
    repositories/             # testes de repositories
  helpers/
    setup.ts                  # setup/teardown do DB de teste
    fixtures.ts               # dados de teste
    api-client.ts             # helper para chamadas HTTP
```

### Regras
- Testes de integração usam **banco real** (MySQL de teste).
- Testes de API sobem o servidor Fastify e fazem requests HTTP reais.
- Setup e teardown garantem isolamento entre testes.

---

## 🌐 Frontend (Next.js App Router)

### Estrutura de pastas

```
frontend/
  package.json
  tsconfig.json
  next.config.ts
  tailwind.config.ts
  src/
    app/                      # Next.js App Router
      layout.tsx              # root layout
      page.tsx                # homepage
      (auth)/
        login/page.tsx
        register/page.tsx
      courses/
        page.tsx              # catálogo de cursos
        [id]/
          page.tsx            # detalhe do curso
          lessons/
            [lessonId]/page.tsx
      dashboard/
        page.tsx              # dashboard do aluno
      admin/
        courses/
          page.tsx            # listagem admin
          new/page.tsx        # criar curso
          [id]/
            edit/page.tsx     # editar curso
            lessons/page.tsx  # gerenciar aulas
    components/
      ui/                     # componentes base (Button, Input, Card, Badge)
      layout/                 # Header, Footer, Sidebar
      course/                 # componentes específicos de curso
      auth/                   # componentes de autenticação
    hooks/
      use-auth.ts             # hook de autenticação
      use-api.ts              # hook genérico de API
    services/
      api-client.ts           # wrapper HTTP com token JWT
      auth.ts                 # login, register, logout
      courses.ts              # operações de cursos
      enrollments.ts          # matrículas
      progress.ts             # progresso
      certificates.ts         # certificados
    lib/
      utils.ts                # utilidades gerais
    styles/
      globals.css
```

### Regras
- **Rendering híbrido**: SSR para páginas dinâmicas/autenticadas, SSG para conteúdo público estático.
- Client da API deve refletir `docs/api-spec.md`.
- Não duplicar regras de domínio no frontend (backend é fonte de verdade).
- UI deve lidar com estados: loading, erro, vazio, sucesso, token expirado.
- `'use client'` somente em componentes que precisam de interatividade.

---

## 📄 Convenções de arquivos

### Nomeação
- Pastas e arquivos: `kebab-case`
- Classes: `PascalCase`
- Funções/variáveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

### Onde colocar o quê
- Contratos de API: `docs/api-spec.md`
- Regras de domínio: `docs/domain.md`
- Schema: `docs/database.md`
- Observabilidade: `docs/observability.md`
- Segurança: `docs/security.md`
- Decisões: `docs/adr/*`
- Contexto para IA: `docs/ai/ai-context.md`

---

## 🤖 Regras para IA

- Não criar arquivos fora desta estrutura sem justificar.
- Se uma nova pasta for necessária:
  - propor mudança em `docs/project-structure.md` antes.
- Manter mudanças pequenas e nas camadas corretas.
- Respeitar separação de pacotes: backend não importa diretamente do frontend e vice-versa.
