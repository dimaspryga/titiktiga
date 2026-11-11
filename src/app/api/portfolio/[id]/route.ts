import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

const json = (value: unknown, fallback: unknown = {}) =>
  typeof value === "string"
    ? (() => {
        try {
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      })()
    : value ?? fallback;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bySlug = req.nextUrl.searchParams.get("by") === "slug";

  const query = supabase
    .from("portfolio_projects")
    .select("*, portfolio_images(url, position)");

  const { data: project, error } = await (bySlug ? query.eq("slug", id) : query.eq("id", id)).single();

  if (error || !project) return NextResponse.json(null, { status: 404 });

  const sortedImages = (project.portfolio_images ?? []).sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );

  return NextResponse.json({
    id: project.id,
    slug: project.slug,
    title: project.title,
    client: project.client,
    category: json(project.category),
    year: project.year,
    cover: project.cover_url,
    images: sortedImages.map((image: any) => image.url),
    description: json(project.description),
    services: json(project.service_tags, []),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await req.json();
  const updates: Record<string, unknown> = {};

  if (input.slug !== undefined) updates.slug = input.slug;
  if (input.title !== undefined) updates.title = input.title;
  if (input.client !== undefined) updates.client = input.client;
  if (input.category !== undefined) updates.category = input.category;
  if (input.year !== undefined) updates.year = input.year;
  if (input.cover !== undefined) updates.cover_url = input.cover;
  if (input.description !== undefined) updates.description = input.description;
  if (input.services !== undefined) updates.service_tags = input.services;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("portfolio_projects").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (Array.isArray(input.images)) {
    await supabase.from("portfolio_images").delete().eq("project_id", id);
    const images = input.images.map((url: string, position: number) => ({
      project_id: id,
      url,
      position,
    }));
    await supabase.from("portfolio_images").insert(images);
  }

  const { data: updated } = await supabase
    .from("portfolio_projects")
    .select("*, portfolio_images(url, position)")
    .eq("id", id)
    .single();

  const sortedImages = (updated?.portfolio_images ?? []).sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );

  return NextResponse.json({
    id: updated.id,
    slug: updated.slug,
    title: updated.title,
    client: updated.client,
    category: json(updated.category),
    year: updated.year,
    cover: updated.cover_url,
    images: sortedImages.map((image: any) => image.url),
    description: json(updated.description),
    services: json(updated.service_tags, []),
  });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(true);
}
