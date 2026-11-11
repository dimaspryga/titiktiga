import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .eq("role", "customer");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(true);
}
