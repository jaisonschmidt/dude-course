# 🗄️ Database

<!-- TEMPLATE: Preencha este documento com o schema do banco de dados do seu projeto. -->
<!-- Consulte docs/engineering-docs-recommendation.md para orientações detalhadas. -->

Este documento descreve o **modelo físico de dados** do projeto.

Para o modelo de domínio e regras de negócio consulte: `docs/domain.md`

Para decisões de arquitetura consulte: `docs/architecture.md`

---

## ✅ Princípios

- **[PREENCHER]** Banco de dados escolhido (ex.: PostgreSQL 16, MySQL 8, MongoDB 7, SQLite, etc.)
- **FKs e constraints** habilitadas (para bancos relacionais).
- **Chaves artificiais** para entidades principais (ex.: `BIGINT`, `UUID`, `SERIAL` — conforme convenção do banco).
- **Auditoria mínima** com `created_at` / `updated_at`.
- **Unicidade** garantida por índices únicos conforme domínio.
- **Integridade referencial** com FKs e regras de `ON DELETE`/`ON UPDATE` (quando aplicável).

---

## 🧱 Tabelas

<!-- Repita esta seção para cada tabela do sistema. -->

### [nome_da_tabela]

> **[PREENCHER]** Descreva cada tabela seguindo o modelo abaixo.

**Descrição:** Breve descrição do propósito da tabela.

#### Campos

- `id`: identificador interno
- `[campo]`: descrição
- `created_at`, `updated_at`

#### Regras/Constraints

- [Constraint 1, ex.: campo X **único**]
- [Constraint 2, ex.: FK para tabela Y]

---

## 🧠 Observações importantes (Domínio ↔ Banco)

<!-- Descreva cálculos, derivações ou regras que conectam domínio e banco. -->

> **[PREENCHER]** Documente regras de negócio que impactam o schema (ex.: cálculos de completude, validações no Service Layer).

---

## 🧾 Schema SQL

<!-- Cole o DDL de referência para migrations. -->

> **[PREENCHER]** Adicione o schema SQL base do projeto.

```sql
-- [PREENCHER] Banco escolhido e configurações recomendadas

-- Exemplo:
-- CREATE TABLE [nome] (
--   id [TIPO_CHAVE_PRIMARIA],
--   ...
--   PRIMARY KEY (id)
-- );
```
