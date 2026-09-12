"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import type { CartItem, CartFile } from "@/types";
import { ArrowLeft } from "lucide-react";

type CardRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string | null;
  image_url?: string | null;
  instructions?: string | null;
  required_documents?: string | null;
};

export default function CardDetailPage() {
  const params = useParams();
  const slug = String(params.slug || "");
  const router = useRouter();
  const [card, setCard] = useState<CardRow | null>(null);
  const [qty, setQty] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.cards || []).find((c: CardRow) => c.slug === slug);
        setCard(found || null);
      })
      .catch(() => setCard(null));
  }, [slug]);

  const add = async () => {
    if (!card) return;
    if (files.length === 0) {
      setMsg("Please upload at least one PDF document");
      return;
    }
    setAdding(true);
    setMsg("");
    try {
      const cartFiles: CartFile[] = [];
      for (const f of files) {
        const buf = await f.arrayBuffer();
        cartFiles.push({ name: f.name, type: f.type, size: f.size, data: buf });
      }
      const item: CartItem = {
        id: `${card.id}-${Date.now()}`,
        cardTypeId: card.id,
        cardName: card.name,
        slug: card.slug,
        price: Number(card.price),
        quantity: qty,
        imageUrl: card.image_url,
        files: cartFiles,
      };
      await addToCart(item);
      setMsg("Added to cart");
      setTimeout(() => router.push("/cart"), 600);
    } catch {
      setMsg("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Loading card…</p>
        <Link href="/cards" className="text-primary text-sm mt-4 inline-block">
          Back to catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
      <Link href="/cards" className="inline-flex items-center text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> All cards
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{card.name}</CardTitle>
          <CardDescription>{card.description}</CardDescription>
          <p className="text-xl font-bold text-primary pt-2">
            {formatCurrency(Number(card.price))} per card
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {card.required_documents && (
            <p className="text-sm text-muted-foreground">
              <strong>Required:</strong> {card.required_documents}
            </p>
          )}
          {card.instructions && (
            <p className="text-sm text-muted-foreground">{card.instructions}</p>
          )}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label>Upload PDF document(s)</Label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </div>
          {msg && <p className="text-sm text-primary">{msg}</p>}
          <Button onClick={add} disabled={adding} className="w-full" size="lg">
            {adding ? "Adding…" : "Add to cart"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
