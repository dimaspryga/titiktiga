import { ImageResponse } from "next/og";

export const alt = "Titiktiga — Studio Kreatif & Toko Produk Desain Yogyakarta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Gambar Open Graph branded (1200×630) — dipakai sebagai default semua halaman. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#141412",
          color: "#f5f2ea",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: "#C6F53F" }} />
            <div style={{ width: 22, height: 22, borderRadius: 99, background: "#f5f2ea" }} />
            <div style={{ width: 22, height: 22, borderRadius: 99, border: "3px solid #f5f2ea" }} />
          </div>
          <div style={{ fontSize: 40, letterSpacing: "0.14em", textTransform: "uppercase" }}>titiktiga</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>
            Menghubungkan titik, menciptakan makna.
          </div>
          <div style={{ fontSize: 30, color: "rgba(245,242,234,0.65)" }}>
            Studio desain & toko produk kreatif — Yogyakarta, Indonesia
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "rgba(245,242,234,0.5)" }}>
          <div>titiktiga.studio</div>
          <div style={{ color: "#C6F53F" }}>Est. 2018</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
