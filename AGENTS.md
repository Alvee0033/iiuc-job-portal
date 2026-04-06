## Project Context

- Monorepo with npm workspaces: `web` for the Next.js frontend and `apis` for the NestJS backend.
- Frontend stack: Next.js App Router, React 19, TypeScript, Tailwind v4, Radix UI, TanStack Query, Zustand.
- Backend stack: NestJS 10, TypeORM, PostgreSQL, Swagger, JWT auth, Redis cache support.
- Product domain: AI-assisted job portal with candidate, recruiter, interview, messaging, CV, and admin flows.

## Source Of Truth

- Treat `web/src/**` and `apis/src/**` as the only application source of truth.
- Do not edit generated or runtime directories unless the task explicitly targets build tooling:
  `web/.next`, `web/node_modules`, `apis/dist`, `apis/node_modules`, `apis/pgdata`, `.vercel`, log files.
- Treat `.env`, `.env.local`, `.env.*`, tokens, database dumps, and service credentials as secrets. Never print or copy them into code, docs, or commit messages.
- For database evolution, prefer explicit migrations and checked-in schema changes. Do not rely on `synchronize` as the long-term source of truth.

## Repo Rules

- Preserve workspace boundaries. Frontend changes belong in `web`; backend changes belong in `apis`.
- Prefer fixing root causes over patching symptoms. Remove duplication when touching a repeated pattern.
- Keep APIs, DTOs, entities, frontend types, and UI state aligned in the same change.
- Add or update verification whenever behavior changes: at minimum build, lint, or focused tests for the affected app.
- Do not introduce new global patterns casually. Reuse existing primitives unless the current primitive is the problem.

## Frontend Rules

- Default to server-first Next.js patterns. Use client components only for browser APIs, local interactivity, or client-side state.
- Use `web/src/lib/api-client.ts` as the preferred typed HTTP layer for new work. Do not expand `web/src/lib/api.ts` with more loosely typed wrappers unless required for a migration step.
- Keep page files thin. Put complex state, data orchestration, or UI logic into focused components, hooks, or `lib` modules.
- Eliminate `any` in touched code whenever practical. Add explicit request, response, and view-model types near the feature.
- Use React Query for remote server state and Zustand only for durable client auth/session state or truly cross-cutting UI state.
- Normalize auth token storage and naming when touched. Avoid introducing parallel keys such as both `token` and `access_token`.
- Prefer shared UI primitives in `web/src/components/ui` and shared helpers in `web/src/lib`.
- Keep accessibility intact: semantic controls, labels, keyboard support, loading and error states, and mobile-safe layouts.

## Backend Rules

- Keep Nest modules cohesive: controller for transport, service for business logic, DTOs for input contracts, entities for persistence.
- Add DTO validation and Swagger decorators for every new or changed request contract.
- Do not place business logic in controllers or entity classes.
- Use explicit authorization checks in addition to guards when resource ownership matters.
- Prefer typed repository queries and narrow selects over broad unbounded fetches.
- Return stable API shapes. If a response contract changes, update Swagger and the frontend consumer in the same task.
- Add migrations for schema changes. Avoid depending on development-only `synchronize` behavior for durable changes.
- Keep integration points behind services for AI providers, file parsing, and third-party APIs.

## Enterprise Standard Expectations

- Favor strict typing, explicit contracts, and predictable error handling over convenience shortcuts.
- Introduce configuration through environment variables and `ConfigService`, with safe defaults only for local development.
- Require observability on meaningful backend changes: clear logs, actionable errors, and no noisy debug logging in production paths.
- Keep code reviewable: small functions, clear names, and comments only where the intent would otherwise be hard to infer.
- When upgrading an area, leave it better than found: reduce duplication, tighten types, and add the missing guardrail closest to the change.

## Done Criteria

- The affected app still starts or builds successfully, or the blocker is documented explicitly.
- The changed flow has an obvious loading, success, and failure path.
- New contracts are typed end-to-end where feasible.
- No generated files, secrets, or local runtime artifacts are treated as hand-maintained source.
