"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCartItems,
  getCartSubtotal,
  getCustomerDetails,
  saveCustomerDetails,
  clearCart,
  clearCustomerDetails,
} from "@/lib/cart";
import type { CartItem, CustomerDetails } from "@/types";
import { MOCK_SETTINGS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Copy, Check, ArrowLeft } from "lucide-react";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<CustomerDetails>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [settings, setSettings] = useState(MOCK_SETTINGS);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSettings({
            ...MOCK_SETTINGS,
            ...d.settings,
            delivery_charge: Number(d.settings.delivery_charge ?? MOCK_SETTINGS.delivery_charge),
            advance_percentage: Number(d.settings.advance_percentage ?? 100),
            free_delivery_min_quantity: Number(
              d.settings.free_delivery_min_quantity ?? 10
            ),
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      const cartItems = await getCartItems();
      if (cartItems.length === 0) {
        router.replace("/cart");
        return;
      }
      setItems(cartItems);
      setSubtotal(await getCartSubtotal());
      const saved = await getCustomerDetails();
      if (saved) setDetails(saved);
      setLoading(false);
    };
    load();
  }, [router]);

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const freeMin = Number(settings.free_delivery_min_quantity ?? 10);
  const delivery =
    freeMin > 0 && totalQty >= freeMin ? 0 : Number(settings.delivery_charge) || 0;
  const total = subtotal + delivery;
  const advancePct = Number(settings.advance_percentage ?? 100);
  const payNow = Math.round((total * advancePct) / 100);
  const remaining = total - payNow;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (details.fullName.trim().length < 2) {
      setError("Full name is required");
      return;
    }
    if (details.phone.replace(/\D/g, "").length < 10) {
      setError("Valid phone is required");
      return;
    }
    if (!details.address.trim() || !details.city.trim() || !details.state.trim() || !details.pincode.trim()) {
      setError("Complete address is required");
      return;
    }

    setPlacing(true);
    try {
      await saveCustomerDetails(details);
      const payloadItems = [];
      for (const item of items) {
        const files = [];
        for (const f of item.files || []) {
          files.push({
            name: f.name,
            type: f.type,
            size: f.size,
            data: arrayBufferToBase64(f.data),
          });
        }
        payloadItems.push({
          cardTypeId: item.cardTypeId,
          cardName: item.cardName,
          quantity: item.quantity,
          price: item.price,
          files,
        });
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: details, items: payloadItems }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to place order");
        return;
      }
      await clearCart();
      await clearCustomerDetails();
      const q = new URLSearchParams({
        order: data.order.orderNumber,
        token: data.order.trackingToken || "",
      });
      router.push(`/order-confirmation?${q}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(settings.upi_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading checkout…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
      <Link href="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to cart
      </Link>
      <h1 className="text-3xl font-bold">Checkout</h1>

      <form onSubmit={placeOrder} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Full name</Label>
              <Input
                value={details.fullName}
                onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Input
                value={details.address}
                onChange={(e) => setDetails({ ...details, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={details.city}
                onChange={(e) => setDetails({ ...details, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={details.state}
                onChange={(e) => setDetails({ ...details, state: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>PIN code</Label>
              <Input
                value={details.pincode}
                onChange={(e) => setDetails({ ...details, pincode: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Pay via UPI to the shop account, then place the order. Admin verifies payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <p className="text-xs text-muted-foreground">UPI ID</p>
                <p className="font-mono font-semibold">{settings.upi_id}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={copyUpi}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {settings.upi_qr_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.upi_qr_url}
                alt="UPI QR"
                className="mx-auto h-48 w-48 object-contain border rounded-lg"
              />
            )}
            <div className="space-y-1 text-sm border-t pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{delivery === 0 ? "FREE" : formatCurrency(delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-primary font-semibold">
                <span>{remaining === 0 ? "Pay full amount" : "Pay now"}</span>
                <span>{formatCurrency(payNow)}</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Remaining</span>
                  <span>{formatCurrency(remaining)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={placing}>
          {placing ? "Placing order…" : "I have paid — Place order"}
        </Button>
      </form>
    </div>
  );
}
