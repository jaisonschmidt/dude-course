# 📚 Domain Model

<!-- TEMPLATE: Preencha este documento com o modelo de domínio do seu projeto. -->
<!-- Consulte docs/engineering-docs-recommendation.md para orientações detalhadas. -->

Este documento descreve o **modelo de domínio** do projeto.

Ele define:

- entidades do sistema
- relacionamentos
- regras de negócio
- estados do domínio

Para detalhes de arquitetura consulte: `docs/architecture.md`

Para visão geral do projeto consulte: `README.md`

---

## 🧩 Entidades do Domínio

<!-- Liste as entidades principais do sistema. Exemplo: -->
<!-- User, Order, Product, Payment, etc. -->

> **[PREENCHER]** Liste as entidades do domínio do seu projeto.

---

## Entidade: [Nome]

<!-- Repita esta seção para cada entidade. -->

> **[PREENCHER]** Descreva cada entidade seguindo o modelo abaixo.

### Descrição

Breve descrição da entidade e seu papel no sistema.

### Atributos

```
id
[campo1]
[campo2]
createdAt
updatedAt
```

### Regras

- [Regra de negócio 1]
- [Regra de negócio 2]

---

## 🔗 Relacionamentos

<!-- Descreva os relacionamentos entre entidades. Pode usar diagrama ASCII ou texto. -->

> **[PREENCHER]** Mapeie os relacionamentos principais (1:N, N:N, etc.)

```
EntityA
  │ 1..*
  ▼
EntityB ─── belongs to ─── EntityC
```

---

## 📊 Regras de Negócio

<!-- Liste as regras de negócio globais do sistema, agrupadas por contexto. -->

> **[PREENCHER]** Descreva as regras de negócio do seu domínio.

### [Contexto 1]

- [Regra]

### [Contexto 2]

- [Regra]

---

## 🔄 Fluxo Principal

<!-- Descreva o fluxo principal do sistema (happy path). -->

> **[PREENCHER]** Descreva o fluxo principal do usuário no sistema.

```
[Passo 1] → [Passo 2] → [Passo 3] → [Resultado]
```
