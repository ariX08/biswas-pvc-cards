"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      setOrder(data.order || null);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const doAction = async (action: string, body: Record<string, string> = {}) => {
    setActionLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Action failed");
        return;
      }
      setShowReject(false);
      setRejectReason("");
      await load();
      setMsg(`Updated: ${data.status || "OK"}`);
    } catch {
      setMsg("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  }
  if (!order) {
    return (
      <div className="p-10 text-center">
        <p>Order not found</p>
        <Link href="/admin" className="text-primary text-sm">
          Back
        </Link>
      </div>
    );
  }

  const status = order.order_status as string;
  const closed = ["REJECTED", "CANCELLED", "COMPLETED"].includes(status);
  const isPending = status === "PENDING_PAYMENT_VERIFICATION";
  const nextStatuses = ["CONFIRMED", "PROCESSING", "PRINTING", "READY", "COMPLETED", "CANCELLED"];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{order.order_number}</h1>
            <p className="text-xs text-muted-foreground">{status.replace(/_/g, " ")}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-4">
        {msg && <p className="text-sm text-primary">{msg}</p>}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{order.customer_name}</p>
            <p>{order.phone}</p>
            {order.email && <p>{order.email}</p>}
            <p>
              {order.address}, {order.city}, {order.state} - {order.pincode}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>Total: {formatCurrency(Number(order.total_amount))}</p>
            <p>Paid online: {formatCurrency(Number(order.advance_amount))}</p>
            <p>Delivery: {Number(order.delivery_charge) === 0 ? "FREE" : formatCurrency(Number(order.delivery_charge))}</p>
            <p>Status: {String(order.payment_status).replace(/_/g, " ")}</p>
          </CardContent>
        </Card>

        {isPending && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verify payment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button disabled={actionLoading} onClick={() => doAction("PAYMENT_RECEIVED")}>
                Payment received
              </Button>
              <Button variant="destructive" disabled={actionLoading} onClick={() => setShowReject(true)}>
                Reject
              </Button>
            </CardContent>
          </Card>
        )}

        {!closed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {nextStatuses
                .filter((s) => s !== status)
                .map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => doAction("UPDATE_STATUS", { newStatus: s })}
                  >
                    {s.replace(/_/g, " ")}
                  </Button>
                ))}
            </CardContent>
          </Card>
        )}

        {!closed && !showReject && (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Reject order</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setShowReject(true)}>
                Reject this order
              </Button>
            </CardContent>
          </Card>
        )}

        {showReject && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rejection reason (required)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label>Reason</Label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Payment not received / unclear files / …"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  disabled={actionLoading || !rejectReason.trim()}
                  onClick={() => doAction("REJECT", { reason: rejectReason })}
                >
                  Confirm rejection
                </Button>
                <Button variant="outline" onClick={() => setShowReject(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {order.rejection_reason && (
          <Card className="border-destructive/40">
            <CardContent className="pt-6 text-destructive text-sm">
              <strong>Rejected:</strong> {order.rejection_reason}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(order.order_status_history || [])
              .slice()
              .sort(
                (a: any, b: any) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
              .map((h: any, i: number) => (
                <div key={i} className="border-b pb-2">
                  <p className="font-medium">{String(h.new_status).replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
                  {h.note && <p className="text-muted-foreground">{h.note}</p>}
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(order.order_items || []).map((item: any) =>
              (item.order_files || []).map((f: any) => (
                <div key={f.id} className="flex justify-between gap-2">
                  <span>{f.file_name}</span>
                  <a
                    className="text-primary hover:underline"
                    href={`/api/admin/files?path=${encodeURIComponent(f.storage_path)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
