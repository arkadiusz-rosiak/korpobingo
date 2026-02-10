# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Lint & format
npm run lint                          # ESLint across all packages
npm run format                        # Prettier --write across all packages
npx prettier --check packages/        # Check without writing

# Test
npm test --workspace=packages/core    # Vitest (core package only)

# Dev
npm run dev -w packages/web           # Next.js dev server
npm run storybook -w packages/web     # Storybook on port 6006

# Deploy
npx sst dev                           # Local dev with SST
npx sst deploy --stage production     # Production deploy
```

**Note:** CI workflow (`.github/workflows/deploy.yml`) still references Biome linter — it should be updated to `npx eslint packages/` to match current tooling.

## Architecture

SST v3 monorepo (npm workspaces) deploying to AWS (Lambda + API Gateway v2 + DynamoDB).

### Packages

- **`packages/core/`** — Shared business logic as namespaced modules (`Round`, `Word`, `Board`, `Player`). Each namespace exports typed CRUD operations against DynamoDB. Custom error classes: `ValidationError`, `NotFoundError`.
- **`packages/functions/`** — Lambda handlers (`rounds.ts`, `words.ts`, `players.ts`, `boards.ts`). All wrapped with `wrapHandler()` middleware that handles errors, CORS, and JSON serialization.
- **`packages/web/`** — Next.js 14 App Router frontend. Tailwind CSS with custom `corpo` color palette (indigo-based, `#1a237e`).
- **`infra/`** — SST infrastructure: `storage.ts` (4 DynamoDB tables), `api.ts` (API Gateway routes), `web.ts` (Next.js deployment + env vars).

### Data Flow

Round lifecycle: `collecting` → `playing` → `finished`. Players join via 6-char share code, submit/vote on words during collecting phase, then get randomized bingo boards when game starts.

### Frontend Patterns

- Reusable UI primitives in `packages/web/components/ui/` with barrel export from `index.ts`
- Real-time updates via `usePolling` hook (not WebSockets)
- Session management in localStorage (`lib/session.ts`); PINs in sessionStorage
- API client (`lib/api.ts`) with exponential backoff + jitter retry logic
- `useNotifications` hook for player join/bingo toast notifications

### DynamoDB Tables

All tables use `roundId` as partition key. Sort keys: `wordId` (Words), `playerName` (Players, Boards). Rounds table has a GSI `byShareCode` on `shareCode`.

## Conventions

- All UI text must be in English
- When generating Polish content (e.g. sample data), use Polish diacritical characters
- Prettier config: double quotes, semicolons, 100 char width, trailing commas
- `sst-env.d.ts` files are generated — keep untracked

### Commits

- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification) — e.g. `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `test:`
- Always sign commits with author line (not co-author):
  ```
  Authored-by: Claude Code <noreply@anthropic.com>
  ```
- Never add any other author or co-author attribution
