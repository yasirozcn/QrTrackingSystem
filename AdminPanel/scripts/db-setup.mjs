// db/schema.sql'i ortak veritabanına uygular. YALNIZCA ŞEMA SAHİBİ çalıştırır (DATABASE_OWNER_URL).
// Ekip kullanıcısının tablo oluşturma yetkisi yoktur; şema değişikliği PR ile önerilir, sahibi uygular.
// Şema tekrar çalıştırılabilir (IF NOT EXISTS); veri silmez. Bu projede "reset" komutu bilerek yoktur.
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const url = process.env.DATABASE_OWNER_URL;
if (!url) {
  console.error("DATABASE_OWNER_URL tanımlı değil. Şemayı yalnızca proje sahibi uygular (sunucuda: infra/dev-db/kur.sh).");
  process.exit(1);
}
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const schema = await readFile(path.join(root, "db", "schema.sql"), "utf8");
const client = new pg.Client({
  connectionString: url,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
});
await client.connect();
try {
  await client.query(schema);
  const { rows } = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1");
  console.log(`Şema uygulandı: ${rows.length} tablo (${rows.map((r) => r.tablename).join(", ")})`);
} finally {
  await client.end();
}
