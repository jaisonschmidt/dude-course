# 🗄️ Database

<!-- TEMPLATE: Preencha este documento com o schema do banco de dados do seu projeto. -->
<!-- Consulte docs/engineering-docs-recommendation.md para orientações detalhadas. -->

Este documento descreve o **modelo físico de dados** do projeto.

Para o modelo de domínio e regras de negócio consulte: `docs/domain.md`

Para decisões de arquitetura consulte: `docs/architecture.md`

---

## ✅ Princípios

- **MySQL 8.0** como banco de dados relacional.
- **Prisma ORM** para acesso a dados, migrations e schema management.
- **FKs e constraints** habilitadas para integridade referencial.
- **Chaves primárias**: `INT AUTO_INCREMENT` para entidades principais.
- **Auditoria mínima** com `created_at` (`DEFAULT CURRENT_TIMESTAMP`) e `updated_at` (`ON UPDATE CURRENT_TIMESTAMP`).
- **Unicidade** garantida por índices únicos conforme domínio.
- **Integridade referencial** com FKs e regras de `ON DELETE`/`ON UPDATE`.
- **Charset**: `utf8mb4` com collation `utf8mb4_unicode_ci` (suporte completo a Unicode).
- **Engine**: InnoDB (padrão MySQL 8.0, suporta transações e FKs).
- Decisão registrada em: `docs/adr/0002-database-mysql.md`.

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
