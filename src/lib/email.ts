import nodemailer from "nodemailer";
import { applicationUrl, optionalEnv, requiredEnv } from "@/lib/runtime-env";

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
  await transporter.sendMail({
    from: optionalEnv("SMTP_FROM", user),
    to: email,
    subject: "Verifikasi akun Titiktiga",
    html: `<p>Halo ${name},</p><p>Verifikasi akun Anda dengan membuka tautan berikut:</p><p><a href="${url}">${url}</a></p><p>Tautan berlaku selama 24 jam.</p>`,
  });
}
