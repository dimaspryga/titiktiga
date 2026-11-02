import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { seedPortfolio } from "@/lib/mock/site";

const json = (value: unknown, fallback: unknown = {}) => typeof value === "string" ? (() => { try { return JSON.parse(value); } catch { return fallback; } })() : (value ?? fallback);

export async function GET() {
  let [rows] = await pool.execute("SELECT * FROM portfolio_projects ORDER BY year DESC, title");
  if (!(rows as any[]).length) {
    for (const project of seedPortfolio) {
      const id = randomUUID();
      await pool.execute("INSERT INTO portfolio_projects(id,slug,title,client,category,year,cover_url,description,service_tags) VALUES (?,?,?,?,?,?,?,?,?)", [id, project.slug, project.title, project.client, JSON.stringify(project.category), project.year, project.cover, JSON.stringify(project.description), JSON.stringify(project.services)]);
      for (let position = 0; position < project.images.length; position++) await pool.execute("INSERT INTO portfolio_images(id,project_id,url,position) VALUES (UUID(),?,?,?)", [id, project.images[position], position]);
    }
    [rows] = await pool.execute("SELECT * FROM portfolio_projects ORDER BY year DESC, title");
  }
  const result: any[] = [];
  for (const project of rows as any[]) {
    const [images] = await pool.execute("SELECT url FROM portfolio_images WHERE project_id=? ORDER BY position", [project.id]);
    result.push({ id: project.id, slug: project.slug, title: project.title, client: project.client, category: json(project.category), year: project.year, cover: project.cover_url, images: (images as any[]).map((image) => image.url), description: json(project.description), services: json(project.service_tags, []) });
  }
  return NextResponse.json(result);
}
