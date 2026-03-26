# ADR-0004: Autenticação via JWT Bearer Token

## Status
Accepted

## Context
O projeto Dude Course precisa de autenticação para proteger recursos do usuário (progresso, matrículas, certificados, dashboard) e recursos administrativos (gestão de cursos e aulas). A API é REST stateless servida por Fastify.

### Alternativas consideradas

#### 1. JWT Bearer Token
- Prós: stateless, simples, funciona bem com API REST e SPA/SSR, sem necessidade de session store
- Contras: não revogável individualmente (sem blacklist), tamanho do token

#### 2. Session-based (cookies)
- Prós: revogável, menor payload
- Contras: requer session store (Redis), mais complexo com SPA, CSRF concerns

#### 3. OAuth2 only (social login)
- Prós: sem gestão de senhas
- Contras: dependência de providers externos, não adequado como único método para MVP

## Decision
Adotar **JWT Bearer Token** como método de autenticação.

**Configuração MVP:**
- Access token com expiração de **1 hora**
- Sem refresh token no MVP (futuro: introduzir quando necessário)
- Hash de senha: **bcrypt** (mínimo 10 rounds)
- Token enviado via header `Authorization: Bearer <token>`
- Logout client-side (remover token do storage)
- Payload do token: `{ userId, email, role }`

**Fluxo:**
1. `POST /api/v1/auth/register` — cria conta, retorna token
2. `POST /api/v1/auth/login` — valida credenciais, retorna token
3. Rotas protegidas: middleware valida token, extrai user context
4. Token expirado: retorna 401, frontend redireciona para login

**Segurança:**
- Nunca logar token completo
- JWT_SECRET em variável de ambiente, nunca no código
- Validar signature e expiração em todo request autenticado
- bcrypt para hashing de senhas (nunca armazenar texto puro)

## Consequences

### Positive
- Arquitetura stateless — não precisa de session store
- Simples de implementar e integrar com frontend (Next.js)
- Funciona naturalmente com API REST
- Fácil de testar (basta enviar header)

### Negative
- Token não é revogável individualmente sem blacklist
- Expiração de 1h requer re-login frequente (mitigável com refresh token futuro)
- bcrypt é CPU-intensive (aceitável para volume MVP)

### Mitigations
- Introduzir refresh token quando feedback de UX indicar necessidade
- Se blacklist for necessária, usar Redis e documentar em ADR separada
- Rate limiting em endpoints de auth para prevenir brute force

## Notes
- Impacta: `docs/security.md`, `docs/api-spec.md`, `docs/architecture.md`, `.github/instructions/security.instructions.md`
- RBAC (admin vs user) será definido quando features admin forem implementadas
