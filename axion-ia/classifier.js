import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const kb = require('./kb.json');

export function classificarMensagem(mensagem) {
  mensagem = mensagem.toLowerCase();

  for (const key in kb) {
    const item = kb[key];

    const encontrou = item.keywords.some(p =>
      mensagem.includes(p)
    );

    if (encontrou) {
      return item;
    }
  }

  return null;
}
