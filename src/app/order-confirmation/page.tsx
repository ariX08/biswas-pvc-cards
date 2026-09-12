"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

function ConfirmationInner() {
  const sp = useSearchParams();
  const order = sp.get("order") || "";
  const token = sp.get("token") || "";

  const trackHref = token
    ? `/track?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`
    : `/track?order=${encodeURIComponent(order)}`;

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
      <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
      <h1 className="text-3xl font-bold">Order placed</h1>
      <p className="text-muted-foreground">
        Thank you. We will verify your UPI payment and start production.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order number</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-lg font-bold">{order || "—"}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Save this number to track your order anytime.
          </p>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={trackHref}>
          <Button size="lg">Track order</Button>
        </Link>
        <Link href="/cards">
          <Button size="lg" variant="outline">
            Continue shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading…</div>}>
      <ConfirmationInner />
    </Suspense>
  );
}
