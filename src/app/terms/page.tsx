import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Biswas PVC Cards",
  description: "Terms of service for ordering PVC cards from Biswas PVC Cards.",
};

export default function TermsPage() {
  return (
    <div className="page-shell py-12 max-w-3xl prose prose-slate">
      <h1 className="text-3xl font-bold mb-6">Terms &amp; Conditions</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: September 2026</p>

      <section className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold">1. Orders</h2>
        <p>
          You may order from 1 card upwards — there is no minimum order quantity.
          Prices are taken from our live catalogue at the moment you place the order.
        </p>

        <h2 className="text-lg font-semibold">2. Payment</h2>
        <p>
          Payment is by UPI to the business account shown at checkout. By default
          you pay the <strong>full order amount</strong> online. The shop owner
          verifies the payment manually before production starts.
        </p>

        <h2 className="text-lg font-semibold">3. Delivery charges</h2>
        <p>
          A delivery charge may apply as shown at checkout.{" "}
          <strong>
            Orders of 10 or more cards (total quantity across all items) receive
            free delivery
          </strong>
          , unless the shop changes this threshold in settings.
        </p>

        <h2 className="text-lg font-semibold">4. Files &amp; printing</h2>
        <p>
          You are responsible for uploading clear, correct documents. We print
          what you supply. Rejected or unclear files may delay or cancel the order.
        </p>

        <h2 className="text-lg font-semibold">5. Rejection &amp; cancellation</h2>
        <p>
          The shop may reject an order at any stage before completion (for example
          unpaid, unclear files, or inability to fulfil). A reason will be recorded
          and shown on the track page with a timestamp.
        </p>

        <h2 className="text-lg font-semibold">6. Contact</h2>
        <p>
          Biswas PVC Cards · +91 91238 98712 · biswascybercafe0615@gmail.com
        </p>
      </section>
    </div>
  );
}
