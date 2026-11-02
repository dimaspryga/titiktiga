import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

const json = (value: unknown, fallback: unknown = {}) => typeof value === "string" ? (() => { try { return JSON.parse(value); } catch { return fallback; } })() : (value ?? fallback);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bySlug = req.nextUrl.searchParams.get("by") === "slug";
  const [rows] = await pool.execute(`SELECT * FROM portfolio_projects WHERE ${bySlug ? "slug" : "id"}=? LIMIT 1`, [id]);
  const project = (rows as any[])[0];
  if (!project) return NextResponse.json(null, { status: 404 });
  const [images] = await pool.execute("SELECT url FROM portfolio_images WHERE project_id=? ORDER BY position", [project.id]);
  return NextResponse.json({ id: project.id, slug: project.slug, title: project.title, client: project.client, category: json(project.category), year: project.year, cover: project.cover_url, images: (images as any[]).map((image) => image.url), description: json(project.description), services: json(project.service_tags, []) });
}
