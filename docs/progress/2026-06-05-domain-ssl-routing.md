# 2026-06-05 域名与 SSL 路由记录

## 背景

用户发现作品集里的「AI 学习伴侣」入口仍然跳到 `http://2young.xin:3003/`。

根因是 `apps/portfolio/script.js` 中该项目只配置了 `port: 3003`，没有配置线上二级域名；同类问题也存在于 FDE 项目，仍然依赖 `port: 3004`。公网作品集在非 localhost 环境下应优先使用二级域名，而不是暴露应用端口。

## 本轮改动

### 本地代码

修改 `apps/portfolio/script.js`：

- AI 学习伴侣：
  - 新增 `domain: "learn.2young.xin"`
  - 展示说明改为 `线上项目：learn.2young.xin`
- FDE：
  - 新增 `domain: "fde.2young.xin"`
  - 展示说明改为 `线上项目：fde.2young.xin`

保留 `port: 3003` / `port: 3004` 作为 localhost 本地预览 fallback。公网环境下 `resolveLaunchHref()` 会优先使用 `domain`。

### DNS

在阿里云 DNS 为 `2young.xin` 增加 / 确认以下 A 记录，均指向腾讯云轻量服务器：

| 主机记录 | 记录值 |
| --- | --- |
| `@` | `43.129.207.237` |
| `www` | `43.129.207.237` |
| `xhs` | `43.129.207.237` |
| `learn` | `43.129.207.237` |
| `fde` | `43.129.207.237` |

用 `dig @223.5.5.5` 验证 5 个域名均解析到 `43.129.207.237`，未发现 AAAA 乱指。

### Nginx

腾讯云服务器：

- IP：`43.129.207.237`
- Nginx 配置：`/etc/nginx/sites-enabled/personal-website`
- 备份配置：
  - `/etc/nginx/backups/personal-website.bak-20260605002234`
  - `/etc/nginx/backups/personal-website.bak-20260604235014`

当前路由：

| 域名 | 后端 |
| --- | --- |
| `2young.xin` | `/opt/personal-website/apps/portfolio` 静态作品集 |
| `www.2young.xin` | `/opt/personal-website/apps/portfolio` 静态作品集 |
| `xhs.2young.xin` | `127.0.0.1:3001` |
| `learn.2young.xin` | `127.0.0.1:3003` |
| `fde.2young.xin` | `127.0.0.1:3004` |

本地留档：

- `docs/progress/artifacts/2026-06-05-domain-ssl-routing/personal-website.pre-certbot.nginx.conf`
- `docs/progress/artifacts/2026-06-05-domain-ssl-routing/personal-website.certbot.nginx.conf`

### SSL

服务器已安装：

- `certbot`
- `python3-certbot-nginx`

已签发一张 Let’s Encrypt 证书，覆盖以下域名：

- `2young.xin`
- `www.2young.xin`
- `xhs.2young.xin`
- `learn.2young.xin`
- `fde.2young.xin`

证书路径：

- fullchain：`/etc/letsencrypt/live/2young.xin/fullchain.pem`
- privkey：`/etc/letsencrypt/live/2young.xin/privkey.pem`

证书信息：

- Issuer：`Let's Encrypt / YR1`
- Not Before：`2026-06-04 15:26:25 GMT`
- Not After：`2026-09-02 15:26:24 GMT`
- `certbot.timer` 已存在，用于自动续期。

备注：执行过 `certbot renew --dry-run`，但该命令长时间无输出，本轮手动停止。正式证书签发、Nginx 加载、HTTPS 访问和系统 timer 均已验证；后续如需做续期演练，可单独在网络稳定时重跑 dry-run。

### 腾讯云防火墙

在轻量服务器防火墙中新增：

- `HTTPS (443)` / `全部IPv4地址` / `TCP 443` / `允许`

同时删除旧的公网直连应用端口规则：

- `3001`
- `3003`
- `3004`

目的：用户公网访问统一走 `80/443 + Nginx + 二级域名`，不再暴露 `http://2young.xin:3003/` 这类端口入口。

注意：服务器内部 Next.js 进程仍监听 `3001/3003/3004`，供 Nginx 反代使用；公网层由腾讯云防火墙阻断。

## 验证

### 代码验证

```bash
node --check apps/portfolio/script.js
```

结论：通过。

### DNS 验证

```bash
dig +short A 2young.xin @223.5.5.5
dig +short A www.2young.xin @223.5.5.5
dig +short A xhs.2young.xin @223.5.5.5
dig +short A learn.2young.xin @223.5.5.5
dig +short A fde.2young.xin @223.5.5.5
```

结论：均返回 `43.129.207.237`。

### Nginx 验证

```bash
sudo nginx -t
sudo ss -ltnp | grep -E ':(80|443|3001|3003|3004)\b'
```

结论：

- Nginx 配置语法通过。
- Nginx 监听 `80/443`。
- 应用进程监听 `3001/3003/3004`，仅作为反代后端。

### HTTPS 验证

以下地址均已返回 `HTTP/1.1 200 OK`：

- `https://2young.xin/`
- `https://www.2young.xin/`
- `https://learn.2young.xin/`
- `https://fde.2young.xin/`
- `https://xhs.2young.xin/`

以下 HTTP 地址均会 301 跳转到 HTTPS：

- `http://2young.xin/`
- `http://learn.2young.xin/`
- `http://fde.2young.xin/`
- `http://xhs.2young.xin/`

以下旧直连端口公网访问已无响应 / 超时：

- `http://2young.xin:3001/`
- `http://2young.xin:3003/`
- `http://2young.xin:3004/`

### 页面标题验证

- `https://2young.xin/`：`洋 | AI 产品作品集`
- `https://learn.2young.xin/`：`AI 智能学习伴侣`
- `https://fde.2young.xin/`：`toB 大模型转型范式集合`
- `https://xhs.2young.xin/login?demo=1&next=%2Fdashboard`：`内容获客平台`

## 风险和后续

1. 本轮公网 `curl` 测试中，个别域名在证书 / 防火墙刚配置后出现过单次 `443` 握手超时，但重试可返回 200；服务端本地 HTTPS、证书覆盖、DNS、Nginx 监听均正常。判断为公网链路或腾讯云规则刚生效阶段的偶发超时，而不是配置缺失。
2. 若后续希望进一步收紧安全面，可以把 PM2 / Next.js 启动参数改成只监听 `127.0.0.1`，而不是 `0.0.0.0`。当前公网防火墙已经阻断直连端口，所以这不是立即阻塞项。
3. 若未来新增子项目，建议统一使用 `<project>.2young.xin` 二级域名，不再开放应用端口。

