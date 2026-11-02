import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2" data-testid="auth-layout">
      <div className="relative hidden flex-col justify-between bg-foreground p-10 text-background lg:flex">
        <Link href="/" aria-label="Titiktiga" data-testid="auth-logo-link">
          <LogoMark className="[&>circle]:fill-background [&>circle:last-child]:fill-lime" />
        </Link>
        <div>
          <p className="font-display text-6xl font-medium leading-[1.05]">
            Menghubungkan titik,
            <br />
            <em className="italic text-lime">menciptakan makna.</em>
          </p>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-background/60">
            Studio desain & toko produk digital dari Magelang. Akun dan transaksi tersimpan aman di database aplikasi.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/40">© {new Date().getFullYear()} Titiktiga</p>
      </div>
      <div className="flex flex-col p-6 md:p-12">
        <Link href="/" className="lg:hidden" aria-label="Titiktiga" data-testid="auth-logo-link-mobile">
          <LogoMark />
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
