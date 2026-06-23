import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server:   process.env.AXHUB_DB_HOST     || "localhost",
  port:     parseInt(process.env.AXHUB_DB_PORT) || 1433,
  database: process.env.AXHUB_DB_NAME     || "AxHub",
  user:     process.env.AXHUB_DB_USER     || "",
  password: process.env.AXHUB_DB_PASS     || "",
  options: {
    encrypt:            process.env.AXHUB_DB_ENCRYPT === "true",
    trustServerCertificate: true
  },
  connectionTimeout: 10000,
  requestTimeout:    15000
};

let pool = null;

export async function conectar() {
  // Reconnect se o pool foi fechado ou perdeu conexão
  if (pool && pool.connected) return pool;
  if (pool) {
    try { await pool.close(); } catch (_) {}
    pool = null;
  }

  pool = await sql.connect(config);
  // Limpar referência em caso de erro fatal no pool
  pool.on("error", (err) => {
    console.error(`❌ [axhub-db] Erro no pool: ${err.message}`);
    pool = null;
  });
  console.log(`🗄️  SQL Server conectado: ${config.server}/${config.database}`);
  return pool;
}

export async function desconectar() {
  if (pool) {
    try { await pool.close(); } catch (_) {}
    pool = null;
  }
}

export function getPool() {
  return pool;
}

export async function testarConexao() {
  try {
    const p = await conectar();
    const result = await p.request().query("SELECT 1 AS ok");
    return { conectado: true, servidor: config.server, banco: config.database };
  } catch (err) {
    return { conectado: false, servidor: config.server, banco: config.database, erro: err.message };
  }
}

export { sql };
