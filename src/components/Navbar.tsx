"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingCart, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCartCount } from "@/lib/cart";
import { useLang } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", key: "home" as const },
  { href: "/cards", key: "cards" as const },
  { href: "/track", key: "track" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

export function Navbar() {
  const pathname = usePathname();
  const { t } = useLang();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getCartCount().then(setCount).catch(() => {});
    const onFocus = () => getCartCount().then(setCount).catch(() => {});
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <div className="bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-xs">
          <span>Premium PVC printing · Delivery across India</span>
          <a href="tel:+919123898712" className="hidden items-center gap-1.5 sm:flex hover:underline">
            <Phone className="size-3" />
            +91 91238 98712
          </a>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary font-extrabold text-primary-foreground">
              B
            </span>
            <span className="truncate font-bold text-foreground">
              Biswas <span className="text-primary">PVC Cards</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart" aria-label={`Cart with ${count} items`} className="relative">
                <ShoppingCart className="size-5" />
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <div className="border-t bg-background lg:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {links.map(({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    pathname === href ? "bg-primary/10 text-primary" : "text-foreground"
                  )}
                >
                  {t(key)}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
