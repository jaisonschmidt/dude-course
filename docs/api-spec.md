# 📑 API Specification (REST)

<!-- TEMPLATE: Preencha este documento com os contratos da API do seu projeto. -->
<!-- Consulte docs/engineering-docs-recommendation.md para orientações detalhadas. -->

Este documento especifica os **contratos da API** do projeto (REST/JSON).

> 💡 **Interactive API Explorer**: Em ambientes de desenvolvimento e staging, uma Swagger UI interativa está disponível em `/documentation`. Veja `backend/README.md` para detalhes.

Referências:
- Visão geral: `README.md`
- Arquitetura: `docs/architecture.md`
- Domínio: `docs/domain.md`
- Banco: `docs/database.md`

---

## ✅ Convenções

### Base URL
- Local: `http://localhost:3001`
- Prefixo: `/api/v1`

Exemplo: `GET /api/v1/[recurso]`

### Formato
- Request/Response: `application/json`
- Datas: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)

### Autenticação

Autenticação baseada em **JWT Bearer Token**.

- Header: `Authorization: Bearer <token>`
- Expiração do access token: `1h`
- Hash de senha: `bcrypt`
- Rotas protegidas devem responder `401 UNAUTHORIZED` quando o token estiver ausente, inválido ou expirado

### Paginação (quando aplicável)
Parâmetros:
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)

Resposta:
- `meta.page`, `meta.pageSize`, `meta.totalItems`, `meta.totalPages`

### Erros (padrão)
Formato comum:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Email is invalid" }
    ],
    "requestId": "req_123"
  }
}
```

Códigos comuns:
- `VALIDATION_ERROR` → 400
- `UNAUTHORIZED` → 401
- `FORBIDDEN` → 403
- `NOT_FOUND` → 404
- `CONFLICT` → 409
- `INTERNAL_ERROR` → 500

---

## 🔐 Auth

Os endpoints de autenticação abaixo compõem a baseline funcional inicial do projeto.

### POST /auth/register

**Auth:** Não

#### Request
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### Responses
- **201 Created** — Usuário criado
- **409 Conflict** — Email já existe
- **400 Validation Error**

Exemplo de resposta (201):

```json
{
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "learner"
  },
  "requestId": "req_123"
}
```

> **Nota:** o register retorna apenas os dados do usuário, sem token. O client deve chamar `POST /auth/login` para obter o access token.

---

### POST /auth/login

**Auth:** Não

#### Request
```json
{
  "email": "string",
  "password": "string"
}
```

#### Response
- **200 OK** — Token de acesso retornado
- **401 Unauthorized** — Credenciais inválidas

Exemplo de resposta:

```json
{
  "data": {
    "accessToken": "jwt-token",
    "expiresIn": "1h",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "learner"
    }
  },
  "requestId": "req_123"
}
```

### POST /auth/logout

**Auth:** Sim

#### Response
- **204 No Content** — Logout tratado no client removendo o token

---
Os recursos abaixo representam a baseline de contrato esperada para o MVP. O bootstrap inicial não exige implementação completa imediata de todos eles, mas a estrutura do projeto deve ser preparada para suportá-los.

### GET /courses

Lista cursos publicados para catálogo público.

**Auth:** Não

#### Query Params (opcional)
- `page`, `pageSize`

#### Response
- **200 OK**

Exemplo de resposta (200):

```json
{
  "data": [
    {
      "id": 1,
      "title": "Node.js Fundamentals",
      "description": "Learn Node.js from scratch",
      "thumbnailUrl": "https://example.com/thumb.jpg",
      "status": "published",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  },
  "requestId": "req_123"
}
```

### GET /courses/{id}

Retorna o detalhe de um curso publicado e sua lista ordenada de lessons.

**Auth:** Não

#### Path Params
- `id` (number)

#### Response
- **200 OK**
- **404 Not Found**

Exemplo de resposta (200):

```json
{
  "data": {
    "id": 1,
    "title": "Node.js Fundamentals",
    "description": "Learn Node.js from scratch",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "status": "published",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "lessons": [
      {
        "id": 1,
        "title": "Introduction",
        "description": "Getting started with Node.js",
        "youtubeUrl": "https://youtube.com/watch?v=abc123",
        "position": 1
      }
    ]
  },
  "requestId": "req_123"
}
```

### POST /courses/{id}/enrollments

Inicia ou garante participação do learner autenticado em um curso publicado.
Operação **idempotente**: se o learner já estiver matriculado, retorna o enrollment existente com `200 OK`.

**Auth:** Sim

#### Path Params
- `id` (number)

#### Response
- **201 Created** — Novo enrollment criado
- **200 OK** — Enrollment já existente retornado (idempotente)
- **404 Not Found** — Curso não encontrado ou não publicado
- **401 Unauthorized** — Token ausente/inválido

Exemplo de resposta (201 / 200):

```json
{
  "data": {
    "id": 1,
    "userId": 42,
    "courseId": 1,
    "startedAt": "2026-01-15T10:00:00.000Z"
  },
  "requestId": "req_123"
}
```

### POST /courses/{courseId}/lessons/{lessonId}/progress

Marca uma lesson como concluída para o learner autenticado.
Operação **idempotente**: marcação repetida retorna o progresso existente.

**Auth:** Sim

#### Path Params
- `courseId` (number)
- `lessonId` (number)

#### Response
- **200 OK** — Progresso registrado (ou já existente — idempotente)
- **404 Not Found** — Lesson não pertence ao curso, ou learner não matriculado
- **401 Unauthorized**
- **400 Validation Error** — `courseId` ou `lessonId` não numéricos

> **Auto-completion:** Quando todas as lessons de um curso forem concluídas, `enrollment.completedAt` é automaticamente preenchido.

Exemplo de resposta (200):

```json
{
  "data": {
    "id": 1,
    "userId": 42,
    "courseId": 1,
    "lessonId": 5,
    "completedAt": "2026-01-15T11:00:00.000Z"
  },
  "requestId": "req_123"
}
```

### GET /me/dashboard

Retorna visão resumida de cursos iniciados, concluídos e progresso do learner autenticado.

**Auth:** Sim

#### Response
- **200 OK** — Dashboard retornado (listas podem ser vazias)
- **401 Unauthorized**

Exemplo de resposta (200):

```json
{
  "data": {
    "inProgress": [
      {
        "courseId": 1,
        "title": "Node.js Fundamentals",
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "progress": {
          "completed": 3,
          "total": 10,
          "percentage": 30
        }
      }
    ],
    "completed": [
      {
        "courseId": 2,
        "title": "TypeScript Mastery",
        "completedAt": "2026-01-20T14:00:00.000Z"
      }
    ],
    "certificates": [
      {
        "courseId": 2,
        "title": "TypeScript Mastery",
        "certificateCode": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "issuedAt": "2026-01-20T14:05:00.000Z"
      }
    ]
  },
  "requestId": "req_123"
}
```

### POST /courses/{id}/certificate

Gera ou retorna o certificado do learner autenticado para um curso concluído.
Operação **idempotente**: se o certificado já existir, retorna o existente.

**Auth:** Sim

#### Path Params
- `id` (number)

#### Response
- **200 OK** — Certificado gerado ou existente retornado (idempotente)
- **403 Forbidden** — Curso não concluído
- **404 Not Found** — Não matriculado
- **401 Unauthorized**

Exemplo de resposta (200):

```json
{
  "data": {
    "id": 1,
    "certificateCode": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "issuedAt": "2026-01-20T14:05:00.000Z",
    "courseName": "TypeScript Mastery",
    "learnerName": "Jane Doe"
  },
  "requestId": "req_123"
}
```

### GET /health

Endpoint de liveness da API.

**Auth:** Não

#### Response
- **200 OK**

Exemplo de resposta (200):

```json
{
  "data": {
    "status": "ok",
    "uptime": 123.45,
    "timestamp": "2026-03-31T17:14:00.000Z",
    "version": "0.1.0",
    "memoryUsedMb": 42
  },
  "requestId": "uuid"
}
```

### GET /ready

Endpoint de readiness da API e de suas dependências críticas.

**Auth:** Não

#### Response
- **200 OK** — API e dependências prontas para receber tráfego
- **503 Service Unavailable** — uma ou mais dependências críticas indisponíveis

Exemplo de resposta (200):

```json
{
  "data": {
    "status": "ready",
    "checks": {
      "api": "ok",
      "database": "ok"
    }
  },
  "requestId": "uuid"
}
```

Exemplo de resposta (503):

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "One or more dependencies are not ready",
    "details": {
      "api": "ok",
      "database": "error"
    },
    "requestId": "uuid"
  }
}
```

---

## 🛡️ Admin

Todas as rotas admin exigem `Authorization: Bearer <token>` com `role: admin`. Learners recebem `403 FORBIDDEN`.

### GET /admin/courses

Lista todos os cursos independente do status (draft, published, unpublished), com paginação. Endpoint exclusivo para administradores.

**Auth:** Sim (admin)

#### Query Params (opcional)
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)

#### Response
- **200 OK**
- **401 Unauthorized**
- **403 Forbidden**

Exemplo de resposta (200):

```json
{
  "data": [
    {
      "id": 1,
      "title": "New Course",
      "description": "A great course",
      "thumbnailUrl": null,
      "status": "draft",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 3,
    "totalPages": 1
  },
  "requestId": "req_123"
}
```

---

### POST /courses

Cria um novo curso (status inicial: `draft`).

**Auth:** Sim (admin)

#### Request
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "thumbnailUrl": "string (optional, valid URL)"
}
```

#### Response
- **201 Created** — Curso criado
- **400 Validation Error** — Campos obrigatórios ausentes ou inválidos
- **401 Unauthorized**
- **403 Forbidden** — Usuário não é admin

Exemplo de resposta (201):

```json
{
  "data": {
    "id": 1,
    "title": "New Course",
    "description": "A great course",
    "thumbnailUrl": null,
    "status": "draft",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "requestId": "req_123"
}
```

---

### PUT /courses/{id}

Atualiza dados de um curso existente.

**Auth:** Sim (admin)

#### Path Params
- `id` (number)

#### Request
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "thumbnailUrl": "string | null (optional)"
}
```

#### Response
- **200 OK** — Curso atualizado
- **400 Validation Error**
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found**

Exemplo de resposta (200): Mesmo shape de `POST /courses`.

---

### PATCH /courses/{id}/publish

Publica um curso existente.

**Auth:** Sim (admin)

> **Nota:** esta rota não aceita corpo na requisição. Enviar `Content-Type: application/json` sem body pode causar erro 400.

#### Path Params
- `id` (number)

#### Pré-requisitos
- Título não vazio
- Descrição não vazia
- ≥ 1 lesson válida associada ao curso

#### Response
- **200 OK** — Curso publicado
- **400 Bad Request** — Pré-requisitos não atendidos
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found**

Exemplo de resposta (200): Course com `"status": "published"`.

---

### PATCH /courses/{id}/unpublish

Despublica um curso, tornando-o invisível no catálogo.

**Auth:** Sim (admin)

> **Nota:** esta rota não aceita corpo na requisição. Enviar `Content-Type: application/json` sem body pode causar erro 400.

#### Path Params
- `id` (number)

#### Response
- **200 OK** — Curso despublicado
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found**

Exemplo de resposta (200): Course com `"status": "unpublished"`.

---

### DELETE /courses/{id}

Remove um curso.

**Auth:** Sim (admin)

#### Path Params
- `id` (number)

#### Response
- **200 OK** ou **204 No Content**
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found**

> **Nota:** Respeitar integridade referencial — enrollments existentes podem impedir exclusão.

---

### POST /courses/{id}/lessons

Cria uma nova lesson em um curso.

**Auth:** Sim (admin)

#### Path Params
- `id` (number) — ID do curso

#### Request
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "youtubeUrl": "string (required, valid YouTube URL)",
  "position": "number (required, >= 1)"
}
```

#### Response
- **201 Created** — Lesson criada
- **400 Validation Error**
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** — Curso não encontrado
- **409 Conflict** — Position duplicada no curso

Exemplo de resposta (201):

```json
{
  "data": {
    "id": 1,
    "courseId": 1,
    "title": "Lesson 1",
    "description": "First lesson",
    "youtubeUrl": "https://youtube.com/watch?v=abc123",
    "position": 1,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "requestId": "req_123"
}
```

---

### PUT /courses/{id}/lessons/{lessonId}

Atualiza uma lesson existente.

**Auth:** Sim (admin)

#### Path Params
- `id` (number) — ID do curso
- `lessonId` (number)

#### Request
Mesmos campos de `POST /courses/{id}/lessons`, todos opcionais.

#### Response
- **200 OK** — Lesson atualizada
- **400 Validation Error**
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** — Curso ou lesson não encontrados

Exemplo de resposta (200): Mesmo shape de `POST /courses/{id}/lessons`.

---

### DELETE /courses/{id}/lessons/{lessonId}

Remove uma lesson de um curso.

**Auth:** Sim (admin)

#### Path Params
- `id` (number) — ID do curso
- `lessonId` (number)

#### Response
- **200 OK** ou **204 No Content**
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found**

---

### PATCH /courses/{id}/lessons/reorder

Reordena as lessons de um curso.

**Auth:** Sim (admin)

#### Path Params
- `id` (number) — ID do curso

#### Request
```json
{
  "lessons": [
    { "lessonId": 1, "position": 1 },
    { "lessonId": 2, "position": 2 }
  ]
}
```

#### Response
- **200 OK** — Lessons reordenadas
- **400 Validation Error** — Array vazio ou positions inválidas
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** — Curso ou lesson não encontrados

Exemplo de resposta (200):

```json
{
  "data": [
    {
      "id": 1,
      "courseId": 1,
      "title": "Lesson 1",
      "position": 1
    },
    {
      "id": 2,
      "courseId": 1,
      "title": "Lesson 2",
      "position": 2
    }
  ],
  "requestId": "req_123"
}
```

---

## 🔁 Idempotência e Consistência

Todas as operações de escrita abaixo são **idempotentes** — chamadas repetidas com os mesmos dados retornam o recurso existente sem efeitos colaterais.

| Endpoint | Primeira chamada | Chamada repetida |
|----------|-----------------|------------------|
| `POST /courses/{id}/enrollments` | `201 Created` | `200 OK` (enrollment existente) |
| `POST /courses/{courseId}/lessons/{lessonId}/progress` | `200 OK` | `200 OK` (progresso existente) |
| `POST /courses/{id}/certificate` | `200 OK` | `200 OK` (certificado existente) |

- **Enrollment:** Unicidade garantida por `userId + courseId`. Duplicata retorna enrollment existente.
- **Progress:** Unicidade garantida por `userId + lessonId`. Marcação repetida não infla progresso.
- **Certificate:** Unicidade garantida por `userId + courseId`. Não cria múltiplos certificados.

---

## 📌 Checklist de Implementação

- [x] Middleware de autenticação (401/403)
- [x] Validação de input (400)
- [x] Padronização de erros com `requestId`
- [x] Paginação em listagens
- [x] Endpoints idempotentes onde necessário
- [x] Auth endpoints (register, login, logout)
- [x] Catálogo de cursos (GET /courses, GET /courses/{id})
- [x] Enrollment idempotente
- [x] Progresso de lessons idempotente
- [x] Dashboard do learner
- [x] Certificados idempotentes
- [x] Admin CRUD de cursos
- [x] Admin listing de cursos (GET /admin/courses)
- [x] Admin CRUD de lessons
- [x] Admin publish/unpublish
- [x] Admin reorder lessons
- [ ] Rate limiting
- [ ] Refresh token
