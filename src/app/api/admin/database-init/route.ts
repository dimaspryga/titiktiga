import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import { mysqlSslEnabled, mysqlSslRejectUnauthorized, optionalEnv, requiredEnv } from "@/lib/runtime-env";

function connectionOptions(): mysql.ConnectionOptions {
  const mysqlUrl = optionalEnv("MYSQL_URL");
  if (mysqlUrl) {
    const url = new URL(mysqlUrl);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
      ssl: mysqlSslEnabled() ? { rejectUnauthorized: mysqlSslRejectUnauthorized() } : undefined,
    };
  }

  return {
    host: optionalEnv("MYSQL_HOST", "127.0.0.1"),
    port: Number(optionalEnv("MYSQL_PORT", "3306")),
    user: optionalEnv("MYSQL_USER", "root"),
    password: optionalEnv("MYSQL_PASSWORD"),
    database: optionalEnv("MYSQL_DATABASE", "titiktiga"),
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
  let secret: string;
  try {
    secret = requiredEnv("DB_INIT_SECRET");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "DB_INIT_SECRET belum dikonfigurasi" }, { status: 503 });
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
