/**
 * Optional WhatsApp via CallMeBot.
 * Email is handled separately in lib/email.ts
 */

export async function notifyNewOrder(payload: {
  orderNumber: string;
  customerName: string;
  phone: string;
  advance: number;
  total: number;
}): Promise<void> {
  const wa = process.env.BUSINESS_WHATSAPP || process.env.ADMIN_WHATSAPP;
  const key = process.env.CALLMEBOT_APIKEY || process.env.WHATSAPP_API_TOKEN;
  if (!wa || !key) return;

  const phone = wa.replace(/\D/g, "");
  const text = encodeURIComponent(
    `New order ${payload.orderNumber}\n${payload.customerName} (${payload.phone})\nTotal ₹${payload.total} | Paid ₹${payload.advance}`
  );
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${key}`;
  try {
    await fetch(url, { method: "GET", cache: "no-store" });
  } catch (e) {
    console.error("WhatsApp notify failed", e);
  }
}
