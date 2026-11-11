import nodemailer from "nodemailer";
import { applicationUrl, optionalEnv } from "@/lib/runtime-env";
import supabase from "@/lib/supabase";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character
  );
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const host = optionalEnv("SMTP_HOST");
  const user = optionalEnv("SMTP_USER");
  const pass = optionalEnv("SMTP_PASS");
  if (!host || !user || !pass) throw new Error("Konfigurasi SMTP belum lengkap");

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass: pass.replace(/\s/g, "") },
  });
  const baseUrl = applicationUrl();
  const url = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  let branding = { logo: "", footer: "Tim Titiktiga", accent: "#dfff00" };
  try {
    const { data } = await supabase
      .from("engagement_content")
      .select("content")
      .limit(1)
      .maybeSingle();

    const stored = typeof data?.content === "string" ? JSON.parse(data.content) : data?.content;
    branding = { ...branding, ...(stored?.emailBranding ?? {}) };
  } catch {
    // Email tetap dapat dikirim dengan branding bawaan jika tabel belum tersedia.
  }
  const safeName = escapeHtml(name);
  const logo = branding.logo
    ? `<img src="${escapeHtml(branding.logo)}" alt="Titiktiga" style="max-height:44px;max-width:180px" />`
    : `<strong style="font-size:24px;letter-spacing:-1px">titiktiga<span style="color:${escapeHtml(branding.accent)}">.</span></strong>`;
  await transporter.sendMail({
    from: optionalEnv("SMTP_FROM", user),
    to: email,
    subject: "Verifikasi akun Titiktiga",
    html: `<div style="background:#f4f4ef;padding:32px;font-family:Arial,sans-serif;color:#171717"><table role="presentation" style="max-width:560px;width:100%;margin:auto;background:#fff"><tr><td style="padding:28px;border-bottom:1px solid #ddd">${logo}</td></tr><tr><td style="padding:36px 28px"><p>Halo ${safeName},</p><p>Verifikasi akun Anda untuk mulai memakai Titiktiga.</p><p style="margin:28px 0"><a href="${url}" style="display:inline-block;background:${escapeHtml(branding.accent)};color:#171717;text-decoration:none;padding:14px 22px;font-weight:bold">Verifikasi akun</a></p><p style="font-size:12px;color:#666">Atau buka: ${escapeHtml(url)}</p><p style="font-size:12px;color:#666">Tautan berlaku selama 24 jam.</p></td></tr><tr><td style="padding:20px 28px;background:#171717;color:#fff;font-size:12px">${escapeHtml(branding.footer)}</td></tr></table></div>`,
  });
}
