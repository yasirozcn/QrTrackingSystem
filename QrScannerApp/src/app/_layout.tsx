import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Kök düzen: tüm ekranlar bu Stack içinde açılır.
// Oturum (SessionProvider) ve Bluetooth kapısı (BluetoothGate) geliştirildiğinde buraya eklenir — bkz. AGENTS.md §2–§3.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
    </SafeAreaProvider>
  );
}
