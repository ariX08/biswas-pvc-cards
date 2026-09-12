import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`settings:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_settings")
      .select(
        "business_name, upi_id, upi_qr_url, advance_percentage, delivery_charge, free_delivery_min_quantity, phone, email"
      )
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Unavailable" }, { status: 503 });
    }

    return NextResponse.json({
      settings: {
        business_name: data.business_name,
        upi_id: data.upi_id,
        upi_qr_url: data.upi_qr_url,
        advance_percentage: Number(data.advance_percentage ?? 100),
        delivery_charge: Number(data.delivery_charge ?? 0),
        free_delivery_min_quantity: Number(data.free_delivery_min_quantity ?? 10),
        phone: data.phone,
        email: data.email,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
