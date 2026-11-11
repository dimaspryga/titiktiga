import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paket & Langganan Desain Bulanan",
  description:
    "Langganan desain Creative-as-a-Service dari Titiktiga: satu biaya bulanan untuk desain tanpa batas — tanpa rekrutmen, revisi tanpa batas, garansi 7 hari.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Paket & Langganan Desain Titiktiga",
    description: "Satu biaya bulanan untuk akses studio desain penuh — tanpa rekrutmen, tanpa drama.",
    url: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
