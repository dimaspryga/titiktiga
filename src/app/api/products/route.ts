import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function mapProduct(p: any) {
  const sortedImages = (p.product_images ?? []).sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );
  const sortedSpecs = (p.product_specs ?? []).sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category_slug ?? "",
    price: Number(p.price),
    discountPercent: p.discount_percent,
    rating: p.rating == null ? null : Number(p.rating),
    images: sortedImages.map((x: any) => x.url),
    shortDescription: parseJson(p.short_description),
    description: parseJson(p.description),
    specs: sortedSpecs.map((x: any) => ({
      label: parseJson(x.label),
      value: x.value,
    })),
    stock: p.stock ?? 0,
    featured: Boolean(p.featured),
    status: p.status ?? "draft",
    createdAt: p.created_at,
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const page = Math.max(1, Number(q.get("page") ?? 1));
  const perPage = Math.max(1, Number(q.get("perPage") ?? 8));

  let query = supabase
    .from("products")
    .select("*, product_images(url, position), product_specs(label, value, position)", { count: "exact" });

  if (q.get("includeDrafts") !== "true") {
    query = query.eq("status", "active");
  }
  if (q.get("category")) {
    query = query.eq("category_slug", q.get("category"));
  }
  if (q.get("q")) {
    query = query.ilike("name", `%${q.get("q")}%`);
  }
  if (q.get("inStockOnly") === "true") {
    query = query.gt("stock", 0);
  }
  if (q.get("discountOnly") === "true") {
    query = query.gt("discount_percent", 0);
  }

  const sort = q.get("sort");
  if (sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else if (sort === "name-asc") {
    query = query.order("name", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const offset = (page - 1) * perPage;
  query = query.range(offset, offset + perPage - 1);

  const { data: rows, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  const products = (rows ?? []).map(mapProduct);

  return NextResponse.json({
    items: products,
    total,
    page,
    perPage,
    hasMore: page * perPage < total,
  });
}

export async function POST(req: NextRequest) {
  const input = await req.json();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      slug: input.slug,
      name: input.name,
      category_slug: input.category || null,
      price: input.price,
      discount_percent: input.discountPercent ?? null,
      rating: input.rating ?? null,
      short_description: input.shortDescription,
      description: input.description,
      stock: input.stock ?? 0,
      featured: Boolean(input.featured),
      status: input.status ?? "draft",
    })
    .select()
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: error?.message ?? "Gagal menambahkan produk" },
      { status: 400 }
    );
  }

  if (Array.isArray(input.images) && input.images.length > 0) {
    const images = input.images.map((url: string, position: number) => ({
      product_id: product.id,
      url,
      position,
    }));
    await supabase.from("product_images").insert(images);
  }

  if (Array.isArray(input.specs) && input.specs.length > 0) {
    const specs = input.specs.map((spec: any, position: number) => ({
      product_id: product.id,
      label: spec.label,
      value: spec.value,
      position,
    }));
    await supabase.from("product_specs").insert(specs);
  }

  const { data: fullProduct } = await supabase
    .from("products")
    .select("*, product_images(url, position), product_specs(label, value, position)")
    .eq("id", product.id)
    .single();

  return NextResponse.json(mapProduct(fullProduct), { status: 201 });
}
