import type {
  Customer,
  MockUser,
  Order,
  PortfolioProject,
  Promotion,
  Service,
  SiteContent,
  Testimonial,
  Voucher,
} from "@/lib/types";

const u = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`;

export const DEMO_PASSWORD_HASH = "sha256:0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d";
export const ADMIN_PASSWORD_HASH = "sha256:ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270";

export const seedUsers: MockUser[] = [
  {
    id: "usr-admin",
    name: "Admin Titiktiga",
    email: "admin@titiktiga.studio",
    passwordHash: ADMIN_PASSWORD_HASH,
    role: "admin",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "usr-demo",
    name: "Demo Prasetya",
    email: "demo@titiktiga.studio",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "customer",
    createdAt: "2025-06-15T00:00:00.000Z",
  },
];

export const seedVouchers: Voucher[] = [
  {
    id: "vou-1", code: "TITIK20", type: "percentage", value: 20, minPurchase: 300000, maxDiscount: 100000,
    startDate: "2025-11-01", expiryDate: "2026-12-31", usageLimit: 100, usedCount: 12, active: true, eligibleCategories: null,
  },
  {
    id: "vou-2", code: "HEMAT50K", type: "fixed", value: 50000, minPurchase: 250000, maxDiscount: null,
    startDate: "2025-11-01", expiryDate: "2026-06-30", usageLimit: 50, usedCount: 3, active: true, eligibleCategories: null,
  },
  {
    id: "vou-3", code: "POSTER10", type: "percentage", value: 10, minPurchase: 0, maxDiscount: 25000,
    startDate: "2025-11-01", expiryDate: "2026-12-31", usageLimit: null, usedCount: 8, active: true, eligibleCategories: ["poster"],
  },
  {
    id: "vou-4", code: "LAMACOMBO", type: "fixed", value: 25000, minPurchase: 100000, maxDiscount: null,
    startDate: "2025-01-01", expiryDate: "2025-06-30", usageLimit: 10, usedCount: 10, active: false, eligibleCategories: null,
  },
];

export const seedCustomers: Customer[] = [
  { id: "cus-1", name: "Demo Prasetya", email: "demo@titiktiga.studio", phone: "+62 812 1111 2222", joinedAt: "2025-06-15T00:00:00.000Z", ordersCount: 2, totalSpent: 631000 },
  { id: "cus-2", name: "Ratna Ayu", email: "ratna.ayu@example.com", phone: "+62 813 2333 1122", joinedAt: "2025-03-02T00:00:00.000Z", ordersCount: 1, totalSpent: 259000 },
  { id: "cus-3", name: "Bimo Prakoso", email: "bimo.prakoso@example.com", phone: "+62 878 4512 3344", joinedAt: "2025-08-19T00:00:00.000Z", ordersCount: 1, totalSpent: 378000 },
  { id: "cus-4", name: "Sari Wulandari", email: "sari.w@example.com", phone: "+62 811 9087 6655", joinedAt: "2025-09-30T00:00:00.000Z", ordersCount: 1, totalSpent: 224000 },
  { id: "cus-5", name: "Dhani Ahmad", email: "dhani.ahmad@example.com", phone: "+62 856 3311 0099", joinedAt: "2025-11-11T00:00:00.000Z", ordersCount: 1, totalSpent: 169000 },
];

const oi = (id: string, slug: string, name: string, image: string, quantity: number, unitPrice: number) => ({
  productId: id, slug, name, image, quantity, unitPrice, subtotal: unitPrice * quantity,
});

export const seedOrders: Order[] = [
  {
    id: "ord-1", number: "TT-2026-0001", customerName: "Demo Prasetya", customerEmail: "demo@titiktiga.studio", customerPhone: "+62 812 1111 2222",
    address: "Jl. Kaliurang KM 5 No. 12, Sleman, Magelang", notes: "",
    items: [oi("prd-001", "cetak-riso-senja-di-kota", "Cetak Riso — Senja di Kota", u("1724685109635-a2206372996b"), 1, 189000), oi("prd-015", "mug-keramik-jeda", "Mug Keramik — Jeda", u("1590906811362-527c7b20ab51"), 1, 145000)],
    subtotal: 334000, productDiscount: 0, voucherCode: null, voucherDiscount: 0, shippingFee: 25000, total: 359000,
    status: "completed", createdAt: "2026-01-04T10:15:00.000Z",
  },
  {
    id: "ord-2", number: "TT-2026-0002", customerName: "Demo Prasetya", customerEmail: "demo@titiktiga.studio", customerPhone: "+62 812 1111 2222",
    address: "Jl. Kaliurang KM 5 No. 12, Sleman, Magelang", notes: "Titip amplop kalau ada",
    items: [oi("prd-005", "buku-sketsa-arska-a5", "Buku Sketsa Arska A5", u("1620275765334-4ed948bb4502"), 2, 116100)],
    subtotal: 232200, productDiscount: 25800, voucherCode: null, voucherDiscount: 0, shippingFee: 25000, total: 257200,
    status: "shipped", createdAt: "2026-01-09T14:30:00.000Z",
  },
  {
    id: "ord-3", number: "TT-2026-0003", customerName: "Ratna Ayu", customerEmail: "ratna.ayu@example.com", customerPhone: "+62 813 2333 1122",
    address: "Jl. Cikajang No. 8, Jakarta Selatan", notes: "",
    items: [oi("prd-003", "cetak-giclee-hening", "Cetak Giclée — Hening", u("1664711942326-2c3351e215e6"), 1, 259000)],
    subtotal: 259000, productDiscount: 0, voucherCode: null, voucherDiscount: 0, shippingFee: 25000, total: 284000,
    status: "processing", createdAt: "2026-01-11T08:05:00.000Z",
  },
  {
    id: "ord-4", number: "TT-2026-0004", customerName: "Bimo Prakoso", customerEmail: "bimo.prakoso@example.com", customerPhone: "+62 878 4512 3344",
    address: "Jl. Diponegoro No. 45, Bandung", notes: "",
    items: [oi("prd-012", "tote-bag-titik-dua", "Tote Bag — Titik Dua", u("1544816155-12df9643f363"), 2, 119000), oi("prd-021", "zine-arsip-kota", "Zine Vol. 3 — Arsip Kota", u("1707989516414-a2394797e0bf"), 1, 85000)],
    subtotal: 323000, productDiscount: 0, voucherCode: null, voucherDiscount: 0, shippingFee: 25000, total: 348000,
    status: "pending", createdAt: "2026-01-13T19:42:00.000Z",
  },
  {
    id: "ord-5", number: "TT-2026-0005", customerName: "Sari Wulandari", customerEmail: "sari.w@example.com", customerPhone: "+62 811 9087 6655",
    address: "Jl. Tunjungan No. 21, Surabaya", notes: "",
    items: [oi("prd-008", "planner-mingguan-jeda", "Planner Mingguan Jeda", u("1683921045461-b8dc5ad37740"), 1, 135200), oi("prd-006", "notebook-spiral-linen", "Notebook Spiral Linen", u("1531346878377-a5be20888e57"), 1, 99000)],
    subtotal: 234200, productDiscount: 33800, voucherCode: null, voucherDiscount: 0, shippingFee: 25000, total: 259200,
    status: "completed", createdAt: "2026-01-14T11:20:00.000Z",
  },
  {
    id: "ord-6", number: "TT-2026-0006", customerName: "Dhani Ahmad", customerEmail: "dhani.ahmad@example.com", customerPhone: "+62 856 3311 0099",
    address: "Jl. Ahmad Yani No. 3, Semarang", notes: "",
    items: [oi("prd-018", "specimen-poster-grotesk", "Specimen Poster — Grotesk", u("1609605348579-3123e3d40eb8"), 1, 159000)],
    subtotal: 159000, productDiscount: 0, voucherCode: null, voucherDiscount: 0, shippingFee: 25000, total: 184000,
    status: "cancelled", createdAt: "2026-01-15T09:10:00.000Z",
  },
  {
    id: "ord-7", number: "TT-2026-0007", customerName: "Ratna Ayu", customerEmail: "ratna.ayu@example.com", customerPhone: "+62 813 2333 1122",
    address: "Jl. Cikajang No. 8, Jakarta Selatan", notes: "",
    items: [oi("prd-009", "sticker-pack-rasa-kota", "Sticker Pack — Rasa Kota", u("1633533452206-8ab246b00e30"), 3, 45000), oi("prd-007", "pulpen-presisi-038", "Pulpen Presisi 0.38", u("1501618669935-18b6ecb13d6d"), 2, 59000)],
    subtotal: 253000, productDiscount: 0, voucherCode: null, voucherDiscount: 0, shippingFee: 25000, total: 278000,
    status: "pending", createdAt: "2026-01-16T16:55:00.000Z",
  },
  {
    id: "ord-8", number: "TT-2026-0008", customerName: "Bimo Prakoso", customerEmail: "bimo.prakoso@example.com", customerPhone: "+62 878 4512 3344",
    address: "Jl. Diponegoro No. 45, Bandung", notes: "",
    items: [oi("prd-017", "set-gelas-keramik-dua", "Set Gelas Keramik (2)", u("1570841398791-33942bd1a99f"), 1, 216750)],
    subtotal: 216750, productDiscount: 38250, voucherCode: null, voucherDiscount: 0, shippingFee: 25000, total: 241750,
    status: "processing", createdAt: "2026-01-17T07:25:00.000Z",
  },
];

export const seedServices: Service[] = [
  {
    id: "svc-1", slug: "branding-identitas", index: "01",
    title: { id: "Branding & Identitas", en: "Branding & Identity" },
    description: { id: "Dari riset nama hingga guideline: identitas yang menjelaskan siapa Anda tanpa perlu berteriak.", en: "From name research to guidelines: an identity that explains who you are without shouting." },
    deliverables: [
      { id: "Logo & sistem visual", en: "Logo & visual system" },
      { id: "Brand guideline", en: "Brand guidelines" },
      { id: "Stationery & aplikasi", en: "Stationery & applications" },
    ],
    priceFrom: 25000000,
  },
  {
    id: "svc-2", slug: "desain-kemasan", index: "02",
    title: { id: "Desain Kemasan", en: "Packaging Design" },
    description: { id: "Kemasan yang enak dipandang di rak dan aman di tangan kurir — struktur, ilustrasi, sampai siap cetak.", en: "Packaging that sings on shelves and survives couriers — structure, illustration, print-ready." },
    deliverables: [
      { id: "Struktur & dieline", en: "Structure & dielines" },
      { id: "Ilustrasi kemasan", en: "Packaging illustration" },
      { id: "Dokumen siap cetak", en: "Print-ready artwork" },
    ],
    priceFrom: 18000000,
  },
  {
    id: "svc-3", slug: "desain-editorial", index: "03",
    title: { id: "Desain Editorial", en: "Editorial Design" },
    description: { id: "Majalah, katalog, laporan tahunan — tata letak yang membuat panjang terasa pendek.", en: "Magazines, catalogues, annual reports — layouts that make long reads feel short." },
    deliverables: [
      { id: "Sistem grid & tipografi", en: "Grid & type system" },
      { id: "Tata letak penuh", en: "Full layout design" },
      { id: "Pendampingan cetak", en: "Print supervision" },
    ],
    priceFrom: 15000000,
  },
  {
    id: "svc-4", slug: "ilustrasi-grafis", index: "04",
    title: { id: "Ilustrasi & Grafis", en: "Illustration & Graphics" },
    description: { id: "Ilustrasi khas untuk kampanye, kemasan, dan ruang — bukan stok, tapi cerita.", en: "Distinctive illustration for campaigns, packaging, and spaces — not stock, but story." },
    deliverables: [
      { id: "Key visual", en: "Key visual" },
      { id: "Set ilustrasi pendukung", en: "Supporting illustration set" },
      { id: "Berkas siap pakai", en: "Ready-to-use assets" },
    ],
    priceFrom: 8000000,
  },
  {
    id: "svc-5", slug: "desain-web-digital", index: "05",
    title: { id: "Desain Web & Digital", en: "Web & Digital Design" },
    description: { id: "Situs dan antarmuka yang cepat, ramah di mata, dan jujur pada konten.", en: "Sites and interfaces that are fast, easy on the eyes, and honest to content." },
    deliverables: [
      { id: "Desain UI", en: "UI design" },
      { id: "Design system ringan", en: "Lightweight design system" },
      { id: "Prototipe interaktif", en: "Interactive prototype" },
    ],
    priceFrom: 20000000,
  },
];

export const seedPortfolio: PortfolioProject[] = [
  {
    id: "pf-1", slug: "arska-coffee-identitas", title: "Arska Coffee — Identitas Visual", client: "Arska Coffee", year: 2025,
    category: { id: "Branding", en: "Branding" }, cover: u("1778665654058-dcd700142738"),
    images: [u("1778665654058-dcd700142738"), u("1713873010288-c4617fc2b15b"), u("1635868388769-b2c0cd93e52d")],
    description: { id: "Kedai kopi di kota kecil dengan ambisi besar. Kami merancang identitas hangat: logotype serif, sistem warna tanah, dan kemasan yang nyaman dibawa jalan.", en: "A small-town coffee shop with big ambitions. We designed a warm identity: a serif logotype, earthy colour system, and packaging made to travel." },
    services: ["Branding & Identitas", "Desain Kemasan"],
  },
  {
    id: "pf-2", slug: "ruparupa-press-editorial", title: "RupaRupa Press — Sistem Editorial", client: "RupaRupa Press", year: 2025,
    category: { id: "Editorial", en: "Editorial" }, cover: u("1713873010288-c4617fc2b15b"),
    images: [u("1713873010288-c4617fc2b15b"), u("1504198322253-cfa87a0ff25f"), u("1778665654058-dcd700142738")],
    description: { id: "Penerbit buku independen butuh sistem yang bisa menampung puluhan judul tanpa kehilangan wajah. Grid modular + tipografi fleksibel adalah jawabannya.", en: "An independent publisher needed a system to hold dozens of titles without losing its face. A modular grid and flexible typography were the answer." },
    services: ["Desain Editorial"],
  },
  {
    id: "pf-3", slug: "senja-skincare-kemasan", title: "Senja Skincare — Kemasan", client: "Senja Skincare", year: 2024,
    category: { id: "Kemasan", en: "Packaging" }, cover: u("1635868388769-b2c0cd93e52d"),
    images: [u("1635868388769-b2c0cd93e52d"), u("1651760937033-8ccab2727cef"), u("1658863025658-4a259cc68fc9")],
    description: { id: "Rangkaian perawatan malam dengan ilustrasi bulan yang tenang. Kemasan monogenik yang mudah dikenali di rak sekalipun penuh.", en: "A night-care line with calm moon illustrations. Monochrome packaging that stays recognisable even on a crowded shelf." },
    services: ["Desain Kemasan", "Ilustrasi & Grafis"],
  },
  {
    id: "pf-4", slug: "festival-titik-temu", title: "Festival Titik Temu", client: "Titik Temu Collective", year: 2025,
    category: { id: "Kampanye", en: "Campaign" }, cover: u("1651760937033-8ccab2727cef"),
    images: [u("1651760937033-8ccab2727cef"), u("1549298222-1c31e8915347"), u("1635621456241-16e4a3a009a0")],
    description: { id: "Identitas festival yang tumbuh dari peserta: sistem visual partisipatif dengan stiker, stempel, dan dinding kolaboratif.", en: "A festival identity grown by its participants: a participatory visual system of stickers, stamps, and a collaborative wall." },
    services: ["Branding & Identitas", "Ilustrasi & Grafis"],
  },
  {
    id: "pf-5", slug: "kios-kreatif-ecommerce", title: "Kios Kreatif — E-commerce", client: "Kios Kreatif", year: 2024,
    category: { id: "Digital", en: "Digital" }, cover: u("1658863025658-4a259cc68fc9"),
    images: [u("1658863025658-4a259cc68fc9"), u("1549298222-1c31e8915347"), u("1713873010288-c4617fc2b15b")],
    description: { id: "Toko daring untuk kolektif 12 pembuat: desain antarmuka yang membiarkan produk bicara, dengan alur checkout seminimal mungkin.", en: "An online shop for a 12-maker collective: an interface that lets products speak, with the shortest possible checkout." },
    services: ["Desain Web & Digital"],
  },
  {
    id: "pf-6", slug: "studio-langit-website", title: "Studio Langit — Situs Portofolio", client: "Studio Langit", year: 2024,
    category: { id: "Digital", en: "Digital" }, cover: u("1549298222-1c31e8915347"),
    images: [u("1549298222-1c31e8915347"), u("1778665654058-dcd700142738"), u("1658863025658-4a259cc68fc9")],
    description: { id: "Situs portofolio untuk studio arsitektur: tenang, cepat, dan penuh ruang — seperti bangunan mereka.", en: "A portfolio site for an architecture studio: calm, fast, and full of air — like their buildings." },
    services: ["Desain Web & Digital"],
  },
  {
    id: "pf-7", slug: "zine-kolaborasi-12-penulis", title: "Zine Kolaborasi — 12 Penulis", client: "Proyek mandiri", year: 2023,
    category: { id: "Editorial", en: "Editorial" }, cover: u("1504198322253-cfa87a0ff25f"),
    images: [u("1504198322253-cfa87a0ff25f"), u("1707989516414-a2394797e0bf"), u("1467951591042-f388365db261")],
    description: { id: "Dua belas penulis, satu buku, tiga warna cetak. Proyek non-profit yang menghimpun dana kelas menulis di Magelang.", en: "Twelve writers, one book, three print colours. A non-profit project funding writing classes in Magelang." },
    services: ["Desain Editorial"],
  },
  {
    id: "pf-8", slug: "lokal-kalender-2026", title: "Lokal — Kalender 2026", client: "Lokal Goods", year: 2025,
    category: { id: "Ilustrasi", en: "Illustration" }, cover: u("1635621456241-16e4a3a009a0"),
    images: [u("1635621456241-16e4a3a009a0"), u("1651760937033-8ccab2727cef"), u("1635868388769-b2c0cd93e52d")],
    description: { id: "Kalender dinding dengan 12 ilustrasi musim tropis. Dicetak riso lima warna — versi favorit kami sejauh ini.", en: "A wall calendar with 12 tropical-season illustrations. Printed in five-colour riso — our favourite so far." },
    services: ["Ilustrasi & Grafis"],
  },
];

export const seedTestimonials: Testimonial[] = [
  {
    id: "tst-1", name: "Ratna Ayu", role: { id: "Founder, Arska Coffee", en: "Founder, Arska Coffee" }, avatar: u("1506863530036-1efeddceb993"),
    quote: { id: "Titiktiga mendengar lebih dulu, baru merancang. Hasilnya identitas yang terasa jujur — pelanggan kami memuji kemasannya hampir setiap hari.", en: "Titiktiga listens first, designs later. The result is an identity that feels honest — our customers compliment the packaging almost daily." },
  },
  {
    id: "tst-2", name: "Bimo Prakoso", role: { id: "Pemimpin Redaksi, RupaRupa Press", en: "Editor-in-chief, RupaRupa Press" }, avatar: u("1758922584983-82ffd5720c6a"),
    quote: { id: "Sistem editorial mereka membuat 30 judul buku terlihat seperti satu keluarga. Disiplin grid-nya luar biasa.", en: "Their editorial system makes 30 book titles look like one family. The grid discipline is remarkable." },
  },
  {
    id: "tst-3", name: "Sari Wulandari", role: { id: "CEO, Senja Skincare", en: "CEO, Senja Skincare" }, avatar: u("1779400203359-09e4f2a26213"),
    quote: { id: "Detail yang tidak terlihat pun mereka rawat — sampai lem kemasan dipilih dengan cermat. Itu level kepedulian yang langka.", en: "Even the invisible details were cared for — down to the packaging glue. That level of care is rare." },
  },
  {
    id: "tst-4", name: "Dhani Ahmad", role: { id: "Kurator, Festival Titik Temu", en: "Curator, Titik Temu Festival" }, avatar: u("1758534063829-a72058381e21"),
    quote: { id: "Identitas festival yang bisa dipegang peserta — stiker, stempel, dinding kolaboratif — membuat semua orang merasa punya.", en: "A festival identity participants could hold — stickers, stamps, a collaborative wall — made everyone feel ownership." },
  },
];

export const seedPromotions: Promotion[] = [
  {
    id: "prm-1", placement: "announcement", active: true, code: null,
    title: { id: "Produk digital siap pakai — diskon untuk pesanan pilihan", en: "Ready-to-use digital products — discounts for selected orders" },
  },
  {
    id: "prm-2", placement: "home-banner", active: true, code: "TITIK20",
    title: { id: "Koleksi cetak riso edisi terbatas — hingga 20% dengan kode", en: "Limited riso print collection — up to 20% off with code" },
  },
];

export const seedContent: SiteContent = {
  hero: {
    eyebrow: { id: "Studio Kreatif — Magelang, Indonesia", en: "Creative Studio — Magelang, Indonesia" },
    titleLines: [
      { id: "Menghubungkan", en: "Connecting" },
      { id: "titik, menciptakan", en: "dots, crafting" },
      { id: "makna.", en: "meaning." },
    ],
    subtitle: {
      id: "Titiktiga adalah studio desain sekaligus toko produk kreatif. Kami membantu brand bercerita lewat identitas, cetakan, dan objek yang hidup lebih lama di tangan orang.",
      en: "Titiktiga is a design studio and creative shop. We help brands tell stories through identities, prints, and objects that outlive trends.",
    },
    image: u("1693159682660-c125e71844d8"),
    imageAlt: { id: "Interior studio Titiktiga", en: "Titiktiga studio interior" },
  },
  marquee: [
    { id: "Menghubungkan Titik", en: "Connecting Dots" },
    { id: "Estetika Minimalis", en: "Minimal Aesthetics" },
    { id: "Produk Kreatif", en: "Creative Goods" },
    { id: "Desain Berkelanjutan", en: "Sustainable Design" },
    { id: "Cetak Riso", en: "Riso Printing" },
    { id: "Studio Sejak 2018", en: "Studio Since 2018" },
  ],
  aboutPreview: {
    eyebrow: { id: "Tentang Kami", en: "About Us" },
    title: { id: "Studio kecil dengan standar besar.", en: "A small studio with big standards." },
    body: {
      id: "Kami percaya desain yang baik adalah desain yang bertahan: jujur pada konten, sabar pada detail, dan ramah pada orang yang memakainya. Nama kami berasal dari 'titik tiga' — tanda berlanjut, bukan berakhir.",
      en: "We believe good design is design that lasts: honest to content, patient with detail, and kind to the people using it. Our name comes from 'three dots' — a sign of continuation, not an end.",
    },
    image: u("1599420186946-7b6fb4e297f0"),
  },
  aboutPage: {
    story: [
      {
        id: "Titiktiga dimulai pada 2018 dari kamar kos di Magelang: satu meja, satu printer riso bekas, dan keyakinan bahwa karya cetak masih punya rasa yang tak tergantikan.",
        en: "Titiktiga began in 2018 in a Magelang boarding room: one desk, one second-hand riso printer, and the belief that print still carries a feeling nothing replaces.",
      },
      {
        id: "Hari ini kami adalah tim kecil perancang, ilustrator, dan tukang cetak yang mengerjakan identitas brand, kemasan, dan publikasi — sambil merawat toko produk kecil kami sendiri.",
        en: "Today we are a small team of designers, illustrators, and printmakers working on brand identities, packaging, and publications — while tending our own small goods shop.",
      },
      {
        id: "Kami tetap mencetak sendiri sebagian produk, bekerja sama dengan perajin lokal, dan memilih kertas yang bisa didaur ulang. Bagi kami, estetika dan tanggung jawab bukan pilihan yang harus dipertentangkan.",
        en: "We still print part of our products ourselves, work with local makers, and choose recyclable papers. To us, aesthetics and responsibility are not opposing choices.",
      },
    ],
    vision: {
      id: "Menjadi studio yang membuktikan bahwa desain Indonesia kecil bisa bersaing di panggung besar — tanpa kehilangan akar dan kejujurannya.",
      en: "To be the studio that proves small Indonesian design can stand on big stages — without losing its roots or honesty.",
    },
    mission: [
      { id: "Merancang dengan riset, menerjunkan detail, dan mengukur dampak.", en: "Design with research, sweat the details, and measure impact." },
      { id: "Membayar mitra dan perajin secara adil dan tepat waktu.", en: "Pay partners and makers fairly, and on time." },
      { id: "Membagikan pengetahuan lewat kelas, zine, dan keterbukaan proses.", en: "Share knowledge through classes, zines, and open process." },
    ],
    philosophy: {
      id: "Tiga titik kami: mendengar, merancang, merawat. Mendengar klien dan konteksnya. Merancang dengan alasan yang bisa dijelaskan. Merawat hasilnya sampai ia hidup sendiri.",
      en: "Our three dots: listen, design, tend. Listen to clients and their context. Design with reasons you can explain. Tend the result until it lives on its own.",
    },
    images: [u("1643216674491-33878507b402"), u("1663433567177-9f94be0bff4c")],
  },
  stats: [
    { id: "stat-1", label: { id: "Tahun berkarya", en: "Years of work" }, value: 8, suffix: "" },
    { id: "stat-2", label: { id: "Proyek selesai", en: "Projects done" }, value: 120, suffix: "+" },
    { id: "stat-3", label: { id: "Produk kreatif", en: "Creative goods" }, value: 23, suffix: "" },
    { id: "stat-4", label: { id: "Klien dijaga", en: "Clients kept" }, value: 96, suffix: "%" },
  ],
  cta: {
    title: { id: "Punya ide yang layak dirawat?", en: "Have an idea worth tending?" },
    subtitle: { id: "Ceritakan pada kami — mulai dari secangkir kopi, tanpa slide yang bikin mengantuk.", en: "Tell us about it — start with a coffee, no sleep-inducing slides." },
    button: { id: "Mulai Percakapan", en: "Start a Conversation" },
  },
  contact: {
    address: { id: "Jl. Gaming Zone, Discord, Magelang 56122", en: "Jl. Gaming Zone, Discord, Magelang 56122" },
    email: "halo@titiktiga.studio",
    phone: "+62 812 3456 7890",
    hours: { id: "Senin–Jumat, 09.00–17.00 WIB", en: "Monday–Friday, 09.00–17.00 WIB" },
  },
  featuredProductIds: ["prd-001", "prd-003", "prd-005", "prd-012", "prd-008", "prd-015"],
  featuredCategorySlugs: ["poster", "stationery", "objek", "tipografi"],
  store: {
    name: "Titiktiga",
    tagline: { id: "Studio kreatif & toko produk desain", en: "Creative studio & design goods shop" },
    shippingFee: 0,
    freeShippingThreshold: 0,
  },
};
