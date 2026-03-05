# Mailu — Self-hosted mail server

Mail server with webmail (Roundcube) for store owners. Send and receive email.

**Docs:** [mailu.io](https://mailu.io/)

## Go live (production)

1. **Get a VPS** — Linux server with public IP (e.g. DigitalOcean, Hetzner, 1GB RAM min)
2. **Install Docker** — `curl -fsSL https://get.docker.com | sh`
3. **Copy this folder** to the server (git clone or scp)
4. **Configure** — `cp mailu.env .env` and edit:
   - `SECRET_KEY` — `pwgen 16 1` or random 16+ chars
   - `BIND_ADDRESS4` — your server's public IP
   - `TLS_FLAVOR=letsencrypt`
   - `INITIAL_ADMIN_PW` — strong password
5. **DNS (GoDaddy)** — Add records:
   - **A:** `mail` → your server IP
   - **MX:** `@` → `mail.akarigear.com` (priority 10)
6. **Deploy** — `./deploy.sh` (Linux) or `docker compose up -d`
7. **Access** — https://mail.akarigear.com/admin (after DNS propagates)

**Auto-deploy (GitHub Actions):** Pushes to `main` trigger deployment. In the repo → Settings → Secrets and variables → Actions, add:
- `DEPLOY_HOST` — VM IP or hostname (e.g. `mail.akarigear.com`)
- `DEPLOY_USER` — SSH user (e.g. `debian` or your username)
- `SSH_PRIVATE_KEY` — Private key for SSH (paste the full key including `-----BEGIN ... -----`)
- `DEPLOY_PATH` — (optional) Path to repo on VM, default `~/mail`

**Windows (local testing):** Run `.\deploy.ps1` — port 25 may be blocked by ISP.

---

## Quick start

### 1. Configure

```bash
cd mail
cp mailu.env .env
```

Edit `.env`:

- **SECRET_KEY** — Generate: `pwgen 16 1` (or any 16+ char random string)
- **DOMAIN** — Your mail domain (e.g. `yourstore.com`)
- **HOSTNAMES** — Hostname for the mail server (e.g. `mail.yourstore.com`)
- **BIND_ADDRESS4** — `127.0.0.1` for local only, or your server's public IP
- **TLS_FLAVOR** — `notls` for testing, `letsencrypt` for production
- **INITIAL_ADMIN_*** — First admin account (create postmaster user)

### 2. Create override directories

**Linux/macOS:**
```bash
mkdir -p data/overrides/{nginx,dovecot,postfix,rspamd,roundcube}
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path data/overrides/nginx, data/overrides/dovecot, data/overrides/postfix, data/overrides/rspamd, data/overrides/roundcube
```

### 3. Start

```bash
docker compose up -d
```

### 4. Create admin (if not using INITIAL_ADMIN_*)

```bash
docker compose exec admin flask mailu admin me example.com 'YourPassword'
```

### 5. Access

- **Admin UI:** http://127.0.0.1:8080/admin
- **Webmail:** http://127.0.0.1:8080/webmail

*(Port 8080 avoids HSTS/HTTPS issues. Use **http://127.0.0.1:8080** — not localhost, not https.)*

**Webmail flow:** Mailu uses SSO. Visit `/admin` first, log in with `admin@akarigear.com`, then use the webmail link or go to `/webmail`. Going directly to `/webmail` without a session will redirect you to the login page.

**Note:** Containers use Cloudflare DNS (1.1.1.1) for DNSSEC validation. For production, consider enabling Mailu's unbound resolver.

### Troubleshooting "fails to connect"

- **Connection refused** — Ensure containers are running: `docker compose ps`. Restart: `docker compose down && docker compose up -d`.
- **Admin works, webmail fails** — Try `http://127.0.0.1:8080/admin`, log in, then click the webmail link in the admin UI.
- **Redirect loop / blank page** — With `TLS_FLAVOR=notls`, add `SESSION_COOKIE_SECURE=False` to `.env` and restart.
- **Port 25 blocked (Windows)** — ISP may block port 25. Use `.\deploy.ps1` or start without port 25 for local testing.

## Production

1. **DNS (GoDaddy)** — In GoDaddy DNS, add:
   - **A record:** `mail.akarigear.com` → your server IP
   - **MX record:** `@` or `akarigear.com` → `mail.akarigear.com` (priority 10)
   - **SPF, DKIM, DMARC** — Generate in Mailu Admin UI after first start (see [Mailu DNS setup](https://mailu.io/2.0/dns.html))
2. **TLS** — Set `TLS_FLAVOR=letsencrypt`
3. **BIND_ADDRESS4** — Use your server's public IP
4. **Firewall** — Open ports 25, 80, 443, 465, 587, 993, 995

## Mousepad backend integration

1. Create a mailbox in Admin UI (e.g. `noreply@yourstore.com`)
2. In `backend/.env`:

```env
SMTP_HOST=mail.yourstore.com
SMTP_PORT=587
SMTP_USER=noreply@yourstore.com
SMTP_PASS=<mailbox-password>
EMAIL_FROM=noreply@yourstore.com
```

## Requirements

- Docker & Docker Compose
- 1GB RAM (2–3GB recommended with antivirus)
- Domain with DNS control
