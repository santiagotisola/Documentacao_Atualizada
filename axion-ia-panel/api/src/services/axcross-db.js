import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server:   process.env.AXCROSS_DB_HOST     || "localhost",
  port:     parseInt(process.env.AXCROSS_DB_PORT) || 1433,
  database: process.env.AXCROSS_DB_NAME     || "AxCross",
  user:     process.env.AXCROSS_DB_USER     || "",
  password: process.env.AXCROSS_DB_PASS     || "",
  options: {
    encrypt:            process.env.AXCROSS_DB_ENCRYPT === "true",
    trustServerCertificate: true
  },
  connectionTimeout: 3000,
  requestTimeout:    5000
};

let pool = null;

/** Atualiza a configuração do banco em runtime (sem reiniciar a API) */
export async function reconfigurar({ host, port, database, user, password, encrypt = false }) {
  if (pool) {
    try { await pool.close(); } catch (_) {}
    pool = null;
  }
  if (host)     config.server   = host;
  if (port)     config.port     = parseInt(port);
  if (database) config.database = database;
  if (user)     config.user     = user;
  if (password !== undefined) config.password = password;
  config.options.encrypt = encrypt === true || encrypt === "true";
  console.log(`🔧 [axcross-db] Configuração atualizada: ${config.server}:${config.port}/${config.database}`);
}

/** Retorna a configuração atual (sem senha) */
export function getConfig() {
  return { server: config.server, port: config.port, database: config.database, user: config.user };
}

export async function conectar() {
  if (pool && pool.connected) return pool;
  if (pool) {
    try { await pool.close(); } catch (_) {}
    pool = null;
  }

  pool = await sql.connect(config);
  pool.on("error", (err) => {
    console.error(`❌ [axcross-db] Erro no pool: ${err.message}`);
    pool = null;
  });
  console.log(`🚦 SQL Server conectado: ${config.server}/${config.database}`);
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
    await p.request().query("SELECT 1 AS ok");
    return { conectado: true, servidor: config.server, banco: config.database };
  } catch (err) {
    return { conectado: false, servidor: config.server, banco: config.database, erro: err.message };
  }
}
