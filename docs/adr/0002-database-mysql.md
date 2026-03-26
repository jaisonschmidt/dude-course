# ADR-0002: MySQL 8.0 com Prisma ORM

## Status
Accepted

## Context
O projeto Dude Course precisa de um banco de dados relacional para armazenar usuários, cursos, aulas, matrículas, progresso e certificados. O modelo de dados é relacional com FKs, constraints de unicidade e integridade referencial.

### Alternativas consideradas

#### 1. PostgreSQL
- Prós: extensões avançadas (JSON, full-text search), comunidade forte, excelente com Prisma
- Contras: pode ser overkill para MVP, setup ligeiramente maior

#### 2. MySQL 8.0
- Prós: amplamente adotado, boa performance para reads, excelente suporte em hosting/cloud, familiar para a equipe, bom suporte no Prisma
- Contras: menos extensões que PostgreSQL, JSON support mais limitado

#### 3. SQLite
- Prós: zero setup, ótimo para prototipagem
- Contras: limitações em concorrência, não adequado para produção web com múltiplos usuários

#### 4. MongoDB
- Prós: flexibilidade de schema
- Contras: modelo de dados é claramente relacional, perderia integridade referencial nativa

## Decision
Adotar **MySQL 8.0** como banco de dados, gerenciado via **Prisma ORM** para schema management, migrations e queries type-safe.

**Convenções:**
- Chaves primárias: `INT AUTO_INCREMENT`
- Charset: `utf8mb4` / Collation: `utf8mb4_unicode_ci`
- Engine: InnoDB (transações e FKs)
- Auditoria: `created_at` (DEFAULT CURRENT_TIMESTAMP) e `updated_at` (ON UPDATE)
- Schema gerenciado no pacote `database/` do monorepo
- Prisma Client exportado como singleton para uso em `backend/` e `integration-tests/`

## Consequences

### Positive
- Banco relacional maduro e estável para o modelo de dados do projeto
- Prisma garante type-safety nas queries e facilita migrations
- INT AUTO_INCREMENT é simples e performático para MVP
- Ampla disponibilidade de hosting (AWS RDS, PlanerScale, etc.)
- Pacote `database/` separado permite reutilização em testes de integração

### Negative
- INT AUTO_INCREMENT expõe sequência (mitigável com UUIDs públicos no futuro)
- MySQL tem menos extensões que PostgreSQL
- Prisma adiciona camada de abstração (raramente problema)

### Mitigations
- Se exposição de IDs sequenciais for concern, introduzir UUID público como campo adicional
- Schema documentado em `docs/database.md`
- Migrations versionadas e reversíveis via Prisma Migrate

## Notes
- Impacta: `docs/database.md`, `docs/local-setup.md`, `database/prisma/schema.prisma`
- Docker Compose provê MySQL para desenvolvimento local
