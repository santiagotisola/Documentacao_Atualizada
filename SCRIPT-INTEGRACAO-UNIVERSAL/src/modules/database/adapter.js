import sql from "mssql";

/**
 * ADAPTADOR MULTI-BANCO
 * Abstrai conexões a SQL Server, MySQL, PostgreSQL.
 * Configurações vêm do .env.
 */

const pools = new Map(); // Cache de conexões ativas

// ============================================
// CONFIGURAÇÕES DE CONEXÃO
// ============================================
function getConfigs() {
  const configs = {};

  // ERP Principal
  if (process.env.ERP_DB_HOST) {
    configs.erp_principal = {
      tipo: process.env.ERP_DB_TYPE || "mysql",
      host: process.env.ERP_DB_HOST,
      port: parseInt(process.env.ERP_DB_PORT) || 3306,
      database: process.env.ERP_DB_NAME,
      user: process.env.ERP_DB_USER,
      password: process.env.ERP_DB_PASS
    };
  }

  // SQL Extra 1
  if (process.env.SQL1_HOST) {
    configs.sql_1 = {
      tipo: process.env.SQL1_TYPE || "sql_server",
      host: process.env.SQL1_HOST,
      port: parseInt(process.env.SQL1_PORT) || 1433,
      database: process.env.SQL1_DB,
      user: process.env.SQL1_USER,
      password: process.env.SQL1_PASS,
      encrypt: process.env.SQL1_ENCRYPT === "true"
    };
  }

  // SQL Extra 2
  if (process.env.SQL2_HOST) {
    configs.sql_2 = {
      tipo: process.env.SQL2_TYPE || "sql_server",
      host: process.env.SQL2_HOST,
      port: parseInt(process.env.SQL2_PORT) || 1433,
      database: process.env.SQL2_DB,
      user: process.env.SQL2_USER,
      password: process.env.SQL2_PASS,
      encrypt: process.env.SQL2_ENCRYPT === "true"
    };
  }

  return configs;
}

// ============================================
// INICIALIZAÇÃO
// ============================================
async function inicializarConexoes() {
  const configs = getConfigs();

  for (const [id, config] of Object.entries(configs)) {
    try {
      if (config.tipo === "sql_server") {
        const pool = await conectarSQLServer(config);
        pools.set(id, { tipo: "sql_server", pool });
        console.log(`  ✅ Banco ${id} (SQL Server) conectado`);
      } else if (config.tipo === "mysql") {
        const pool = await conectarMySQL(config);
        pools.set(id, { tipo: "mysql", pool });
        console.log(`  ✅ Banco ${id} (MySQL) conectado`);
      } else if (config.tipo === "postgresql") {
        const pool = await conectarPostgreSQL(config);
        pools.set(id, { tipo: "postgresql", pool });
        console.log(`  ✅ Banco ${id} (PostgreSQL) conectado`);
      }
    } catch (err) {
      console.log(`  ⚠️ Banco ${id} não conectado: ${err.message}`);
    }
  }
}

// ============================================
// CONECTORES POR TIPO
// ============================================
async function conectarSQLServer(config) {
  const sqlConfig = {
    server: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    options: {
      encrypt: config.encrypt || false,
      trustServerCertificate: true
    },
    connectionTimeout: 10000,
    requestTimeout: 15000
  };
  return sql.connect(sqlConfig);
}

async function conectarMySQL(config) {
  const mysql = await import("mysql2/promise");
  return mysql.default.createPool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 10000
  });
}

async function conectarPostgreSQL(config) {
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 10,
    connectionTimeoutMillis: 10000
  });
  // Testar conexão
  const client = await pool.connect();
  client.release();
  return pool;
}

// ============================================
// OPERAÇÕES GENÉRICAS
// ============================================

/**
 * Executa query em qualquer banco configurado
 * @param {string} sistemaId - ID do banco (erp_principal, sql_1, etc.)
 * @param {string} query - Query SQL com @param0, @param1... para parâmetros
 * @param {Array} params - Array de valores para os parâmetros
 */
async function executarQuery(sistemaId, queryStr, params = []) {
  const conexao = pools.get(sistemaId);
  if (!conexao) throw new Error(`Banco '${sistemaId}' não está conectado. Verifique configuração no .env`);

  switch (conexao.tipo) {
    case "sql_server":
      return executarQuerySQLServer(conexao.pool, queryStr, params);
    case "mysql":
      return executarQueryMySQL(conexao.pool, queryStr, params);
    case "postgresql":
      return executarQueryPostgreSQL(conexao.pool, queryStr, params);
    default:
      throw new Error(`Tipo de banco não suportado: ${conexao.tipo}`);
  }
}

async function executarQuerySQLServer(pool, queryStr, params) {
  const request = pool.request();
  params.forEach((valor, idx) => {
    request.input(`param${idx}`, valor);
  });
  const result = await request.query(queryStr);
  return result.recordset;
}

async function executarQueryMySQL(pool, queryStr, params) {
  // Converter @param0, @param1... para ? (formato MySQL)
  let mysqlQuery = queryStr;
  const mysqlParams = [];
  params.forEach((valor, idx) => {
    mysqlQuery = mysqlQuery.replace(new RegExp(`@param${idx}`, "g"), "?");
    mysqlParams.push(valor);
  });
  const [rows] = await pool.execute(mysqlQuery, mysqlParams);
  return rows;
}

async function executarQueryPostgreSQL(pool, queryStr, params) {
  // Converter @param0, @param1... para $1, $2... (formato PostgreSQL)
  let pgQuery = queryStr;
  params.forEach((_, idx) => {
    pgQuery = pgQuery.replace(new RegExp(`@param${idx}`, "g"), `$${idx + 1}`);
  });
  const result = await pool.query(pgQuery, params);
  return result.rows;
}

/**
 * Testa conexão com banco específico
 */
async function testarConexao(sistemaId) {
  try {
    const resultado = await executarQuery(sistemaId, "SELECT 1 as ok");
    return { conectado: true, sistema: sistemaId };
  } catch (err) {
    return { conectado: false, sistema: sistemaId, erro: err.message };
  }
}

/**
 * Lista tabelas de um banco
 */
async function listarTabelas(sistemaId) {
  const conexao = pools.get(sistemaId);
  if (!conexao) throw new Error(`Banco '${sistemaId}' não conectado`);

  let query;
  switch (conexao.tipo) {
    case "sql_server":
      query = "SELECT TABLE_NAME as nome, TABLE_TYPE as tipo FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME";
      break;
    case "mysql":
      query = "SELECT TABLE_NAME as nome, TABLE_TYPE as tipo FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME";
      break;
    case "postgresql":
      query = "SELECT tablename as nome, 'BASE TABLE' as tipo FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename";
      break;
  }

  return executarQuery(sistemaId, query);
}

/**
 * Status geral de todas as conexões
 */
function statusGeral() {
  const status = {};
  for (const [id, conn] of pools) {
    status[id] = { tipo: conn.tipo, conectado: true };
  }
  return status;
}

// ============================================
// EXPORTAÇÃO
// ============================================
export const dbAdapter = {
  inicializarConexoes,
  executarQuery,
  testarConexao,
  listarTabelas,
  statusGeral
};
