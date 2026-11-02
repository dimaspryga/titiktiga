import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

function parseJson(value: unknown, fallback: unknown = "") {
  if (typeof value !== "string") return value ?? fallback;
  try { return JSON.parse(value); } catch { return value || fallback; }
}

function mapCategory(r: any) {
  return { id: r.id, slug: r.slug, name: parseJson(r.name, { id: "", en: "" }), description: parseJson(r.description, { id: "", en: "" }), image: r.image_url, order: r.order_index };
}

export async function GET(){const [rows]=await pool.execute("SELECT * FROM categories ORDER BY order_index, name");return NextResponse.json((rows as any[]).map(mapCategory))}
export async function POST(req:NextRequest){const i=await req.json();const id=require("crypto").randomUUID();await pool.execute("INSERT INTO categories(id,slug,name,description,image_url,order_index) VALUES (?,?,?,?,?,?)",[id,i.slug,JSON.stringify(i.name),JSON.stringify(i.description),i.image,i.order??0]);const [rows]=await pool.execute("SELECT * FROM categories WHERE id=?",[id]);return NextResponse.json(mapCategory((rows as any[])[0]),{status:201})}
