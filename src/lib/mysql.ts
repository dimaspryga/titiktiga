import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? "titiktiga",
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: "Z",
  supportBigNumbers: true,
});

export default pool;

export async function jsonQuery<T>(sql: string, params: unknown[] = []): Promise<T> {
  const [rows] = await pool.execute(sql, params as mysql.ExecuteValues);
  return rows as T;
}
