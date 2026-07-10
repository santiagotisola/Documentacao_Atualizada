/**
 * importar-equipamentos-zerotier.mjs
 * Importa dados da planilha "ID ZERO TIER MASTER.xlsx" → MongoDB collection "equipamentos"
 * 
 * Uso: cd axion-ia-api && node --env-file=.env importar-equipamentos-zerotier.mjs
 */

import XLSX from "xlsx";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Mapeamento Aba → ClienteSlug + UF ────────────────────────────────────────

const MAPA_SITES = {
  "2-ECONOMIA":   { slug: "economia",  uf: "GO", fabricanteCol: true },
  "3-IMEPI":      { slug: "imepi",     uf: "PI" },
  "4-BAHIA":      { slug: "ibametro",  uf: "BA" },
  "5-SMTT":       { slug: "smtt",      uf: "MA" },
  "6-STRANS":     { slug: "strans",    uf: "PI" },
  "7-IPEMCE":     { slug: "ipemce",    uf: "CE" },
  "8-DERSE":      { slug: "derse",     uf: "SE" },
  "9-IPEMPE":     { slug: "ipempe",    uf: "PE" },
  "10-SETRANS":   { slug: "setrans",   uf: "PI" },
  "11-IMETROPA":  { slug: "imetropa",  uf: "PA" },
};

// ─── Conectar MongoDB ─────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:admin123@localhost:27017/axion-ia?authSource=admin";
await mongoose.connect(MONGO_URI);
console.log("✓ MongoDB conectado");

// Importar modelo
const { Equipamento } = await import("./src/models/equipamento.model.js");

// ─── Ler planilha ─────────────────────────────────────────────────────────────

const xlsxPath = path.resolve(__dirname, "../Planilha/ID ZERO TIER MASTER.xlsx");
const wb = XLSX.readFile(xlsxPath);

let totalImportados = 0;
let totalIgnorados = 0;
const equipamentos = [];

for (const sheetName of wb.SheetNames) {
  const config = MAPA_SITES[sheetName];
  if (!config) {
    console.log(`⏭  Aba "${sheetName}" ignorada (não mapeada)`);
    continue;
  }

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  // Identificar colunas (a primeira linha de dados é o header)
  // As colunas variam por aba, mas seguem padrão: ID ZeroTier, Rede, Alias, ID AnyDesk, IP, Portas, Zabbix, [Fabricante], Obs
  
  console.log(`\n─── ${sheetName} (${config.slug}) ───`);

  for (const row of rows) {
    const values = Object.values(row);
    
    // Detectar colunas pelo header row (skip headers)
    const cols = Object.keys(row);
    
    // Pegar valores na ordem padrão da planilha
    let zerotierNodeId, redeAxion, alias, anydeskId, zerotierIp, porta, zabbix, fabricante, observacoes;

    // A planilha tem layout variável, mas os campos sempre seguem a ordem:
    // [ID ZeroTier] [Rede Axion] [AnyDesk Alias] [ID AnyDesk] [IP ZeroTier] [Portas] [Zabbix] [Fabricante/Obs] [Obs]
    
    if (config.fabricanteCol) {
      // Aba ECONOMIA tem coluna extra "FABRICANTE"
      zerotierNodeId = String(row[cols[0]] || "").trim();
      redeAxion      = String(row[cols[1]] || "").trim();
      alias          = String(row[cols[2]] || "").trim();
      anydeskId      = String(row[cols[3]] || "").trim();
      zerotierIp     = String(row[cols[4]] || "").trim();
      porta          = row[cols[5]];
      zabbix         = String(row[cols[6]] || "").trim();
      fabricante     = String(row[cols[7]] || "").trim();
      observacoes    = String(row[cols[8]] || "").trim();
    } else {
      zerotierNodeId = String(row[cols[0]] || "").trim();
      redeAxion      = String(row[cols[1]] || "").trim();
      alias          = String(row[cols[2]] || "").trim();
      anydeskId      = String(row[cols[3]] || "").trim();
      zerotierIp     = String(row[cols[4]] || "").trim();
      porta          = row[cols[5]];
      zabbix         = String(row[cols[6]] || "").trim();
      observacoes    = String(row[cols[7]] || "").trim();
      fabricante     = "";
    }

    // Skip header row e linhas de instrução
    if (!alias || alias === "ANYDESK ALIAS" || alias === "-" || alias === "") {
      // Se tem alias vazio mas tem AnyDesk, tenta pegar do AnyDesk
      if (!alias && anydeskId && anydeskId !== "ID ANYDESK" && anydeskId !== "-") {
        alias = anydeskId;
      } else {
        totalIgnorados++;
        continue;
      }
    }

    // Normalizar valores
    const isNaRede = redeAxion === "SIM";
    const nodeId = (zerotierNodeId && zerotierNodeId !== "-" && zerotierNodeId !== "ID ZERO TIER" && /^[A-F0-9]{10}$/i.test(zerotierNodeId)) ? zerotierNodeId : null;
    const ip = (zerotierIp && zerotierIp !== "-" && zerotierIp !== "IP ZERO TIER" && zerotierIp.startsWith("172.27")) ? zerotierIp : null;
    const portaNum = (typeof porta === "number" && porta > 0) ? porta : (parseInt(porta) > 0 ? parseInt(porta) : 80);
    const zabbixStatus = (zabbix === "OK") ? "OK" : (zabbix === "w" ? "pendente" : "nao_configurado");
    const anyId = (anydeskId && anydeskId !== "-" && anydeskId !== "ID ANYDESK") ? String(anydeskId).replace(/\s/g, "") : null;

    // Detectar tipo pelo alias/observações
    let tipo = "ocr";
    const obsLower = (observacoes || "").toLowerCase();
    const aliasLower = alias.toLowerCase();
    if (obsLower.includes("tablet")) tipo = "tablet";
    else if (obsLower.includes("notebook")) tipo = "notebook";
    else if (aliasLower.includes("pl_")) tipo = "ocr"; // placas
    
    // Detectar fabricante
    let fab = "Axion";
    if (fabricante === "Pumatronix") fab = "Pumatronix";
    else if (!isNaRede && !nodeId && config.fabricanteCol) fab = "Pumatronix";

    // Detectar status
    let status = "ativo";
    if (obsLower.includes("desativado")) status = "desativado";
    else if (obsLower.includes("retirado") || obsLower.includes("equipamento retirado")) status = "retirado";
    else if (!isNaRede && !nodeId) status = "desativado";

    equipamentos.push({
      alias,
      clienteSlug: config.slug,
      site: sheetName.replace(/^\d+-/, ""),
      tipo,
      fabricante: fab,
      zerotierNodeId: nodeId,
      zerotierIp: ip,
      redeAxion: isNaRede,
      anydeskAlias: alias.includes("@ad") ? alias : null,
      anydeskId: anyId,
      porta: portaNum,
      zabbix: zabbixStatus,
      status,
      observacoes: observacoes || null,
      uf: config.uf,
    });
  }
}

// ─── Bulk Write ───────────────────────────────────────────────────────────────

console.log(`\n═══ Importando ${equipamentos.length} equipamentos ═══\n`);

const BATCH = 100;
for (let i = 0; i < equipamentos.length; i += BATCH) {
  const batch = equipamentos.slice(i, i + BATCH);
  const ops = batch.map(eq => ({
    updateOne: {
      filter: { alias: eq.alias },
      update: { $set: eq },
      upsert: true,
    }
  }));
  const result = await Equipamento.bulkWrite(ops);
  console.log(`  Batch ${Math.floor(i / BATCH) + 1}: ${result.upsertedCount} inseridos, ${result.modifiedCount} atualizados`);
  totalImportados += result.upsertedCount + result.modifiedCount;
}

// ─── Resultado ────────────────────────────────────────────────────────────────

const total = await Equipamento.countDocuments();
const naRede = await Equipamento.countDocuments({ redeAxion: true });

console.log(`\n✅ Importação concluída!`);
console.log(`   Total na collection: ${total}`);
console.log(`   Na rede ZeroTier: ${naRede}`);
console.log(`   Linhas ignoradas (headers/instruções): ${totalIgnorados}`);

await mongoose.disconnect();
