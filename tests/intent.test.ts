import { describe, expect, it } from "vitest";
import { sanitizeReturnPath } from "@/lib/services/intent";

describe("sanitizeReturnPath", () => {
  it("allows internal paths", () => {
    expect(sanitizeReturnPath("/products?category=poster&page=2")).toBe("/products?category=poster&page=2");
    expect(sanitizeReturnPath("/checkout")).toBe("/checkout");
  });
  it("falls back on empty or missing values", () => {
    expect(sanitizeReturnPath(null)).toBe("/");
    expect(sanitizeReturnPath(undefined, "/about")).toBe("/about");
    expect(sanitizeReturnPath("", "/about")).toBe("/about");
  });
  it("rejects external URLs", () => {
    expect(sanitizeReturnPath("https://evil.com")).toBe("/");
    expect(sanitizeReturnPath("http://evil.com")).toBe("/");
    expect(sanitizeReturnPath("javascript:alert(1)")).toBe("/");
  });
  it("rejects protocol-relative and encoded slashes", () => {
    expect(sanitizeReturnPath("//evil.com")).toBe("/");
    expect(sanitizeReturnPath("/\\evil.com")).toBe("/");
  });
  it("rejects control characters", () => {
    expect(sanitizeReturnPath("/a\u0000b")).toBe("/");
  });
});
