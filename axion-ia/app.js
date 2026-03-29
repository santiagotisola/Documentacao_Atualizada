import readline from 'readline';
import { gerarResposta } from './engine.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 AxionIA iniciada...");
console.log("Digite sua dúvida ou problema técnico:\n");

rl.on("line", async (input) => {
  if (!input.trim()) return;
  const resposta = await gerarResposta(input);
  console.log("\n" + resposta + "\n");
});
