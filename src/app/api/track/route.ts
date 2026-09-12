import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`track:${ip}`, 30, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const orderNumber = req.nextUrl.searchParams.get("order")?.trim();
    const token = req.nextUrl.searchParams.get("token")?.trim();

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        order_number,
        customer_name,
        phone,
        order_status,
        payment_status,
        rejection_reason,
        subtotal,
        delivery_charge,
        total_amount,
        advance_amount,
        remaining_amount,
        created_at,
        updated_at,
        tracking_token,
        order_items (
          quantity,
          price_per_card,
          subtotal,
          card_types ( name, slug )
        ),
        order_status_history (
          old_status,
          new_status,
          note,
          created_at
        )
      `
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (token && order.tracking_token && token !== order.tracking_token) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { tracking_token: _t, ...safe } = order as any;

    const history = Array.isArray(safe.order_status_history)
      ? [...safe.order_status_history].sort(
          (a: any, b: any) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      : [];

    return NextResponse.json({
      order: {
        ...safe,
        order_status_history: history,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
