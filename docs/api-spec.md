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

> **[PREENCHER]** Defina o esquema de autenticação (ex.: JWT Bearer, API Key, OAuth2).

- Header: `Authorization: Bearer <token>`

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

> **[PREENCHER]** Documente os endpoints de autenticação do seu projeto.

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

#### Response
- **200 OK** — Token de acesso retornado
- **401 Unauthorized** — Credenciais inválidas

---

## 📦 Recursos

> **[PREENCHER]** Documente os endpoints de cada recurso do sistema seguindo o padrão abaixo.

### GET /[recurso]

> **[PREENCHER]** Descreva o endpoint.

**Auth:** Sim/Não

#### Query Params (opcional)
- `page`, `pageSize`

#### Response
- **200 OK**

---

### GET /[recurso]/{id}

> **[PREENCHER]** Descreva o endpoint.

**Auth:** Sim/Não

#### Path Params
- `id` (number)

#### Response
- **200 OK**
- **404 Not Found**

---

### POST /[recurso]

> **[PREENCHER]** Descreva o endpoint.

**Auth:** Sim/Não

#### Request
```json
{}
```

#### Response
- **201 Created**
- **400 Validation Error**

---

## 🔁 Idempotência e Consistência

> **[PREENCHER]** Liste endpoints que devem ser idempotentes e regras de unicidade que o backend deve garantir.

---

## 📌 Checklist de Implementação

- [ ] Middleware de autenticação (401/403)
- [ ] Validação de input (400)
- [ ] Padronização de erros com `requestId`
- [ ] Paginação em listagens
- [ ] Endpoints idempotentes onde necessário
