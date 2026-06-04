# 2026-06-04 Tencent Lighthouse Deployment Progress

## Scope

Deploy the personal website monorepo to Tencent Cloud Lighthouse for IP-stage public validation.

## Server

- Provider: Tencent Cloud Lighthouse
- Instance ID: `lhins-fszi97j9`
- Region: China Hong Kong / Hong Kong Zone 3
- Public IPv4: `43.129.207.237`
- OS: Ubuntu Server 22.04 LTS 64bit
- Spec: 2 vCPU / 2GB RAM / 40GB SSD / 20Mbps peak bandwidth / 512GB monthly traffic
- SSH user: `ubuntu`
- Local SSH key installed for server access: `/Users/wy/.ssh/tencent_lighthouse_personal_website`

## Repository

- Remote: `git@gitee.com:mr_wang112/personal-website.git`
- Branch: `main`
- Latest deployed commit: `9c0af8d` (`fix: use app base url for merchant login redirects`)
- Server clone path: `/opt/personal-website`
- Server clone mode: shallow clone from Gitee after an initial full clone stalled.
- Gitee server deploy key: installed as repository deploy key `tencent-lighthouse-personal-website`; read-only pull/fetch only.

## Runtime Setup

- Added 2GB swap: `/swapfile`
- Installed system packages: `nginx`, `postgresql`, `postgresql-contrib`, `git`, `build-essential`, `ufw`
- Node.js: `v22.22.3`
- pnpm: `10.20.0`
- PM2: `7.0.1`
- PostgreSQL: Ubuntu package `14.23`
- Nginx: Ubuntu package `1.18.0`

Note: pnpm 11 initially failed `--frozen-lockfile` because this repo still stores `pnpm.overrides` in `package.json`; server was pinned to pnpm `10.20.0`, matching local behavior.

## Database

- Local PostgreSQL database: `personal_website_content`
- App DB user: `personal_website_app`
- Env file: `/opt/personal-website/apps/content-growth-platform/.env.production`
- Secrets are stored only in the server env file and are not recorded here.
- Migrations applied: all SQL files under `apps/content-growth-platform/db/migrations/*.sql`
- Seeded demo merchant user:
  - Email: `demo@jingjing.local`
  - Password: `jingjing-demo`
  - Status: `active`
- Public schema table count after migration: `48`

`202605160002_selfhost_pgvector_optional.sql` reported pgvector unavailable and used the intended `embedding_json` fallback.

## Running Services

PM2 processes:

- `content-growth-platform`: port `3001`
- `ai-learning-companion`: port `3003`
- `fde-ai-empowerment`: port `3004`

Nginx:

- Port `80`
- Serves static portfolio from `/opt/personal-website/apps/portfolio`

Tencent Lighthouse firewall:

- Existing: TCP `22`, TCP `80`, ICMP all
- Added: TCP `3001`, TCP `3003`, TCP `3004`, all IPv4 sources

## Verified URLs

- Portfolio: `http://43.129.207.237/` returned `200 OK`
- Content platform login: `http://43.129.207.237:3001/login?demo=1` returned `200 OK`
- Content platform demo login POST created `jingjing_session`
- Content platform dashboard after login: `http://43.129.207.237:3001/dashboard/consultation` returned `200 OK`
- AI learning companion: `http://43.129.207.237:3003/` returned `200 OK`
- FDE AI empowerment: `http://43.129.207.237:3004/` returned `200 OK`

## Code Fix During Deployment

The merchant login route originally redirected with `new URL(path, request.url)`. In this self-hosted direct-port setup, the login response produced `Location: http://localhost:3001/dashboard`. Commit `9c0af8d` makes merchant-login redirects use `APP_BASE_URL` first, so production login now redirects to `http://43.129.207.237:3001/dashboard`.

Validation:

- Local `pnpm typecheck:content-growth`: passed.
- Server `pnpm build:content-growth`: passed after pulling `9c0af8d`.

## Known Gaps

- OSS is not configured yet. `/api/health` returns `503` because `STORAGE_PROVIDER=aliyun_oss` is set but Aliyun OSS env vars are empty. App and database checks are OK; storage check fails by design until OSS is added.
- Video/content-generation workers are not started. This is intentional for the current job-seeking demo deployment.
- HTTPS is not configured yet. Domain DNS should be pointed first, then issue certificates with Certbot/Nginx.
- Current portfolio launch links open direct ports (`3001`, `3003`, `3004`). This is fine for IP-stage validation. A cleaner domain-stage setup should move these behind subdomains or Nginx paths.

## Next Steps

1. Configure Aliyun OSS bucket and write OSS env vars into `/opt/personal-website/apps/content-growth-platform/.env.production`.
2. Restart `content-growth-platform` and recheck `/api/health`.
3. Add Aliyun DNS A records pointing to `43.129.207.237`.
4. After DNS resolves, configure HTTPS certificates.
