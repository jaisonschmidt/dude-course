# 📑 API Specification (REST)

<!-- TEMPLATE: Preencha este documento com os contratos da API do seu projeto. -->
<!-- Consulte docs/engineering-docs-recommendation.md para orientações detalhadas. -->

Este documento especifica os **contratos da API** do projeto (REST/JSON).

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

### GET /courses/{id}

Retorna o detalhe de um curso publicado e sua lista ordenada de lessons.

**Auth:** Não

#### Path Params
- `id` (number)

#### Response
- **200 OK**
- **404 Not Found**

### POST /courses/{id}/enrollments

Inicia ou garante participação do learner autenticado em um curso publicado.

**Auth:** Sim

#### Path Params
- `id` (number)

#### Response
- **201 Created**
- **409 Conflict** — matrícula já existente quando a operação não for tratada de forma idempotente

### POST /courses/{courseId}/lessons/{lessonId}/progress

Marca uma lesson como concluída para o learner autenticado.

**Auth:** Sim

#### Path Params
- `courseId` (number)
- `lessonId` (number)

#### Response
- **200 OK**
- **404 Not Found**
- **409 Conflict** — inconsistência de estado quando aplicável

### GET /me/dashboard

Retorna visão resumida de cursos iniciados, concluídos e progresso do learner autenticado.

**Auth:** Sim

#### Response
- **200 OK**

### POST /courses/{id}/certificate

Gera ou retorna o certificado do learner autenticado para um curso concluído.

**Auth:** Sim

#### Path Params
- `id` (number)

#### Response
- **200 OK**
- **403 Forbidden** — curso ainda não concluído

### GET /health

Endpoint de liveness da API.

**Auth:** Não

#### Response
- **200 OK**

### GET /ready

Endpoint de readiness da API e de suas dependências críticas.

**Auth:** Não

#### Response
- **200 OK** — API e dependências prontas para receber tráfego
- **503 Service Unavailable** — uma ou mais dependências críticas indisponíveis

Endpoints e regras mínimas para o MVP:

## 🔁 Idempotência e Consistência

- `POST /courses/{id}/enrollments`
  O backend deve garantir unicidade de participação por `userId + courseId`.
- `POST /courses/{courseId}/lessons/{lessonId}/progress`
  Marcação repetida da mesma lesson não pode inflar progresso. O backend deve garantir unicidade por `userId + lessonId`.
- `POST /courses/{id}/certificate`
  Não deve criar múltiplos certificados inconsistentes para o mesmo `userId + courseId`.

Observação:
Detalhes finos de payloads de resposta de cada recurso podem ser refinados durante a implementação funcional, desde que permaneçam compatíveis com estas regras e com o formato de erro/documentação já definida.

---

## 📌 Checklist de Implementação

- [ ] Middleware de autenticação (401/403)
- [ ] Validação de input (400)
- [ ] Padronização de erros com `requestId`
- [ ] Paginação em listagens
- [ ] Endpoints idempotentes onde necessário
