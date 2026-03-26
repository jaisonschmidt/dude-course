# 🏗️ Architecture

Este documento descreve as **decisões arquiteturais** do projeto **Dude Course**.

Para visão geral consulte: `README.md`

Para regras do domínio consulte: `docs/domain.md`

---

## 🧭 Architectural Style

O projeto adota o estilo **MVC (Model-View-Controller)** adaptado para uma API REST com frontend separado.

A decisão está registrada na ADR: `docs/adr/0001-mvc-architecture.md`

**Justificativa:** simplicidade, curva de aprendizado baixa, adequado para MVP, amplamente conhecido e suportado por ferramentas de IA.

### Camadas

- **Models** (`models/`): entidades de domínio e tipos. Regras de negócio puras, sem dependência de framework.
- **Services** (`services/`): lógica de negócio e orquestração. Coordenam repositories e aplicam regras de domínio.
- **Controllers** (`controllers/`): handlers HTTP. Recebem request, delegam para services, formatam response.
- **Repositories** (`repositories/`): acesso a dados via Prisma. Abstraídos por interfaces para testabilidade.
- **Routes** (`routes/`): definições de rotas Fastify, vinculam paths a controllers.
- **Middlewares** (`middlewares/`): auth, requestId, validação, error handling.
- **DTOs** (`dto/`): objetos de transferência de dados para request/response HTTP.
- **Plugins** (`plugins/`): plugins Fastify (requestId, CORS, etc.).
- **Config** (`config/`): configuração centralizada (env vars, constantes).

### Regras de dependência

```
Routes → Controllers → Services → Repositories → Models
                ↓            ↓
           Middlewares      DTOs
```

**Direção:** camadas externas (HTTP) dependem de camadas internas (negócio), nunca o contrário.

**Princípios:**

- **Models** não importam nenhuma outra camada
- **Services** dependem de Models e de interfaces de Repositories (abstrações)
- **Controllers** dependem de Services e DTOs — **nunca** contêm regra de negócio
- **Repositories** dependem de Models e do Prisma Client (importado do pacote `database`)
- **Routes** apenas conectam controllers a paths — sem lógica
- **Middlewares** são transversais: auth, error handling, requestId

---

## 🧩 Responsabilidades por camada

### Models (`models/`)
- Entidades de negócio (User, Course, Lesson, Enrollment, LessonProgress, Certificate)
- Tipos e interfaces TypeScript
- Regras invariantes do domínio

**Não deve conter:** SQL, HTTP, DTOs de API, dependências de framework, imports de Prisma

### Services (`services/`)
- Lógica de negócio e orquestração de operações
- Validação de regras de domínio (ex.: "curso deve estar publicado para matrícula")
- Coordenação de múltiplos repositories quando necessário
- Dependem de interfaces de repositories (abstrações), não de implementações concretas

**Não deve conter:** acesso direto ao request/response HTTP, formatação de resposta

### Controllers (`controllers/`)
- Recebem e parsam requests HTTP
- Validam input via schemas (Zod)
- Delegam para services
- Formatam response no padrão `{ data, requestId }`

**Regra:** controller é um adaptador HTTP — transforma request em input do service e output em response.

### Repositories (`repositories/`)
- Acesso a dados via Prisma Client
- Implementam interfaces definidas em `models/` ou `services/`
- Encapsulam queries e operações de banco

**Não deve conter:** regras de negócio, formatação HTTP

### Routes (`routes/`)
- Registram rotas no Fastify
- Vinculam método HTTP + path a controller + middlewares
- Sem lógica de negócio

### Middlewares (`middlewares/`)
- Autenticação JWT (validação de token, extração de user context)
- Geração/propagação de `requestId`
- Error handling global (mapear erros para respostas padronizadas)
- Validação de schemas

### DTOs (`dto/`)
- Objetos de request/response HTTP (alinhados com `docs/api-spec.md`)
- Schemas Zod para validação
- Separados das entidades de domínio (Models)

---

## 📦 Estrutura recomendada do repositório

O projeto é um **monorepo pnpm workspaces** com 4 pacotes:

```
dude-course/
  pnpm-workspace.yaml
  package.json              # root — scripts globais e devDependencies compartilhadas

  backend/                  # Pacote: API Fastify
    package.json
    src/
      models/               # entidades de domínio e tipos
      services/             # lógica de negócio
      controllers/          # handlers HTTP
      repositories/         # acesso a dados (Prisma)
      routes/               # definições de rotas Fastify
      middlewares/          # auth, requestId, error handling
      dto/                  # schemas Zod e tipos de request/response
      plugins/              # plugins Fastify
      config/               # env vars, constantes
      utils/                # logger (Pino), helpers
      server.ts             # bootstrap do Fastify
    test/
      unit/                 # testes unitários (services, models)

  frontend/                 # Pacote: Next.js App Router
    package.json
    src/
      app/                  # Next.js App Router (pages, layouts)
      components/           # componentes React
      hooks/                # custom hooks
      services/             # API client
      lib/                  # utilidades
      styles/               # CSS / Tailwind

  database/                 # Pacote: Prisma schema, migrations, seeds
    package.json
    prisma/
      schema.prisma         # schema do banco
      migrations/           # migrations geradas pelo Prisma
    src/
      client.ts             # Prisma Client singleton exportado
      seed.ts               # seed script

  integration-tests/        # Pacote: testes de integração
    package.json
    test/
      api/                  # testes de rotas com DB real
      repositories/         # testes de repositories
    helpers/                # fixtures, setup, teardown
```

### Frontend (Next.js App Router)

```
frontend/src/
  app/
    layout.tsx              # root layout
    page.tsx                # homepage
    (auth)/
      login/page.tsx
      register/page.tsx
    courses/
      page.tsx              # catálogo
      [id]/page.tsx         # detalhe do curso
    dashboard/
      page.tsx              # dashboard do aluno
    admin/
      courses/
        page.tsx            # gestão de cursos
  components/
    ui/                     # componentes base (Button, Input, Card)
    layout/                 # Header, Footer, Sidebar
    course/                 # componentes de curso
  hooks/
    use-auth.ts
    use-api.ts
  services/
    api-client.ts           # wrapper HTTP com token
    auth.ts                 # login, register, token management
    courses.ts              # CRUD de cursos
  styles/
    globals.css
```

---

## 🔐 Autenticação

- Autenticação baseada em **JWT Bearer Token**.
- Rotas protegidas devem validar token via middleware (`middlewares/auth.ts`).
- Expiração: 1h (MVP, sem refresh token).
- Hash de senha: **bcrypt**.
- Contratos e exemplos: `docs/api-spec.md`.
- Decisão registrada em: `docs/adr/0004-auth-jwt.md`.

---

## 📈 Observability

- **APM**: New Relic (instrumentação do backend Fastify).
- **Logging**: Pino (integrado nativamente ao Fastify) com logs estruturados em JSON.
- Padronizar `requestId` para correlação em logs e erros.
- Erros devem ser mapeados para o padrão especificado em `docs/api-spec.md`.
- Detalhes completos: `docs/observability.md`.

---

## 🔒 Segurança

Obrigatório:
- validação de input em controllers com schemas Zod
- queries parametrizadas via Prisma (proteção contra SQL injection)
- não logar tokens/senhas/dados sensíveis
- controles de acesso via middleware de auth para rotas protegidas
- proteção contra IDOR (verificar ownership de recursos)

Detalhes completos: `docs/security.md`.

---

## 📈 Evolução Arquitetural

Possíveis melhorias futuras (quando necessidade aparecer):
- cache (Redis) para leituras intensas
- processamento assíncrono (filas) para operações pesadas
- refresh tokens para sessões mais longas
- RBAC granular para admin
- rate limiting para endpoints de auth
