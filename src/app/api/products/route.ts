import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/mysql";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const page = Math.max(1, Number(q.get("page") ?? 1)); const perPage = Math.max(1, Number(q.get("perPage") ?? 8));
  const where: string[]=[]; const params: any[]=[];
  if (q.get("includeDrafts") !== "true") { where.push("p.status='active'"); }
  if (q.get("category")) { where.push("p.category_slug=?"); params.push(q.get("category")); }
  if (q.get("q")) { where.push("p.name LIKE ?"); params.push(`%${q.get("q")}%`); }
  if (q.get("inStockOnly") === "true") where.push("p.stock>0");
  if (q.get("discountOnly") === "true") where.push("p.discount_percent>0");
  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM products p ${sqlWhere}`, params);
  const sort = q.get("sort") === "price-asc" ? "p.price ASC" : q.get("sort") === "price-desc" ? "p.price DESC" : q.get("sort") === "name-asc" ? "p.name ASC" : "p.created_at DESC";
  const [rows] = await pool.execute(`SELECT p.* FROM products p ${sqlWhere} ORDER BY ${sort} LIMIT ? OFFSET ?`, [...params, perPage, (page-1)*perPage]);
  const products = await Promise.all((rows as any[]).map(async p => mapProduct(p)));
  const total = Number((countRows as any[])[0].total);
  return NextResponse.json({items:products,total,page,perPage,hasMore:page*perPage<total});
}

export async function POST(req: NextRequest) {
  const input=await req.json(); const id=randomUUID();
  await pool.execute("INSERT INTO products (id,slug,name,category_slug,price,discount_percent,short_description,description,stock,featured,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [id,input.slug,input.name,input.category || null,input.price,input.discountPercent ?? null,JSON.stringify(input.shortDescription),JSON.stringify(input.description),input.stock,input.featured,input.status]);
  await saveImages(id,input.images ?? []); await saveSpecs(id,input.specs ?? []);
  return NextResponse.json(await mapProduct((await pool.execute("SELECT * FROM products WHERE id=?",[id]))[0][0]),{status:201});
}

async function mapProduct(p:any) { const [images]=await pool.execute("SELECT url FROM product_images WHERE product_id=? ORDER BY position",[p.id]); const [specs]=await pool.execute("SELECT label,value FROM product_specs WHERE product_id=? ORDER BY position",[p.id]); return {id:p.id,slug:p.slug,name:p.name,category:p.category_slug??"",price:Number(p.price),discountPercent:p.discount_percent,images:(images as any[]).map(x=>x.url),shortDescription:p.short_description,description:p.description,specs:(specs as any[]).map(x=>({label:x.label,value:x.value})),stock:p.stock,featured:Boolean(p.featured),status:p.status,createdAt:p.created_at}; }
async function saveImages(id:string,images:string[]) { await pool.execute("DELETE FROM product_images WHERE product_id=?",[id]); for(let i=0;i<images.length;i++) await pool.execute("INSERT INTO product_images(id,product_id,url,position) VALUES (?,?,?,?)",[randomUUID(),id,images[i],i]); }
async function saveSpecs(id:string,specs:any[]) { await pool.execute("DELETE FROM product_specs WHERE product_id=?",[id]); for(let i=0;i<specs.length;i++) await pool.execute("INSERT INTO product_specs(id,product_id,label,value,position) VALUES (?,?,?,?,?)",[randomUUID(),id,JSON.stringify(specs[i].label),specs[i].value,i]); }
