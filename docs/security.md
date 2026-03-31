# 🔒 Security

Este documento define o baseline de **segurança** do projeto: autenticação, autorização, validação, proteção de dados e práticas de desenvolvimento seguro.

Referências:
- Arquitetura: `docs/architecture.md`
- Guidelines: `docs/engineer-guidelines.md`
- Contratos/API: `docs/api-spec.md`
- Banco: `docs/database.md`
- Observabilidade: `docs/observability.md`

---

## 🎯 Objetivos

- Proteger contas e dados dos usuários.
- Evitar classes comuns de vulnerabilidades (OWASP Top 10).
- Definir um baseline de segurança para implementação incremental.
- Minimizar vazamento de dados (PII) e credenciais.

---

## ✅ Princípios

- **Secure by default**: rotas sensíveis protegidas por padrão.
- **Least privilege**: permissões mínimas necessárias.
- **Defense in depth**: múltiplas camadas de proteção (auth + validação + DB constraints).
- **Não confiar no client**: toda validação crítica ocorre no backend.

---

## 🔐 Autenticação (JWT)

### Regras
- Rotas protegidas exigem `Authorization: Bearer <token>`.
- Tokens inválidos/ausentes → **401 UNAUTHORIZED**.
- Nunca logar token completo (no máximo prefixo + hash/truncado, se necessário).
- Senhas nunca são armazenadas em texto puro:
  - armazenar apenas `password_hash` usando **bcrypt** (mínimo 10 rounds).

### Expiração e rotação (baseline)
- `expiresIn` no login (ex.: 1h).
- Refresh token é opcional no MVP; se introduzido, documentar em `docs/api-spec.md`.

### Logout
- No MVP (JWT stateless), logout é client-side (remover token).
- Se blacklist/rotation for necessária, introduzir store (ex.: Redis) e documentar.

### Frontend Token Handling (implementado)
- **Storage**: JWT armazenado em `localStorage` (key: `auth_token`).
- **Cookie sync**: token é copiado para cookie não-httpOnly (`auth-token`) para que o Next.js middleware (server-side) possa verificar autenticação sem JavaScript.
- **Rehydration**: ao montar, `AuthProvider` lê token do `localStorage`, verifica expiração (decode JWT `exp`), e restaura estado sem flash de tela de login.
- **Auto-logout em 401**: `api.ts` registra um callback global via `setOnUnauthorized()`. Quando qualquer API call retorna 401, o callback limpa token + user do state e localStorage, e redireciona para `/login`.
- **Prevenção de loops**: o handler de 401 só dispara uma vez (limpa o callback após execução).
- **Proteção server-side**: `middleware.ts` do Next.js intercepta rotas protegidas (`/dashboard/**`, `/admin/**`) e redireciona para `/login` se o cookie `auth-token` estiver ausente.
- **Proteção client-side**: componente `ProtectedRoute` verifica `isAuthenticated` e `user.role` — redireciona ou exibe "Acesso negado".

---

## 🛂 Autorização (Access Control)

### Regras mínimas
- Usuário só acessa dados do **próprio** contexto.
- Endpoints de learner são "user scoped" — verificar ownership.
- Endpoints admin exigem `role: admin`.

### Admin (implementado)
- Campo `role` no model User: valores `learner` (default) e `admin`.
- JWT payload inclui `role` — verificado no middleware `admin-guard.ts`.
- 9 endpoints admin protegidos (CRUD cursos + CRUD aulas) → `403 FORBIDDEN` para learners.
- Contratos documentados em `docs/api-spec.md` (seção Admin).
- Regras de publicação documentadas em `docs/domain.md`.

---

## ✅ Validação e Sanitização de Input

### Regras
- Validar input em **todos** endpoints.
- Retornar 400 com `VALIDATION_ERROR` conforme `docs/api-spec.md`.
- Sanitizar strings quando aplicável (ex.: trim, limites de tamanho).
- Rejeitar payloads com campos inesperados (quando possível).

### Exemplos de validações mínimas
- `email` formato válido e tamanho máximo
- `password` tamanho mínimo e máximo
- IDs numéricos validados (ex.: `entityId`)
- URLs devem ser validadas quando aplicável

---

## 🧱 Proteção contra Injection

### SQL Injection
- Usar queries parametrizadas/ORM.
- Nunca concatenar input do usuário em SQL.
- Garantir constraints e FKs conforme `docs/database.md`.

### Outros injections
- Nunca renderizar HTML de inputs do usuário sem sanitização (frontend).
- Evitar SSRF (se no futuro houver fetch de URLs externas).

---

## 🧩 CSRF, CORS e Cookies

### Token em header (baseline)
- JWT em `Authorization` reduz risco de CSRF (comparado a cookie auth).
- Se no futuro usar cookies:
  - `HttpOnly`, `Secure`, `SameSite=Lax/Strict`
  - implementar CSRF tokens

### CORS
- Configurar allowlist de origens (staging/prod).
- Não usar `*` em produção.

---

## 🧠 Rate Limiting (recomendado)

No MVP pode ser opcional, mas recomendado em produção:
- `/auth/login`: limitar tentativas por IP/usuário
- `/auth/register`: limitar criação por IP
- resposta: 429 `TOO_MANY_REQUESTS` (se adotado, documentar no API spec)

---

## 🔑 Secrets Management

### Regras
- Nunca commitar secrets no repositório.
- Usar variáveis de ambiente.
- Separar configs por ambiente (dev/staging/prod).
- Rotacionar tokens/keys quando expostos.

### Exemplos de secrets
- DB password
- Secret de autenticação / private keys
- License keys de ferramentas de APM/observabilidade

---

## 🧾 Logging e PII

### Regras
- Não logar:
  - password, password_hash
  - JWT token completo
  - payloads completos em rotas sensíveis
- Logs devem conter `requestId` para correlação (ver `docs/observability.md`).
- Em erros, evitar retornar stack trace ao client.

PII (mínimo):
- Em logs, preferir `userId` ao invés de email/nome.

---

## 📦 Dependências e Supply Chain

### Regras
- Manter dependências atualizadas (patch/minor frequentes).
- Ativar scanning de vulnerabilidades quando necessário (ex.: GitHub Dependabot, Snyk).
- Validar licenses quando necessário.

### Hardening do gerenciador de pacotes
- Bloquear scripts perigosos quando possível (se aplicável ao gerenciador de pacotes usado).
- Revisar dependências transitivas críticas.

---

## 🧪 Checklist de segurança por endpoint (baseline)

### Auth
- Register:
  - validação de email/senha
  - evitar enumeração de usuários em mensagens
- Login:
  - resposta genérica para credenciais inválidas
  - rate limit recomendado

### Recursos protegidos
- exigir token válido
- validar IDs de recursos
- garantir integridade referencial entre entidades
- idempotência em operações de escrita (quando aplicável)
- acesso restrito ao dono do recurso

---

## 🧯 Security Testing (mínimo)

- Unit tests para validações críticas
- Integration tests para:
  - 401 sem token
  - 403 quando recurso não pertence
  - 409 em conflito (ex.: email duplicado)
- Teste de regressão para bug de autorização (IDOR)

---

## 🤖 Regras para IA

- Não introduzir novos endpoints sem atualizar `docs/api-spec.md`.
- Não criar campos/tabelas sem atualizar `docs/domain.md` e `docs/database.md`.
- Implementar validações de input em todos endpoints.
- Nunca gerar código que logue secrets ou PII indevida.
- Qualquer mudança em auth deve refletir este documento.
