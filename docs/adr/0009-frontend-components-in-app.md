# ADR-0009: Frontend Components In-App (não pacote externo)

## Status

Accepted

## Context

O projeto possui apenas 1 frontend consumer (Next.js App Router para o MVP v1). Ao definir a estratégia de componentes, havia duas opções:

1. **In-app**: componentes vivem em `frontend/src/components/`, importados diretamente
2. **Pacote externo**: componentes em pacote separado (`@dude-course/ui`), publicado e consumido via npm/pnpm workspace

A decisão foi necessária na Etapa 0 da implementação frontend (issue #54).

## Decision

Manter todos os componentes **in-app** dentro de `frontend/src/components/`, organizados em subpastas por domínio:

```
components/
  ui/           # componentes base reutilizáveis (Button, Input, Card, Modal, Badge, etc.)
  layout/       # Header, Footer, Sidebar
  auth/         # LoginForm, RegisterForm, ProtectedRoute
  course/       # CourseCard, LessonItem, YouTubePlayer, ProgressBar, etc.
  dashboard/    # DashboardCourseCard, CertificateCard, DashboardStats
  admin/        # CourseForm, LessonForm, LessonReorderList, ConfirmModal, etc.
```

Cada subpasta possui:
- Componentes `.tsx`
- Barrel export `index.ts`
- Subpasta `__tests__/` com testes `.spec.tsx`

## Consequences

### Positive
- **Server Components nativos**: componentes funcionam sem complicações de pacote externo (ex.: `'use client'` boundaries)
- **Tailwind CSS configuração única**: sem necessidade de configurar Tailwind em pacote separado
- **Iteração imediata**: alterar componente → hot-reload instantâneo, sem ciclo publish → install → test
- **Simplicidade**: sem overhead de build/publish de pacote, sem versionamento semântico de UI lib
- **Colocation de testes**: `__tests__/` ao lado dos componentes que testam

### Negative
- Se surgir um segundo frontend consumer, será necessário extrair componentes para pacote compartilhado
- Sem versionamento independente de componentes (atrelados ao deploy do frontend)

### Notes
- **Quando extrair?** Quando surgir um 2º frontend ou necessidade de design system corporativo
- Total de componentes implementados no MVP: ~30 componentes em 6 pastas, com 42 arquivos de teste
- Decisão tomada na Etapa 0 (issue #54, PR #61) e seguida consistentemente em todas as 7 etapas
