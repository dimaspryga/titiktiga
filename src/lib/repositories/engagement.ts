import useSWR from "swr";
import { engagementRepo } from "@/lib/repositories/supabase";

export const useEngagement = () => useSWR("engagement", () => engagementRepo.get());

export const CONSULT_LINKS = {
  whatsapp:
    "https://wa.me/6281234567890?text=" +
    encodeURIComponent("Halo Titiktiga, saya ingin konsultasi layanan desain."),
  discord: "https://discord.gg/titiktiga",
};

export function whatsappUrlFor(message: string): string {
  return `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
}
