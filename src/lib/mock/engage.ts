import type { EngagementContent } from "@/lib/types";

const lt = (id: string, en: string) => ({ id, en });

/**
 * Konten engagement (ala Creative-as-a-Service) — data demo, fiktif.
 * Dikelola lewat engagementRepo; belum di-expose ke admin content.
 */
export const seedEngagement: EngagementContent = {
  trustedClients: ["Arska Coffee", "RupaRupa Press", "Senja Skincare", "Titik Temu Collective", "Lokal Goods", "Kios Kreatif"],
  painPoints: [
    {
      id: "pain-1",
      title: lt("Rekrutmen butuh proses panjang?", "Hiring takes forever?"),
      description: lt("Merekrut desainer in-house bisa makan waktu berbulan-bulan — belum retensi dan onboarding.", "Hiring an in-house designer takes months — before retention and onboarding even start."),
    },
    {
      id: "pain-2",
      title: lt("Skill tim terbatas?", "Limited team skills?"),
      description: lt("Butuh banyak jenis desain — logo, kemasan, UI — tapi keahlian tim internal tidak semuanya.", "You need logo, packaging, and UI work — but your in-house team can't cover them all."),
    },
    {
      id: "pain-3",
      title: lt("Biaya operasional membengkak?", "Operation costs piling up?"),
      description: lt("Tim besar berarti gaji, tool, dan ruang kerja. Sering jadi pemborosan saat antrean sedikit.", "A big team means salaries, tools, and space — often wasted when the queue is short."),
    },
    {
      id: "pain-4",
      title: lt("Desain makin lama selesai?", "Designs taking too long?"),
      description: lt("Ukuran dan antrean tim menentukan cepat-lambatnya desain selesai. Antrean kami dikelola harian.", "Team size and queues decide turnaround. Ours is managed daily."),
    },
  ],
  steps: [
    {
      id: "step-1",
      index: "01",
      title: lt("Kirim brief-mu", "Send your brief"),
      description: lt("Ceritakan kebutuhan desain melalui form konsultasi atau grup WhatsApp yang kami siapkan.", "Tell us what you need through the consult form or your dedicated WhatsApp group."),
      image: "/uploads/c22fa21c-bd35-45eb-9afe-3e35271c5f50.png",
    },
    {
      id: "step-2",
      index: "02",
      title: lt("Kami kerjakan & diskusikan", "We design & discuss"),
      description: lt("Permintaan diproses oleh studio — kamu bebas berdiskusi dengan project manager kami.", "Requests are processed by the studio — discuss freely with your project manager."),
      image: "/uploads/31039303-75de-496a-b7c5-32ddefc91014.png",
    },
    {
      id: "step-3",
      index: "03",
      title: lt("Terima hasil & revisi", "Receive & refine"),
      description: lt("Tinjau preview, beri catatan, dan unduh hasil final beserta seluruh source file-nya.", "Review previews, leave notes, and download finals with all source files."),
      image: "/uploads/0218758b-0e77-4540-8b87-d3aec4d107e8.png",
    },
    {
      id: "step-4",
      index: "04",
      title: lt("Pilih revisi", "Choose revisions"),
      description: lt("Masukkan masukan yang masih perlu diperbaiki agar hasil benar-benar cocok dengan brand.", "Add the notes still needed so the result fits your brand."),
      image: "/uploads/c22fa21c-bd35-45eb-9afe-3e35271c5f50.png",
    },
    {
      id: "step-5",
      index: "05",
      title: lt("Proyek siap pakai", "Your project is ready"),
      description: lt("Terima file final dalam format yang telah disepakati dan mulai gunakan untuk bisnismu.", "Receive the agreed final file formats and put them to work for your business."),
      image: "/uploads/31039303-75de-496a-b7c5-32ddefc91014.png",
    },
  ],
  deliverableGroups: [
    {
      id: "fast",
      label: lt("±1 Hari Kerja", "±1 Business Day"),
      items: [
        lt("Post media sosial", "Social media post"),
        lt("Poster & flyer", "Poster & flyer"),
        lt("Desain ads", "Ad creatives"),
        lt("Banner digital", "Digital banner"),
        lt("Kartu nama", "Business card"),
        lt("Template email", "Email template"),
      ],
    },
    {
      id: "deep",
      label: lt("±3 Hari Kerja", "±3 Business Days"),
      items: [
        lt("Logo & identitas", "Logo & identity"),
        lt("Infografis", "Infographic"),
        lt("Ilustrasi 2D", "2D illustration"),
        lt("UI design", "UI design"),
        lt("Desain kemasan", "Packaging"),
        lt("Landing page", "Landing page"),
      ],
    },
  ],
  facilities: [
    {
      id: "fac-1",
      title: lt("Dedicated Project Manager", "Dedicated Project Manager"),
      description: lt("Satu orang yang memahami brand-mu dan memastikan setiap request sesuai standar kualitas studio.", "One person who knows your brand and keeps every request up to studio standard."),
    },
    {
      id: "fac-2",
      title: lt("Papan Manajemen Proyek", "Project Management Board"),
      description: lt("Pantau status seluruh request — masuk, dikerjakan, review, selesai — dalam satu papan.", "Track every request — queued, in progress, review, done — on one board."),
    },
    {
      id: "fac-3",
      title: lt("Grup WhatsApp Khusus", "Dedicated WhatsApp Group"),
      description: lt("Koordinasi harian dengan studio langsung dari grup yang dibuat khusus untuk brand-mu.", "Daily coordination with the studio, right from a group made for your brand."),
    },
    {
      id: "fac-4",
      title: lt("Feedback Langsung di Desain", "Feedback on the Design"),
      description: lt("Beri catatan langsung pada preview desain — revisi jadi presisi, bukan tebak-tebakan.", "Pin comments right on the preview — revisions become precise, not guesswork."),
    },
    {
      id: "fac-5",
      title: lt("Manajemen File Rapi", "Tidy File Management"),
      description: lt("Seluruh hasil terarsip rapi per brand dan per bulan, siap diunduh kapan pun.", "Every deliverable archived per brand and month, ready to download anytime."),
    },
  ],
  benefits: [
    { id: "b-1", label: lt("Flat rate bulanan", "Flat monthly rate") },
    { id: "b-2", label: lt("Revisi tanpa batas", "Unlimited revisions") },
    { id: "b-3", label: lt("Garansi uang kembali 7 hari", "7-day money-back guarantee") },
    { id: "b-4", label: lt("Turnaround cepat", "Fast turnaround") },
    { id: "b-5", label: lt("Unlimited brand", "Unlimited brands") },
    { id: "b-6", label: lt("70+ jenis layanan", "70+ service types") },
    { id: "b-7", label: lt("Request tanpa batas", "Unlimited requests") },
    { id: "b-8", label: lt("Hak cipta penuh", "Full copyrights") },
    { id: "b-9", label: lt("Quality control berlapis", "Strict quality control") },
  ],
  faq: [
    {
      id: "faq-1",
      question: lt("Apa itu langganan Titiktiga dan bagaimana cara kerjanya?", "What is a Titiktiga subscription and how does it work?"),
      answer: lt("Langganan Titiktiga adalah model Creative-as-a-Service: satu biaya bulanan untuk akses studio desain tanpa proses rekrutmen. Pilih paket, kirim request sesuka perlu, dan pantau progresnya di papan manajemen proyek.", "A Titiktiga subscription is Creative-as-a-Service: one monthly fee for studio access without hiring. Pick a plan, send unlimited requests, and track progress on the project board."),
    },
    {
      id: "faq-2",
      question: lt("Jenis desain apa saja yang bisa saya minta?", "What kinds of design can I request?"),
      answer: lt("70+ jenis: identitas brand, media sosial, kemasan, editorial, ilustrasi, hingga UI design. Daftar lengkap ada di halaman Layanan — kalau tidak ada di daftar, tanyakan saja.", "70+ types: brand identity, social media, packaging, editorial, illustration, even UI design. The full list is on the Services page — if it's not listed, just ask."),
    },
    {
      id: "faq-3",
      question: lt("Bagaimana sistem pembayarannya?", "How does billing work?"),
      answer: lt("Flat rate bulanan yang ditagih di awal periode. Paket 3 bulan dan 12 bulan mendapat potongan per bulan. Tanpa biaya tersembunyi —upgrade atau turunkan paket kapan saja.", "A flat monthly rate billed up front. 3- and 12-month plans get monthly discounts. No hidden fees — upgrade or downgrade anytime."),
    },
    {
      id: "faq-4",
      question: lt("Berapa lama satu desain diselesaikan?", "How fast is one design done?"),
      answer: lt("Rata-rata post media sosial ±1 hari kerja; logo, infografis, atau UI ±3 hari kerja. Kompleksitas selalu kami konfirmasi di awal.", "Social media posts average ±1 business day; logos, infographics, or UI ±3 days. We always confirm complexity up front."),
    },
    {
      id: "faq-5",
      question: lt("Bagaimana jika saya tidak puas dengan hasilnya?", "What if I'm not satisfied with the result?"),
      answer: lt("Revisi tanpa batas sampai desain sesuai keinginan. Dan jika dalam 7 hari pertama kamu merasa bukan jodoh, garansi uang kembali berlaku.", "Unlimited revisions until it feels right. And if within the first 7 days it's just not a match, the money-back guarantee applies."),
    },
    {
      id: "faq-6",
      question: lt("Apakah saya mendapatkan hak cipta penuh?", "Do I get full copyright?"),
      answer: lt("Ya — seluruh hasil termasuk aset premium dengan hak komersial penuh atas nama brand-mu, plus source file.", "Yes — everything includes premium assets with full commercial rights under your brand, plus source files."),
    },
  ],
  pricing: {
    periods: [
      { id: "per-1", label: lt("1 Bulan", "1 Month"), months: 1, discountPercent: 0 },
      { id: "per-3", label: lt("3 Bulan", "3 Months"), months: 3, discountPercent: 10 },
      { id: "per-12", label: lt("12 Bulan", "12 Months"), months: 12, discountPercent: 20 },
    ],
    tiers: [
      {
        id: "tier-titik",
        name: "Titik",
        tagline: lt("Desain grafis harian untuk brand yang baru mulai.", "Everyday graphic design for brands getting started."),
        monthlyPrice: 3500000,
        parallelProjects: 1,
        brands: lt("1 brand", "1 brand"),
        features: [
          lt("Logo & identitas dasar", "Logo & basic identity"),
          lt("Post media sosial", "Social media posts"),
          lt("Poster, flyer & ads", "Posters, flyers & ads"),
          lt("Kartu nama & stationery", "Business cards & stationery"),
          lt("Template email", "Email templates"),
        ],
        highlighted: false,
      },
      {
        id: "tier-titik-tiga",
        name: "Titik Tiga",
        tagline: lt("Paket lengkap: grafis, motion, hingga UI.", "The full package: graphics, motion, to UI."),
        monthlyPrice: 6900000,
        parallelProjects: 1,
        brands: lt("Unlimited brand", "Unlimited brands"),
        features: [
          lt("Semua layanan paket Titik", "Everything in Titik"),
          lt("Motion graphic", "Motion graphics"),
          lt("Ilustrasi 2D & infografis", "2D illustration & infographics"),
          lt("UI design & wireframe", "UI design & wireframes"),
          lt("Desain kemasan", "Packaging design"),
        ],
        highlighted: true,
      },
      {
        id: "tier-atelier",
        name: "Atelier",
        tagline: lt("Dua proyek paralel untuk ritme kerja serius.", "Two parallel projects for a serious pace."),
        monthlyPrice: 11500000,
        parallelProjects: 2,
        brands: lt("Unlimited brand", "Unlimited brands"),
        features: [
          lt("Semua layanan paket Titik Tiga", "Everything in Titik Tiga"),
          lt("2 proyek dalam 1 waktu", "2 projects at once"),
          lt("Dedicated project manager", "Dedicated project manager"),
          lt("Prioritas antrean", "Priority queue"),
          lt("Sumber file eksklusif", "Exclusive design resources"),
        ],
        highlighted: false,
      },
    ],
    allInclude: [
      lt("Desain & revisi tanpa batas", "Unlimited designs & revisions"),
      lt("Source file lengkap", "Complete source files"),
      lt("Aset stock premium", "Premium stock assets"),
      lt("Hak cipta komersial penuh", "Full commercial copyright"),
      lt("Quality control berlapis", "Layered quality control"),
      lt("Garansi uang kembali 7 hari", "7-day money-back guarantee"),
    ],
    customTitle: lt("Butuh paket yang lebih personal?", "Need something more personal?"),
    customBody: lt("Ceritakan kebutuhan dan anggaranmu — kami rancang paket custom yang pas untuk bisnismu.", "Tell us your needs and budget — we'll shape a custom package that fits."),
  },
};
