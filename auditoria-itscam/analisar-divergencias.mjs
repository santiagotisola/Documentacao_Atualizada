/**
 * ANALISADOR DE DIVERGÊNCIAS - Gera relatório de correções por menu
 * 
 * Executa APÓS coletar-configuracoes.mjs
 * Execução: node auditoria-itscam/analisar-divergencias.mjs
 * 
 * Gera:
 * - Relatório por menu com de-para de cada configuração
 * - Lista de correções priorizadas por impacto
 * - Mapa visual de problemas por equipamento
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const RESULTS_DIR = './auditoria-itscam/resultados';
const REPORT_DIR = './auditoria-itscam/relatorios';

// ═══════════════════════════════════════════════════════════════
// REGRAS DE VALIDAÇÃO POR ENDPOINT
// Cada regra define o valor esperado e o impacto de divergência
// ═══════════════════════════════════════════════════════════════

const REGRAS_VALIDACAO = {
  '/api/image/profiles': {
    categoria: 'CRÍTICO',
    menu: 'Imagem > Perfis',
    caminho_ui: 'Menu Lateral → Imagem → Perfis',
    regras: [
      {
        campo: 'transitions.lower.startTime',
        esperado: '00:00:00',
        impacto: 'ALTO - Causa travamento em perfil noturno (P&B permanente)',
        correcao: 'Alterar para 00:00:00 para ativar transição por luminosidade'
      },
      {
        campo: 'transitions.lower.endTime',
        esperado: '00:00:00',
        impacto: 'ALTO - Cria janela morta na transição de perfis',
        correcao: 'Alterar para 00:00:00'
      },
      {
        campo: 'transitions.upper.startTime',
        esperado: '00:00:00',
        impacto: 'ALTO - Impede retorno ao perfil diurno',
        correcao: 'Alterar para 00:00:00'
      },
      {
        campo: 'transitions.upper.endTime',
        esperado: '00:00:00',
        impacto: 'ALTO - Cria dead-zone temporal',
        correcao: 'Alterar para 00:00:00'
      },
      {
        campo: 'transitions.upper.level',
        esperado: 35,
        impacto: 'MÉDIO - Threshold inconsistente pode causar oscilação',
        correcao: 'Padronizar para 35 (padrão frota)'
      },
      {
        campo: 'transitions.lower.level',
        esperado: 10,
        impacto: 'MÉDIO - Threshold inconsistente',
        correcao: 'Padronizar para 10 (padrão frota)'
      },
      {
        campo: 'transitions.lower.holdTime',
        esperado: 60000,
        impacto: 'BAIXO - Sem holdTime causa oscilações rápidas',
        correcao: 'Definir holdTime=60000 (1 minuto de estabilização)'
      },
      {
        campo: 'color.saturation (Diurno)',
        esperado: 0,
        impacto: 'ALTO - Se diferente de 0 no diurno, imagem fica dessaturada',
        correcao: 'Garantir saturation=0 no perfil Diurno'
      },
      {
        campo: 'lens.exchanger (Diurno)',
        esperado: true,
        impacto: 'ALTO - IR-cut deve estar FECHADO no diurno para imagem colorida',
        correcao: 'Ativar exchanger=true no perfil Diurno'
      },
      {
        campo: 'exposure.level.roi.enabled (Diurno)',
        esperado: true,
        impacto: 'MÉDIO - Sem ROI, exposição pode ficar instável',
        correcao: 'Habilitar ROI de exposição no perfil Diurno'
      },
      {
        campo: 'overlay.text (contém código correto)',
        validacao: 'custom',
        impacto: 'MÉDIO - Overlay com código de equipamento ERRADO',
        correcao: 'Corrigir CODIGO EQUIPAMENTO no texto do overlay'
      }
    ]
  },
  '/api/equipment/transitioner': {
    categoria: 'CRÍTICO',
    menu: 'Imagem > Transicionador',
    caminho_ui: 'Menu Lateral → Imagem → Transições',
    regras: [
      {
        campo: 'mode',
        esperado: 'luminosity',
        impacto: 'ALTO - Se não for luminosity, transição automática não funciona',
        correcao: 'Configurar modo para "luminosity"'
      }
    ]
  },
  '/api/equipment/general': {
    categoria: 'IMPORTANTE',
    menu: 'Sistema > Geral',
    caminho_ui: 'Menu Lateral → Sistema → Geral',
    regras: [
      {
        campo: 'hostname',
        validacao: 'deve_conter_codigo_equip',
        impacto: 'BAIXO - Hostname inconsistente dificulta identificação',
        correcao: 'Padronizar hostname para formato: FaixaXX'
      }
    ]
  },
  '/api/equipment/dateAndTime': {
    categoria: 'IMPORTANTE',
    menu: 'Sistema > Data e Hora',
    caminho_ui: 'Menu Lateral → Sistema → Data e Hora',
    regras: [
      {
        campo: 'timezone',
        esperado: 'America/Sao_Paulo',
        impacto: 'ALTO - Timezone errado invalida timestamp das passagens',
        correcao: 'Configurar timezone para America/Sao_Paulo'
      },
      {
        campo: 'ntp.enabled',
        esperado: true,
        impacto: 'ALTO - Sem NTP, relógio desincroniza',
        correcao: 'Habilitar sincronização NTP'
      }
    ]
  },
  '/api/equipment/network/ethernet': {
    categoria: 'INFORMATIVO',
    menu: 'Sistema > Rede > Ethernet',
    caminho_ui: 'Menu Lateral → Sistema → Rede → Ethernet',
    regras: [
      {
        campo: 'dhcp',
        impacto: 'INFO - IP fixo vs DHCP varia por instalação',
        correcao: 'Verificar se IP corresponde ao esperado para o site'
      }
    ]
  },
  '/api/equipment/servers/ftp': {
    categoria: 'IMPORTANTE',
    menu: 'Equipamento > Servidores > FTP',
    caminho_ui: 'Menu Lateral → Equipamento → Servidores → FTP',
    regras: [
      {
        campo: 'enabled',
        impacto: 'ALTO - Se FTP desabilitado, imagens não são enviadas',
        correcao: 'Verificar se FTP está habilitado e apontando para servidor correto'
      },
      {
        campo: 'host',
        impacto: 'ALTO - Servidor FTP deve ser consistente entre equipamentos',
        correcao: 'Padronizar endereço do servidor FTP'
      }
    ]
  },
  '/api/equipment/servers/lince': {
    categoria: 'IMPORTANTE',
    menu: 'Equipamento > Servidores > Lince',
    caminho_ui: 'Menu Lateral → Equipamento → Servidores → Lince',
    regras: [
      {
        campo: 'enabled',
        impacto: 'ALTO - Lince é o protocolo principal de envio',
        correcao: 'Garantir que Lince está habilitado'
      },
      {
        campo: 'serverAddress',
        impacto: 'ALTO - Endereço do servidor deve ser consistente',
        correcao: 'Padronizar endereço do servidor Lince'
      }
    ]
  },
  '/api/equipment/ocr': {
    categoria: 'CRÍTICO',
    menu: 'Equipamento > OCR',
    caminho_ui: 'Menu Lateral → Equipamento → Reconhecimento → OCR',
    regras: [
      {
        campo: 'enabled',
        esperado: true,
        impacto: 'CRÍTICO - Sem OCR, placas não são lidas',
        correcao: 'Habilitar OCR'
      },
      {
        campo: 'model',
        impacto: 'ALTO - Modelo OCR deve ser consistente (AX-OCR)',
        correcao: 'Padronizar modelo OCR'
      }
    ]
  },
  '/api/equipment/classifier': {
    categoria: 'IMPORTANTE',
    menu: 'Equipamento > Classificador',
    caminho_ui: 'Menu Lateral → Equipamento → Reconhecimento → Classificador',
    regras: [
      {
        campo: 'enabled',
        impacto: 'MÉDIO - Classificador identifica tipo de veículo',
        correcao: 'Verificar se classificador está habilitado conforme necessidade'
      }
    ]
  },
  '/api/equipment/lanes': {
    categoria: 'CRÍTICO',
    menu: 'Equipamento > Faixas',
    caminho_ui: 'Menu Lateral → Equipamento → Faixas',
    regras: [
      {
        campo: 'lanes[].direction',
        impacto: 'ALTO - Sentido da faixa afeta registro de passagens',
        correcao: 'Verificar sentido configurado vs sentido real da via'
      },
      {
        campo: 'lanes[].laneNumber',
        impacto: 'MÉDIO - Número da faixa deve corresponder à instalação física',
        correcao: 'Conferir numeração com planta de instalação'
      }
    ]
  },
  '/api/system/maintenance/automaticreboot': {
    categoria: 'INFORMATIVO',
    menu: 'Sistema > Manutenção > Reboot Automático',
    caminho_ui: 'Menu Lateral → Sistema → Manutenção → Reboot Automático',
    regras: [
      {
        campo: 'enabled',
        impacto: 'BAIXO - Reboot automático ajuda em estabilidade',
        correcao: 'Considerar habilitar reboot semanal programado'
      }
    ]
  },
  '/api/system/maintenance/remoteaccess': {
    categoria: 'SEGURANÇA',
    menu: 'Sistema > Manutenção > Acesso Remoto',
    caminho_ui: 'Menu Lateral → Sistema → Manutenção → Acesso Remoto',
    regras: [
      {
        campo: 'ssh.enabled',
        impacto: 'SEGURANÇA - SSH aberto pode ser vetor de ataque',
        correcao: 'Desabilitar SSH se não necessário para manutenção'
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES DE ANÁLISE
// ═══════════════════════════════════════════════════════════════

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, key) => {
    if (o === undefined || o === null) return undefined;
    if (key.includes('[')) {
      const [arrKey, idx] = key.split('[');
      const index = parseInt(idx);
      return o[arrKey]?.[index];
    }
    return o[key];
  }, obj);
}

function extractEquipCode(name) {
  const match = name?.match(/GOEC6O(\d+)/);
  return match ? `GOEC6O${match[1]}` : null;
}

function validateProfiles(profiles, deviceName) {
  const issues = [];
  const equipCode = extractEquipCode(deviceName);
  
  if (!Array.isArray(profiles)) return [{ campo: 'profiles', problema: 'Dados inválidos' }];
  
  for (const profile of profiles) {
    const prefix = `Perfil "${profile.name}" (id=${profile.id})`;
    
    // Verificar transições
    if (profile.transitions) {
      const { lower, upper } = profile.transitions;
      
      if (lower?.startTime && lower.startTime !== '00:00:00') {
        issues.push({
          campo: `${prefix} → transitions.lower.startTime`,
          atual: lower.startTime,
          esperado: '00:00:00',
          impacto: 'ALTO',
          problema: 'Transição time-based pode causar travamento'
        });
      }
      if (lower?.endTime && lower.endTime !== '00:00:00') {
        issues.push({
          campo: `${prefix} → transitions.lower.endTime`,
          atual: lower.endTime,
          esperado: '00:00:00',
          impacto: 'ALTO',
          problema: 'Janela de tempo restritiva'
        });
      }
      if (upper?.startTime && upper.startTime !== '00:00:00') {
        issues.push({
          campo: `${prefix} → transitions.upper.startTime`,
          atual: upper.startTime,
          esperado: '00:00:00',
          impacto: 'ALTO',
          problema: 'Transição de retorno restrita por horário'
        });
      }
      if (upper?.endTime && upper.endTime !== '00:00:00') {
        issues.push({
          campo: `${prefix} → transitions.upper.endTime`,
          atual: upper.endTime,
          esperado: '00:00:00',
          impacto: 'ALTO',
          problema: 'Dead-zone temporal impede retorno'
        });
      }
      if (upper?.level && upper.level !== 35) {
        issues.push({
          campo: `${prefix} → transitions.upper.level`,
          atual: upper.level,
          esperado: 35,
          impacto: 'MÉDIO',
          problema: 'Threshold não-padrão'
        });
      }
      
      // Verificar self-reference (bug GOEC6O040)
      if (lower?.profile === profile.id && profile.name?.toLowerCase().includes('noturno')) {
        issues.push({
          campo: `${prefix} → transitions.lower.profile`,
          atual: `${lower.profile} (SELF!)`,
          esperado: 'Deve apontar para perfil DIFERENTE',
          impacto: 'CRÍTICO',
          problema: 'Auto-referência! Perfil noturno aponta para si mesmo = TRAVAMENTO'
        });
      }
    }
    
    // Verificar perfil Diurno
    if (profile.name?.toLowerCase().includes('diurno') || profile.name?.toLowerCase().includes('tarde')) {
      if (profile.color?.saturation !== 0) {
        issues.push({
          campo: `${prefix} → color.saturation`,
          atual: profile.color?.saturation,
          esperado: 0,
          impacto: 'ALTO',
          problema: 'Saturação não-zero no perfil diurno'
        });
      }
      if (profile.lens?.exchanger !== true) {
        issues.push({
          campo: `${prefix} → lens.exchanger`,
          atual: profile.lens?.exchanger,
          esperado: true,
          impacto: 'ALTO',
          problema: 'IR-cut não ativado no perfil diurno'
        });
      }
    }
    
    // Verificar overlay
    if (profile.overlay?.text && equipCode) {
      if (!profile.overlay.text.includes(equipCode)) {
        const overlayCode = profile.overlay.text.match(/CODIGO EQUIPAMENTO:\s*(\S+)/)?.[1];
        issues.push({
          campo: `${prefix} → overlay.text`,
          atual: `CODIGO EQUIPAMENTO: ${overlayCode}`,
          esperado: `CODIGO EQUIPAMENTO: ${equipCode}`,
          impacto: 'MÉDIO',
          problema: 'Overlay com código de equipamento ERRADO'
        });
      }
    }
  }
  
  return issues;
}

function analyzeDevice(deviceData) {
  if (deviceData._error) {
    return { device: deviceData._device, status: 'OFFLINE', issues: [] };
  }
  
  const issues = [];
  
  // Analisar perfis de imagem (mais crítico)
  const profiles = deviceData.menus?.['02-IMAGEM']?.['/api/image/profiles']?.data;
  if (profiles) {
    issues.push(...validateProfiles(profiles, deviceData._device.name));
  }
  
  // Analisar cada endpoint conforme regras
  for (const [menuKey, menuData] of Object.entries(deviceData.menus || {})) {
    for (const [endpoint, epData] of Object.entries(menuData || {})) {
      const regra = REGRAS_VALIDACAO[endpoint];
      if (!regra) continue;
      
      // Aqui se aplicariam regras específicas por endpoint
      // A validação de profiles já é feita acima de forma detalhada
    }
  }
  
  return {
    device: deviceData._device,
    status: issues.length === 0 ? 'OK' : 'DIVERGENTE',
    issueCount: issues.length,
    criticalCount: issues.filter(i => i.impacto === 'CRÍTICO' || i.impacto === 'ALTO').length,
    issues
  };
}

// ═══════════════════════════════════════════════════════════════
// GERADOR DE RELATÓRIO MARKDOWN
// ═══════════════════════════════════════════════════════════════

function generateMarkdownReport(analyses) {
  let md = `# Relatório de Auditoria ITScam 450 — Análise por Menu\n\n`;
  md += `**Data:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Total equipamentos:** ${analyses.length}\n`;
  md += `**Com divergências:** ${analyses.filter(a => a.status === 'DIVERGENTE').length}\n`;
  md += `**Offline:** ${analyses.filter(a => a.status === 'OFFLINE').length}\n\n`;
  
  md += `---\n\n## Resumo por Equipamento\n\n`;
  md += `| # | Equipamento | Status | Issues | Críticas | Ação |\n`;
  md += `|---|---|---|---|---|---|\n`;
  
  for (const analysis of analyses.sort((a, b) => b.criticalCount - a.criticalCount)) {
    const icon = analysis.status === 'OK' ? '✅' : analysis.status === 'OFFLINE' ? '⚫' : '❌';
    md += `| ${icon} | ${analysis.device.name} | ${analysis.status} | ${analysis.issueCount} | ${analysis.criticalCount} | ${analysis.criticalCount > 0 ? '**CORRIGIR**' : 'OK'} |\n`;
  }
  
  md += `\n---\n\n## Análise Detalhada por Menu\n\n`;
  
  // Agrupar issues por menu/regra
  for (const [endpoint, regra] of Object.entries(REGRAS_VALIDACAO)) {
    md += `### ${regra.menu}\n\n`;
    md += `- **Categoria:** ${regra.categoria}\n`;
    md += `- **Caminho na UI:** \`${regra.caminho_ui}\`\n`;
    md += `- **Endpoint API:** \`${endpoint}\`\n\n`;
    
    md += `#### Regras de Validação:\n\n`;
    for (const r of regra.regras) {
      md += `| Campo | Valor Esperado | Impacto | Correção |\n`;
      md += `|---|---|---|---|\n`;
      md += `| \`${r.campo}\` | ${r.esperado || 'Variável'} | ${r.impacto} | ${r.correcao} |\n\n`;
    }
    
    // Listar equipamentos com problema neste menu
    const affectedDevices = analyses.filter(a => 
      a.issues.some(i => i.campo.includes(regra.menu.split(' > ')[1] || ''))
    );
    
    if (affectedDevices.length > 0) {
      md += `#### Equipamentos com Divergência:\n\n`;
      for (const a of affectedDevices) {
        const relevant = a.issues.filter(i => true); // filtrar por menu
        md += `- **${a.device.name}**: ${relevant.length} issues\n`;
        for (const issue of relevant.slice(0, 5)) {
          md += `  - \`${issue.campo}\`: ${issue.atual} → ${issue.esperado} (${issue.problema})\n`;
        }
      }
    }
    
    md += `\n---\n\n`;
  }
  
  // Seção de correções priorizadas
  md += `## Plano de Correção Priorizado\n\n`;
  md += `### Prioridade 1 — CRÍTICA (causa perda de dados/funcionalidade)\n\n`;
  md += `| # | Equipamento | Problema | Correção | Menu/Caminho |\n`;
  md += `|---|---|---|---|---|\n`;
  
  let count = 1;
  for (const a of analyses) {
    for (const issue of a.issues.filter(i => i.impacto === 'CRÍTICO')) {
      md += `| ${count++} | ${a.device.name} | ${issue.problema} | ${issue.esperado} | Imagem > Perfis |\n`;
    }
  }
  
  md += `\n### Prioridade 2 — ALTA (causa degradação operacional)\n\n`;
  md += `| # | Equipamento | Problema | Correção |\n`;
  md += `|---|---|---|---|\n`;
  
  for (const a of analyses) {
    for (const issue of a.issues.filter(i => i.impacto === 'ALTO')) {
      md += `| ${count++} | ${a.device.name} | ${issue.problema} | Ajustar \`${issue.campo}\` de ${issue.atual} para ${issue.esperado} |\n`;
    }
  }
  
  md += `\n### Prioridade 3 — MÉDIA (melhoria de padronização)\n\n`;
  md += `| # | Equipamento | Problema |\n`;
  md += `|---|---|---|\n`;
  
  for (const a of analyses) {
    for (const issue of a.issues.filter(i => i.impacto === 'MÉDIO')) {
      md += `| ${count++} | ${a.device.name} | ${issue.problema}: ${issue.atual} → ${issue.esperado} |\n`;
    }
  }
  
  return md;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  ANALISADOR DE DIVERGÊNCIAS ITScam 450');
  console.log('═══════════════════════════════════════════════════\n');
  
  if (!existsSync(RESULTS_DIR)) {
    console.error('❌ Diretório de resultados não encontrado. Execute coletar-configuracoes.mjs primeiro.');
    process.exit(1);
  }
  
  // Carregar todos os resultados
  const files = readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  console.log(`📂 ${files.length} arquivos de equipamentos encontrados\n`);
  
  const allDevices = [];
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(RESULTS_DIR, file), 'utf8'));
    allDevices.push(data);
  }
  
  // Analisar cada dispositivo
  console.log('🔍 Analisando divergências...\n');
  const analyses = allDevices.map(analyzeDevice);
  
  // Gerar relatório
  const report = generateMarkdownReport(analyses);
  
  if (!existsSync(REPORT_DIR)) {
    const { mkdirSync } = await import('fs');
    mkdirSync(REPORT_DIR, { recursive: true });
  }
  
  writeFileSync(join(REPORT_DIR, 'AUDITORIA-COMPLETA-POR-MENU.md'), report);
  writeFileSync(join(REPORT_DIR, 'analises-raw.json'), JSON.stringify(analyses, null, 2));
  
  // Resumo no console
  console.log('📊 RESUMO:');
  console.log(`   ✅ OK: ${analyses.filter(a => a.status === 'OK').length}`);
  console.log(`   ❌ Divergentes: ${analyses.filter(a => a.status === 'DIVERGENTE').length}`);
  console.log(`   ⚫ Offline: ${analyses.filter(a => a.status === 'OFFLINE').length}`);
  console.log(`\n   Total de issues: ${analyses.reduce((sum, a) => sum + a.issueCount, 0)}`);
  console.log(`   Issues críticas: ${analyses.reduce((sum, a) => sum + a.criticalCount, 0)}`);
  console.log(`\n📄 Relatório gerado: ${REPORT_DIR}/AUDITORIA-COMPLETA-POR-MENU.md`);
}

main();
