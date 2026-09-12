import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security | Biswas PVC Cards",
  description: "How we protect your data and orders.",
};

export default function SecurityPage() {
  return (
    <div className="page-shell py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Security</h1>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Admin access uses a signed session cookie (HMAC), not a raw password in the browser.
          Sessions expire after 12 hours. Login is rate-limited.
        </p>
        <p>
          Uploaded PDFs are stored in a private storage bucket and are only accessible
          to the shop owner after authentication.
        </p>
        <p>
          Order numbers are random and non-sequential. Public track lookups never expose
          internal tokens or storage paths.
        </p>
        <p>
          Prices and business settings (delivery, free-delivery threshold, payment %)
          always come from the server database — never from client-supplied values on
          order creation.
        </p>
      </div>
    </div>
  );
}
