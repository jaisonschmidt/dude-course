# Full Feature Cycle — Definition of Done Checklist

Use this checklist to verify a feature is truly complete before closing the issue.

## Pre-implementation
- [ ] Issue exists with clear title and business context
- [ ] Acceptance criteria defined in Given/When/Then format
- [ ] Priority assigned (P0–P3)
- [ ] Architectural analysis completed and posted on issue
- [ ] ADR created if new architectural decision was made
- [ ] Implementation plan documented on the issue

## Implementation
- [ ] Code follows architectural boundaries per `docs/architecture.md`
- [ ] Domain layer has no framework imports
- [ ] Use cases depend only on ports (interfaces)
- [ ] Controllers contain no business logic
- [ ] DTOs are separate from domain entities
- [ ] Naming follows `docs/engineer-guidelines.md` conventions
- [ ] Files are in correct directories per `docs/project-structure.md`

## API compliance
- [ ] Endpoints match `docs/api-spec.md` contracts
- [ ] Response format: `{ data, requestId }` for success
- [ ] Error format: `{ code, message, details, requestId }` for errors
- [ ] HTTP status codes are correct
- [ ] Input validation on all endpoints

## Testing
- [ ] Unit tests for all new/modified use cases (mocked ports)
- [ ] Integration tests for new/modified endpoints
- [ ] Error flows tested
- [ ] Idempotency tested (where applicable)
- [ ] Uniqueness constraint violations tested
- [ ] Auth scenarios tested (401, 403)
- [ ] All tests pass

## Security
- [ ] Input validation at controller boundary
- [ ] Parameterized queries / ORM (no SQL injection)
- [ ] No passwords, tokens, or PII in logs
- [ ] User-scoped resources verified (no IDOR)
- [ ] JWT handling follows `docs/security.md`

## Observability
- [ ] `requestId` propagated through all layers
- [ ] Structured JSON logging used
- [ ] Error responses include `requestId`
- [ ] Appropriate log levels (debug/info/warn/error)
- [ ] No sensitive data in logs

## Code Review
- [ ] PR reviewed and approved
- [ ] All review comments addressed
- [ ] No security vulnerabilities

## Documentation
- [ ] `docs/api-spec.md` updated (if new/modified endpoints)
- [ ] `docs/database.md` updated (if schema changes)
- [ ] `docs/domain.md` updated (if new entities/rules)
- [ ] ADR created (if architectural decision)
- [ ] `CONTEXT_PACK.md` updated (if significant changes)

## Issue tracking
- [ ] All subtasks marked as completed
- [ ] PR linked to issue (`Closes #N` or `Part of #N`)
- [ ] Issue card updated with final status by all agents
