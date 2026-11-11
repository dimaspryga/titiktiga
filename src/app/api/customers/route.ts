import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, email, phone, created_at, orders(id, total, status)")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = (users ?? []).map((u: any) => {
    const validOrders = (u.orders ?? []).filter((o: any) => o.status !== "cancelled");
    const totalSpent = validOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      joinedAt: u.created_at,
      ordersCount: (u.orders ?? []).length,
      totalSpent,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const i = await req.json();

  const { data: u, error } = await supabase
    .from("users")
    .insert({
      name: i.name,
      email: i.email,
      phone: i.phone ?? "",
      password_hash: "admin-created",
      role: "customer",
    })
    .select()
    .single();

  if (error || !u) {
    return NextResponse.json({ error: error?.message ?? "Gagal menambahkan pelanggan" }, { status: 400 });
  }

  return NextResponse.json(
    {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      joinedAt: u.created_at,
      ordersCount: 0,
      totalSpent: 0,
    },
    { status: 201 }
  );
}
