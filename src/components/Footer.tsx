"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1fr_1fr_1.25fr]">
        <div>
          <div className="mb-4 text-lg font-bold">Biswas PVC Cards</div>
          <p className="max-w-xs text-sm text-secondary-foreground/75">
            Professional PVC cards, straightforward ordering and dependable customer care.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <a href="tel:+919123898712" className="flex items-center gap-2 hover:underline">
            <Phone className="size-4 text-primary" />
            +91 91238 98712
          </a>
          <a
            href="mailto:biswascybercafe0615@gmail.com"
            className="flex items-center gap-2 break-all hover:underline"
          >
            <Mail className="size-4 shrink-0 text-primary" />
            biswascybercafe0615@gmail.com
          </a>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            Biswas Cyber Cafe, Kolkata, West Bengal
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 text-secondary-foreground/70">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/security">Security</Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-secondary-foreground/20">
          <iframe
            src="https://maps.google.com/maps?q=Biswas%20Cyber%20Cafe%20Kolkata&t=&z=15&ie=UTF8&iwloc=&output=embed"
            title="Shop location"
            loading="lazy"
            className="h-48 w-full"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <div className="border-t border-secondary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 text-xs text-secondary-foreground/60">
          <span>© {new Date().getFullYear()} Biswas PVC Cards</span>
          <a
            href="https://arix.faltuworkonly91.workers.dev"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Made by ARITRA.DESIGN
          </a>
        </div>
      </div>
    </footer>
  );
}
