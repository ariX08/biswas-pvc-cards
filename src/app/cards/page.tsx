"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MOCK_CARDS } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CardsPage() {
  const [all, setAll] = useState(MOCK_CARDS.filter((c) => c.active));
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((d) => {
        if (d.cards?.length) setAll(d.cards);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter(
      (c: any) =>
        c.name.toLowerCase().includes(term) ||
        (c.category || "").toLowerCase().includes(term) ||
        (c.description || "").toLowerCase().includes(term) ||
        (c.slug || "").includes(term)
    );
  }, [all, q]);

  const categories = Array.from(new Set(filtered.map((c: any) => c.category || "Other")));

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">All Cards</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Identity, health & ration cards — any quantity.
        </p>
      </motion.div>

      <div className="max-w-xl mx-auto mb-10 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 h-11 rounded-full shadow-sm"
          placeholder="Search cards..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-16">No cards found.</p>
      )}

      {categories.map((category) => (
        <div key={String(category)} className="mb-12">
          <h2 className="text-xl font-semibold mb-4">{String(category)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered
              .filter((c: any) => (c.category || "Other") === category)
              .map((card: any, i: number) => (
                <motion.div
                  key={card.id || card.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/cards/${card.slug}`}>
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                      <CardHeader>
                        <div className="aspect-[1.6/1] bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-lg mb-3 flex items-center justify-center border overflow-hidden">
                          {card.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={card.image_url} alt={card.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-3xl font-bold text-primary/40">
                              {card.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg">{card.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {card.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          {formatCurrency(Number(card.price))}
                        </span>
                        <span className="text-xs text-muted-foreground">{card.category}</span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
