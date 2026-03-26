---
description: "Use when creating or modifying Prisma schema or migrations. Covers Prisma Migrate patterns, constraints, rollback safety, and MySQL conventions."
applyTo: "**/prisma/**,**/database/**"
---

# Database Migration Guidelines (Prisma + MySQL)

## Migration standards

- Migrations are managed by **Prisma Migrate** in the `database/` package
- Schema changes go in `database/prisma/schema.prisma`
- Generate migrations with `pnpm prisma migrate dev --name <description>`
- Each migration should represent ONE atomic schema change
- Prisma handles `up` automatically; manual SQL can be added in migration files
- Always test migrations in development before staging/production

## Schema conventions (MySQL 8.0 via Prisma)

- **Primary keys**: `Int @id @default(autoincrement())`
- **Audit fields**: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- **Soft deletes**: use `deletedAt DateTime?` when needed
- **Charset/collation**: `utf8mb4` / `utf8mb4_unicode_ci` (set in datasource or connection URL)

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
