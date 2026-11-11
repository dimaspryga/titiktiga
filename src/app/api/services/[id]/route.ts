import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patch = await req.json();
  const updates: Record<string, unknown> = {};

  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.description !== undefined) updates.description = patch.description;
  if (patch.priceFrom !== undefined) updates.price_from = Number(patch.priceFrom) || 0;
  if (patch.image !== undefined) updates.image_url = String(patch.image ?? "");

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("services").update(updates).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (Array.isArray(patch.deliverables)) {
    await supabase.from("service_deliverables").delete().eq("service_id", id);
    const deliverables = patch.deliverables.map((label: any, position: number) => ({
      service_id: id,
      label,
      position,
    }));
    await supabase.from("service_deliverables").insert(deliverables);
  }

  return NextResponse.json({ ok: true });
}
