"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Clock,
  CheckCircle2,
  Printer,
  Truck,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  LogOut,
  Settings,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  total_amount: number;
  advance_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  printing: number;
  ready: number;
  completed: number;
  rejected: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    printing: 0,
    ready: 0,
    completed: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: Package, filter: "all" },
    { label: "Pending pay", value: stats.pending, icon: Clock, filter: "PENDING_PAYMENT_VERIFICATION" },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, filter: "CONFIRMED" },
    { label: "Processing", value: stats.processing, icon: AlertCircle, filter: "PROCESSING" },
    { label: "Printing", value: stats.printing, icon: Printer, filter: "PRINTING" },
    { label: "Ready", value: stats.ready, icon: Truck, filter: "READY" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, filter: "COMPLETED" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, filter: "REJECTED" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Biswas PVC Cards</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/cards">
              <Button variant="outline" size="sm">
                <CreditCard className="h-4 w-4 mr-1" /> Cards
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" /> Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setStatusFilter(s.filter)}
              className={`text-left rounded-xl border bg-card p-4 hover:border-primary/40 transition ${
                statusFilter === s.filter ? "ring-2 ring-primary" : ""
              }`}
            >
              <s.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search order #, name, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <Button onClick={load}>Search</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!loading && orders.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders found.</p>
            )}
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-3 hover:bg-muted/50"
              >
                <div>
                  <p className="font-semibold">{o.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.customer_name} · {o.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(Number(o.total_amount))}</p>
                  <p className="text-xs text-primary">
                    {String(o.order_status).replace(/_/g, " ")}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
