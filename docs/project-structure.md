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
  vitest.config.ts
  src/
    models/                   # entidades de domínio e tipos
      index.ts                # re-exports
      errors.ts               # NotFoundError, BadRequestError, ConflictError
      user.ts
      course.ts
      lesson.ts
      enrollment.ts
      lesson-progress.ts
      certificate.ts
    services/                 # lógica de negócio
      auth-service.ts
      course-service.ts         # listagem pública de cursos
      admin-course-service.ts   # CRUD admin de cursos
      admin-lesson-service.ts   # CRUD admin de aulas + reorder
      enrollment-service.ts
      lesson-progress-service.ts
      dashboard-service.ts
      certificate-service.ts
    controllers/              # handlers HTTP
      auth-controller.ts
      course-controller.ts      # listagem pública
      admin-course-controller.ts # CRUD admin cursos
      admin-lesson-controller.ts # CRUD admin aulas
      enrollment-controller.ts
      lesson-progress-controller.ts
      dashboard-controller.ts
      certificate-controller.ts
    repositories/             # acesso a dados (Prisma)
      user-repository.ts
      course-repository.ts
      lesson-repository.ts
      enrollment-repository.ts
      lesson-progress-repository.ts
      certificate-repository.ts
    routes/                   # definições de rotas Fastify
      index.ts                # composition root — registra todas as rotas
      auth-routes.ts
      course-routes.ts
      admin-course-routes.ts
      admin-lesson-routes.ts
      enrollment-routes.ts
      lesson-progress-routes.ts
      dashboard-routes.ts
      certificate-routes.ts
    middlewares/               # auth, guards, error handling
      auth.ts                 # JWT verification middleware
      admin-guard.ts          # role-based access (admin only)
      error-handler.ts
      not-found.ts
    dto/                      # schemas Zod e tipos request/response
      auth-dto.ts
      course-dto.ts
      admin-course-dto.ts
      admin-lesson-dto.ts
      enrollment-dto.ts
      lesson-progress-dto.ts
      dashboard-dto.ts
      certificate-dto.ts
    plugins/                  # plugins Fastify
      request-id.ts
      cors.ts
      swagger.ts              # Swagger UI + OpenAPI (condicional: dev/staging/test only)
    config/                   # configuração centralizada
      env.ts
    utils/                    # logger, helpers
      logger.ts
      prisma-errors.ts        # helper para tratar erros Prisma (RecordNotFound)
      zod-to-json-schema.ts   # Zod → JSON Schema (strip $schema for Fastify Ajv compatibility)
    server.ts                 # bootstrap do Fastify
  test/
    setup.ts                  # Vitest global setup
    helpers/
      fastify-mocks.ts        # mock helpers para testes de controllers
    unit/
      config/
        env.spec.ts
      controllers/            # testes unitários de controllers
        auth-controller.spec.ts
        course-controller.spec.ts
        admin-course-controller.spec.ts
        admin-lesson-controller.spec.ts
        enrollment-controller.spec.ts
        lesson-progress-controller.spec.ts
        dashboard-controller.spec.ts
        certificate-controller.spec.ts
      services/               # testes unitários de services
        auth-service.spec.ts
        course-service.spec.ts
        admin-course-service.spec.ts
        admin-lesson-service.spec.ts
        enrollment-service.spec.ts
        lesson-progress-service.spec.ts
        dashboard-service.spec.ts
        certificate-service.spec.ts
      middlewares/             # testes unitários de middlewares
        auth.spec.ts
        admin-guard.spec.ts
        error-handler.spec.ts
      server.spec.ts
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
  vitest.config.ts              # fileParallelism: false (DB compartilhado)
  test/
    health.spec.ts              # GET /health, GET /ready
    observability.spec.ts       # requestId propagation, X-Request-Id
    api/                        # testes de rotas com DB real
      auth.spec.ts
      courses.spec.ts
      admin-courses.spec.ts
      admin-lessons.spec.ts
      enrollments.spec.ts
      lesson-progress.spec.ts
      dashboard.spec.ts
      certificate.spec.ts
    repositories/               # testes de repositories
  helpers/
    db.ts                       # Prisma test client, truncateAll, seed helpers
    request.ts                  # HTTP helper (get, post, put, patch, del)
```

### Regras
- Testes de integração usam **banco real** (MySQL de teste: `dude_course_test`).
- Testes de API sobem o servidor Fastify e fazem requests HTTP reais.
- Setup e teardown garantem isolamento entre testes.
- `fileParallelism: false` — arquivos executam sequencialmente para evitar race conditions no DB.

---

## 🌐 Frontend (Next.js App Router)

### Estrutura de pastas

> Legenda: ✅ Implementado | 📋 Planejado

```
frontend/
  package.json
  tsconfig.json
  vitest.config.ts
  next.config.ts
  tailwind.config.ts
  src/
    app/                      # Next.js App Router
      layout.tsx              # ✅ root layout
      page.tsx                # ✅ homepage
      globals.css             # ✅ estilos globais
      (auth)/
        login/page.tsx        # ✅ página de login
        register/page.tsx     # ✅ página de registro
      courses/
        page.tsx              # 📋 catálogo de cursos
        [id]/
          page.tsx            # 📋 detalhe do curso
          lessons/
            [lessonId]/page.tsx  # 📋 player de aula
      dashboard/
        page.tsx              # ✅ dashboard do aluno
      admin/
        courses/
          page.tsx            # 📋 listagem admin
          new/page.tsx        # 📋 criar curso
          [id]/
            edit/page.tsx     # 📋 editar curso
            lessons/page.tsx  # 📋 gerenciar aulas
      __tests__/
        page.spec.tsx         # ✅ teste da homepage
    components/
      ui/                     # componentes base
        Button.tsx            # ✅
        __tests__/
          Button.spec.tsx     # ✅
      layout/                 # ✅ barrel (Header, Footer, Sidebar — 📋)
      course/                 # ✅ barrel (componentes de curso — 📋)
      auth/                   # ✅ barrel (componentes de auth — 📋)
    hooks/
      use-auth.ts             # ✅ hook de autenticação
      use-api.ts              # ✅ hook genérico de API
    services/
      api.ts                  # ✅ wrapper HTTP com token JWT
      auth-service.ts         # ✅ login, register, logout
      __tests__/
        api.spec.ts           # ✅ testes do API client
    lib/
      utils.ts                # ✅ utilidades gerais
    styles/
      .gitkeep                # ✅ placeholder
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
