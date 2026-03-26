# 🗂️ Project Structure

Este documento define a **estrutura recomendada do repositório** e convenções de organização do código para o projeto.

Objetivo:
- reduzir ambiguidade na criação de arquivos/pastas
- orientar contribuições humanas e assistidas por IA
- reforçar limites de camadas (conforme `docs/architecture.md`)

Referências:
- `README.md`
- `docs/architecture.md`
- `docs/engineer-guidelines.md`
- `docs/ai/ai-context.md`
- `docs/agent-task-flow.md`

---

## 📦 Estrutura do repositório (top-level)

Recomendado:

```
project-root/
  README.md

  docs/
    architecture.md
    domain.md
    database.md
    api-spec.md
    engineer-guidelines.md
    observability.md
    security.md
    ai/ai-context.md
    agent-task-flow.md
    project-structure.md

    adr/
      0000-adr-template.md
      [ADRs do projeto]

  backend/
    package.json
    src/
      ...

  frontend/
    package.json
    pages/
      ...
```

---

## 🧱 Backend

<!-- Adapte a estrutura conforme o estilo arquitetural definido em docs/architecture.md -->

### Estrutura de pastas (exemplo)

```
backend/
  src/
    domain/
      entities/
      value-objects/          # opcional
      errors/

    application/
      use-cases/
      ports/
      dto/                    # opcional (modelos de entrada/saída do app, não HTTP)

    interfaces/
      http/
        controllers/
        routes/
        middlewares/
        dto/                  # request/response DTOs (HTTP)
      mappers/                # DTO <-> modelos app/domain

    infrastructure/
      db/
        connection/
        migrations/
      repositories/
      logging/
      observability/
      providers/              # serviços externos (futuro)

    main/
      container/              # composition root / wiring
      server/                 # server bootstrap
```

> **Nota:** Esta estrutura é um exemplo baseado em arquitetura em camadas. Adapte conforme o estilo arquitetural e a linguagem do seu projeto (ver `docs/architecture.md`).

### Regras rápidas
- **Domínio/Modelos**: zero dependência de framework/DB.
- **Aplicação/Serviços**: casos de uso + abstrações; não importa infra/interfaces.
- **Interfaces/Controllers**: handlers HTTP/DTOs; sem regra de negócio.
- **Infraestrutura**: DB/repos/providers/logging/observabilidade.
- **Composição/Main**: única camada que "junta tudo".

> Adapte camadas e regras conforme o estilo arquitetural do projeto (ver `docs/architecture.md`).

Detalhes completos em: `docs/architecture.md`.

---

## 🧪 Testes (backend)

Recomendação de organização:

```
backend/
  test/
    unit/
      domain/
      application/
    integration/
      repositories/
      http/
    e2e/                      # mínimo viável (fluxo feliz)
```

Regras:
- Unit tests focam em `domain` e `application`.
- Integration tests cobrem repos e endpoints críticos.
- E2E cobre o fluxo principal do sistema.

---

## 🌐 Frontend

<!-- [PREENCHER] Adapte a estrutura conforme o framework frontend do projeto. -->

### Estrutura de pastas (exemplo)

```
frontend/
  [PREENCHER] Estrutura do framework frontend adotado
  
  components/
  hooks/                      # ou equivalente
  services/
    api-client.[ext]          # wrapper HTTP
    auth.[ext]                # login/token helpers
    [recurso].[ext]           # clients por recurso

  styles/
```

### Regras
- Client da API deve refletir `docs/api-spec.md`.
- Não duplicar regras de domínio no frontend (backend é fonte de verdade).
- UI deve lidar com:
  - loading
  - erros (mensagens amigáveis)
  - token expirado (redirect para login)

---

## 📄 Convenções de arquivos

### Nomeação
- Pastas e arquivos: `kebab-case` (preferencial) **ou** padrão do framework.
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
- Manter mudanças pequenas e em camadas corretas.
