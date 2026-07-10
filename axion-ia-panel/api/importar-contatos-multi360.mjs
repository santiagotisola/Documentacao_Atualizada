/**
 * importar-contatos-multi360.mjs
 * Script de importação da planilha Multi360 (Google Contacts CSV) → MongoDB
 * 
 * Uso: node --env-file=.env importar-contatos-multi360.mjs [arquivo.csv]
 * 
 * O que faz:
 * 1. Lê o CSV exportado do Google Contacts
 * 2. Normaliza telefones (remove +, espaços, garante formato 55DDXXXXXXXXX)
 * 3. Deduz UF pelo DDD
 * 4. Importa no MongoDB (collection "contatos")
 * 5. Faz match com sessões WhatsApp existentes (preenche interações)
 * 6. Gera relatório de importação
 */

import { readFileSync } from "fs";
import { parse } from "path";
import mongoose from "mongoose";
import { Contato } from "./src/models/contato.model.js";
import { WhatsAppSessao } from "./src/models/whatsapp-sessao.model.js";

// === Configuração ===
const CSV_PATH = process.argv[2] || "../contatos-multi360-google-2026-05-20.csv";
const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:admin123@localhost:27017/axion-ia?authSource=admin";

// === Mapa DDD → UF ===
const DDD_UF = {
  "61": "DF", "62": "GO", "64": "GO", "63": "TO",
  "65": "MT", "66": "MT", "67": "MS",
  "11": "SP", "12": "SP", "13": "SP", "14": "SP", "15": "SP", "16": "SP", "17": "SP", "18": "SP", "19": "SP",
  "21": "RJ", "22": "RJ", "24": "RJ",
  "27": "ES", "28": "ES",
  "31": "MG", "32": "MG", "33": "MG", "34": "MG", "35": "MG", "37": "MG", "38": "MG",
  "41": "PR", "42": "PR", "43": "PR", "44": "PR", "45": "PR", "46": "PR",
  "47": "SC", "48": "SC", "49": "SC",
  "51": "RS", "53": "RS", "54": "RS", "55": "RS",
  "68": "AC", "69": "RO",
  "71": "BA", "73": "BA", "74": "BA", "75": "BA", "77": "BA",
  "79": "SE",
  "81": "PE", "87": "PE",
  "82": "AL",
  "83": "PB",
  "84": "RN",
  "85": "CE", "88": "CE",
  "86": "PI", "89": "PI",
  "91": "PA", "93": "PA", "94": "PA",
  "92": "AM", "97": "AM",
  "95": "RR", "96": "AP",
  "98": "MA", "99": "MA",
};

// === Parser CSV simples (sem dependência externa) ===
function parseCSV(text) {
  const lines = text.split("\n");
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ""; });
    rows.push(obj);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// === Normalização ===
function normalizarTelefone(phone) {
  const digits = phone.replace(/\D/g, "");
  // Se começa com 55 e tem 12-13 dígitos, está OK
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  // Se tem 10-11 dígitos (sem país), adicionar 55
  if (digits.length >= 10 && digits.length <= 11) return "55" + digits;
  return digits;
}

function extrairDDD(telefoneLimpo) {
  if (telefoneLimpo.startsWith("55") && telefoneLimpo.length >= 4) {
    return telefoneLimpo.substring(2, 4);
  }
  return telefoneLimpo.substring(0, 2);
}

function extrairLinhaWA(groupMembership) {
  const match = groupMembership?.match(/WHATSAPP\s+(\d+)/);
  return match ? match[1] : null;
}

// === Main ===
async function main() {
  console.log("📥 Importação Multi360 → AxionIA CRM");
  console.log("─".repeat(50));
  
  // Ler CSV
  const csvText = readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(csvText);
  console.log(`📄 Arquivo: ${CSV_PATH}`);
  console.log(`📊 Total de registros: ${rows.length}`);
  
  // Conectar MongoDB
  await mongoose.connect(MONGO_URI);
  console.log("📦 MongoDB conectado");
  
  // Stats
  let importados = 0;
  let atualizados = 0;
  let ignorados = 0;
  let erros = 0;
  
  // Processar em lotes de 500
  const BATCH = 500;
  const ops = [];
  
  for (const row of rows) {
    const phoneRaw = row["Phone 1 - Value"];
    if (!phoneRaw) { ignorados++; continue; }
    
    const telefoneLimpo = normalizarTelefone(phoneRaw);
    if (telefoneLimpo.length < 10) { ignorados++; continue; }
    
    const ddd = extrairDDD(telefoneLimpo);
    const uf = DDD_UF[ddd] || "";
    const linhaWA = extrairLinhaWA(row["Group Membership"]);
    
    const nome = row["Name"] || row["Given Name"] || "Desconhecido";
    const primeiroNome = row["Given Name"] || "";
    const sobrenome = [row["Additional Name"], row["Family Name"]].filter(Boolean).join(" ").trim();
    
    ops.push({
      updateOne: {
        filter: { telefone: phoneRaw.trim() },
        update: {
          $set: {
            nome: nome.replace(/[""]/g, ""),
            primeiroNome: primeiroNome.replace(/[""]/g, ""),
            sobrenome: sobrenome.replace(/[""]/g, ""),
            telefone: phoneRaw.trim(),
            telefoneLimpo,
            ddd,
            estado: uf,
            empresa: row["Organization 1 - Name"] || null,
            linhaWhatsApp: linhaWA,
            origem: "multi360",
            atualizadoEm: new Date(),
          },
          $setOnInsert: {
            tags: [],
            grupo: "geral",
            produtos: [],
            totalInteracoes: 0,
            totalTickets: 0,
            totalMensagensWA: 0,
            score: 0,
            classificacao: "lead",
            ativo: true,
            importadoEm: new Date(),
          }
        },
        upsert: true,
      }
    });
    
    // Executar lote
    if (ops.length >= BATCH) {
      const result = await Contato.bulkWrite(ops);
      importados += result.upsertedCount;
      atualizados += result.modifiedCount;
      ops.length = 0;
      process.stdout.write(`\r  Processados: ${importados + atualizados + ignorados}/${rows.length}`);
    }
  }
  
  // Lote final
  if (ops.length > 0) {
    const result = await Contato.bulkWrite(ops);
    importados += result.upsertedCount;
    atualizados += result.modifiedCount;
  }
  
  console.log("\n");
  console.log("─".repeat(50));
  console.log("✅ Importação concluída!");
  console.log(`   📥 Novos contatos: ${importados}`);
  console.log(`   🔄 Atualizados:    ${atualizados}`);
  console.log(`   ⏭️  Ignorados:      ${ignorados}`);
  
  // === Enriquecimento: match com sessões WhatsApp ===
  console.log("\n🔗 Enriquecendo com dados de sessões WhatsApp...");
  const sessoes = await WhatsAppSessao.find({ lgpdAceito: true }).lean();
  
  let matches = 0;
  for (const s of sessoes) {
    const updated = await Contato.updateOne(
      { telefoneLimpo: s.telefone },
      {
        $set: {
          lgpdAceito: true,
          lgpdAceitoEm: s.lgpdAceitoEm || s.createdAt,
          ultimaInteracao: s.ultimaMensagem,
        },
        $inc: { totalMensagensWA: 1 },
      }
    );
    if (updated.modifiedCount > 0) matches++;
  }
  console.log(`   🤝 Matches WhatsApp: ${matches} contatos enriquecidos`);
  
  // === Estatísticas finais ===
  const stats = await Contato.aggregate([
    { $group: { _id: "$estado", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  console.log("\n📊 Distribuição por UF:");
  stats.forEach(s => console.log(`   ${s._id || "??"}: ${s.count}`));
  
  const total = await Contato.countDocuments();
  console.log(`\n🏁 Total na base: ${total} contatos`);
  
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
