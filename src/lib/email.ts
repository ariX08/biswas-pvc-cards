import nodemailer from "nodemailer";

export interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string | null;
  total: number;
  advance: number;
  remaining?: number;
  itemsSummary: string;
  address: string;
}

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[email] EMAIL_USER or EMAIL_APP_PASSWORD not set — skipping send");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/** Always deliver new-order notification to business inbox */
export async function sendBusinessOrderEmail(payload: OrderEmailPayload): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const to =
    process.env.EMAIL_TO?.trim() ||
    "biswascybercafe0615@gmail.com";

  const from = process.env.EMAIL_USER!;
  const subject = `[New Order] ${payload.orderNumber} — ₹${payload.total}`;

  const text = `
New PVC Card Order

Order: ${payload.orderNumber}
Customer: ${payload.customerName}
Phone: ${payload.phone}
Email: ${payload.email || "—"}
Address: ${payload.address}

Items:
${payload.itemsSummary}

Total: ₹${payload.total}
Paid (online): ₹${payload.advance}
Remaining: ₹${payload.remaining ?? 0}

Open admin to verify payment:
https://biswaspvccards.vercel.app/admin
`.trim();

  const html = `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
  <h2 style="margin:0 0 8px;color:#0f172a">New PVC Card Order</h2>
  <p style="margin:0 0 16px;color:#64748b">Order <strong>${payload.orderNumber}</strong></p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:6px 0;color:#64748b">Customer</td><td style="padding:6px 0;text-align:right"><strong>${payload.customerName}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Phone</td><td style="padding:6px 0;text-align:right">${payload.phone}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0;text-align:right">${payload.email || "—"}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Address</td><td style="padding:6px 0;text-align:right">${payload.address}</td></tr>
    <tr><td colspan="2" style="padding:12px 0;border-top:1px solid #e2e8f0"><pre style="margin:0;white-space:pre-wrap;font-family:inherit">${payload.itemsSummary}</pre></td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Total</td><td style="padding:6px 0;text-align:right;font-size:18px"><strong>₹${payload.total}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Amount paid online</td><td style="padding:6px 0;text-align:right">₹${payload.advance}</td></tr>
  </table>
  <p style="margin:24px 0 0">
    <a href="https://biswaspvccards.vercel.app/admin" style="display:inline-block;background:#f97316;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Open Admin Dashboard</a>
  </p>
</div>
`.trim();

  await transporter.sendMail({
    from: `"Biswas PVC Cards" <${from}>`,
    to,
    subject,
    text,
    html,
  });
}
