import mysql from "mysql2/promise";
import { mysqlSslEnabled, mysqlSslRejectUnauthorized, optionalEnv } from "@/lib/runtime-env";

const sslEnabled = mysqlSslEnabled();
const baseOptions = {
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: "Z",
  supportBigNumbers: true,
  ...(sslEnabled ? { ssl: { rejectUnauthorized: mysqlSslRejectUnauthorized() } } : {}),
};

function poolOptionsFromUrl(urlValue: string): mysql.PoolOptions {
  const url = new URL(urlValue);

  return {
    ...baseOptions,
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
  };
}

const mysqlUrl = optionalEnv("MYSQL_URL");
const pool = mysqlUrl
  ? mysql.createPool(poolOptionsFromUrl(mysqlUrl))
  : mysql.createPool({
      ...baseOptions,
      host: optionalEnv("MYSQL_HOST", "127.0.0.1"),
      port: Number(optionalEnv("MYSQL_PORT", "3306")),
      user: optionalEnv("MYSQL_USER", "root"),
      password: optionalEnv("MYSQL_PASSWORD"),
      database: optionalEnv("MYSQL_DATABASE", "titiktiga"),
    });

export default pool;

export async function jsonQuery<T>(sql: string, params: unknown[] = []): Promise<T> {
  const [rows] = await pool.execute(sql, params as mysql.ExecuteValues);
  return rows as T;
}
