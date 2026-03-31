import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server:   process.env.AXTON_DB_HOST     || "localhost",
  port:     parseInt(process.env.AXTON_DB_PORT) || 1433,
  database: process.env.AXTON_DB_NAME     || "AxTon",
  user:     process.env.AXTON_DB_USER     || "",
  password: process.env.AXTON_DB_PASS     || "",
  options: {
    encrypt:            process.env.AXTON_DB_ENCRYPT === "true",
    trustServerCertificate: true
  },
  connectionTimeout: 10000,
  requestTimeout:    15000
};

let pool = null;

export async function conectar() {
  if (pool) return pool;
  pool = await sql.connect(config);
  console.log(`⚖️  SQL Server conectado: ${config.server}/${config.database}`);
  return pool;
}

export async function desconectar() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export function getPool() {
  return pool;
}

export async function testarConexao() {
  try {
    const p = await conectar();
    await p.request().query("SELECT 1 AS ok");
    return { conectado: true, servidor: config.server, banco: config.database };
  } catch (err) {
    return { conectado: false, servidor: config.server, banco: config.database, erro: err.message };
  }
}
