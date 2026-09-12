import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.HEALTH_SECRET;
  const q = req.nextUrl.searchParams.get("secret");
  if (!secret || q !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });
    return NextResponse.json({
      ok: true,
      ordersCount: count ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
