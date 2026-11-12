import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Titiktiga — Studio Kreatif & Toko Produk Desain Magelang",
    template: "%s — Titiktiga",
  },
  description:
    "Titiktiga adalah studio desain & toko produk kreatif dari Magelang identitas brand, cetakan riso, stationery, dan objek pilihan. Langganan desain bulanan tanpa rekrutmen.",
  keywords: [
    "studio desain Magelang",
    "creative agency Indonesia",
    "jasa desain grafis",
    "cetak risograf",
    "langganan desain bulanan",
    "tokoh produk kreatif",
    "Titiktiga",
  ],
  applicationName: "Titiktiga",
  authors: [{ name: "Titiktiga Studio" }],
  creator: "Titiktiga Studio",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: ["en_US"],
    url: "/",
    siteName: "Titiktiga",
    title: "Titiktiga — Studio Kreatif & Toko Produk Desain Magelang",
    description:
      "Studio desain & toko produk kreatif dari Magelang identitas brand, cetakan riso, stationery, dan objek pilihan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Titiktiga — Studio Kreatif & Toko Produk Desain Magelang",
    description: "Studio desain & toko produk kreatif dari Magelang.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.svg" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Titiktiga",
  url: "/",
  logo: "/favicon.svg",
  description: "Studio desain & toko produk kreatif dari Magelang, Indonesia.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Prawirotaman No. 33",
    addressLocality: "Magelang",
    addressCountry: "ID",
  },
  sameAs: ["https://wa.me/6281234567890", "https://discord.gg/titiktiga"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Titiktiga",
  url: "/",
  inLanguage: "id",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, websiteJsonLd]) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
