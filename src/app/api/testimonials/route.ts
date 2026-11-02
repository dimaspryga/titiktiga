import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/mysql";
import { seedTestimonials } from "@/lib/mock/site";

const json = (value: unknown, fallback: unknown = {}) => typeof value === "string" ? (() => { try { return JSON.parse(value); } catch { return fallback; } })() : (value ?? fallback);

export async function GET() {
  let [rows] = await pool.execute("SELECT * FROM testimonials ORDER BY position, name");
  if (!(rows as any[]).length) {
    for (let position = 0; position < seedTestimonials.length; position++) {
      const testimonial = seedTestimonials[position];
      await pool.execute("INSERT INTO testimonials(id,quote,name,role,avatar,position) VALUES (?,?,?,?,?,?)", [randomUUID(), JSON.stringify(testimonial.quote), testimonial.name, JSON.stringify(testimonial.role), testimonial.avatar, position]);
    }
    [rows] = await pool.execute("SELECT * FROM testimonials ORDER BY position, name");
  }
  return NextResponse.json((rows as any[]).map((row) => ({ id: row.id, quote: json(row.quote), name: row.name, role: json(row.role), avatar: row.avatar })));
}
