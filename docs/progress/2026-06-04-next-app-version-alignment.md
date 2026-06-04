# 2026-06-04 Next app version alignment progress

## Scope

- Base: `main` after fast-forward merging `codex/fde-ai-empowerment`.
- Working branch: `codex/next-app-version-alignment`.
- Goal: align the three formal Next.js apps while keeping the content-growth backend/worker path conservative.

## Changes

- Aligned `apps/ai-learning-companion`, `apps/content-growth-platform`, and `apps/fde-ai-empowerment` on:
  - `next` `16.2.7`
  - `eslint-config-next` `16.2.7`
  - `react` / `react-dom` `19.2.4`
- Moved FDE from app-level npm lockfile to the workspace `pnpm-lock.yaml`.
- Added root scripts for FDE:
  - `dev:fde`
  - `lint:fde`
  - `build:fde`
- Added pnpm overrides:
  - `postcss` `8.5.15`
  - `qs` `6.15.2`
- Removed abandoned Supabase runtime helpers from content-growth:
  - `src/lib/supabase/admin.ts`
  - `src/lib/supabase/browser.ts`
  - `src/lib/supabase/server.ts`
- Kept content-growth on PostgreSQL; no Supabase package was added.
- Removed content-growth direct `proxy-agent` dependency because runtime code did not import it.
- Moved `shadcn` from production dependencies to dev dependencies and upgraded it to `4.10.0`.
- Updated FDE for Next 16:
  - replaced removed `next lint` usage with direct `eslint`
  - migrated ESLint config to the Next 16 flat config entrypoints
  - removed `next/font/google` so builds no longer depend on fetching Google Fonts
  - fixed small lint findings surfaced by the stricter React hooks rules

## Validation

Passed:

- `pnpm lint:ai-learning`
- `pnpm build:ai-learning`
- `pnpm lint:fde`
- `pnpm build:fde`
- `pnpm typecheck:content-growth`
- `pnpm build:content-growth`
- `pnpm lint:content-growth`

Notes:

- `pnpm lint:content-growth` exits 0 with two existing warnings:
  - `scripts/migrate-factory-source-items-to-merchant-media.mjs`: unused `sourceItem`
  - `src/server/api/video-job-payload.ts`: unused `buildMissingVideoAssetHints`
- `pnpm build:fde` exits 0 with an existing Recharts warning about chart container width/height during static generation.

Browser smoke:

- Portfolio homepage at `http://127.0.0.1:8080/` loads and shows `FDE 企业 AI 赋能`.
- Portfolio FDE detail `进入该项目` points to `http://localhost:3004/`.
- FDE app loads at `http://localhost:3004/`.
- AI learning companion loads at `http://localhost:3003/`.
- Content-growth login page loads at `http://localhost:3001/login?demo=1&next=%2Fdashboard`.

## OSS Proxy Dependency Remediation

Follow-up remediation removed the production vulnerability path from the content-growth OSS SDK chain.

Before remediation, `pnpm audit --prod` exited non-zero because of:

```text
apps__content-growth-platform
  > ali-oss
  > urllib
  > proxy-agent
  > pac-proxy-agent
  > pac-resolver
  > degenerator
  > vm2
```

The implemented fix keeps Aliyun OSS direct mode unchanged:

- Set `.npmrc` `auto-install-peers=false` so pnpm does not auto-install optional peers such as `urllib`'s `proxy-agent`.
- Added a local dependency-compatible `proxy-agent` stub at `packages/proxy-agent-disabled/` so Turbopack can resolve `urllib`'s lazy `require("proxy-agent")` during build.
- Added a narrow Aliyun OSS guard that rejects `URLLIB_ENABLE_PROXY` / `URLLIB_PROXY`, the two env vars that would enable `urllib` proxy mode in this application.
- Added explicit `@base-ui/react` peer dependencies `@date-fns/tz` and `date-fns`, which had previously been supplied by pnpm auto peer installation.

After remediation:

- `pnpm audit --prod` passes with `No known vulnerabilities found`.
- `pnpm --dir apps/content-growth-platform list ali-oss urllib proxy-agent --depth 4` shows `urllib 2.44.0` satisfied by the local `proxy-agent` stub, without `pac-resolver`, `degenerator`, or `vm2`.
- `pnpm build:content-growth` passes.
- `pnpm typecheck:content-growth` passes.
- `pnpm lint:content-growth` passes with the two existing warnings listed above.
