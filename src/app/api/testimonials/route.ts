import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { seedTestimonials } from "@/lib/mock/site";

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
  const { data: initialRows, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let rows = initialRows;
  if (!rows || rows.length === 0) {
    const seedData = seedTestimonials.map((testimonial, position) => ({
      quote: testimonial.quote,
      name: testimonial.name,
      role: testimonial.role,
      avatar: testimonial.avatar,
      position,
    }));

    const { error: seedError } = await supabase.from("testimonials").insert(seedData);
    if (seedError) {
      return NextResponse.json({ error: seedError.message }, { status: 500 });
    }

    const recheck = await supabase
      .from("testimonials")
      .select("*")
      .order("position", { ascending: true })
      .order("name", { ascending: true });

    if (recheck.error) {
      return NextResponse.json({ error: recheck.error.message }, { status: 500 });
    }

    rows = recheck.data ?? [];
  }

  return NextResponse.json(
    (rows ?? []).map((row: any) => ({
      id: row.id,
      quote: json(row.quote),
      name: row.name,
      role: json(row.role),
      avatar: row.avatar,
    }))
  );
}

export async function POST(req: Request) {
  const input = await req.json();
  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      quote: input.quote,
      name: input.name,
      role: input.role,
      avatar: input.avatar ?? "",
      position: input.position ?? 0,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Gagal menambahkan testimoni" }, { status: 400 });
  }

  return NextResponse.json({
    id: data.id,
    quote: json(data.quote),
    name: data.name,
    role: json(data.role),
    avatar: data.avatar,
  }, { status: 201 });
}
