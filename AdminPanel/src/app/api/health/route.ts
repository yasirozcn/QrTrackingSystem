// Örnek uç nokta: ortak veritabanına bir istek atar ve sonucu JSON döner.
// Mobil API uç noktaları (kök AGENTS.md §5) aynı kalıpla yazılır: route → repo fonksiyonu → PostgreSQL.
import { NextResponse } from "next/server";
import { dbHealth } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ db: "ok", ...(await dbHealth()) });
  } catch (e) {
    console.error("[health]", e);
    return NextResponse.json({ db: "error", error: "Veritabanına ulaşılamadı.", code: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
