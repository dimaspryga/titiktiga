import { describe, expect, it } from "vitest";
import { contactSchema } from "../src/lib/validation/schemas";

describe("contact form schema", () => {
  it("trims fields and accepts an empty optional phone number", () => {
    const result = contactSchema.safeParse({
      name: "  Titik Tiga  ",
      email: " studio@example.com ",
      phone: " ",
      message: "  Mari diskusikan proyek desain ini.  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "Titik Tiga",
        email: "studio@example.com",
        phone: "",
        message: "Mari diskusikan proyek desain ini.",
      });
    }
  });

  it("rejects oversized values", () => {
    const result = contactSchema.safeParse({
      name: "A".repeat(101),
      email: "studio@example.com",
      phone: "",
      message: "A".repeat(5001),
    });

    expect(result.success).toBe(false);
  });
});
