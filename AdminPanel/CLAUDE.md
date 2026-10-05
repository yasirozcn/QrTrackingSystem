@AGENTS.md

AdminPanel'de çalışırken kökteki `../AGENTS.md` (protokol, API sözleşmesi, iş kuralları, §7.1 ortak veritabanı kuralları) ve `../CLAUDE.md` de geçerlidir.
Veritabanı AWS'de ve ortaktır: bağlantıyı `npm run db:check` ile doğrulayın; veri silen/değiştiren SQL'den önce onay alın; şema değişikliğini PR olarak hazırlayın (proje sahibi uygular).
İşi bitirmeden önce: `npm run typecheck`, `npm run lint` ve davranış değiştiyse uçtan uca test.
Yapı referans projeyle birebir aynı olmalı: dosya ve ad seçimleri için bu klasördeki AGENTS.md §2 hedef ağacına bakın (kök AGENTS.md §0).
