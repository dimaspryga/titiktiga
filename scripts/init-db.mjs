import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

function connectionOptions() {
  const mysqlUrl = process.env.MYSQL_URL?.trim();
  if (mysqlUrl) {
    const url = new URL(mysqlUrl);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
      multipleStatements: false,
      ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
    };
  }

  return {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "titiktiga",
    multipleStatements: false,
  };
}

function prepareSql(sql) {
  return sql
    .replace(/^DROP DATABASE IF EXISTS[^;]*;?/i, "")
    .replace(/^CREATE DATABASE[^;]*;?/i, "")
    .replace(/^USE\s+[^;]*;?/i, "")
    .replace(/CREATE TABLE\s+(?!IF NOT EXISTS)/gi, "CREATE TABLE IF NOT EXISTS ")
    .replace(/^INSERT INTO\s+/gim, "INSERT IGNORE INTO ");
}

async function main() {
  const sqlPath = path.join(process.cwd(), "database", "mysql.sql");
  const source = await fs.readFile(sqlPath, "utf8");
  const connection = await mysql.createConnection(connectionOptions());
  let statementCount = 0;

  try {
    for (const statement of prepareSql(source).split(";").map((item) => item.trim()).filter(Boolean)) {
      await connection.query(statement);
      statementCount += 1;
    }
  } finally {
    await connection.end();
  }

  console.log(`Database initialized successfully (${statementCount} statements).`);
}

main().catch((error) => {
  console.error("Database initialization failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
