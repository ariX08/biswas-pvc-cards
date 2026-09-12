import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ settings: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("business_settings")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const allowed = [
      "business_name",
      "upi_id",
      "upi_qr_url",
      "advance_percentage",
      "delivery_charge",
      "free_delivery_min_quantity",
      "phone",
      "email",
      "address",
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        patch[key] = body[key];
      }
    }

    if (patch.advance_percentage !== undefined) {
      patch.advance_percentage = Math.min(
        100,
        Math.max(0, Number(patch.advance_percentage))
      );
    }
    if (patch.delivery_charge !== undefined) {
      patch.delivery_charge = Math.max(0, Number(patch.delivery_charge));
    }
    if (patch.free_delivery_min_quantity !== undefined) {
      patch.free_delivery_min_quantity = Math.max(
        0,
        Number(patch.free_delivery_min_quantity)
      );
    }

    if (!existing?.id) {
      const { data, error } = await supabase
        .from("business_settings")
        .insert({
          business_name: body.business_name || "Biswas PVC Cards",
          upi_id: body.upi_id || "",
          advance_percentage: patch.advance_percentage ?? 100,
          delivery_charge: patch.delivery_charge ?? 50,
          free_delivery_min_quantity: patch.free_delivery_min_quantity ?? 10,
          phone: body.phone || "+91 91238 98712",
          email: body.email || "biswascybercafe0615@gmail.com",
          ...patch,
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ settings: data });
    }

    const { data, error } = await supabase
      .from("business_settings")
      .update(patch)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
