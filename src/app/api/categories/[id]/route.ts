import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

function parseJson(value: unknown, fallback: unknown = "") {
  if (typeof value !== "string") return value ?? fallback;
  try { return JSON.parse(value); } catch { return value || fallback; }
}

function mapCategory(r: any) {
  return {
    id: r.id,
    slug: r.slug,
    name: parseJson(r.name, { id: "", en: "" }),
    description: parseJson(r.description, { id: "", en: "" }),
    image: r.image_url,
    order: r.order_index,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await req.json();
  const fields: string[] = [];
  const values: unknown[] = [];
  const add = (column: string, value: unknown) => {
    if (value !== undefined) {
      fields.push(`${column}=?`);
      values.push(value);
    }
  };

  add("slug", input.slug);
  add("name", input.name === undefined ? undefined : JSON.stringify(input.name));
  add("description", input.description === undefined ? undefined : JSON.stringify(input.description));
  add("image_url", input.image);
  add("order_index", input.order);

  if (fields.length) {
    await pool.execute(`UPDATE categories SET ${fields.join(", ")} WHERE id=?`, [...values, id] as any[]);
  }
  const [rows] = await pool.execute("SELECT * FROM categories WHERE id=?", [id]);
  const row = (rows as any[])[0];
  if (!row) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  return NextResponse.json(mapCategory(row));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.execute("DELETE FROM categories WHERE id=?", [id]);
  return NextResponse.json(true);
}
