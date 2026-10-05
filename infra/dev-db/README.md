# Ortak geliştirme veritabanı (AWS)

Ekipteki herkesin bağlandığı PostgreSQL. **Yeni bir AWS hesabındaki** küçük bir Lightsail sunucusunda çalışır (Fen Bahçeleri'nin mevcut sunucusundan ve canlı veritabanından tamamen ayrıdır).
Maliyet: Lightsail Linux 5–7 $/ay (yeni hesaplarda seçili planlar ilk 3 ay ücretsiz). Veritabanı ~25–40 MB RAM kullanır; 0,5 GB'lık plan yeter.

| | Değer |
| --- | --- |
| Adres | `<SUNUCU_IP>:5433` |
| Veritabanı | `izmirfen` |
| Ekip kullanıcısı | `izmirfen_app` — yalnızca SELECT/INSERT/UPDATE/DELETE; tablo oluşturamaz/silemez, TRUNCATE yapamaz, sorgu başına 15 sn sınır, en fazla 40 bağlantı |
| Şema sahibi | `izmirfen_owner` — yalnızca proje sahibi |
| Güvenlik | SSL zorunlu (SSL'siz bağlantı reddedilir), scram-sha-256 şifre, 10 yıllık kendinden imzalı sertifika |

## Kurulum (proje sahibi, bir kez)

0. **Yeni AWS hesabında sunucu:** https://lightsail.aws.amazon.com → Create instance → bölge **Frankfurt** → Linux/Unix → **OS Only → Ubuntu 24.04 LTS** → plan (5 $ / 0,5 GB yeterli) → oluştur. **Networking → Create static IP** → sunucuya bağla. Hesapta **Billing → Budgets** ile 10 $'lık bütçe alarmı kurun.
   Sunucuda (Connect using SSH) Docker:
   ```bash
   curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER && exit   # tekrar bağlanın
   ```
1. **Lightsail → sunucu → Networking → IPv4 Firewall → Add rule:** Custom, TCP, **5433**.
   Mümkünse "Restrict to IP address" ile yalnızca okulun ve ekibin IP'lerine açın (ev IP'leri değişiyorsa herkese açık bırakılabilir; SSL + güçlü şifre zorunlu).
2. Sunucuda (Connect using SSH):
   ```bash
   git clone https://github.com/<HESAP>/<DEPO>.git izmirfen && cd izmirfen/infra/dev-db
   bash kur.sh
   ```
   `kur.sh`: `.env` yoksa güçlü şifreler üretir → Postgres'i başlatır → `AdminPanel/db/schema.sql`'i uygular → ekip bağlantı adresini yazar.
3. Şifreler: `cat ~/izmirfen/infra/dev-db/.env` — `OWNER_PASSWORD` sizde kalır; `APP_PASSWORD`'ü ekibe **özel kanaldan** verin (şifre yöneticisi paylaşımı; depoya, Jira'ya, grup sohbetine yazmayın).

## Ekibin bağlantı bilgisi

```ini
DATABASE_URL=postgres://izmirfen_app:<APP_PASSWORD>@<SUNUCU_IP>:5433/izmirfen
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
DATABASE_POOL_MAX=3
```
Görsel araç (TablePlus / DBeaver / pgAdmin): Host `<SUNUCU_IP>`, Port `5433`, User `izmirfen_app`, Database `izmirfen`, **SSL mode: require**.

## İşletme

```bash
cd ~/izmirfen/infra/dev-db
docker compose ps                                           # durum
docker compose logs -f db                                   # bağlantı logları (log_connections=on)
docker compose exec db psql -U izmirfen_owner -d izmirfen   # sahip olarak SQL
git pull && bash kur.sh                                     # şema değişikliği birleşince uygula (veri silmez)
docker compose exec -T db pg_dump -U izmirfen_owner -d izmirfen | gzip > izmirfen-$(date +%F).sql.gz   # yedek
```
- **Ekip şifresini değiştirmek** (biri ekipten ayrılınca): `docker compose exec db psql -U izmirfen_owner -d izmirfen -c "ALTER ROLE izmirfen_app PASSWORD '<yeni>'"` → `.env`'deki `APP_PASSWORD`'ü de güncelleyin → ekibe yeni şifreyi iletin.
- **Örnek veriyle baştan başlamak** (yalnızca sahip, ekibe haber vererek): `docker compose down -v && bash kur.sh` — tüm veri silinir; ilk `npm run dev` örnek veriyi yeniden ekler.
- Bu sunucu yalnızca geliştirme veritabanı içindir; ileride canlı ortam ayrı bir veritabanıyla kurulur.
