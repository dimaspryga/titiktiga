import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { seedPortfolio } from "@/lib/mock/site";

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

export async function GET() {
  const { data: initialProjects, error } = await supabase
    .from("portfolio_projects")
    .select("*, portfolio_images(url, position)")
    .order("year", { ascending: false })
    .order("title", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let projects = initialProjects;
  if (!projects || projects.length === 0) {
    for (const project of seedPortfolio) {
      const { data: createdProject, error: createError } = await supabase
        .from("portfolio_projects")
        .insert({
          slug: project.slug,
          title: project.title,
          client: project.client,
          category: project.category,
          year: project.year,
          cover_url: project.cover,
          description: project.description,
          service_tags: project.services,
        })
        .select()
        .single();

      if (createError || !createdProject) {
        return NextResponse.json(
          { error: createError?.message ?? "Gagal menambahkan data portofolio awal" },
          { status: 500 }
        );
      }

      if (createdProject && project.images?.length) {
        const images = project.images.map((url: string, position: number) => ({
          project_id: createdProject.id,
          url,
          position,
        }));
        const { error: imagesError } = await supabase.from("portfolio_images").insert(images);
        if (imagesError) {
          const { error: cleanupError } = await supabase
            .from("portfolio_projects")
            .delete()
            .eq("id", createdProject.id);
          return NextResponse.json(
            {
              error: imagesError.message,
              ...(cleanupError && { cleanupError: cleanupError.message }),
            },
            { status: 500 }
          );
        }
      }
    }

    const recheck = await supabase
      .from("portfolio_projects")
      .select("*, portfolio_images(url, position)")
      .order("year", { ascending: false })
      .order("title", { ascending: true });

    if (recheck.error) {
      return NextResponse.json({ error: recheck.error.message }, { status: 500 });
    }

    projects = recheck.data ?? [];
  }

  const result = (projects ?? []).map((project: any) => {
    const sortedImages = (project.portfolio_images ?? []).sort(
      (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
    );
    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      client: project.client,
      category: json(project.category),
      year: project.year,
      cover: project.cover_url ?? "",
      images: sortedImages.map((image: any) => image.url),
      description: json(project.description),
      services: json(project.service_tags, []),
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const input = await req.json();
  const { data: project, error } = await supabase
    .from("portfolio_projects")
    .insert({
      slug: input.slug,
      title: input.title,
      client: input.client,
      category: input.category,
      year: input.year,
      cover_url: input.cover ?? "",
      description: input.description,
      service_tags: input.services ?? [],
    })
    .select()
    .single();

  if (error || !project) {
    return NextResponse.json({ error: error?.message ?? "Gagal menambahkan project" }, { status: 400 });
  }

  if (Array.isArray(input.images) && input.images.length > 0) {
    const images = input.images.map((url: string, position: number) => ({
      project_id: project.id,
      url,
      position,
    }));
    const { error: imagesError } = await supabase.from("portfolio_images").insert(images);
    if (imagesError) {
      const { error: cleanupError } = await supabase.from("portfolio_projects").delete().eq("id", project.id);
      return NextResponse.json(
        {
          error: imagesError.message,
          ...(cleanupError && { cleanupError: cleanupError.message }),
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    id: project.id,
    slug: project.slug,
    title: project.title,
    client: project.client,
    category: json(project.category),
    year: project.year,
    cover: project.cover_url,
    images: input.images ?? [],
    description: json(project.description),
    services: json(project.service_tags, []),
  }, { status: 201 });
}
