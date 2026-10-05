#!/usr/bin/env bash
# Sertifika yoksa üretir (10 yıl, kendi imzalı), sonra resmi giriş betiğiyle Postgres'i SSL zorunlu başlatır.
set -euo pipefail
SSL_DIR=/var/lib/postgresql/ssl
if [ ! -f "$SSL_DIR/server.key" ]; then
  mkdir -p "$SSL_DIR"
  openssl req -new -x509 -days 3650 -nodes -subj "/CN=izmirfen-devdb" \
    -keyout "$SSL_DIR/server.key" -out "$SSL_DIR/server.crt" >/dev/null 2>&1
  echo "[ssl] yeni sertifika üretildi"
fi
chown -R postgres:postgres "$SSL_DIR"
chmod 600 "$SSL_DIR/server.key"
exec docker-entrypoint.sh postgres \
  -c ssl=on -c ssl_cert_file="$SSL_DIR/server.crt" -c ssl_key_file="$SSL_DIR/server.key" \
  -c hba_file=/etc/postgresql/pg_hba.conf \
  -c password_encryption=scram-sha-256 \
  -c max_connections=60 -c shared_buffers=48MB -c work_mem=2MB \
  -c log_connections=on
