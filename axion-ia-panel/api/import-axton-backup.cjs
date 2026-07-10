const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

function parseMongoJSON(raw) {
  // Remove BOM if present
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  let json = raw
    .replace(/ObjectId\("([^"]+)"\)/g, '"$1"')
    .replace(/ISODate\("([^"]+)"\)/g, '"$1"')
    .replace(/NumberLong\(([^)]+)\)/g, '$1')
    .replace(/NumberInt\(([^)]+)\)/g, '$1')
    .replace(/NumberDecimal\("([^"]+)"\)/g, '$1')
    .replace(/BinData\(\d+,\s*"[^"]*"\)/g, 'null');
  return JSON.parse(json);
}

(async () => {
  const c = await MongoClient.connect('mongodb://admin:admin123@localhost:27017/?authSource=admin');
  const db = c.db('AxTon');

  // Limpar collections existentes
  const cols = await db.listCollections().toArray();
  for (const col of cols) await db.dropCollection(col.name);

  const backupDir = path.resolve(__dirname, '..', 'AxTon', 'Database', 'backup');
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const colName = file.replace('.json', '');
    try {
      const raw = fs.readFileSync(path.join(backupDir, file), 'utf8');
      const data = parseMongoJSON(raw);
      if (Array.isArray(data) && data.length > 0) {
        await db.collection(colName).insertMany(data);
        console.log(`${colName}: ${data.length} docs`);
      }
    } catch (e) {
      console.log(`${colName}: ERRO - ${e.message.substring(0, 100)}`);
    }
  }
  await c.close();
  console.log('\n✅ Importação concluída!');
})();
