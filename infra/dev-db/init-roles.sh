#!/usr/bin/env bash
# Veritabanı İLK oluşturulurken bir kez çalışır: ekip kullanıcısını oluşturur ve yetkilerini sınırlar.
# izmirfen_app: tablolarda SELECT/INSERT/UPDATE/DELETE yapabilir; tablo oluşturamaz, silemez, şema değiştiremez.
set -euo pipefail
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE ROLE ${APP_USER} LOGIN PASSWORD '${APP_PASSWORD}' CONNECTION LIMIT 40;
REVOKE ALL ON DATABASE ${POSTGRES_DB} FROM PUBLIC;
GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO ${APP_USER};
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO ${APP_USER};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${APP_USER};
ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${APP_USER};
ALTER ROLE ${APP_USER} SET statement_timeout = '15s';
ALTER ROLE ${APP_USER} SET idle_in_transaction_session_timeout = '60s';
SQL
echo "[init] ${APP_USER} oluşturuldu (yalnızca veri okuma/yazma)"
