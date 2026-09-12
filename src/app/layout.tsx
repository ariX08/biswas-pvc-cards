import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Biswas PVC Cards | Premium PVC Card Printing Kolkata",
    template: "%s | Biswas PVC Cards",
  },
  description:
    "Order high-quality PVC reprints of Voter ID, PAN, Driving Licence, Aadhaar, Health & Ration cards. Guest checkout, UPI payment, free delivery on 10+ cards. Serving Kolkata & all India.",
  keywords: [
    "PVC card printing",
    "Voter ID PVC",
    "PAN card PVC",
    "Driving licence card",
    "Kolkata PVC cards",
    "Biswas PVC Cards",
  ],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Biswas PVC Cards",
    description: "Premium PVC card printing with easy online ordering.",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
