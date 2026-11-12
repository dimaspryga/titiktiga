import { NextRequest, NextResponse } from "next/server";
import { currentAuth } from "@/lib/auth-session";
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
    detailCover: p.detail_cover ?? null,
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const by = req.nextUrl.searchParams.get("by");

  const query = supabase
    .from("products")
    .select("*, product_images(url, position), product_specs(label, value, position)");

  const { data, error } = await (by === "slug" ? query.eq("slug", id) : query.eq("id", id)).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json(null, { status: 404 });
  if (data.status !== "active") {
    const auth = await currentAuth();
    if (auth?.role !== "admin") return NextResponse.json(null, { status: 404 });
  }
  return NextResponse.json(mapProduct(data));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await req.json();
  const updates: Record<string, unknown> = {};

  if (input.slug !== undefined) updates.slug = input.slug;
  if (input.name !== undefined) updates.name = input.name;
  if (input.category !== undefined) updates.category_slug = input.category || null;
  if (input.price !== undefined) updates.price = input.price;
  if (input.discountPercent !== undefined) updates.discount_percent = input.discountPercent;
  if (input.rating !== undefined) updates.rating = input.rating;
  if (input.detailCover !== undefined) updates.detail_cover = input.detailCover || null;
  if (input.stock !== undefined) updates.stock = input.stock;
  if (input.featured !== undefined) updates.featured = Boolean(input.featured);
  if (input.status !== undefined) updates.status = input.status;
  if (input.shortDescription !== undefined) updates.short_description = input.shortDescription;
  if (input.description !== undefined) updates.description = input.description;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("products").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (Array.isArray(input.images)) {
    const { error: deleteImagesError } = await supabase.from("product_images").delete().eq("product_id", id);
    if (deleteImagesError) {
      return NextResponse.json({ error: deleteImagesError.message }, { status: 500 });
    }
    const images = input.images.map((url: string, position: number) => ({
      product_id: id,
      url,
      position,
    }));
    if (images.length > 0) {
      const { error: imagesError } = await supabase.from("product_images").insert(images);
      if (imagesError) return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }
  }

  if (Array.isArray(input.specs)) {
    const { error: deleteSpecsError } = await supabase.from("product_specs").delete().eq("product_id", id);
    if (deleteSpecsError) {
      return NextResponse.json({ error: deleteSpecsError.message }, { status: 500 });
    }
    const specs = input.specs.map((spec: any, position: number) => ({
      product_id: id,
      label: spec.label,
      value: spec.value,
      position,
    }));
    if (specs.length > 0) {
      const { error: specsError } = await supabase.from("product_specs").insert(specs);
      if (specsError) return NextResponse.json({ error: specsError.message }, { status: 500 });
    }
  }

  const { data: fullProduct, error: fullProductError } = await supabase
    .from("products")
    .select("*, product_images(url, position), product_specs(label, value, position)")
    .eq("id", id)
    .single();

  if (fullProductError || !fullProduct) {
    return NextResponse.json(
      { error: fullProductError?.message ?? "Produk tidak ditemukan" },
      { status: fullProductError ? 500 : 404 }
    );
  }

  return NextResponse.json(mapProduct(fullProduct));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(true);
}
