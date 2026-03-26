---
description: "Use when creating or modifying frontend pages, components, or hooks. Covers Next.js App Router patterns, API integration, and UI state handling."
applyTo: "frontend/**"
---

# Frontend Development Guidelines (Next.js App Router)

> Consult `CONTEXT_PACK.md` for stack details and `docs/project-structure.md` for folder layout.

## Rendering strategy

- **Hybrid rendering**: SSR for dynamic/authenticated pages, SSG for public/static content
- Use React Server Components by default
- Add `'use client'` only for components that need interactivity (hooks, event handlers)
- Follow ADR-0003 for rendering decisions

## Project structure

Follow the frontend structure defined in `docs/project-structure.md`.

## API integration

- All API calls go through `services/` — never call endpoints directly from components
- Match contracts exactly as defined in `docs/api-spec.md`
- Base path: `/api/v1`
- Handle JWT token: store in memory/httpOnly cookie, attach via `Authorization: Bearer <token>`, handle expiration
- Handle error response format: `{ code, message, details, requestId }`
- Use `fetch` or lightweight HTTP client (no heavy libraries like axios)

## UI state handling

Every data-fetching component MUST handle:
- **Loading**: skeleton/spinner while fetching
- **Error**: meaningful error message with retry option
- **Empty**: appropriate empty state message
- **Success**: render data
- **Token expired**: redirect to login

## Non-negotiable rules

- **No business rules in frontend** — backend is source of truth
- Never expose auth tokens in client-side errors or console
- Always handle HTTP errors gracefully
- Use typed props and API responses (per project language/framework)
