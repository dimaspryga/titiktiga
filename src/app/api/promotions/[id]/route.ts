import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

function parseJson(value: unknown) {
  if (typeof value !== "string") return value ?? {};
  try { return JSON.parse(value); } catch { return {}; }
}

function mapPromotion(r: any) {
  return { id: r.id, placement: r.placement, title: parseJson(r.title), code: r.code ?? null, active: Boolean(r.active) };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await req.json();
  const fields: string[] = [];
  const values: unknown[] = [];
  const add = (column: string, value: unknown) => {
    if (value !== undefined) { fields.push(`${column}=?`); values.push(value); }
  };
  add("placement", input.placement);
  add("title", input.title === undefined ? undefined : JSON.stringify(input.title));
  add("code", input.code);
  if (input.active !== undefined) add("active", input.active ? 1 : 0);
  if (fields.length) await pool.execute(`UPDATE promotions SET ${fields.join(", ")} WHERE id=?`, [...values, id] as any[]);
  const [rows] = await pool.execute("SELECT * FROM promotions WHERE id=?", [id]);
  const row = (rows as any[])[0];
  if (!row) return NextResponse.json({ error: "Promosi tidak ditemukan" }, { status: 404 });
  return NextResponse.json(mapPromotion(row));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.execute("DELETE FROM promotions WHERE id=?", [id]);
  return NextResponse.json(true);
}
