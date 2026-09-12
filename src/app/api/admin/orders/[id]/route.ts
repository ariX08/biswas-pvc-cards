import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SELECT = `
  *,
  order_items (
    id,
    quantity,
    price_per_card,
    subtotal,
    card_types ( id, name, slug ),
    order_files ( id, file_name, storage_path, file_size, mime_type )
  ),
  payments ( id, amount, method, status, verified_at ),
  order_status_history ( id, old_status, new_status, note, created_at )
`;

async function findOrder(supabase: ReturnType<typeof createAdminClient>, id: string) {
  const byId = await supabase.from("orders").select(SELECT).eq("id", id).maybeSingle();
  if (byId.data) return byId.data;
  const byNum = await supabase
    .from("orders")
    .select(SELECT)
    .eq("order_number", id)
    .maybeSingle();
  return byNum.data || null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const order = await findOrder(supabase, id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, reason, newStatus } = body;
    const supabase = createAdminClient();

    let existing = await supabase
      .from("orders")
      .select("id, order_status, payment_status")
      .eq("id", id)
      .maybeSingle();
    if (!existing.data) {
      existing = await supabase
        .from("orders")
        .select("id, order_status, payment_status")
        .eq("order_number", id)
        .maybeSingle();
    }
    if (!existing.data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const orderId = existing.data.id;
    const currentStatus = existing.data.order_status as string;

    if (action === "PAYMENT_RECEIVED") {
      await supabase
        .from("orders")
        .update({ payment_status: "VERIFIED", order_status: "CONFIRMED" })
        .eq("id", orderId);
      await supabase
        .from("payments")
        .update({ status: "VERIFIED", verified_at: new Date().toISOString() })
        .eq("order_id", orderId);
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        old_status: currentStatus,
        new_status: "CONFIRMED",
        note: "Payment verified by admin",
      });
      return NextResponse.json({ success: true, status: "CONFIRMED" });
    }

    if (action === "REJECT") {
      const why = (reason || "").trim();
      if (!why) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }
      if (currentStatus === "REJECTED" || currentStatus === "CANCELLED" || currentStatus === "COMPLETED") {
        return NextResponse.json(
          { error: "Order is already closed" },
          { status: 400 }
        );
      }
      await supabase
        .from("orders")
        .update({
          payment_status: "NOT_RECEIVED",
          order_status: "REJECTED",
          rejection_reason: why,
        })
        .eq("id", orderId);
      await supabase
        .from("payments")
        .update({ status: "NOT_RECEIVED" })
        .eq("order_id", orderId);
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        old_status: currentStatus,
        new_status: "REJECTED",
        note: why,
      });
      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    if (action === "UPDATE_STATUS" && newStatus) {
      const allowed = [
        "CONFIRMED",
        "PROCESSING",
        "PRINTING",
        "READY",
        "COMPLETED",
        "CANCELLED",
      ];
      if (!allowed.includes(newStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("id", orderId);
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        old_status: currentStatus,
        new_status: newStatus,
        note: `Status changed to ${newStatus}`,
      });
      return NextResponse.json({ success: true, status: newStatus });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
