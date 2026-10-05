// Ortak veritabanına bağlantıyı kontrol eder: sürüm, SSL, kullanıcı, yetkiler, tablolar.
// Kullanım: npm run db:check
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL tanımlı değil: cp .env.example .env.local ve proje sahibinden aldığınız adresi yazın.");
  process.exit(1);
}
const client = new pg.Client({
  connectionString: url,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
  connectionTimeoutMillis: 8000,
});
const t0 = Date.now();
try {
  await client.connect();
} catch (e) {
  console.error(`Bağlanılamadı: ${e.message}`);
  console.error("Kontrol: sunucu IP/port doğru mu (5433), Lightsail güvenlik duvarında 5433 açık mı, DATABASE_SSL=true mu, şifre doğru mu?");
  process.exit(1);
}
try {
  const ms = Date.now() - t0;
  const info = (await client.query(
    `SELECT current_user AS "user", current_database() AS db, split_part(version(), ' ', 2) AS version,
            (SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()) AS ssl`,
  )).rows[0];
  const tables = (await client.query(
    `SELECT tablename, has_table_privilege(current_user, quote_ident(tablename), 'INSERT') AS can_write
     FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`,
  )).rows;
  const canCreate = (await client.query("SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS c")).rows[0].c;
  console.log(`Bağlandı (${ms} ms): ${info.user}@${info.db} · PostgreSQL ${info.version} · SSL: ${info.ssl ? "açık" : "KAPALI"}`);
  console.log(`Tablolar (${tables.length}): ${tables.map((t) => t.tablename + (t.can_write ? "" : " [salt okunur]")).join(", ") || "(yok — şema henüz uygulanmamış)"}`);
  console.log(`Şema değiştirme yetkisi: ${canCreate ? "VAR (şema sahibi)" : "yok (ekip kullanıcısı — beklenen)"}`);
  for (const t of ["students", "admin_users", "kiosks", "attendance_events"]) {
    if (tables.some((x) => x.tablename === t)) {
      const n = (await client.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n;
      console.log(`  ${t}: ${n} satır`);
    }
  }
} finally {
  await client.end();
}
