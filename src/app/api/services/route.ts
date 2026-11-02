import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/mysql";
import { seedServices } from "@/lib/mock/site";

const json = (value: unknown, fallback: unknown = {}) => typeof value === "string" ? (() => { try { return JSON.parse(value); } catch { return fallback; } })() : (value ?? fallback);

export async function GET() {
  let [rows] = await pool.execute("SELECT * FROM services ORDER BY index_label");
  if (!(rows as any[]).length) {
    for (const service of seedServices) {
      const id = randomUUID();
      await pool.execute("INSERT INTO services(id,slug,index_label,title,description,price_from) VALUES (?,?,?,?,?,?)", [id, service.slug, service.index, JSON.stringify(service.title), JSON.stringify(service.description), service.priceFrom]);
      for (let position = 0; position < service.deliverables.length; position++) {
        await pool.execute("INSERT INTO service_deliverables(id,service_id,label,position) VALUES (UUID(),?,?,?)", [id, JSON.stringify(service.deliverables[position]), position]);
      }
    }
    [rows] = await pool.execute("SELECT * FROM services ORDER BY index_label");
  }
  const result: any[] = [];
  for (const service of rows as any[]) {
    const [deliverables] = await pool.execute("SELECT label FROM service_deliverables WHERE service_id=? ORDER BY position", [service.id]);
    result.push({ id: service.id, slug: service.slug, index: service.index_label, title: json(service.title), description: json(service.description), deliverables: (deliverables as any[]).map((item) => json(item.label)), priceFrom: Number(service.price_from) });
  }
  return NextResponse.json(result);
}
