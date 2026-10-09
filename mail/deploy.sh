#!/bin/bash
# Mailu deployment script — run on your mail server (Linux)
set -e

echo "=== Mailu deployment ==="

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "Docker not found. Install: https://docs.docker.com/engine/install/"
  exit 1
fi

# Create override directories
echo "Creating override directories..."
mkdir -p data/overrides/{nginx,dovecot,postfix,rspamd,roundcube}

# Check .env
if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy mailu.env to .env and edit:"
  echo "  cp mailu.env .env"
  echo ""
  echo "Required for production:"
  echo "  - SECRET_KEY (pwgen 16 1)"
  echo "  - BIND_ADDRESS4 (your server's public IP)"
  echo "  - TLS_FLAVOR=letsencrypt"
  exit 1
fi

# Validate production settings (skip prompts when non-interactive, e.g. CI)
if grep -q "BIND_ADDRESS4=127.0.0.1" .env; then
  echo "WARNING: BIND_ADDRESS4 is 127.0.0.1 — mail won't be reachable from internet."
  echo "For production, set to your server's public IP."
  if [[ -t 0 ]]; then
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi
  else
    echo "Non-interactive mode: continuing."
  fi
fi

if grep -q "TLS_FLAVOR=notls" .env; then
  echo "WARNING: TLS_FLAVOR=notls — not recommended for production."
  echo "For production, set TLS_FLAVOR=letsencrypt after DNS is configured."
fi

# Pull and start
echo "Pulling images..."
docker compose pull

echo "Starting Mailu..."
docker compose up -d

echo ""
echo "=== Mailu is running ==="
echo "Admin UI:  http://$(grep BIND_ADDRESS4 .env | cut -d= -f2)/admin"
echo "Webmail:   http://$(grep BIND_ADDRESS4 .env | cut -d= -f2)/webmail"
echo ""
echo "Next: Add DNS records (A + MX for mail.akarigear.com), then set TLS_FLAVOR=letsencrypt and restart."
