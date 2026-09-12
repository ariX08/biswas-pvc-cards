import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeFilter(s: string) {
  return s.replace(/[%_,()\\]/g, "");
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        orders: [],
        stats: {
          total: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          printing: 0,
          ready: 0,
          completed: 0,
          rejected: 0,
        },
        source: "mock",
      });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const searchRaw = searchParams.get("search");
    const search = searchRaw ? escapeFilter(searchRaw.trim()) : "";

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status && status !== "all") {
      query = query.eq("order_status", status);
    }
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data: orders, error } = await query;
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const { data: allOrders } = await supabase.from("orders").select("order_status");

    const stats = {
      total: allOrders?.length || 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      printing: 0,
      ready: 0,
      completed: 0,
      rejected: 0,
    };

    for (const o of allOrders || []) {
      switch (o.order_status) {
        case "PENDING_PAYMENT_VERIFICATION":
          stats.pending++;
          break;
        case "CONFIRMED":
          stats.confirmed++;
          break;
        case "PROCESSING":
          stats.processing++;
          break;
        case "PRINTING":
          stats.printing++;
          break;
        case "READY":
          stats.ready++;
          break;
        case "COMPLETED":
          stats.completed++;
          break;
        case "REJECTED":
        case "CANCELLED":
          stats.rejected++;
          break;
      }
    }

    return NextResponse.json({ orders: orders || [], stats, source: "database" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
