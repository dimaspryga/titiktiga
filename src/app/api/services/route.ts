import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { seedServices } from "@/lib/mock/site";

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
  const { data: initialServices, error } = await supabase
    .from("services")
    .select("*, service_deliverables(label, position)")
    .order("index_label", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let services = initialServices;
  if (!services || services.length === 0) {
    for (const service of seedServices) {
      const { data: createdService } = await supabase
        .from("services")
        .insert({
          slug: service.slug,
          index_label: service.index,
          title: service.title,
          description: service.description,
          price_from: service.priceFrom,
          image_url: service.image ?? "",
        })
        .select()
        .single();

      if (createdService && service.deliverables?.length) {
        const deliverables = service.deliverables.map((label: any, position: number) => ({
          service_id: createdService.id,
          label,
          position,
        }));
        await supabase.from("service_deliverables").insert(deliverables);
      }
    }

    const recheck = await supabase
      .from("services")
      .select("*, service_deliverables(label, position)")
      .order("index_label", { ascending: true });

    services = recheck.data ?? [];
  }

  const result = (services ?? []).map((service: any) => {
    const sortedDeliverables = (service.service_deliverables ?? []).sort(
      (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
    );
    return {
      id: service.id,
      slug: service.slug,
      index: service.index_label,
      title: json(service.title),
      description: json(service.description),
      deliverables: sortedDeliverables.map((item: any) => json(item.label)),
      priceFrom: Number(service.price_from),
      image: service.image_url ?? "",
    };
  });

  return NextResponse.json(result);
}
