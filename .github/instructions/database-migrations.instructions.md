---
description: "Use when creating or modifying database migrations. Covers migration patterns, constraints, rollback safety, and schema conventions."
applyTo: "**/migrations/**"
---

# Database Migration Guidelines

## Migration standards

- Each migration file represents ONE atomic schema change
- File naming: `YYYYMMDDHHMMSS-<description>.[ext]` (timestamp prefix)
- Every migration MUST have both `up` and `down` methods (or equivalent)
- `down` must fully reverse `up` — migrations must be rollback-safe

## Schema conventions (per `docs/database.md`)

<!-- Adapt these conventions to the database engine defined in CONTEXT_PACK.md -->

- **Primary keys**: use the recommended type for your database (e.g., `SERIAL`, `BIGINT AUTO_INCREMENT`, `UUID`)
- **Audit fields**: `created_at` and `updated_at` with appropriate default values
- **Soft deletes**: use `deleted_at` (nullable timestamp) when needed
- **Charset/collation**: configure per database engine recommendations

## Constraints

- Always define foreign keys with explicit `ON DELETE` / `ON UPDATE` behavior
- Use `ON DELETE CASCADE` only when child records should be removed with parent
- Define UNIQUE constraints as documented in `docs/database.md`

## Indexes

- Add indexes for columns used in WHERE, JOIN, ORDER BY
- Foreign key columns are typically auto-indexed (verify per database engine)
- Composite indexes: put most selective column first

## Safety rules

- Never DROP a column in the same release as code removal
- Add columns as NULLABLE first, backfill, then add NOT NULL constraint
- Never modify existing constraints in-place — drop and recreate
- Test rollback before considering migration complete
