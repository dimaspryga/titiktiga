import { beforeEach, describe, expect, it } from "vitest";
import { voucherRepo } from "@/lib/repositories";
import { useMockDb } from "@/lib/repositories/db";

describe("voucherRepo.check", () => {
  beforeEach(() => {
    useMockDb.setState({ ...useMockDb.getState(), vouchers: useMockDb.getState().vouchers });
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
