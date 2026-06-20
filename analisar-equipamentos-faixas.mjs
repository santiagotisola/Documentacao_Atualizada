#!/usr/bin/env node
/**
 * Análise de Equipamentos VARCO por Faixa
 * Compara configurações entre Faixa 1 e Faixa 2
 * Identifica equipamentos offline e divergências
 */

import fs from 'fs/promises';

const API_BASE = 'http://localhost:3100/api/varco';

// Equipamentos reportados com problema (caíram às 22h)
// Nota: 0 faixa 1 = 10 faixa 1 (correção de nomenclatura)
const EQUIPAMENTOS_PROBLEMA = [
  { numero: 10, faixas: [1] }, // Era reportado como "0", mas é o local 10
  { numero: 11, faixas: [1] },
  { numero: 13, faixas: [1, 2] },
  { numero: 18, faixas: [2] },
  { numero: 28, faixas: [1] },
  { numero: 29, faixas: [1] },
  { numero: 44, faixas: [1, 2] },
  { numero: 46, faixas: [2] },
  { numero: 57, faixas: [1] }
];

// UUID do dispositivo exemplo (offline)
const DISPOSITIVO_EXEMPLO = 'abf8fedb-4f1b-471f-a6bd-4e00484d5737';

async function buscarFrotaVarco() {
  console.log('🔍 Buscando dados da frota VARCO Cloud...');
  const res = await fetch(`${API_BASE}/frota`);
  const data = await res.json();
  console.log(`✅ ${data.total} dispositivos | ${data.online} online | ${data.offline} offline\n`);
  return data;
}

async function buscarAuditoria() {
  console.log('📋 Buscando dados de auditoria...');
  const res = await fetch(`${API_BASE}/auditoria`);
  const data = await res.json();
  console.log(`✅ ${data.total} dispositivos auditados\n`);
  return data;
}

function extrairNumeroLocal(nome) {
  // Extrai número do formato "GOEC6Oxxxx - Faixa X"
  const match = nome.match(/GOEC6O(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function extrairFaixa(nome) {
  const match = nome.match(/Faixa (\d)/);
  return match ? parseInt(match[1]) : null;
}

function analisarDispositivo(device) {
  const numero = extrairNumeroLocal(device.name);
  const faixa = extrairFaixa(device.name);
  
  return {
    numero,
    faixa,
    nome: device.name,
    uuid: device.uuid,
    ip: device.ip,
    online: device.connected === true,
    status: device.status,
    lastSeen: device.lastSeen,
    availability: device.availability?.toFixed(2) || 'N/A',
    tunnel: device.tunnel,
    problema: EQUIPAMENTOS_PROBLEMA.some(
      eq => eq.numero === numero && eq.faixas.includes(faixa)
    )
  };
}

function agruparPorLocal(dispositivos) {
  const grupos = {};
  
  dispositivos.forEach(d => {
    if (!d.numero) return;
    
    if (!grupos[d.numero]) {
      grupos[d.numero] = { numero: d.numero, faixa1: null, faixa2: null };
    }
    
    if (d.faixa === 1) grupos[d.numero].faixa1 = d;
    if (d.faixa === 2) grupos[d.numero].faixa2 = d;
  });
  
  return grupos;
}

function compararFaixas(grupo) {
  const { faixa1, faixa2 } = grupo;
  
  if (!faixa1 || !faixa2) {
    return { tipo: 'INCOMPLETO', detalhes: 'Local possui apenas uma faixa configurada' };
  }
  
  const divergencias = [];
  
  // Compara status online/offline
  if (faixa1.online !== faixa2.online) {
    divergencias.push({
      campo: 'Status Conexão',
      faixa1: faixa1.online ? 'ONLINE' : 'OFFLINE',
      faixa2: faixa2.online ? 'ONLINE' : 'OFFLINE'
    });
  }
  
  // Compara IP (devem ser iguais no mesmo local)
  if (faixa1.ip !== faixa2.ip) {
    divergencias.push({
      campo: 'IP',
      faixa1: faixa1.ip,
      faixa2: faixa2.ip
    });
  }
  
  // Compara availability
  const diff = Math.abs(parseFloat(faixa1.availability) - parseFloat(faixa2.availability));
  if (diff > 10) {
    divergencias.push({
      campo: 'Disponibilidade',
      faixa1: `${faixa1.availability}%`,
      faixa2: `${faixa2.availability}%`,
      diferenca: `${diff.toFixed(2)}%`
    });
  }
  
  return {
    tipo: divergencias.length > 0 ? 'DIVERGENTE' : 'CONFORME',
    divergencias
  };
}

function analisarProblemaHorario(dispositivos) {
  const agora = new Date();
  const problemasRecentes = [];
  
  dispositivos.forEach(d => {
    if (!d.online && d.lastSeen) {
      const lastSeen = new Date(d.lastSeen);
      const horasOffline = (agora - lastSeen) / (1000 * 60 * 60);
      
      const hora = lastSeen.getHours();
      
      problemasRecentes.push({
        ...d,
        horaQueda: hora,
        horasOffline: horasOffline.toFixed(1),
        quedaAs22h: hora === 22
      });
    }
  });
  
  return problemasRecentes;
}

function gerarRelatorioMarkdown(analise) {
  const md = [];
  
  md.push('# Análise Equipamentos VARCO - Problema Faixas');
  md.push('');
  md.push(`**Data da Análise:** ${new Date().toLocaleString('pt-BR')}`);
  md.push('');
  md.push('---');
  md.push('');
  
  // Sumário Executivo
  md.push('## 📊 Sumário Executivo');
  md.push('');
  md.push(`- **Total de Dispositivos:** ${analise.total}`);
  md.push(`- **Online:** ${analise.online} (${((analise.online/analise.total)*100).toFixed(1)}%)`);
  md.push(`- **Offline:** ${analise.offline} (${((analise.offline/analise.total)*100).toFixed(1)}%)`);
  md.push(`- **Locais com Problema Reportado:** ${analise.locaisProblema.length}`);
  md.push(`- **Equipamentos com Queda às 22h:** ${analise.quedasAs22h}`);
  md.push('');
  
  // Dispositivo Exemplo (Offline)
  md.push('## 🔴 Dispositivo Exemplo - OFFLINE');
  md.push('');
  if (analise.dispositivoExemplo) {
    const d = analise.dispositivoExemplo;
    md.push(`- **Nome:** ${d.nome}`);
    md.push(`- **UUID:** \`${d.uuid}\``);
    md.push(`- **IP:** ${d.ip}`);
    md.push(`- **Status:** ${d.online ? '🟢 ONLINE' : '🔴 OFFLINE'}`);
    md.push(`- **Última Conexão:** ${d.lastSeen || 'N/A'}`);
    md.push(`- **Disponibilidade:** ${d.availability}%`);
    md.push(`- **Túnel VARCO:** ${d.tunnel}`);
    md.push('');
    md.push('### Erro Reportado');
    md.push('```');
    md.push('Dispositivo Offline');
    md.push('O túnel está configurado, mas o dispositivo não está conectado no momento');
    md.push('```');
  } else {
    md.push('*Dispositivo não encontrado na frota*');
  }
  md.push('');
  
  // Equipamentos com Problema
  md.push('## ⚠️ Equipamentos Reportados com Problema');
  md.push('');
  md.push('| Local | Faixa | Nome | Status | Última Visão | Availability | Problema 22h |');
  md.push('|-------|-------|------|--------|--------------|--------------|--------------|');
  
  analise.equipamentosProblema.forEach(eq => {
    const status = eq.online ? '🟢 Online' : '🔴 Offline';
    const prob22h = eq.quedaAs22h ? '✅ SIM' : '-';
    md.push(`| ${eq.numero} | ${eq.faixa} | ${eq.nome} | ${status} | ${eq.lastSeen || 'N/A'} | ${eq.availability}% | ${prob22h} |`);
  });
  md.push('');
  
  // Análise por Local (Faixa 1 vs Faixa 2)
  md.push('## 🔍 Análise Comparativa: Faixa 1 vs Faixa 2');
  md.push('');
  
  const divergentes = analise.comparacao.filter(c => c.status === 'DIVERGENTE');
  const conformes = analise.comparacao.filter(c => c.status === 'CONFORME');
  const incompletos = analise.comparacao.filter(c => c.status === 'INCOMPLETO');
  
  md.push(`- **Locais Divergentes:** ${divergentes.length}`);
  md.push(`- **Locais Conformes:** ${conformes.length}`);
  md.push(`- **Locais Incompletos:** ${incompletos.length} (apenas uma faixa)`);
  md.push('');
  
  if (divergentes.length > 0) {
    md.push('### 🚨 Locais com Divergências entre Faixas');
    md.push('');
    
    divergentes.forEach(local => {
      md.push(`#### Local ${local.numero} (${local.nome})`);
      md.push('');
      md.push('| Aspecto | Faixa 1 | Faixa 2 | Observação |');
      md.push('|---------|---------|---------|------------|');
      
      if (local.faixa1 && local.faixa2) {
        md.push(`| Status | ${local.faixa1.online ? '🟢 Online' : '🔴 Offline'} | ${local.faixa2.online ? '🟢 Online' : '🔴 Offline'} | ${local.faixa1.online === local.faixa2.online ? 'OK' : '⚠️ DIVERGÊNCIA'} |`);
        md.push(`| IP | ${local.faixa1.ip} | ${local.faixa2.ip} | ${local.faixa1.ip === local.faixa2.ip ? 'OK' : '⚠️ IPs diferentes'} |`);
        md.push(`| Availability | ${local.faixa1.availability}% | ${local.faixa2.availability}% | Δ ${Math.abs(parseFloat(local.faixa1.availability) - parseFloat(local.faixa2.availability)).toFixed(2)}% |`);
        md.push(`| UUID | \`${local.faixa1.uuid}\` | \`${local.faixa2.uuid}\` | - |`);
      }
      md.push('');
      
      if (local.divergencias && local.divergencias.length > 0) {
        md.push('**Divergências Detectadas:**');
        local.divergencias.forEach(div => {
          md.push(`- **${div.campo}:** Faixa 1 = ${div.faixa1}, Faixa 2 = ${div.faixa2}`);
        });
        md.push('');
      }
    });
  }
  
  // Problemas de Horário
  if (analise.problemasHorario.length > 0) {
    md.push('## ⏰ Análise de Horário das Quedas');
    md.push('');
    md.push('| Local | Faixa | Hora da Queda | Horas Offline | Problema às 22h |');
    md.push('|-------|-------|---------------|---------------|-----------------|');
    
    analise.problemasHorario
      .sort((a, b) => (a.quedaAs22h === b.quedaAs22h ? 0 : a.quedaAs22h ? -1 : 1))
      .forEach(p => {
        const as22h = p.quedaAs22h ? '✅ SIM' : 'Não';
        md.push(`| ${p.numero} | ${p.faixa} | ${p.horaQueda}:00 | ${p.horasOffline}h | ${as22h} |`);
      });
    md.push('');
  }
  
  // Hipóteses e Diagnóstico
  md.push('## 🔬 Hipóteses de Diagnóstico');
  md.push('');
  
  if (analise.quedasAs22h > 0) {
    md.push('### ⚠️ Padrão Identificado: Quedas às 22h');
    md.push('');
    md.push('**Possíveis Causas:**');
    md.push('');
    md.push('1. **Reinicialização Programada**');
    md.push('   - Tarefa agendada no sistema operacional');
    md.push('   - Restart automático do serviço VARCO');
    md.push('   - Atualização automática de firmware às 22h');
    md.push('');
    md.push('2. **Problema de Energia/Infraestrutura**');
    md.push('   - Queda de energia no horário específico');
    md.push('   - Instabilidade na rede elétrica');
    md.push('   - Problema no nobreak/UPS');
    md.push('');
    md.push('3. **Problema de Rede**');
    md.push('   - Reinicialização de switches/roteadores');
    md.push('   - Manutenção programada da operadora');
    md.push('   - Firewall bloqueando conexão em horário específico');
    md.push('');
    md.push('4. **Timeout de Sessão**');
    md.push('   - Token de autenticação expirando');
    md.push('   - Sessão do túnel VARCO sendo desconectada');
    md.push('   - Problema no keep-alive da conexão');
    md.push('');
  }
  
  // Recomendações
  md.push('## ✅ Recomendações de Correção');
  md.push('');
  md.push('### Ações Imediatas');
  md.push('');
  md.push('1. **Verificar Logs do Sistema**');
  md.push('   ```bash');
  md.push('   # Acessar via túnel VARCO (quando online)');
  md.push('   journalctl -u itscam -S "22:00" --since today');
  md.push('   tail -f /var/log/syslog | grep -i varco');
  md.push('   ```');
  md.push('');
  md.push('2. **Verificar Tarefas Agendadas (cron)**');
  md.push('   ```bash');
  md.push('   crontab -l');
  md.push('   ls -la /etc/cron.d/');
  md.push('   systemctl list-timers');
  md.push('   ```');
  md.push('');
  md.push('3. **Testar Conectividade Manual**');
  md.push('   ```bash');
  md.push('   # No dispositivo (via SSH ou console)');
  md.push('   ping edge.varco.io -c 5');
  md.push('   curl -v https://api.varco.io/health');
  md.push('   ```');
  md.push('');
  md.push('### Ações de Médio Prazo');
  md.push('');
  md.push('1. **Ajustar Configuração do Agente VARCO**');
  md.push('   - Revisar timeout de conexão');
  md.push('   - Configurar retry automático');
  md.push('   - Aumentar intervalo de keep-alive');
  md.push('');
  md.push('2. **Monitoramento Proativo**');
  md.push('   - Configurar alertas para quedas de conexão');
  md.push('   - Implementar health check periódico');
  md.push('   - Log detalhado de eventos de reconexão');
  md.push('');
  md.push('3. **Padronizar Configurações**');
  md.push('   - Garantir que Faixa 1 e Faixa 2 tenham configurações idênticas');
  md.push('   - Sincronizar versões de firmware');
  md.push('   - Validar configurações de rede');
  md.push('');
  
  // Dispositivos para Investigar
  md.push('## 🎯 Dispositivos Prioritários para Investigação');
  md.push('');
  md.push('### Offline no Momento');
  md.push('');
  const offline = analise.equipamentosProblema.filter(e => !e.online);
  if (offline.length > 0) {
    offline.forEach(d => {
      md.push(`- **${d.nome}** (Local ${d.numero}, Faixa ${d.faixa})`);
      md.push(`  - UUID: \`${d.uuid}\``);
      md.push(`  - Túnel: ${d.tunnel}`);
      md.push(`  - Última conexão: ${d.lastSeen || 'Desconhecido'}`);
      md.push('');
    });
  } else {
    md.push('*Todos os dispositivos reportados estão online no momento*');
    md.push('');
  }
  
  // Comandos Úteis
  md.push('## 🛠️ Comandos Úteis para Diagnóstico');
  md.push('');
  md.push('### Verificar Status Geral da Frota');
  md.push('```bash');
  md.push('curl http://localhost:3100/api/varco/frota');
  md.push('```');
  md.push('');
  md.push('### Forçar Recoleta de Dados');
  md.push('```bash');
  md.push('curl -X POST http://localhost:3100/api/varco/recoleta \\');
  md.push('  -H "X-Admin-Token: 4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3"');
  md.push('```');
  md.push('');
  md.push('### Acessar Dispositivo via Túnel VARCO');
  md.push('```');
  md.push('# Login: admin');
  md.push('# Senha: #econocr@');
  md.push('```');
  md.push('');
  md.push('---');
  md.push('');
  md.push(`*Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}*`);
  
  return md.join('\n');
}

async function executarAnalise() {
  try {
    // Buscar dados
    const frota = await buscarFrotaVarco();
    
    // Analisar dispositivos
    const dispositivos = frota.devices.map(analisarDispositivo);
    
    // Buscar dispositivo exemplo
    const dispositivoExemplo = dispositivos.find(d => d.uuid === DISPOSITIVO_EXEMPLO);
    
    // Filtrar equipamentos com problema reportado
    const equipamentosProblema = dispositivos.filter(d => d.problema);
    
    // Agrupar por local
    const grupos = agruparPorLocal(dispositivos);
    
    // Comparar faixas
    const comparacao = Object.values(grupos).map(grupo => {
      const comp = compararFaixas(grupo);
      return {
        numero: grupo.numero,
        nome: `GOEC6O${String(grupo.numero).padStart(3, '0')}`,
        faixa1: grupo.faixa1,
        faixa2: grupo.faixa2,
        status: comp.tipo,
        divergencias: comp.divergencias
      };
    });
    
    // Analisar problemas de horário
    const problemasHorario = analisarProblemaHorario(equipamentosProblema);
    const quedasAs22h = problemasHorario.filter(p => p.quedaAs22h).length;
    
    // Montar análise completa
    const analise = {
      total: frota.total,
      online: frota.online,
      offline: frota.offline,
      dispositivoExemplo,
      locaisProblema: EQUIPAMENTOS_PROBLEMA.map(eq => eq.numero),
      equipamentosProblema,
      comparacao,
      problemasHorario,
      quedasAs22h
    };
    
    // Gerar relatório
    const relatorio = gerarRelatorioMarkdown(analise);
    
    // Salvar
    const nomeArquivo = `ANALISE-EQUIPAMENTOS-FAIXAS-${new Date().toISOString().split('T')[0]}.md`;
    await fs.writeFile(nomeArquivo, relatorio, 'utf-8');
    
    console.log(`\n✅ Análise completa salva em: ${nomeArquivo}`);
    console.log(`\n📊 Resumo:`);
    console.log(`   - ${analise.equipamentosProblema.length} equipamentos com problema reportado`);
    console.log(`   - ${analise.quedasAs22h} quedas confirmadas às 22h`);
    console.log(`   - ${comparacao.filter(c => c.status === 'DIVERGENTE').length} locais com divergências entre faixas`);
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    process.exit(1);
  }
}

// Executar
executarAnalise();
