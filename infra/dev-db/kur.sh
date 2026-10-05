#!/usr/bin/env bash
# Ortak geliştirme veritabanını sunucuda kurar/günceller. Tekrar çalıştırılabilir.
#   1) .env yoksa güçlü şifreler üretir
#   2) Postgres'i (SSL zorunlu) başlatır
#   3) AdminPanel/db/schema.sql'i şema sahibi olarak uygular
#   4) Ekip için bağlantı bilgisini yazar
# Kullanım (sunucuda, depo klonlandıktan sonra):  cd infra/dev-db && bash kur.sh
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -f .env ]; then
  umask 077
  printf 'OWNER_PASSWORD=%s\nAPP_PASSWORD=%s\n' "$(openssl rand -hex 24)" "$(openssl rand -hex 24)" > .env
  echo "Yeni şifreler üretildi: infra/dev-db/.env (yedekleyin, paylaşmayın)"
fi
docker compose up -d --wait
docker compose exec -T db psql -v ON_ERROR_STOP=1 -q -U izmirfen_owner -d izmirfen < ../../AdminPanel/db/schema.sql
TABLES=$(docker compose exec -T db psql -tA -U izmirfen_owner -d izmirfen -c "SELECT count(*) FROM pg_tables WHERE schemaname='public'")
IP=$(curl -s -m 5 https://checkip.amazonaws.com || echo SUNUCU_IP)
echo
echo "Hazır: $TABLES tablo. Ekip bağlantısı (şifreyi özel kanaldan iletin):"
echo "  DATABASE_URL=postgres://izmirfen_app:<APP_PASSWORD>@${IP}:5433/izmirfen"
echo "  DATABASE_SSL=true"
echo "  DATABASE_SSL_REJECT_UNAUTHORIZED=false"
echo
echo "Unutmayın: Lightsail → Networking → IPv4 Firewall → Custom TCP 5433 kuralı ekleyin."
