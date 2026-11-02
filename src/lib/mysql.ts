import mysql from "mysql2/promise";

const sslEnabled = process.env.MYSQL_SSL === "true";
const baseOptions = {
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: "Z",
  supportBigNumbers: true,
  ...(sslEnabled ? { ssl: { rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false" } } : {}),
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

const pool = process.env.MYSQL_URL
  ? mysql.createPool(poolOptionsFromUrl(process.env.MYSQL_URL))
  : mysql.createPool({
      ...baseOptions,
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? "root",
      password: process.env.MYSQL_PASSWORD ?? "",
      database: process.env.MYSQL_DATABASE ?? "titiktiga",
    });

export default pool;

export async function jsonQuery<T>(sql: string, params: unknown[] = []): Promise<T> {
  const [rows] = await pool.execute(sql, params as mysql.ExecuteValues);
  return rows as T;
}
