"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

type SettingsForm = {
  business_name: string;
  upi_id: string;
  upi_qr_url: string;
  advance_percentage: number;
  delivery_charge: number;
  free_delivery_min_quantity: number;
  phone: string;
  email: string;
  address: string;
};

const empty: SettingsForm = {
  business_name: "",
  upi_id: "",
  upi_qr_url: "",
  advance_percentage: 100,
  delivery_charge: 50,
  free_delivery_min_quantity: 10,
  phone: "",
  email: "",
  address: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setForm({
            business_name: d.settings.business_name || "",
            upi_id: d.settings.upi_id || "",
            upi_qr_url: d.settings.upi_qr_url || "",
            advance_percentage: Number(d.settings.advance_percentage ?? 100),
            delivery_charge: Number(d.settings.delivery_charge ?? 50),
            free_delivery_min_quantity: Number(
              d.settings.free_delivery_min_quantity ?? 10
            ),
            phone: d.settings.phone || "",
            email: d.settings.email || "",
            address: d.settings.address || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const set = (key: keyof SettingsForm, value: string | number) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          advance_percentage: Number(form.advance_percentage),
          delivery_charge: Number(form.delivery_charge),
          free_delivery_min_quantity: Number(form.free_delivery_min_quantity),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Failed to save");
        return;
      }
      setMsg("All business settings saved.");
      if (data.settings) {
        setForm((f) => ({
          ...f,
          ...data.settings,
          advance_percentage: Number(data.settings.advance_percentage ?? f.advance_percentage),
          delivery_charge: Number(data.settings.delivery_charge ?? f.delivery_charge),
          free_delivery_min_quantity: Number(
            data.settings.free_delivery_min_quantity ?? f.free_delivery_min_quantity
          ),
        }));
      }
    } catch {
      setErr("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Business Settings</h1>
            <p className="text-sm text-muted-foreground">
              Delivery, payment %, UPI, contact — all driven from the database.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <form onSubmit={save} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact and brand</CardTitle>
              <CardDescription>Shown on public site and receipts.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Business name</Label>
                <Input
                  value={form.business_name}
                  onChange={(e) => set("business_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment (UPI)</CardTitle>
              <CardDescription>
                Customers pay this UPI ID. Default is full payment (100%).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>UPI ID</Label>
                <Input
                  value={form.upi_id}
                  onChange={(e) => set("upi_id", e.target.value)}
                  placeholder="yourname@upi"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>UPI QR image URL</Label>
                <Input
                  value={form.upi_qr_url}
                  onChange={(e) => set("upi_qr_url", e.target.value)}
                  placeholder="https://... (public image URL)"
                />
                {form.upi_qr_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.upi_qr_url}
                    alt="UPI QR"
                    className="mt-2 h-40 w-40 rounded border object-contain"
                  />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Advance percentage (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.advance_percentage}
                  onChange={(e) => set("advance_percentage", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  100 = full payment online. Lower values show remaining balance.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
              <CardDescription>
                Free delivery when total card quantity in the order reaches the threshold.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Delivery charge (INR)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.delivery_charge}
                  onChange={(e) => set("delivery_charge", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Free delivery from (pieces)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.free_delivery_min_quantity}
                  onChange={(e) =>
                    set("free_delivery_min_quantity", Number(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Set 0 to disable free delivery. Default 10 = free when qty is 10 or more.
                </p>
              </div>
            </CardContent>
          </Card>

          {msg ? <p className="text-sm font-medium text-green-600">{msg}</p> : null}
          {err ? <p className="text-sm font-medium text-destructive">{err}</p> : null}

          <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save all settings"}
          </Button>
        </form>
      </div>
    </div>
  );
}
