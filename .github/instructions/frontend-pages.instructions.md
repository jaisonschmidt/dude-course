---
description: "Use when creating or modifying frontend pages, components, or hooks. Covers framework patterns, API integration, and UI state handling."
applyTo: "frontend/**"
---

# Frontend Development Guidelines

> Consult `CONTEXT_PACK.md` for the frontend framework and `docs/project-structure.md` for folder layout.

## Rendering strategy

<!-- Adapt to the framework and rendering approach defined in your project -->

- Follow the rendering strategy defined in `CONTEXT_PACK.md` and relevant ADRs
- Use server-side rendering for dynamic, authenticated pages (when supported)
- Use static generation for public, rarely-changing content (when supported)

## Project structure

Follow the frontend structure defined in `docs/project-structure.md`.

## API integration

- All API calls go through `services/` — never call endpoints directly from components
- Match contracts exactly as defined in `docs/api-spec.md`
- Base path: `/api/v1`
- Handle auth token: attach to requests via appropriate mechanism, handle expiration
- Handle error response format: `{ code, message, details, requestId }`

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
