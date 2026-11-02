import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { seedContent } from "@/lib/mock/site";
export async function GET(){const [rows]=await pool.execute("SELECT content FROM site_content WHERE id=1");const stored=(rows as any[])[0]?.content ?? {};const c=typeof stored === "string" ? JSON.parse(stored) : stored;return NextResponse.json({...seedContent,...c,store:{...seedContent.store,...(c.store ?? {})}})}
export async function PATCH(req:NextRequest){const c=await req.json();await pool.execute("UPDATE site_content SET content=? WHERE id=1",[JSON.stringify(c)]);return NextResponse.json(c)}
