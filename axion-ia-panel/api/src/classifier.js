import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const kb = require('./kb.json');

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function classificarMensagem(mensagem) {
  const msgNorm = normalizar(mensagem);

  for (const key in kb) {
    const item = kb[key];

    const encontrou = item.keywords.some(k =>
      msgNorm.includes(normalizar(k))
    );

    if (encontrou) {
      return item;
    }
  }

  return null;
}
