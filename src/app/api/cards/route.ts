import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_CARDS } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ cards: MOCK_CARDS.filter((c) => c.active), source: "mock" });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("card_types")
      .select("*")
      .eq("active", true)
      .order("category")
      .order("name");

    if (error || !data?.length) {
      return NextResponse.json({ cards: MOCK_CARDS.filter((c) => c.active), source: "mock" });
    }

    return NextResponse.json({ cards: data, source: "database" });
  } catch {
    return NextResponse.json({ cards: MOCK_CARDS.filter((c) => c.active), source: "mock" });
  }
}
