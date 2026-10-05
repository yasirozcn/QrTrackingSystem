@AGENTS.md

## Claude Code için ek notlar

- **Hedef, referans projeyle birebir aynı yapıdır** (kök AGENTS.md §0). Dosya, klasör, fonksiyon, route ve ekran adlarını AGENTS.md'deki hedef ağaçlardan alın; yeni ad uydurmayın. Ağaçta olmayan bir şey gerekiyorsa önce kullanıcıya sorun.
- **Dosya yapısı** (ayrıntı: kök AGENTS.md §3, alt projelerin AGENTS.md §2):
  ```
  AdminPanel/   db/schema.sql · scripts/ · src/lib/{db/,config,auth,session,api,protocol,scan,sms}.ts · src/components/ · src/app/{login,(panel),api/mobile}/
  QrScannerApp/ src/app/(ekranlar) · src/components/{ui,BluetoothGate}.tsx · src/lib/{config,api,session,device,protocol,ble} · modules/kiosk-beacon/ · tools/
  infra/dev-db/ ortak geliştirme veritabanı (dokunmayın — proje sahibi)
  ```
  Yeni dosyayı bu ağaçtaki yerine koyun; ağaçta yeri yoksa oluşturmadan önce sorun.
- **Gereksiz kod yok, okunabilir kod** (kök AGENTS.md §8.1): yalnızca istenen değişikliği yapın; spekülatif soyutlama, kullanılmayan kod, yorum satırına alınmış kod, tek satırlık sarmalayıcı, gereksiz bağımlılık eklemeyin. Var olan yardımcıları (`repo.ts`, `api.ts`, `ui.tsx`) kullanın. Kısa fonksiyon, erken dönüş, açıklayıcı ad; yorumlar "neden"i anlatır. Değişikliği bitirince kendi diff'inizi bu gözle gözden geçirin ve gereksiz olanı silin.
- **`AUTH_SECRET`**: şu an kullanılmıyor (auth yok). Auth geliştirilirken kök AGENTS.md §5.1'e uyun: her geliştirici kendi anahtarını üretir, anahtar paylaşılmaz/commit'lenmez; üretimde `AUTH_SECRET` yoksa `auth.ts` hata fırlatır (uyarıyla devam etmez). Kullanıcıdan başkasının anahtarını istemeyin veya bir anahtarı koda yazmayın.

- Bir alt projede çalışırken o klasördeki `CLAUDE.md` / `AGENTS.md` da yüklenir; ikisini birlikte uygulayın. Çelişki olursa **alt projedeki** kural geçerlidir, ama protokol ve API sözleşmesi (kök AGENTS.md §4–§6) yalnızca iki taraf birlikte değiştirilerek değişir.
- Bir işe başlamadan önce ilgili dosyayı okuyun; özellikle `AdminPanel/src/lib/protocol.ts` ↔ `QrScannerApp/src/lib/protocol.ts`, `AdminPanel/src/lib/scan.ts`, `AdminPanel/db/schema.sql`.
- Kütüphane sürümleri eğitim verinizden yenidir (Next.js 16, Expo SDK 57, React 19). API'yi hafızadan yazmayın: Next.js için `AdminPanel/node_modules/next/dist/docs/`, Expo için https://docs.expo.dev/llms.txt.
- "Bitti" demeden önce kök AGENTS.md §9'daki komutları çalıştırın ve çıktıyı raporlayın. Test çalıştıramadıysanız bunu açıkça söyleyin.
- Gizli bilgi içeren dosyaları (`.env*`, `infra/dev-db/.env`) okumayın/göstermeyin; commit'e eklemeyin. Şifreyi veya `DATABASE_URL`'yi komut satırına, koda, loga yazan bir komut önermeyin.
- Veritabanı **ortaktır** (AWS, tüm ekip). Veri silen/değiştiren SQL'i (`DELETE`, `UPDATE`, toplu işlemler) çalıştırmadan önce kullanıcıya etkilenecek satırları gösterip onay alın; `WHERE`'siz `DELETE/UPDATE` asla. Testler kendi oluşturduğu kayıtları kullanır ve sonunda siler (kök AGENTS.md §7.1).
- Şema değişikliğini veritabanında doğrudan denemeyin (yetkiniz de yok): `db/schema.sql` + `types.ts` + `repo.ts` değişikliğini PR olarak hazırlayın ve proje sahibinin uygulaması gerektiğini belirtin.
- Commit ve push yalnızca istendiğinde.
