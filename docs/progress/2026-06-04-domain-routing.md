# 2026-06-04 Domain routing for 2young.xin

## Goal

把阿里云域名 `2young.xin` 指向腾讯 Lighthouse，并按二级域名拆分：

- `2young.xin`: 个人作品集主页
- `www.2young.xin`: 个人作品集主页
- `xhs.2young.xin`: 小红书 / 内容获客平台

## DNS

Provider:

- 阿里云云解析 DNS

Added records:

| Host | Type | Value | TTL |
| --- | --- | --- | --- |
| `@` | A | `43.129.207.237` | 10 minutes |
| `www` | A | `43.129.207.237` | 10 minutes |
| `xhs` | A | `43.129.207.237` | 10 minutes |

阿里云页面确认：

- 成功添加 3 条记录。
- `2young.xin` DNS 信息配置正确。

## Tencent Server Routing

Server:

- Tencent Lighthouse: `43.129.207.237`

Nginx config:

- Remote path: `/etc/nginx/sites-enabled/personal-website`
- Backup path: `/etc/nginx/backups/personal-website.bak-20260604235014`
- Local archived copy: `docs/progress/artifacts/2026-06-04-domain-routing/personal-website.nginx.conf`

Routing:

- `2young.xin` / `www.2young.xin` / unknown default host:
  - Serves static portfolio from `/opt/personal-website/apps/portfolio`.
  - Keeps fallback proxy to `127.0.0.1:3001` for existing app paths.
- `xhs.2young.xin`:
  - Proxies all paths to `127.0.0.1:3001`.

Nginx validation:

- `sudo nginx -t`: passed.
- `sudo systemctl reload nginx`: completed.

## Portfolio Entry Update

Updated:

- `apps/portfolio/script.js`

Change:

- Matrix Growth launch now uses `xhs.2young.xin` on non-local hosts.
- Local preview still uses the configured local port.

## Verification

DNS:

- `2young.xin` -> `43.129.207.237`
- `www.2young.xin` -> `43.129.207.237`
- `xhs.2young.xin` -> `43.129.207.237`
- AliDNS `223.5.5.5` returned the same three A records.

HTTP:

- `http://2young.xin/`: 200, static portfolio.
- `http://www.2young.xin/`: 200, static portfolio.
- `http://xhs.2young.xin/`: 200, Next.js content platform.
- `http://xhs.2young.xin/login?demo=1&next=%2Fdashboard`: 200, title `内容获客平台`.

## Follow-up

HTTPS is not configured yet. Current working URLs are HTTP. The next domain step should be issuing certificates for:

- `2young.xin`
- `www.2young.xin`
- `xhs.2young.xin`

Recommended route:

- Use `certbot --nginx` or Tencent/ZeroSSL certificates, then redirect HTTP to HTTPS.
