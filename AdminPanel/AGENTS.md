<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — AdminPanel (web paneli + mobil API)

Önce kökteki [`../AGENTS.md`](../AGENTS.md) dosyasını okuyun: protokol, API sözleşmesi ve iş kuralları oradadır ve **bağlayıcıdır**.
Bu dosya AdminPanel'in nasıl kurulduğunu ve hangi kurallarla geliştirildiğini anlatır.

## 1. Teknoloji

| Katman | Seçim |
| --- | --- |
| Çatı | **Next.js 16** (App Router, Turbopack, Server Components, Server Actions), React 19, TypeScript (strict) |
| Stil | Tailwind CSS 4 (`src/app/globals.css` içinde `.btn`, `.card`, `.table`, `.badge`, `.input` yardımcı sınıfları) |
| Veritabanı | PostgreSQL 17 — **AWS'deki ortak geliştirme veritabanı** (SSL, port 5433); sürücü `pg` (ORM yok, el yazımı SQL). Yerelde veritabanı kurulmaz |
| Doğrulama | `zod` (her API gövdesi) |
| Kimlik | `jose` (JWT HS256), `bcryptjs` (şifre özeti, maliyet 10) |
| Canlı | Docker (`output: "standalone"`) + Caddy (otomatik HTTPS) — ileride `deploy/` |

Paket yöneticisi **npm** (`package-lock.json`; mobil uygulamayla aynı). Yeni paket: `npm install <paket>`; kilit dosyası commit'lenir.

**Şablon hazır (başlangıç durumu).** Bu klasör çalışan bir Next.js 16 projesidir: tüm bağımlılıklar mevcut panelle aynı sürümlerde, veritabanı katmanı tamam,
geçici başlangıç sayfası ve örnek uç nokta AWS'deki ortak veritabanından veri okur. İlk çalıştırma:
```bash
npm install
cp .env.example .env.local      # DATABASE_URL (proje sahibinden). AUTH_SECRET şimdilik boş (kök AGENTS.md §5.1)
npm run db:check                # "SSL: açık", 11 tablo
npm run dev                     # http://localhost:3000 → "Ortak veritabanına bağlı" · /api/health → JSON
```

## 2. Klasör yapısı

**Hedef ağaç** — geliştirme bittiğinde AdminPanel tam olarak budur (kök AGENTS.md §0). ✅ = depoda hazır · ⏳ = ekip geliştirecek.
Yollar ve dosya adları değiştirilmez; listede olmayan dosya eklenmeden önce proje sahibine sorulur.

```
AdminPanel/
├── AGENTS.md, CLAUDE.md, README.md⏳, .env.example✅, .gitignore✅
├── package.json✅, package-lock.json✅, next.config.ts✅, tsconfig.json✅, eslint.config.mjs✅, postcss.config.mjs✅
├── Dockerfile⏳, .dockerignore⏳                      canlı imaj (standalone)
├── public/.gitkeep✅
├── db/schema.sql✅                                    tek şema dosyası (yalnızca proje sahibi uygular)
├── deploy/⏳                                          canlı: docker-compose.yml, Caddyfile, .env.example, sunucu-hazirla.sh, yedek-al.sh
├── scripts/
│   ├── db-check.mjs✅                                 ortak veritabanı bağlantı kontrolü
│   ├── db-setup.mjs✅                                 şemayı uygular (DATABASE_OWNER_URL)
│   ├── create-admin.mjs✅                             yönetici/kiosk hesabı (şifre gizli sorulur)
│   └── e2e-test.mjs⏳                                 uçtan uca API testi (kendi verisini oluşturur ve siler)
└── src/
    ├── lib/
    │   ├── db/pg.ts✅, db/repo.ts✅, db/types.ts✅, db/seed.ts✅
    │   ├── config.ts⏳                                ortam değişkenleri (tek yer) — authSecret dahil (§5.1)
    │   ├── auth.ts⏳                                  signToken, verifyToken, bearerClaims (JWT HS256)
    │   ├── session.ts⏳                               panel çerezi fb_admin: createWebSession, destroyWebSession, getWebAdmin, requireWebAdmin
    │   ├── api.ts⏳                                   ApiError, ok, handler, body, requireStudent, requireKioskAdmin, rateLimit, clientIp
    │   ├── protocol.ts⏳                              QR/BLE/imza — mobildeki ile birebir aynı
    │   ├── scan.ts⏳                                  processScan, manualEvent, REJECT_MESSAGES
    │   └── sms.ts⏳                                   formatTime, formatDateTime, buildSmsBody, dispatchSms
    ├── components/
    │   ├── AutoRefresh.tsx⏳                          sayfayı N sn'de bir yeniler
    │   └── Badges.tsx⏳                               DirectionBadge, ReviewBadge, SourceBadge
    └── app/
        ├── layout.tsx✅, globals.css✅, favicon.ico✅
        ├── page.tsx✅ (GEÇİCİ: bağlantı durumu — panel geliştirilince silinir; "/" (panel)/page.tsx olur)
        ├── api/health/route.ts✅                      ortak veritabanı sağlık kontrolü (bu projeye özgü)
        ├── login/  page.tsx⏳, LoginForm.tsx⏳, actions.ts⏳ (loginAction, logoutAction)
        ├── (panel)/
        │   ├── layout.tsx⏳ (requireWebAdmin + menü), NavLinks.tsx⏳, actions.ts⏳ (tüm Server Action'lar)
        │   ├── page.tsx⏳ Canlı durum · hareketler/page.tsx⏳ · ogrenciler/page.tsx⏳ + StudentForms.tsx⏳
        │   └── kiosklar/page.tsx⏳ · denemeler/page.tsx⏳ · sms/page.tsx⏳ · denetim/page.tsx⏳
        └── api/mobile/
            ├── config/route.ts⏳
            ├── student/{check-email, set-password, login, me}/route.ts⏳
            ├── scan/route.ts⏳
            ├── admin/login/route.ts⏳
            └── kiosks/route.ts⏳, kiosks/[id]/start/route.ts⏳, kiosks/[id]/feed/route.ts⏳
```
Server Action adları (`src/app/(panel)/actions.ts`): `resetPasswordAction, resetDeviceAction, createStudentAction, manualEventAction, reviewEventAction, createKioskAction, toggleKioskAction`.

### Veritabanına nasıl istek atılır (kalıp)

```
Route / Server Component / Server Action  →  repo.ts fonksiyonu  →  q() / tx()  →  pg havuzu  →  SSL  →  AWS PostgreSQL
```
```ts
// src/app/api/mobile/kiosks/route.ts  (örnek)
import { handler, ok, requireKioskAdmin } from "@/lib/api";
import { listKiosks } from "@/lib/db/repo";

export const GET = handler(async (req: Request) => {
  await requireKioskAdmin(req);
  const kiosks = await listKiosks();                 // SQL yalnızca repo.ts içinde
  return ok({ kiosks: kiosks.filter((k) => k.status === "ACTIVE").map((k) => ({ id: k.id, name: k.name })) });
});
```
Yeni bir sorgu gerekiyorsa `repo.ts`'e parametreli bir fonksiyon eklenir (`q<Tip>("SELECT … WHERE id = $1", [id])`); route ve sayfalar SQL yazmaz.
Hazır örnek: `src/app/api/health/route.ts` → `dbHealth()`.

## 3. Veri katmanı kuralları

- **Veritabanına yalnızca `src/lib/db/repo.ts` erişir.** Sayfalar, route'lar ve iş kuralları repo fonksiyonlarını çağırır; başka yerde SQL yazılmaz.
- Repo fonksiyonları: `findStudentByEmail, getStudent, listStudents, createStudent, setStudentPassword, getActiveDevice, getActiveDeviceForStudent, setFirstPasswordAndBindDevice, resetStudentPassword, resetStudentDevice, findAdminByEmail, getAdmin, listKiosks, getKiosk, touchKiosk, createKiosk, setKioskStatus, insertScanAttempt, isReplay, lastEventForStudent, createEventWithSms, updateSms, getEvent, reviewEvent, listEvents, listScanAttempts, listKioskAttempts, listSms, dashboardStats, addAudit, listAudit`.
- Her zaman **parametreli sorgu** (`$1, $2`); kullanıcı girdisini SQL metnine eklemeyin.
- Birden çok tabloya yazan işlemler `tx()` içinde (transaction): `createStudent`, `setFirstPasswordAndBindDevice` (öğrenci satırı `FOR UPDATE` ile kilitlenir), `resetStudentDevice`, `createEventWithSms`.
- Satırlar `camel()` ile camelCase'e, `Date` değerleri ISO metne çevrilir. `bigint` (time_slot) sayı olarak döner.
- `insertScanAttempt`: kabul edilmiş aynı (cihaz, kiosk, dilim) ikinci kez yazılırsa tekil indeks hatası (`23505`) yakalanır ve kayıt `REJECTED/REPLAY` olarak yazılır.
- `dashboardStats`: "bugün" Türkiye saatine göre (`date_trunc('day', now() AT TIME ZONE 'Europe/Istanbul')`).

### Tablolar (`db/schema.sql`)

| Tablo | Amaç / önemli kolonlar | Kısıtlar |
| --- | --- | --- |
| `students` | school_no, first_name, last_name, email, class_name, password_hash (null = henüz şifre yok), presence_status `IN/OUT` (varsayılan OUT), is_active | `lower(email)` tekil |
| `guardians` | full_name, phone | |
| `student_guardians` | student_id, guardian_id, relation, notify_entry, notify_exit | PK (student_id, guardian_id) |
| `devices` | id = uygulamanın ürettiği deviceId, student_id, platform, device_secret, status `ACTIVE/REVOKED`, bound_at, revoked_at, revoked_by | öğrenci başına tek ACTIVE (kısmi tekil indeks) |
| `kiosks` | name, secret (32 bayt hex), status `ACTIVE/DISABLED`, last_seen_at | **yön kolonu yok** |
| `scan_attempts` | device_id, student_id, kiosk_id, time_slot, ble_token, ble_rssi, ble_ok, integrity_ok, result `ACCEPTED/REJECTED`, reject_reason | (device_id, kiosk_id, time_slot) ACCEPTED için tekil |
| `attendance_events` | student_id, direction `IN/OUT`, occurred_at, source `APP/MANUAL/OFFLINE`, kiosk_id, scan_attempt_id, review_status `UNREVIEWED/OK/SUSPICIOUS`, reviewed_by, note | |
| `sms_messages` | event_id, guardian_id, phone, body, status `QUEUED/SENT/DELIVERED/FAILED/MOCK_SENT`, attempt_count, sent_at | (event_id, guardian_id) tekil |
| `permissions` | izin kayıtları (ileride) | |
| `admin_users` | full_name, email, role `ADMIN/KIOSK`, password_hash | `lower(email)` tekil |
| `audit_logs` | admin_user_id, action, entity, entity_id, before_value/after_value (jsonb) | |

Şema değişikliği: `db/schema.sql`'e `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` ile ekleyin, `types.ts` ve `repo.ts`'i aynı PR'da güncelleyin. **Ekip kullanıcısının şema yetkisi yoktur**; PR birleşince proje sahibi uygular (kök AGENTS.md §7.1). Uygulanmadan önce yeni kolonu kullanan kod çalışmaz.

## 4. Web paneli

Oturum: `/login` (Server Action, bcrypt). Yalnızca `role = ADMIN` girer; KIOSK hesabı panele giremez. Oturum 12 saat, `fb_admin` httpOnly çerezi (`COOKIE_SECURE`).
Her yönetici işlemi Server Action (`src/app/(panel)/actions.ts`) ile yapılır ve `addAudit` ile kaydedilir; sonra `revalidatePath`.

| Sayfa | İçerik |
| --- | --- |
| `/` Canlı durum | Kartlar: okulda / dışarıda / bugünkü hareket (+incelenmemiş) / bugün reddedilen okutma; son 15 hareket; 10 sn'de bir otomatik yenilenir |
| `/hareketler` | Tüm giriş-çıkışlar; filtre: tümü / incelenmedi / dikkat gerekenler (manuel + şüpheli) / şüpheli; "Uygun" / "Şüpheli" işaretleme |
| `/ogrenciler` | Liste (sınıf + soyada göre, Türkçe sıralama), veli, durum, bağlı cihaz; **Şifreyi sıfırla**, **Cihazı sıfırla**, **Manuel giriş/çıkış**; yeni öğrenci formu (okul no, ad, soyad, sınıf, e-posta, veli adı, veli telefonu) |
| `/kiosklar` | Kiosk listesi (çevrimiçi = son 60 sn'de sinyal), ekle (yalnızca ad), devre dışı bırak / etkinleştir |
| `/denemeler` | Reddedilen okutmalar (neden, öğrenci, kiosk, BLE bilgisi) |
| `/sms` | Veli SMS kayıtları ve durumları |
| `/denetim` | Denetim kaydı (yönetici işlemleri) |

Server Components veriyi doğrudan repo'dan okur (`export const dynamic = "force-dynamic"`). İstemci bileşenleri yalnızca form durumu ve otomatik yenileme içindir.

## 5. Mobil API uygulama kuralları

- Her route `handler(async (req) => …)` ile sarılır; gövde `await body(req, zodSchema)` ile doğrulanır; hata `throw new ApiError(status, "Türkçe mesaj", "KOD")`.
- Kimlik: `requireStudent(req)` / `requireKioskAdmin(req)`. Öğrenci isteklerinde cihazın hâlâ aktif ve o öğrenciye bağlı olduğu da kontrol edilir (`DEVICE_REVOKED`).
- Giriş uç noktalarında `rateLimit` (bellek içi): check-email 30/IP; set-password 8/e-posta + 30/IP; login 10/e-posta + 50/IP; admin login 10/e-posta + 30/IP (10 dk pencere).
- Okutma iş kuralları yalnızca `src/lib/scan.ts`'te; route ince kalır. Her okutma denemesi sunucu loguna tek satır yazılır: `[scan] KABUL (IN) · öğrenci … · kiosk … · BLE … → EŞLEŞTİ`.
- SMS gönderimi yanıtı bekletmez (`void dispatchSms(sms)`).

## 6. Ortam değişkenleri (`.env.example` → `.env.local`)

| Değişken | Açıklama |
| --- | --- |
| `DATABASE_URL` | Ortak veritabanı: `postgres://izmirfen_app:<şifre>@<sunucu>:5433/izmirfen` — **proje sahibinden özel kanaldan alınır** |
| `DATABASE_SSL` | `true` (sunucu SSL'siz bağlantıyı reddeder) |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `false` (sertifika kendinden imzalı; bağlantı yine şifreli) |
| `DATABASE_POOL_MAX` | `3` — ortak veritabanında geliştirici başına küçük havuz |
| `SEED_SAMPLE_DATA` | Boş veritabanına örnek veri (geliştirmede açık, canlıda kapalı) |
| `DATABASE_OWNER_URL` | **Yalnızca proje sahibi** — şema uygulamak için; ekipte boş kalır |
| `AUTH_SECRET` | JWT anahtarı. **Şu an kullanılmıyor**; `auth.ts` geliştirilince gerekir. Herkes kendisi üretir (`openssl rand -hex 32`), paylaşılmaz; canlıda zorunlu (kök AGENTS.md §5.1) |
| `BLE_REQUIRED` | `true`: BLE jetonu zorunlu |
| `DUPLICATE_WINDOW_SECONDS` | Çift okutma penceresi (varsayılan 120) |
| `SMS_PROVIDER` | `mock` |
| `SCHOOL_SHORT_NAME` | SMS imzası |
| `COOKIE_SECURE` | Yerelde (http) `false`, canlıda `true` |

## 7. Komutlar

```bash
npm install
npm run db:check      # ortak veritabanına bağlantı: SSL, kullanıcı, yetkiler, tablolar, satır sayıları
npm run dev           # http://localhost:3000 (boş DB'ye ilk bağlanan geliştirici örnek veriyi ekler)
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run admin:create -- --email ad@okul.test --name "Ad Soyad" --role ADMIN   # şifre gizli sorulur
```
Bu projede **`db:reset` yoktur** ve olmayacaktır (ortak veritabanı). Uçtan uca test (geliştirildiğinde) kendi verisini oluşturur ve temizler.

**Sorun giderme (`npm run db:check`)**: `ECONNREFUSED/timeout` → sunucu adresi/port 5433 veya güvenlik duvarı; `no pg_hba.conf entry … no encryption` → `DATABASE_SSL=true` değil; `password authentication failed` → şifre; `permission denied for schema public` → şema değiştirmeye çalışıyorsunuz (yalnızca proje sahibi).

## 8. Canlı ortam

Ortak geliştirme veritabanı canlı değildir. Canlıya alma (ayrı veritabanı + panel + HTTPS, Docker) proje sonunda yapılır; yöntem ve maliyet planı görev listesindedir. Canlı veritabanına ekip doğrudan bağlanmaz.

## 9. Yapılmaması gerekenler

- `repo.ts` dışında SQL; ORM eklemek; şemayı elle değiştirmeye çalışmak (yetki de yok) veya `schema.sql`'e yazmamak.
- Ortak veritabanında `WHERE`'siz `DELETE/UPDATE`, başkasının test verisini silmek, veritabanı adresini/şifresini koda veya loga yazmak.
- İstemciden gelen `direction`'a, öğrenci kimliğine veya zaman damgasına güvenmek (öğrenci kimliği JWT'den, yön sunucudan, tazelik sunucu saatinden).
- Hata yanıtında stack/SQL ayrıntısı döndürmek; şifre, anahtar veya JWT loglamak.
- `protocol.ts`'i mobil tarafı güncellemeden değiştirmek.
