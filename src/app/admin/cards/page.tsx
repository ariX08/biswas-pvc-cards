"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function AdminCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/cards");
    const data = await res.json();
    setCards(data.cards || []);
  };

  useEffect(() => {
    load();
  }, []);

  const updatePrice = async (id: string, price: number) => {
    setMsg("");
    const res = await fetch("/api/admin/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, price }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setMsg("Price updated");
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch("/api/admin/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Card catalogue</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 space-y-4 max-w-3xl">
        {msg && <p className="text-sm text-primary">{msg}</p>}
        {cards.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between gap-2">
                <span>{c.name}</span>
                <span className="text-primary">{formatCurrency(Number(c.price))}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Price (₹)</label>
                <Input
                  type="number"
                  defaultValue={Number(c.price)}
                  className="w-28"
                  id={`price-${c.id}`}
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const el = document.getElementById(`price-${c.id}`) as HTMLInputElement;
                  updatePrice(c.id, Number(el?.value));
                }}
              >
                Save price
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleActive(c.id, !c.active)}
              >
                {c.active ? "Disable" : "Enable"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
