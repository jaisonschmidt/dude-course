# frontend

Interface web do Dude Course, construída com **Next.js 15** (App Router) + **React 19** + **TypeScript** + **Tailwind CSS**.

Faz parte do monorepo `dude-course`. Consulte o [README raiz](../README.md) para o setup completo do projeto.

---

## ⚙️ Variáveis de Ambiente

Copie o arquivo de exemplo antes de rodar:

```bash
cp .env.example .env.local
```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL base da API backend | `http://localhost:3001/api/v1` |

---

## 📜 Scripts

| Script | Comando | Descrição |
|--------|---------|----------|
| `dev` | `next dev` | Inicia em modo desenvolvimento com hot-reload |
| `build` | `next build` | Gera o build de produção |
| `start` | `next start` | Serve o build de produção |
| `test` | `vitest run` | Roda os testes unitários |
| `test:watch` | `vitest` | Roda os testes em modo watch |
| `test:coverage` | `vitest run --coverage` | Roda os testes com cobertura |
| `lint` | `tsc --noEmit` | Verifica erros de tipagem TypeScript |

---

## 🚀 Como Rodar Isolado

```bash
pnpm --filter frontend dev
```

> O frontend espera o backend rodando em `http://localhost:3001`. Configure `NEXT_PUBLIC_API_URL` em `frontend/.env.local` se a URL for diferente.

---

## 🗂️ Estrutura de Pastas

```
src/
  middleware.ts               # proteção de rotas server-side (cookie check)
  app/                        # Next.js App Router (16 pages)
    layout.tsx                # root layout
    providers.tsx             # AuthProvider
    layout-shell.tsx          # Header + Footer shell
    error.tsx                 # error boundary global
    not-found.tsx             # página 404
    (auth)/                   # login + registro
    courses/                  # catálogo + detalhe + player de aula
    dashboard/                # dashboard do aluno
    admin/                    # painel admin (CRUD cursos + aulas)
  components/                 # 30+ componentes em 6 pastas
    ui/                       # Badge, Button, Card, EmptyState, ErrorMessage, Input, LoadingSpinner, Modal, Pagination
    layout/                   # Header, Footer, Sidebar
    auth/                     # LoginForm, RegisterForm, ProtectedRoute
    course/                   # CourseCard, CourseList, ProgressBar, EnrollButton, LessonItem, LessonList, YouTubePlayer
    dashboard/                # DashboardCourseCard, CertificateCard, DashboardStats
    admin/                    # AdminCourseCard, ConfirmModal, CourseForm, LessonForm, LessonReorderList
  hooks/                      # use-auth.tsx (AuthProvider + Context), use-api.ts
  services/                   # 8 services + types/
    api.ts                    # HTTP client (fetch, JWT Bearer, 401 handler)
    auth-service.ts           # login, register, logout
    course-service.ts         # listCourses, getCourse
    enrollment-service.ts     # enrollInCourse, markLessonComplete
    dashboard-service.ts      # getDashboard
    certificate-service.ts    # generateCertificate
    admin-course-service.ts   # CRUD admin de cursos
    admin-lesson-service.ts   # CRUD admin de aulas + reorder
    types/                    # course.ts, dashboard.ts, certificate.ts
  lib/                        # utils.ts
```

---

## 📦 Dependências-Chave

| Lib | Propósito |
|-----|-----------|
| `react-hook-form` + `@hookform/resolvers` | Formulários com validação |
| `zod` (v4) | Schemas de validação (⚠️ usar `z.number()` + `valueAsNumber`, não `z.coerce.number()`) |
| `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | Drag-and-drop para reordenar aulas (admin) |
| `tailwindcss` | Estilização utility-first |
| `vitest` + `@testing-library/react` + `@testing-library/user-event` | Testes |

---

## 🧪 Testes

**42 test files**, **223 testes** (Vitest + Testing Library)

```bash
pnpm --filter frontend test          # rodar todos
pnpm --filter frontend test:watch    # modo watch
pnpm --filter frontend test:coverage # com cobertura
```

Organização: cada pasta de componentes/services/hooks tem uma subpasta `__tests__/` com arquivos `.spec.tsx` / `.spec.ts`.

---

## 🏗️ Padrões Arquiteturais

- **Auth**: Context API (`AuthProvider`) com token JWT em `localStorage` + cookie sync
- **Proteção de rotas**: `middleware.ts` (server-side) + `ProtectedRoute` (client-side, suporta `requiredRole`)
- **401 global**: `api.ts` registra callback — auto-logout + redirect `/login` quando token expira
- **Services layer**: 1 service por domínio, componentes nunca fazem `fetch` diretamente
- **Rendering**: Server Components para páginas públicas, `'use client'` para interatividade
- **Error handling**: `error.tsx` (boundary global com retry), `not-found.tsx` (404), `loading.tsx` por rota

---

## 📄 Rotas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Pública | Homepage (hero + cursos em destaque) |
| `/courses` | Pública | Catálogo de cursos (paginado) |
| `/courses/:id` | Pública | Detalhe do curso (aulas, enrollment) |
| `/courses/:id/lessons/:lessonId` | Auth | Player de aula (YouTube embed + marcação) |
| `/login` | Guest | Login |
| `/register` | Guest | Registro |
| `/dashboard` | Auth | Dashboard do aluno (progresso + certificados) |
| `/admin/courses` | Admin | Listagem de cursos (todos os status) |
| `/admin/courses/new` | Admin | Criar curso |
| `/admin/courses/:id/edit` | Admin | Editar + publicar/despublicar/deletar |
| `/admin/courses/:id/lessons` | Admin | Gerenciar aulas (CRUD + drag-and-drop) |
