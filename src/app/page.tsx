"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Truck, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type CardRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string | null;
  description?: string;
};

export default function HomePage() {
  const [featured, setFeatured] = useState<CardRow[]>([]);

  useEffect(() => {
    fetch("/api/cards", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.cards?.length) setFeatured(d.cards.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/5">
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Premium PVC Cards, Printed Fast
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Voter ID, PAN, Driving Licence and more. Guest checkout, UPI payment, free delivery on 10+ cards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/cards">
                <Button size="lg" className="w-full sm:w-auto shadow-md">
                  Browse Cards
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Track Order
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: CreditCard, title: "Any Quantity", desc: "Order 1 card or 100. No minimum." },
            { icon: Shield, title: "Secure Documents", desc: "Private storage for your files." },
            { icon: Truck, title: "Fast Delivery", desc: "Quick processing across India." },
            { icon: Clock, title: "Easy Tracking", desc: "Track with Order ID — no login." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full border-none shadow-sm bg-card">
                <CardHeader>
                  <f.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Cards</h2>
          <Link href="/cards" className="text-sm text-primary font-medium hover:underline">
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((card, i) => (
            <motion.div
              key={card.id || card.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/cards/${card.slug}`}>
                <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all">
                  <CardHeader>
                    <div className="aspect-[1.6/1] rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 mb-2 flex items-center justify-center border overflow-hidden">
                      {card.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.image_url} alt={card.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-primary/30">{card.name[0]}</span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <CardDescription>
                      {formatCurrency(Number(card.price))} per card
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      View & Order
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
