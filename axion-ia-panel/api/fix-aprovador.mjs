import { MongoClient } from "mongodb";

const c = await MongoClient.connect("mongodb://admin:admin123@localhost:27017/axion-ia?authSource=admin");
const db = c.db();

// Corrigir aprovador
await db.collection("pedido_compras").updateOne(
  { codigo: "PC-2026-000004" },
  { $set: { "aprovacoes.0.aprovador": "5562984085383" } }
);

const p = await db.collection("pedido_compras").findOne({ codigo: "PC-2026-000004" });
console.log("Aprovador corrigido:", p.aprovacoes[0].aprovador);

await c.close();
