import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/api/axios";
import { voucherRepo } from "@/lib/repositories";
import { useMockDb } from "@/lib/repositories/db";

describe("voucherRepo.check", () => {
  beforeEach(() => {
    useMockDb.setState({ ...useMockDb.getState(), vouchers: useMockDb.getState().vouchers });

    vi.spyOn(apiClient, "request").mockImplementation(async (config: any) => {
      if (config.url === "/vouchers/check" && (config.method === "POST" || config.method === undefined)) {
        const { code, subtotal, categories = [] } = config.data;
        const v = useMockDb
          .getState()
          .vouchers.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());

        if (!v) return { data: { ok: false, error: "invalid" } } as any;
        if (!v.active) return { data: { ok: false, error: "inactive" } } as any;

        const today = new Date().toISOString().slice(0, 10);
        if (today < v.startDate || today > v.expiryDate) {
          return { data: { ok: false, error: "expired" } } as any;
        }
        if (v.usageLimit != null && v.usedCount >= v.usageLimit) {
          return { data: { ok: false, error: "limit" } } as any;
        }
        if (subtotal < v.minPurchase) {
          return { data: { ok: false, error: "min-purchase" } } as any;
        }
        if (v.eligibleCategories?.length) {
          const match = categories.some((c: string) =>
            v.eligibleCategories?.map((x: string) => x.toLowerCase()).includes(c.toLowerCase())
          );
          if (!match) return { data: { ok: false, error: "category" } } as any;
        }
        return { data: { ok: true, voucher: v } } as any;
      }
      return { data: null } as any;
    });
  });

  it("accepts a valid active voucher", async () => {
    const result = await voucherRepo.check("TITIK20", 500000);
    expect(result.ok).toBe(true);
  });

  it("is case-insensitive and trims input", async () => {
    const result = await voucherRepo.check("  titik20 ", 500000);
    expect(result.ok).toBe(true);
  });

  it("rejects unknown codes", async () => {
    const result = await voucherRepo.check("TIDAKADA", 500000);
    expect(result).toEqual({ ok: false, error: "invalid" });
  });

  it("rejects expired/inactive vouchers", async () => {
    // LAMACOMBO di-seed nonaktif + kedaluwarsa; status nonaktif terdeteksi lebih dulu.
    expect(await voucherRepo.check("LAMACOMBO", 500000)).toEqual({ ok: false, error: "inactive" });
  });

  it("rejects below minimum purchase", async () => {
    const result = await voucherRepo.check("TITIK20", 100000);
    expect(result).toEqual({ ok: false, error: "min-purchase" });
  });

  it("rejects when no cart category matches eligibility", async () => {
    const result = await voucherRepo.check("POSTER10", 100000, ["objek"]);
    expect(result).toEqual({ ok: false, error: "category" });
  });

  it("accepts when category eligibility matches", async () => {
    const result = await voucherRepo.check("POSTER10", 100000, ["poster"]);
    expect(result.ok).toBe(true);
  });
});
