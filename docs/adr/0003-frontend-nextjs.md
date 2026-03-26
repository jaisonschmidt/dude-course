# ADR-0003: Next.js com App Router e Rendering Híbrido

## Status
Accepted

## Context
O projeto Dude Course precisa de um frontend web responsivo para apresentar catálogo de cursos, player de aulas (YouTube embed), dashboard do aluno e painel admin. O frontend consome a API REST do backend Fastify.

### Alternativas consideradas

#### 1. Next.js (App Router)
- Prós: SSR + SSG híbrido, React Server Components, excelente DX, grande ecossistema, SEO-friendly
- Contras: complexidade do App Router, mais opinado

#### 2. Nuxt.js
- Prós: SSR/SSG, bom DX, Vue.js
- Contras: ecossistema menor que React/Next.js, menos familiar

#### 3. React SPA (Vite)
- Prós: simplicidade, controle total, rápido para prototipar
- Contras: sem SSR (ruim para SEO no catálogo público), sem SSG

#### 4. SvelteKit
- Prós: performance, DX excelente, SSR/SSG
- Contras: ecossistema menor, menos suporte de IA

## Decision
Adotar **Next.js com App Router** e **rendering híbrido** (SSR + SSG).

**Estratégia de rendering:**
- **SSG**: páginas públicas estáticas (homepage, catálogo de cursos)
- **SSR**: páginas dinâmicas/autenticadas (dashboard, detalhes do curso com progresso, admin)
- **React Server Components**: padrão para componentes que não precisam de interatividade
- **`'use client'`**: somente para componentes com hooks, event handlers, browser APIs

**Estrutura:**
```
frontend/src/
  app/           # App Router (pages, layouts)
  components/    # React components
  hooks/         # Custom hooks
  services/      # API client
  lib/           # Utilities
  styles/        # CSS / Tailwind
```

## Consequences

### Positive
- SEO excelente para páginas públicas (catálogo de cursos)
- Performance com Server Components (menos JS no client)
- Flexibilidade de rendering por página/componente
- Grande ecossistema React e comunidade ativa
- Excelente suporte de ferramentas de IA (Copilot, Cursor)

### Negative
- Complexidade do App Router (Server vs Client Components)
- Overhead de setup comparado a SPA puro
- Dependência do framework Next.js

### Mitigations
- Documentar padrões de rendering em `docs/project-structure.md`
- Instruction file para frontend (`.github/instructions/frontend-pages.instructions.md`)
- Usar `'use client'` explicitamente quando necessário

## Notes
- Impacta: `docs/project-structure.md`, `docs/architecture.md`, `.github/instructions/frontend-pages.instructions.md`, `.github/agents/frontend-dev.agent.md`
- TypeScript é obrigatório no frontend
