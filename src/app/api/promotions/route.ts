import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/mysql";
import { seedPromotions } from "@/lib/mock/site";

function parseJson(value: unknown, fallback: unknown = {}) {
  if (typeof value !== "string") return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function mapPromotion(r: any) {
  return { id: r.id, placement: r.placement, title: parseJson(r.title), code: r.code ?? null, active: Boolean(r.active) };
}

export async function GET() {
  let [rows] = await pool.execute("SELECT * FROM promotions ORDER BY id");
  let promotions = rows as any[];
  if (!promotions.length) {
    for (const promo of seedPromotions) {
      await pool.execute("INSERT INTO promotions(id, placement, title, code, active) VALUES (?,?,?,?,?)", [randomUUID(), promo.placement, JSON.stringify(promo.title), promo.code, promo.active ? 1 : 0]);
    }
    [rows] = await pool.execute("SELECT * FROM promotions ORDER BY id");
    promotions = rows as any[];
  }
  return NextResponse.json(promotions.map(mapPromotion));
}

export async function POST(req: NextRequest) {
  const input = await req.json();
  const id = randomUUID();
  await pool.execute("INSERT INTO promotions(id, placement, title, code, active) VALUES (?,?,?,?,?)", [id, input.placement, JSON.stringify(input.title), input.code, input.active ? 1 : 0]);
  const [rows] = await pool.execute("SELECT * FROM promotions WHERE id=?", [id]);
  return NextResponse.json(mapPromotion((rows as any[])[0]), { status: 201 });
}
