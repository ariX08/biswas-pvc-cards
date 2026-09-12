import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOrderNumber, generateTrackingToken } from "@/lib/utils";
import { notifyNewOrder } from "@/lib/notify";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingItem {
  cardTypeId: string;
  cardName: string;
  quantity: number;
  price: number;
  files: { name: string; type: string; size: number; data: string }[];
}

interface IncomingBody {
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: IncomingItem[];
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`orders:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body: IncomingBody = await req.json();

    if (!body.customer?.fullName?.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!body.customer?.phone?.trim() || body.customer.phone.length < 10) {
      return NextResponse.json({ error: "Valid phone is required" }, { status: 400 });
    }
    if (!body.customer?.address?.trim()) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }
    if (!body.customer?.city?.trim() || !body.customer?.state?.trim() || !body.customer?.pincode?.trim()) {
      return NextResponse.json({ error: "City, state and PIN code are required" }, { status: 400 });
    }
    if (!body.items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const supabase = createAdminClient();

    const { data: settings, error: settingsError } = await supabase
      .from("business_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json({ error: "Business settings not configured." }, { status: 500 });
    }

    const { data: allCards, error: cardsError } = await supabase
      .from("card_types")
      .select("id, name, slug, price, active")
      .eq("active", true);

    if (cardsError || !allCards?.length) {
      return NextResponse.json({ error: "No card types in database." }, { status: 500 });
    }

    const byId = new Map(allCards.map((c) => [c.id, c]));
    const byName = new Map(allCards.map((c) => [c.name.toLowerCase().trim(), c]));
    const bySlug = new Map(allCards.map((c) => [c.slug, c]));

    let subtotal = 0;
    const validatedItems: {
      card_type_id: string;
      quantity: number;
      price_per_card: number;
      subtotal: number;
      files: IncomingItem["files"];
    }[] = [];

    for (const item of body.items) {
      let card =
        byId.get(item.cardTypeId) ||
        byName.get(item.cardName.toLowerCase().trim()) ||
        bySlug.get(item.cardTypeId);

      if (!card) {
        const nameLower = item.cardName.toLowerCase();
        card = allCards.find(
          (c) =>
            c.name.toLowerCase().includes(nameLower) ||
            nameLower.includes(c.name.toLowerCase())
        );
      }

      if (!card || !card.active) {
        return NextResponse.json({ error: `Card not available: ${item.cardName}` }, { status: 400 });
      }
      if (item.quantity < 1) {
        return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
      }

      const price = Number(card.price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      validatedItems.push({
        card_type_id: card.id,
        quantity: item.quantity,
        price_per_card: price,
        subtotal: itemSubtotal,
        files: item.files || [],
      });
    }

    const totalQty = validatedItems.reduce((s, it) => s + it.quantity, 0);
    const freeMin = Number(settings.free_delivery_min_quantity ?? 10);
    let deliveryCharge = Number(settings.delivery_charge) || 0;
    if (freeMin > 0 && totalQty >= freeMin) {
      deliveryCharge = 0;
    }
    const advancePercentage = Number(settings.advance_percentage ?? 100);
    const totalAmount = subtotal + deliveryCharge;
    const advanceAmount = Math.round((totalAmount * advancePercentage) / 100);
    const remainingAmount = totalAmount - advanceAmount;

    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        tracking_token: trackingToken,
        customer_name: body.customer.fullName.trim(),
        phone: body.customer.phone.trim(),
        email: body.customer.email?.trim() || null,
        address: body.customer.address.trim(),
        city: body.customer.city.trim(),
        state: body.customer.state.trim(),
        pincode: body.customer.pincode.trim(),
        subtotal,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        advance_percentage: advancePercentage,
        advance_amount: advanceAmount,
        remaining_amount: remainingAmount,
        payment_status: "PENDING_VERIFICATION",
        order_status: "PENDING_PAYMENT_VERIFICATION",
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order: " + (orderError?.message || "unknown") },
        { status: 500 }
      );
    }

    for (const item of validatedItems) {
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          card_type_id: item.card_type_id,
          quantity: item.quantity,
          price_per_card: item.price_per_card,
          subtotal: item.subtotal,
        })
        .select()
        .single();

      if (itemError || !orderItem) continue;

      for (const file of item.files) {
        try {
          const buffer = Buffer.from(file.data, "base64");
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const storagePath = `${order.id}/${orderItem.id}/${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from("order-documents")
            .upload(storagePath, buffer, {
              contentType: file.type || "application/pdf",
              upsert: false,
            });

          if (uploadError) {
            console.error("File upload error:", uploadError.message, storagePath);
            continue;
          }

          await supabase.from("order_files").insert({
            order_item_id: orderItem.id,
            file_name: file.name,
            storage_path: storagePath,
            file_size: file.size,
            mime_type: file.type || "application/pdf",
          });
        } catch (fileErr) {
          console.error("File processing error:", fileErr);
        }
      }
    }

    await supabase.from("payments").insert({
      order_id: order.id,
      amount: advanceAmount,
      method: "UPI",
      status: "PENDING_VERIFICATION",
    });

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      old_status: null,
      new_status: "PENDING_PAYMENT_VERIFICATION",
      note: "Order placed by customer",
    });

    notifyNewOrder({
      orderNumber: order.order_number,
      customerName: body.customer.fullName,
      phone: body.customer.phone,
      advance: Number(order.advance_amount),
      total: Number(order.total_amount),
    }).catch(() => {});

    try {
      const { sendBusinessOrderEmail } = await import("@/lib/email");
      await sendBusinessOrderEmail({
        orderNumber: order.order_number,
        customerName: body.customer.fullName,
        phone: body.customer.phone,
        email: body.customer.email,
        total: Number(order.total_amount),
        advance: Number(order.advance_amount),
        remaining: Number(order.remaining_amount),
        itemsSummary: validatedItems
          .map((it) => `• qty ${it.quantity} @ ₹${it.price_per_card}`)
          .join("\n"),
        address: `${body.customer.address}, ${body.customer.city}, ${body.customer.state} - ${body.customer.pincode}`,
      });
    } catch (e) {
      console.error("email notify failed", e);
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        trackingToken: order.tracking_token,
        totalAmount: order.total_amount,
        advanceAmount: order.advance_amount,
        remainingAmount: order.remaining_amount,
        status: order.order_status,
      },
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "Internal server error: " + (err?.message || "unknown") },
      { status: 500 }
    );
  }
}
