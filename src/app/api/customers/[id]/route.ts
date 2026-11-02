import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;await pool.execute("DELETE FROM users WHERE id=? AND role='customer'",[id]);return NextResponse.json(true)}
