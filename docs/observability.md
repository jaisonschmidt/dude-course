# 📈 Observability

Este documento define o padrão de **observabilidade** do projeto: logs, correlação, erros, métricas e instrumentação.

Referências:
- Arquitetura: `docs/architecture.md`
- Guidelines: `docs/engineer-guidelines.md`
- API errors padrão: `docs/api-spec.md`
- AI context: `docs/ai/ai-context.md`

---

## 🎯 Objetivos

- Detectar e diagnosticar problemas rapidamente (MTTR baixo).
- Correlacionar logs ↔ traces ↔ erros usando um identificador único.
- Padronizar o formato de logs para facilitar busca e dashboards.
- Garantir visibilidade mínima: latência, taxa de erro, throughput.

---

## ✅ Padrão de correlação

### requestId (obrigatório)
- Gerar um `requestId` único para **toda requisição**.
- Preferir aceitar `X-Request-Id` vindo do client/gateway e, se não existir, gerar.
- Retornar sempre o `requestId` no response header: `X-Request-Id`.
- Incluir `requestId` em:
  - logs
  - respostas de erro (conforme `docs/api-spec.md`)
  - atributos da ferramenta de APM (custom attributes)

**Header padrão**
- Entrada: `X-Request-Id`
- Saída: `X-Request-Id`

---

## 🪵 Logging

### Requisitos mínimos
- Logs estruturados em **JSON**.
- Níveis: `debug`, `info`, `warn`, `error`.
- Logar apenas o necessário (evitar ruído).
- Nunca logar dados sensíveis:
  - senha, `password_hash`
  - token JWT completo
  - dados pessoais além do necessário (evitar PII)

### Campos padrão do log (backend)
Todo log deve tentar conter:

```json
{
  "timestamp": "ISO-8601",
  "level": "info",
  "message": "human readable message",
  "service": "[nome-do-projeto]-api",
  "env": "dev|staging|prod",
  "requestId": "req_...",
  "http": {
    "method": "GET",
    "path": "/api/v1/courses",
    "status": 200,
    "durationMs": 34
  },
  "user": {
    "id": 1
  },
  "error": {
    "name": "ErrorName",
    "message": "error message",
    "stack": "stacktrace (prod: opcional/limitado)",
    "code": "INTERNAL_ERROR"
  }
}
```

### O que logar (mínimo)
- **Request start** (opcional em prod, útil em dev/staging)
- **Request end** (recomendado)
  - method, path, status, durationMs, requestId
- **Erros** (sempre)
  - requestId + code + stack (com cuidado em prod)
- **Eventos de domínio relevantes** (info)
  - Matrícula em curso (`enrollment.created`)
  - Progresso de aula marcado (`lesson-progress.completed`)
  - Curso completado (`enrollment.completed`)
  - Certificado gerado (`certificate.issued`)
  - Curso publicado/despublicado (`course.published`, `course.unpublished`)

### Onde logar
- Backend: stdout/stderr (para agregação posterior)
- Frontend: evitar logs ruidosos em prod; usar somente erros críticos

---

## 📋 Domain Events Implementados

Os seguintes eventos de domínio estão instrumentados no backend:

| Evento | Localização | Nível | Campos |
|--------|------------|-------|--------|
| `user.registered` | AuthController | info | `requestId`, `userId` |
| `user.login.success` | AuthController | info | `requestId`, `userId` |
| `user.login.failure` | AuthController | warn | `requestId` |
| `enrollment.created` | EnrollmentController | info | `requestId`, `userId`, `courseId` |
| `lesson-progress.completed` | LessonProgressController | info | `requestId`, `userId`, `courseId`, `lessonId` |
| `enrollment.completed` | LessonProgressController | info | `requestId`, `userId`, `courseId` |
| `certificate.issued` | CertificateController | info | `requestId`, `userId`, `courseId`, `certificateCode` |
| `course.published` | AdminCourseController | info | `requestId`, `userId`, `courseId` |
| `course.unpublished` | AdminCourseController | info | `requestId`, `userId`, `courseId` |
| `admin.course.created` | AdminCourseController | info | `requestId`, `userId`, `courseId` |
| `admin.course.updated` | AdminCourseController | info | `requestId`, `userId`, `courseId` |
| `admin.course.deleted` | AdminCourseController | info | `requestId`, `userId`, `courseId` |
| `admin.lesson.created` | AdminLessonController | info | `requestId`, `userId`, `courseId`, `lessonId` |
| `admin.lesson.updated` | AdminLessonController | info | `requestId`, `userId`, `courseId`, `lessonId` |
| `admin.lesson.deleted` | AdminLessonController | info | `requestId`, `userId`, `courseId`, `lessonId` |
| `admin.lessons.reordered` | AdminLessonController | info | `requestId`, `userId`, `courseId` |
| `dashboard.fetched` | DashboardController | info | `requestId`, `userId` |

**Notas:**
- `certificate.issued` fires only on **new** certificate creation, not on idempotent re-fetch
- `user.login.failure` uses `warn` level (security-relevant)
- No sensitive data (password, token, PII) is included in any log

---

## ❗ Erros e exceções

### Padrão de resposta de erro
Todos erros devem seguir o formato definido em `docs/api-spec.md`:

- `code`
- `message`
- `details` (quando validação)
- `requestId`

### Mapeamento recomendado (backend)
- Validação de input → 400 (`VALIDATION_ERROR`)
- Sem auth/token inválido → 401 (`UNAUTHORIZED`)
- Sem permissão → 403 (`FORBIDDEN`)
- Recurso não encontrado → 404 (`NOT_FOUND`)
- Conflito (recurso duplicado) → 409 (`CONFLICT`)
- Erro inesperado → 500 (`INTERNAL_ERROR`)

**Regra:** erro inesperado deve:
- registrar log `error` com requestId
- reportar para a ferramenta de APM
- retornar `INTERNAL_ERROR` sem detalhes sensíveis

---

## 🧪 Healthchecks

### Endpoints implementados
- `GET /health` → liveness (API está no ar)
- `GET /ready` → readiness (dependências OK: DB)

Resposta de `/health` (200):

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

Resposta de `/ready` (200):

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

Resposta de `/ready` (503):

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

## 📊 Métricas (mínimo viável)

### Métricas de API
- Latência p50/p95/p99 por endpoint
- Taxa de erro (4xx/5xx)
- Throughput (req/min)
- Apdex (se configurado)

### Métricas de domínio (custom)

- Registros de usuários por dia
- Matrículas em cursos por dia
- Taxa de conclusão de cursos (completados / matriculados)
- Certificados emitidos por dia
- Aulas marcadas como concluídas por dia

**Observação:** evitar métricas que exponham PII.

---

## 🧩 Tracing (APM)

Ferramenta de APM: **New Relic**

Biblioteca de logging: **Pino** (integrado nativamente ao Fastify)

### Requisitos
- Instrumentação APM habilitada no backend.
- Incluir atributos custom:
  - `requestId`
  - `userId` (quando autenticado)
  - IDs de recursos (somente quando relevante)
- Nomear transações por rota (ex.: `GET /api/v1/courses/{id}`)

### Eventos importantes para trace
- Login (sucesso/falha) — com cuidado para não logar credenciais
- Operações de escrita relevantes

- Matrícula em curso
- Conclusão de curso e emissão de certificado
- Operações administrativas (criação/edição/publicação de cursos)

---

## 🔎 Alertas (baseline)

Configurar alertas básicos em staging/prod:

- **High Error Rate**: 5xx acima de X% por Y minutos
- **High Latency**: p95 acima de X ms por Y minutos
- **DB Connectivity**: readiness falhando
- **Crash/Restart loop**: app reiniciando continuamente

(Os thresholds serão definidos após observação de baseline real.)

---

## 🧰 Troubleshooting rápido

### Cenário: Matrícula falha com 409 Conflict
Verificar:
1. Logs com `requestId` para identificar erro de duplicata
2. Constraint UNIQUE em `enrollments(user_id, course_id)` no banco
3. Se o curso está publicado (status = 'published')

### Cenário: Certificado não é gerado após conclusão
Verificar:
1. Progresso de todas as aulas do curso — devem estar marcadas como concluídas
2. Status de conclusão do enrollment na tabela `enrollments`
3. Logs de `enrollment.completed` e `certificate.issued`
4. Trace no New Relic para a transação

### Cenário: Latência alta em listagem de cursos
Verificar:
1. Query no Prisma — verificar se há N+1 queries
2. Índices nas colunas de filtro/ordenação
3. Trace no New Relic para identificar gargalo

---

## 🤖 Regras para IA

- Não inventar campos de log fora do padrão sem atualizar este documento.
- Não adicionar PII em logs.
- Sempre incluir `requestId` nos logs e no error payload.
- Se mudar formato de erro, atualizar `docs/api-spec.md` e este documento.
