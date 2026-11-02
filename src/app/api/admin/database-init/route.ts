import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";

function connectionOptions(): mysql.ConnectionOptions {
  if (process.env.MYSQL_URL) {
    const url = new URL(process.env.MYSQL_URL);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
      ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
    };
  }

  return {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "titiktiga",
  };
}

function prepareSql(sql: string) {
  return sql
    .replace(/^DROP DATABASE IF EXISTS[^;]*;?/i, "")
    .replace(/^CREATE DATABASE[^;]*;?/i, "")
    .replace(/^USE\s+[^;]*;?/i, "")
    .replace(/CREATE TABLE\s+(?!IF NOT EXISTS)/gi, "CREATE TABLE IF NOT EXISTS ")
    .replace(/^INSERT INTO\s+/gim, "INSERT IGNORE INTO ");
}

export async function POST(request: NextRequest) {
  const secret = process.env.DB_INIT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "DB_INIT_SECRET belum dikonfigurasi" }, { status: 503 });
  }

  const suppliedSecret = request.headers.get("x-init-secret") ?? "";
  if (suppliedSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sqlPath = path.join(process.cwd(), "database", "mysql.sql");
    const source = await fs.readFile(sqlPath, "utf8");
    const connection = await mysql.createConnection(connectionOptions());
    let statements = 0;

    try {
      for (const statement of prepareSql(source).split(";").map((item) => item.trim()).filter(Boolean)) {
        await connection.query(statement);
        statements += 1;
      }
    } finally {
      await connection.end();
    }

    return NextResponse.json({ initialized: true, statements });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Database initialization failed",
    }, { status: 500 });
  }
}
