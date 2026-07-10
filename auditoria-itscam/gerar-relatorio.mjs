// Gerador de Relatório de Erros — ITScam 450
// Executar: node auditoria-itscam/gerar-relatorio.mjs
// Saída:    auditoria-itscam/RELATORIO-ERROS.md
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const src   = join(__dir, "validacao-config.json");
const dest  = join(__dir, "RELATORIO-ERROS.md");

const data = JSON.parse(readFileSync(src, "utf8"));
const { resumo, grupos, offline } = data;
const geradoEm = new Date(data.geradoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

// Mapa de IP por nome (de analise-dados.json)
let ipMap = {};
try {
  const ad = JSON.parse(readFileSync(join(__dir, "analise-dados.json"), "utf8"));
  (ad.devices || ad.dispositivos || []).forEach(d => { if (d.ip) ipMap[d.nome] = d.ip; });
} catch (_) {}

const SEV_ICON  = { alto: "🔴", medio: "🟡", baixo: "🟢" };
const SEV_LABEL = { alto: "Alta", medio: "Média", baixo: "Baixa" };

const INSTRUCOES = {
  SNMP_OFF: {
    problema: "SNMP está habilitado, mas o padrão exige que esteja desabilitado.",
    correcao: [
      "Acesse a interface web do equipamento: `http://<IP-do-equipamento>`",
      "Navegue até **Sistema > SNMP**",
      "Desmarque a opção **Habilitar SNMP**",
      "Clique em **Salvar**",
    ],
    obs: "⚠️ Não é possível corrigir via API REST — necessário acesso manual à UI web.",
  },
  NTP_SERVER: {
    problema: "Servidor NTP configurado incorretamente (`200.160.0.8`). Deve ser `time.google.com`.",
    correcao: [
      "Acesse a interface web do equipamento: `http://<IP-do-equipamento>`",
      "Navegue até **Equipamento > Data e Hora**",
      "No campo **Servidor NTP**, substitua `200.160.0.8` por `time.google.com`",
      "Clique em **Salvar**",
    ],
    obs: "⚠️ O endpoint REST `/api/equipment/dateAndTime` retorna HTTP 500 para este campo — necessário acesso manual à UI web.",
  },
};

const FALLBACK_INSTRUCAO = (menu) => ({
  problema: "Valor fora do padrão definido no script de configuração.",
  correcao: [
    `Acesse a interface web do equipamento: \`http://<IP-do-equipamento>\``,
    `Navegue até **${menu}**`,
    "Ajuste o valor conforme indicado na coluna 'Esperado'",
    "Clique em **Salvar**",
  ],
});

function fmtValor(v) {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "Sim (true)" : "Não (false)";
  return String(v);
}

function row(...cols) { return `| ${cols.join(" | ")} |`; }

const L = [];

L.push("# 📋 Relatório de Erros — Frota ITScam 450");
L.push("");
L.push(`> **Gerado em:** ${geradoEm}  `);
L.push(`> **Script padrão:** \`config-padrao/padrao-faixa-{1,2}.json\`  `);
L.push(`> **Regras validadas:** ${data.totalRegras}`);
L.push("");
L.push("---");
L.push("");

// ── Resumo executivo ──────────────────────────────────────────────────────────
L.push("## 📊 Resumo Executivo");
L.push("");
L.push(row("Indicador", "Valor", "Detalhes"));
L.push(row("---", "---", "---"));
L.push(row("Total de equipamentos", resumo.total, "Faixas 1 e 2 de cada ponto"));
L.push(row("✅ Conformes", `**${resumo.conformes}**`, `${resumo.percentConformes}% do total`));
L.push(row("⚠️ Com erros", `**${resumo.alterados}**`, `${grupos.length} grupo(s) de problemas`));
L.push(row("📡 Offline", `**${resumo.offline}**`, "Sem comunicação — verificar fisicamente"));
L.push("");
const blocos = Math.round(resumo.percentConformes / 5);
const barra  = "█".repeat(blocos) + "░".repeat(20 - blocos);
L.push(`**Conformidade:** \`[${barra}] ${resumo.percentConformes}%\``);
L.push("");
L.push("---");
L.push("");

// ── Seção de Erros ────────────────────────────────────────────────────────────
if (grupos.length === 0) {
  L.push("## ✅ Nenhum erro encontrado");
  L.push("");
  L.push("Todos os equipamentos online estão em conformidade com o script padrão.");
} else {
  L.push("## ❌ Erros a Corrigir");
  L.push("");
  L.push(`> **${resumo.alterados} equipamento(s)** com divergências em **${grupos.length} grupo(s)**:`);
  L.push("");
  grupos.forEach((g, i) => {
    const titles = g.alteracoes.map(a => a.titulo).join(" + ");
    const devs   = g.dispositivos.map(d => d.nome).join(", ");
    L.push(`- [Grupo ${i + 1}: ${titles}](#grupo-${i + 1}) — ${devs}`);
  });
  L.push("");
  L.push("---");
  L.push("");

  grupos.forEach((g, idx) => {
    L.push(`### Grupo ${idx + 1}`);
    L.push("");
    g.alteracoes.forEach(alt => {
      const sev  = SEV_ICON[alt.severidade] || "⚪";
      const inst = INSTRUCOES[alt.id] || FALLBACK_INSTRUCAO(alt.menu);
      L.push(`#### ${sev} ${alt.titulo}`);
      L.push("");
      L.push("| Campo | Valor |");
      L.push("|---|---|");
      L.push(`| **Severidade** | ${SEV_LABEL[alt.severidade] || alt.severidade} |`);
      L.push(`| **Localização na UI** | ${alt.menu} |`);
      L.push(`| **Valor atual** | \`${fmtValor(alt.valorAtual)}\` |`);
      L.push(`| **Valor esperado** | \`${fmtValor(alt.valorEsperado)}\` |`);
      L.push("");
      L.push(`**Problema:** ${inst.problema}`);
      L.push("");
      L.push("**Como corrigir:**");
      inst.correcao.forEach((step, i) => L.push(`${i + 1}. ${step}`));
      if (inst.obs) { L.push(""); L.push(inst.obs); }
      L.push("");
    });
    L.push(`**Equipamentos afetados (${g.dispositivos.length}):**`);
    L.push("");
    L.push(row("Equipamento", "Faixa", "Score", "IP / Acesso Web"));
    L.push(row("---", "---", "---", "---"));
    g.dispositivos.forEach(d => {
      const ip   = ipMap[d.nome] || d.ip || "—";
      const link = ip !== "—" ? `[\`${ip}\`](http://${ip})` : "—";
      L.push(row(d.nome, `F${d.faixa}`, `${d.score}%`, link));
    });
    L.push("");
    L.push("---");
    L.push("");
  });
}

// ── Seção Offline ─────────────────────────────────────────────────────────────
L.push("## 📡 Equipamentos Offline");
L.push("");
if (offline.length === 0) {
  L.push("> Nenhum equipamento offline no momento.");
} else {
  L.push(`> **${offline.length} equipamento(s)** sem comunicação. Não é possível validar ou corrigir remotamente.`);
  L.push("");
  L.push(row("Equipamento", "Endereço IP", "UUID (Varco Cloud)", "Ação recomendada"));
  L.push(row("---", "---", "---", "---"));
  offline.forEach(d => {
    L.push(row(d.nome, d.ip || "—", `\`${d.uuid}\``, "🔧 Verificar fisicamente no local"));
  });
  L.push("");
  L.push("### Passos para verificação física");
  L.push("");
  L.push("1. Deslocar equipe técnica ao ponto de instalação");
  L.push("2. Verificar alimentação elétrica do equipamento");
  L.push("3. Verificar cabo de rede / conexão 4G do roteador");
  L.push("4. Verificar LED de status do equipamento:");
  L.push("   - 🟢 Verde piscando = operacional");
  L.push("   - 🔴 Vermelho = falha de hardware");
  L.push("   - ⚫ Apagado = sem energia");
  L.push("5. Reinicializar o equipamento se necessário");
  L.push("6. Após restaurar a comunicação, re-executar a validação");
}

L.push("");
L.push("---");
L.push("");
L.push("## 🔄 Como re-executar este relatório");
L.push("");
L.push("```bash");
L.push("# 1. Recoleta dados da frota (≈90s)");
L.push("node auditoria-itscam/recoletar-dados.mjs");
L.push("");
L.push("# 2. Valida configurações e atualiza validacao-config.json");
L.push("node auditoria-itscam/validar-config.mjs");
L.push("");
L.push("# 3. Gera este relatório");
L.push("node auditoria-itscam/gerar-relatorio.mjs");
L.push("```");
L.push("");
L.push("---");
L.push("");
L.push("*Relatório gerado automaticamente pelo sistema de auditoria ITScam — Axion Tecnologia*");

const md = L.join("\n");
writeFileSync(dest, md, "utf8");
console.log(`✅ Relatório salvo: auditoria-itscam/RELATORIO-ERROS.md`);
console.log(`   Tamanho: ${(md.length / 1024).toFixed(1)}KB`);
console.log(`   Erros: ${resumo.alterados} equipamento(s) | Offline: ${resumo.offline}`);
