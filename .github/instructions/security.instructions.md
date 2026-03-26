---
description: "Use when dealing with authentication, authorization, input validation, sensitive data handling, JWT tokens, password hashing, or access control."
applyTo: "backend/src/**"
---

# Security Guidelines

## Authentication (per `docs/security.md` and ADR-0004)

- JWT Bearer tokens for authentication (1h expiration, no refresh tokens in MVP)
- Password hashing: **bcrypt** (minimum 10 rounds)
- Always validate token signature and expiration
- Extract user context from token for authorization

## Input validation

- Validate ALL inputs at the controller boundary using **Zod** schemas
- Zod schemas live in `dto/` folder
- Reject invalid input with 400 and specific field errors
- Never trust client-side validation

## SQL injection prevention

- Always use **Prisma ORM** for database queries (parameterized by default)
- NEVER concatenate user input into raw SQL strings
- Use the repository pattern — all DB access through `repositories/` layer

## Sensitive data rules

**Never log:**
- Passwords or password hashes
- Full JWT tokens (log only last 8 chars if needed for debugging)
- Personal Identifiable Information (PII) beyond what's necessary

**Never expose to client:**
- Stack traces
- Internal error details
- Database structure information

## Access control

- User-scoped resources: always verify the requesting user owns the resource
- Prevent IDOR (Insecure Direct Object Reference): check `userId` matches token
- Return 403 Forbidden when user doesn't own the resource
- Return 401 Unauthorized when token is missing/invalid

## Secrets management

- All secrets in environment variables
- Never commit secrets to the repository
- Use `.env.example` with placeholder values only
