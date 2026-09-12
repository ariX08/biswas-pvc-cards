"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type HistoryItem = {
  old_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
};

type TrackOrder = {
  order_number: string;
  customer_name: string;
  order_status: string;
  payment_status: string;
  rejection_reason: string | null;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  advance_amount: number;
  remaining_amount: number;
  created_at: string;
  order_items: { quantity: number; price_per_card: number; card_types: { name: string } | null }[];
  order_status_history: HistoryItem[];
};

function TrackInner() {
  const sp = useSearchParams();
  const [orderNum, setOrderNum] = useState(sp.get("order") || "");
  const [token, setToken] = useState(sp.get("token") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackOrder | null>(null);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const q = new URLSearchParams({ order: orderNum.trim() });
      if (token.trim()) q.set("token", token.trim());
      const res = await fetch(`/api/track?${q}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Track your order</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Enter the order number from your confirmation. Status history includes date and time (IST).
      </p>

      <form onSubmit={search} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 space-y-1">
          <Label htmlFor="order">Order number</Label>
          <Input
            id="order"
            value={orderNum}
            onChange={(e) => setOrderNum(e.target.value)}
            placeholder="PVC-2026-XXXXXXXX"
            required
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="token">Tracking token (optional)</Label>
          <Input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="From confirmation link"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Looking up…" : "Track"}
          </Button>
        </div>
      </form>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {order && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <span>{order.order_number}</span>
                <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {order.order_status.replace(/_/g, " ")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Customer:</span>{" "}
                {order.customer_name}
              </p>
              <p>
                <span className="text-muted-foreground">Placed:</span>{" "}
                {formatDateTime(order.created_at)}
              </p>
              <p>
                <span className="text-muted-foreground">Payment:</span>{" "}
                {order.payment_status.replace(/_/g, " ")}
              </p>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {Number(order.delivery_charge) === 0
                      ? "FREE"
                      : formatCurrency(Number(order.delivery_charge))}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.total_amount))}</span>
                </div>
                {Number(order.remaining_amount) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Remaining</span>
                    <span>{formatCurrency(Number(order.remaining_amount))}</span>
                  </div>
                )}
              </div>
              {order.rejection_reason && (
                <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                  <strong>Rejected:</strong> {order.rejection_reason}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-border space-y-6 ml-2">
                {(order.order_status_history || []).map((h, i) => (
                  <li key={i} className="ml-4">
                    <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-primary" />
                    <p className="font-medium">{h.new_status.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(h.created_at)}
                    </p>
                    {h.note && (
                      <p className="text-sm text-muted-foreground mt-0.5">{h.note}</p>
                    )}
                  </li>
                ))}
                {(!order.order_status_history || order.order_status_history.length === 0) && (
                  <li className="ml-4 text-sm text-muted-foreground">No history yet.</li>
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="page-shell py-10">Loading…</div>}>
      <TrackInner />
    </Suspense>
  );
}
