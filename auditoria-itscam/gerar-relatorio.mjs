/**
 * Gera relatório de comparação a partir dos dados já coletados em _ALL_DEVICES.json
 * Uso: node auditoria-itscam/gerar-relatorio.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = './auditoria-itscam/resultados';
const ALL_DEVICES_FILE = join(OUTPUT_DIR, '_ALL_DEVICES.json');

function deepDiff(ref, target, path) {
  const diffs = [];
  if (ref === null || target === null) {
    if (ref !== target) diffs.push({ path, ref, target, tipo: 'valor_diferente' });
    return diffs;
  }
  if (typeof ref !== typeof target) {
    diffs.push({ path, ref, target, tipo: 'tipo_diferente' });
    return diffs;
  }
  if (Array.isArray(ref)) {
    if (!Array.isArray(target)) {
      diffs.push({ path, tipo: 'tipo_diferente', ref: 'array', target: typeof target });
      return diffs;
    }
    if (ref.length !== target.length) {
      diffs.push({ path, tipo: 'tamanho_array', ref: ref.length, target: target.length });
    }
    const maxLen = Math.min(ref.length, target.length);
    for (let i = 0; i < maxLen; i++) {
      diffs.push(...deepDiff(ref[i], target[i], `${path}[${i}]`));
    }
    return diffs;
  }
  if (typeof ref === 'object') {
    const allKeys = new Set([...Object.keys(ref), ...Object.keys(target)]);
    for (const key of allKeys) {
      if (['_timestamp', 'active', 'uptime', 'temperature', 'cpuUsage', 'memUsage', 'diskUsage'].includes(key)) continue;
      if (!(key in ref)) {
        diffs.push({ path: `${path}.${key}`, tipo: 'campo_extra', target: target[key] });
      } else if (!(key in target)) {
        diffs.push({ path: `${path}.${key}`, tipo: 'campo_ausente', ref: ref[key] });
      } else {
        diffs.push(...deepDiff(ref[key], target[key], `${path}.${key}`));
      }
    }
    return diffs;
  }
  if (ref !== target) {
    diffs.push({ path, ref, target, tipo: 'valor_diferente' });
  }
  return diffs;
}

function generateComparisonReport(results) {
  const report = {
    metadata: {
      dataColeta: new Date().toISOString(),
      totalEquipamentos: results.length,
      equipamentosComErro: results.filter(r => r._error).length,
      equipamentosOk: results.filter(r => !r._error).length,
    },
    porMenu: {},
    resumoPorEquipamento: {},
  };

  const referencia = results.find(r => r._device?.name?.includes('GOEC6O058') && r._device?.name?.includes('Faixa 1'));
  if (!referencia || referencia._error) {
    report.metadata.aviso = 'Equipamento referência (GOEC6O058 Faixa 1) não disponível';
    return report;
  }

  report.metadata.referencia = referencia._device.name;

  for (const [menuKey, menuData] of Object.entries(referencia.menus || {})) {
    report.porMenu[menuKey] = { endpoints: {}, divergenciasCount: 0 };

    for (const [endpoint, epData] of Object.entries(menuData)) {
      const refConfig = epData.data;
      const comparisons = [];

      for (const result of results) {
        if (result._error || result === referencia) continue;
        const deviceMenuData = result.menus?.[menuKey]?.[endpoint]?.data;
        if (!deviceMenuData) continue;

        const diffs = deepDiff(refConfig, deviceMenuData, '');
        if (diffs.length > 0) {
          comparisons.push({ device: result._device.name, diferencas: diffs });

          // Acumular por equipamento
          if (!report.resumoPorEquipamento[result._device.name]) {
            report.resumoPorEquipamento[result._device.name] = { totalDivergencias: 0, menus: {} };
          }
          if (!report.resumoPorEquipamento[result._device.name].menus[menuKey]) {
            report.resumoPorEquipamento[result._device.name].menus[menuKey] = 0;
          }
          report.resumoPorEquipamento[result._device.name].totalDivergencias += diffs.length;
          report.resumoPorEquipamento[result._device.name].menus[menuKey] += diffs.length;
        }
      }

      report.porMenu[menuKey].endpoints[endpoint] = {
        nome: epData.nome,
        referencia: referencia._device.name,
        equipamentosComDiferenca: comparisons.length,
        detalhes: comparisons
      };
      report.porMenu[menuKey].divergenciasCount += comparisons.length;
    }
  }

  return report;
}

function generateMarkdownSummary(report) {
  let md = `# Relatório de Divergências - Auditoria ITScam 450\n\n`;
  md += `**Data:** ${report.metadata.dataColeta}\n`;
  md += `**Referência:** ${report.metadata.referencia}\n`;
  md += `**Total equipamentos:** ${report.metadata.totalEquipamentos}\n`;
  md += `**Coletados com sucesso:** ${report.metadata.equipamentosOk}\n`;
  md += `**Falhas de conexão:** ${report.metadata.equipamentosComErro}\n\n`;

  md += `## Resumo por Menu\n\n`;
  md += `| Menu | Divergências | Endpoints com diferença |\n`;
  md += `|------|-------------|------------------------|\n`;

  const menusSorted = Object.entries(report.porMenu).sort((a, b) => b[1].divergenciasCount - a[1].divergenciasCount);
  for (const [menu, data] of menusSorted) {
    const endpointsComDif = Object.values(data.endpoints).filter(e => e.equipamentosComDiferenca > 0).length;
    md += `| ${menu} | ${data.divergenciasCount} | ${endpointsComDif} |\n`;
  }

  md += `\n## Top 20 Equipamentos com Mais Divergências\n\n`;
  md += `| Equipamento | Total Divergências | Menus Afetados |\n`;
  md += `|-------------|-------------------|----------------|\n`;

  const eqSorted = Object.entries(report.resumoPorEquipamento)
    .sort((a, b) => b[1].totalDivergencias - a[1].totalDivergencias)
    .slice(0, 20);

  for (const [name, data] of eqSorted) {
    const menusAfetados = Object.keys(data.menus).length;
    md += `| ${name} | ${data.totalDivergencias} | ${menusAfetados} |\n`;
  }

  md += `\n## Detalhamento por Menu\n\n`;

  for (const [menu, data] of menusSorted) {
    if (data.divergenciasCount === 0) continue;
    md += `### ${menu}\n\n`;

    for (const [ep, epData] of Object.entries(data.endpoints)) {
      if (epData.equipamentosComDiferenca === 0) continue;
      md += `#### ${epData.nome} (\`${ep}\`)\n`;
      md += `Equipamentos divergentes: **${epData.equipamentosComDiferenca}**\n\n`;

      // Agrupar divergências por campo (path)
      const fieldCounts = {};
      for (const comp of epData.detalhes) {
        for (const diff of comp.diferencas) {
          if (!fieldCounts[diff.path]) {
            fieldCounts[diff.path] = { count: 0, tipo: diff.tipo, refValue: diff.ref, examples: [] };
          }
          fieldCounts[diff.path].count++;
          if (fieldCounts[diff.path].examples.length < 3) {
            fieldCounts[diff.path].examples.push({ device: comp.device, value: diff.target });
          }
        }
      }

      const sortedFields = Object.entries(fieldCounts).sort((a, b) => b[1].count - a[1].count);
      if (sortedFields.length > 0) {
        md += `| Campo | Tipo | Equip. Afetados | Valor Referência | Exemplos |\n`;
        md += `|-------|------|-----------------|------------------|----------|\n`;
        for (const [field, info] of sortedFields.slice(0, 15)) {
          const examples = info.examples.map(e => `${e.device}: \`${JSON.stringify(e.value).substring(0, 40)}\``).join(', ');
          md += `| \`${field}\` | ${info.tipo} | ${info.count} | \`${JSON.stringify(info.refValue).substring(0, 40)}\` | ${examples} |\n`;
        }
        if (sortedFields.length > 15) {
          md += `| ... | ... | ... | ... | +${sortedFields.length - 15} campos |\n`;
        }
        md += `\n`;
      }
    }
  }

  // Lista de equipamentos com falha
  md += `## Equipamentos com Falha de Conexão\n\n`;
  const failures = JSON.parse(readFileSync(ALL_DEVICES_FILE, 'utf8')).filter(r => r._error);
  for (const f of failures) {
    md += `- **${f._device.name}** — Erro: ${f._error}\n`;
  }

  return md;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

console.log('📊 Carregando dados coletados...');
const results = JSON.parse(readFileSync(ALL_DEVICES_FILE, 'utf8'));
console.log(`   ${results.length} equipamentos carregados (${results.filter(r => !r._error).length} OK, ${results.filter(r => r._error).length} falhas)`);

console.log('\n🔍 Gerando relatório de comparação...');
const report = generateComparisonReport(results);

writeFileSync(join(OUTPUT_DIR, '_RELATORIO_COMPARACAO.json'), JSON.stringify(report, null, 2));
console.log('   ✅ _RELATORIO_COMPARACAO.json salvo');

console.log('\n📝 Gerando relatório Markdown...');
const markdown = generateMarkdownSummary(report);
writeFileSync(join(OUTPUT_DIR, '_RELATORIO_DIVERGENCIAS.md'), markdown);
console.log('   ✅ _RELATORIO_DIVERGENCIAS.md salvo');

console.log('\n═══════════════════════════════════════════════════');
console.log('  RELATÓRIO GERADO COM SUCESSO');
console.log('═══════════════════════════════════════════════════');
console.log(`  Total menus analisados: ${Object.keys(report.porMenu).length}`);
console.log(`  Menus com divergências: ${Object.values(report.porMenu).filter(m => m.divergenciasCount > 0).length}`);
console.log(`  Equipamentos com divergências: ${Object.keys(report.resumoPorEquipamento).length}`);
console.log('═══════════════════════════════════════════════════\n');
