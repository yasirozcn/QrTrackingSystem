// GEÇİCİ başlangıç ekranı: uygulama → AdminPanel → AWS veritabanı zincirini doğrular.
// Öğrenci/kiosk akışları geliştirildiğinde bu ekran "Öğrenci girişi / Yönetici girişi (kiosk)" seçimine dönüşür (AGENTS.md §3).
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL, colors } from "@/lib/config";

type Health = { db: string; latencyMs?: number; counts?: Record<string, number>; error?: string };

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  // Örnek istek: AdminPanel'deki /api/health uç noktası veritabanından okur ve JSON döner.
  // Gerçek istekler src/lib/api.ts istemcisiyle yapılacak (AGENTS.md §5).
  const check = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/health`);
      const data = (await res.json()) as Health;
      setOk(res.ok && data.db === "ok");
      setResult(
        data.db === "ok"
          ? `Veritabanı bağlı (${data.latencyMs} ms)\n${Object.entries(data.counts ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n")}`
          : (data.error ?? `Hata (${res.status})`),
      );
    } catch (e) {
      console.warn("[health]", e);
      setOk(false);
      setResult("AdminPanel'e ulaşılamadı. Bilgisayarda `npm run dev` açık mı, telefon aynı Wi-Fi'da mı, .env'deki adres doğru mu?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <Text style={styles.kicker}>İzmir Fen</Text>
        <Text style={styles.title}>Okul Giriş-Çıkış</Text>
        <Text style={styles.sub}>Şablon hazır. Geliştirmeye başlamadan önce sunucu bağlantısını test edin.</Text>

        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={check} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Sunucu bağlantısını test et</Text>}
        </Pressable>

        {result && <Text style={[styles.result, { color: ok ? colors.brandDark : colors.danger }]}>{result}</Text>}
      </View>
      <Text style={styles.footer}>Sunucu: {API_URL}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, justifyContent: "center", padding: 24 },
  kicker: { fontSize: 13, fontWeight: "700", letterSpacing: 1.2, color: colors.brand, textTransform: "uppercase" },
  title: { fontSize: 30, fontWeight: "700", color: colors.ink, marginTop: 6 },
  sub: { fontSize: 15, color: colors.muted, marginTop: 6, marginBottom: 28 },
  button: { backgroundColor: colors.brand, borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center" },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  result: { marginTop: 20, fontSize: 14, lineHeight: 20 },
  footer: { textAlign: "center", color: "#94a3b8", fontSize: 11, paddingBottom: 8 },
});
