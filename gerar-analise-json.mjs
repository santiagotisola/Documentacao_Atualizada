#!/usr/bin/env node
/**
 * gerar-analise-json.mjs
 * Gera um JSON completo com análise de todo o ecossistema AxionIA
 * Captura: estrutura, rotas, componentes, APIs, modelos, ciclos de processo
 *
 * Uso: node gerar-analise-json.mjs
 * Output: ANALISE-SISTEMA-COMPLETA-{timestamp}.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = __dirname;
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUTPUT = path.join(BASE, `ANALISE-SISTEMA-COMPLETA-${timestamp}.json`);

// ─── Utilitários ──────────────────────────────────────────────────────────────

function lerArquivo(caminho) {
  try { return fs.readFileSync(caminho, 'utf-8'); }
  catch { return null; }
}

function listarRecursivo(dir, exts = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.md'], excluir = ['node_modules', 'dist', 'build', '.docusaurus', '.git']) {
  const resultado = [];
  if (!fs.existsSync(dir)) return resultado;
  try {
    const itens = fs.readdirSync(dir);
    for (const item of itens) {
      if (excluir.some(e => item === e || item.startsWith('.'))) continue;
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        resultado.push(...listarRecursivo(full, exts, excluir));
      } else if (exts.includes(path.extname(item))) {
        resultado.push(full);
      }
    }
  } catch {}
  return resultado;
}

function contarLinhas(conteudo) {
  return conteudo ? conteudo.split('\n').length : 0;
}

function extrairImports(conteudo) {
  if (!conteudo) return [];
  const matches = [...conteudo.matchAll(/^import\s+.+\s+from\s+['"]([^'"]+)['"]/gm)];
  return [...new Set(matches.map(m => m[1]))];
}

function extrairExports(conteudo) {
  if (!conteudo) return [];
  const nomes = [];
  const defaultMatch = conteudo.match(/export\s+default\s+(?:function\s+|class\s+)?(\w+)/);
  if (defaultMatch) nomes.push(`default:${defaultMatch[1]}`);
  const named = [...conteudo.matchAll(/export\s+(?:const|function|class|async function)\s+(\w+)/g)];
  named.forEach(m => nomes.push(m[1]));
  return nomes;
}

function extrairRotasReact(conteudo) {
  if (!conteudo) return [];
  const rotas = [];
  const matches = [...conteudo.matchAll(/<Route\s[^>]*path=["']([^"']+)["']/g)];
  matches.forEach(m => rotas.push(m[1]));
  return rotas;
}

function extrairEndpointsExpress(conteudo) {
  if (!conteudo) return [];
  const endpoints = [];
  const patterns = [
    /router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/g,
    /app\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/g,
  ];
  for (const pat of patterns) {
    const matches = [...conteudo.matchAll(pat)];
    matches.forEach(m => endpoints.push({ metodo: m[1].toUpperCase(), rota: m[2] }));
  }
  return endpoints;
}

function extrairModelos(conteudo) {
  if (!conteudo) return [];
  const modelos = [];
  const matches = [...conteudo.matchAll(/mongoose\.model\(['"](\w+)['"]/g)];
  matches.forEach(m => modelos.push(m[1]));
  const schema = [...conteudo.matchAll(/new Schema\({/g)];
  return modelos;
}

function extrairComponentesReact(conteudo) {
  if (!conteudo) return [];
  const componentes = [];
  const matches = [...conteudo.matchAll(/(?:function|const)\s+([A-Z]\w+)\s*[=(]/g)];
  matches.forEach(m => componentes.push(m[1]));
  return [...new Set(componentes)];
}

function extrairEstados(conteudo) {
  if (!conteudo) return [];
  const estados = [];
  const matches = [...conteudo.matchAll(/useState\((?:[^)]*)\)[^;]*;\s*\/\/\s*(.+)|const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g)];
  matches.forEach(m => { if (m[2]) estados.push(m[2]); });
  return [...new Set(estados)].slice(0, 20);
}

function resumirComponente(caminho) {
  const conteudo = lerArquivo(caminho);
  const nome = path.basename(caminho);
  return {
    arquivo: path.relative(BASE, caminho).replace(/\\/g, '/'),
    linhas: contarLinhas(conteudo),
    tamanho_kb: conteudo ? Math.round(conteudo.length / 1024 * 10) / 10 : 0,
    componentes: extrairComponentesReact(conteudo),
    imports: extrairImports(conteudo).filter(i => !i.startsWith('react') && !i.startsWith('@')),
    exports: extrairExports(conteudo),
    estados: extrairEstados(conteudo),
    tem_useEffect: conteudo ? (conteudo.match(/useEffect/g) || []).length : 0,
    tem_useCallback: conteudo ? conteudo.includes('useCallback') : false,
    tem_useMemo: conteudo ? conteudo.includes('useMemo') : false,
    tem_api_call: conteudo ? (conteudo.includes('api.get') || conteudo.includes('api.post') || conteudo.includes('axios')) : false,
  };
}

// ─── Análise do App.jsx (rotas principais) ────────────────────────────────────

function analisarAppJsx() {
  const conteudo = lerArquivo(path.join(BASE, 'axion-ia-panel/src/App.jsx'));
  if (!conteudo) return { erro: 'App.jsx não encontrado' };

  const rotas = extrairRotasReact(conteudo);

  // Extrair PAGE_INFO
  const pageInfoMatch = conteudo.match(/const PAGE_INFO = \{([\s\S]+?)\};/);
  const paginas = [];
  if (pageInfoMatch) {
    const linhas = pageInfoMatch[1].split('\n');
    linhas.forEach(linha => {
      const m = linha.match(/["']([^"']+)["']\s*:\s*\{[^}]*title:\s*["']([^"']+)["']/);
      if (m) paginas.push({ rota: m[1], titulo: m[2] });
    });
  }

  // Extrair MENU_SECTIONS
  const menuSections = [];
  const gruposMatch = [...conteudo.matchAll(/group:\s*["']([^"']+)["']/g)];
  const itensMatch = [...conteudo.matchAll(/to:\s*["']([^"']+)["'][^}]*label:\s*["']([^"']+)["']/g)];
  gruposMatch.forEach(m => menuSections.push({ grupo: m[1], itens: [] }));
  itensMatch.forEach(m => {
    const grupo = menuSections[menuSections.length - 1];
    if (grupo) grupo.itens.push({ rota: m[1], label: m[2] });
  });

  // Importações de páginas
  const importPagesMatch = [...conteudo.matchAll(/import\s+(\w+)\s+from\s+["']\.\/pages\/([^"']+)["']/g)];
  const paginasImportadas = importPagesMatch.map(m => ({ componente: m[1], arquivo: m[2] }));

  return {
    total_rotas: rotas.length,
    rotas,
    paginas_registradas: paginas,
    paginas_importadas: paginasImportadas,
    grupos_menu: menuSections,
    linhas: contarLinhas(conteudo),
  };
}

// ─── Análise do painel (frontend) ─────────────────────────────────────────────

function analisarPainel() {
  const srcDir = path.join(BASE, 'axion-ia-panel/src');
  const pagesDir = path.join(srcDir, 'pages');
  const componentsDir = path.join(srcDir, 'components');
  const dataDir = path.join(srcDir, 'data');
  const servicesDir = path.join(srcDir, 'services');
  const hooksDir = path.join(srcDir, 'hooks');
  const contextDir = path.join(srcDir, 'context');
  const utilsDir = path.join(srcDir, 'utils');

  // Listar todas as páginas
  const paginasArquivos = listarRecursivo(pagesDir, ['.jsx', '.js']);
  const paginas = paginasArquivos.map(resumirComponente);

  // Componentes compartilhados
  const componentesArquivos = listarRecursivo(componentsDir, ['.jsx', '.js']);
  const componentes = componentesArquivos.map(resumirComponente);

  // Data files
  const dataArquivos = listarRecursivo(dataDir, ['.js', '.jsx', '.ts', '.json']);
  const dataFiles = dataArquivos.map(f => {
    const conteudo = lerArquivo(f);
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      linhas: contarLinhas(conteudo),
      exports: extrairExports(conteudo),
    };
  });

  // Services
  const servicesArquivos = listarRecursivo(servicesDir, ['.js', '.jsx', '.ts']);
  const services = servicesArquivos.map(f => {
    const conteudo = lerArquivo(f);
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      linhas: contarLinhas(conteudo),
      exports: extrairExports(conteudo),
      tem_axios: conteudo ? conteudo.includes('axios') : false,
    };
  });

  // Hooks
  const hooksArquivos = listarRecursivo(hooksDir, ['.js', '.jsx', '.ts']);
  const hooks = hooksArquivos.map(f => {
    const conteudo = lerArquivo(f);
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      linhas: contarLinhas(conteudo),
      exports: extrairExports(conteudo),
    };
  });

  // Context
  const contextArquivos = listarRecursivo(contextDir, ['.js', '.jsx', '.ts']);
  const context = contextArquivos.map(f => {
    const conteudo = lerArquivo(f);
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      linhas: contarLinhas(conteudo),
      exports: extrairExports(conteudo),
    };
  });

  // Utils
  const utilsArquivos = listarRecursivo(utilsDir, ['.js', '.jsx', '.ts']);
  const utils = utilsArquivos.map(f => {
    const conteudo = lerArquivo(f);
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      linhas: contarLinhas(conteudo),
      exports: extrairExports(conteudo),
    };
  });

  // App principal
  const appJsx = analisarAppJsx();

  // Package.json
  let pkgJson = {};
  try { pkgJson = JSON.parse(lerArquivo(path.join(BASE, 'axion-ia-panel/package.json')) || '{}'); } catch {}

  // Estatísticas
  const totalLinhasPaginas = paginas.reduce((a, p) => a + p.linhas, 0);
  const totalLinhasComponentes = componentes.reduce((a, c) => a + c.linhas, 0);

  return {
    framework: 'React 18 + Vite',
    porta: 3017,
    versao: pkgJson.version || '—',
    dependencias: Object.keys(pkgJson.dependencies || {}),
    app_jsx: appJsx,
    estatisticas: {
      total_paginas: paginas.length,
      total_componentes_compartilhados: componentes.length,
      total_hooks: hooks.length,
      total_contexts: context.length,
      total_services: services.length,
      total_data_files: dataFiles.length,
      total_utils: utils.length,
      linhas_paginas: totalLinhasPaginas,
      linhas_componentes: totalLinhasComponentes,
      paginas_com_api_call: paginas.filter(p => p.tem_api_call).length,
    },
    paginas,
    componentes_compartilhados: componentes,
    hooks,
    context,
    services,
    data_files: dataFiles,
    utils,
  };
}

// ─── Análise da API (backend) ─────────────────────────────────────────────────

function analisarAPI() {
  const apiDir = path.join(BASE, 'axion-ia-panel/api/src');
  if (!fs.existsSync(apiDir)) return { erro: 'API não encontrada em axion-ia-panel/api/src' };

  // Routes
  const rotasDir = path.join(apiDir, 'routes');
  const rotasArquivos = listarRecursivo(rotasDir, ['.js']);
  const modelsDir = path.join(apiDir, 'models');
  const modelsArquivos = listarRecursivo(modelsDir, ['.js']);
  const servicesDir = path.join(apiDir, 'services');
  const servicesArquivos = listarRecursivo(servicesDir, ['.js']);

  // Todos os controllers
  const todosArquivos = listarRecursivo(apiDir, ['.js']);
  const controllers = todosArquivos.filter(f => f.includes('controller'));

  // Endpoints de routes.js principal
  const routesJs = lerArquivo(path.join(apiDir, 'routes.js'));
  const endpointsGlobais = extrairEndpointsExpress(routesJs || '');

  // Endpoints por arquivo de rota
  const endpointsPorRota = rotasArquivos.map(f => {
    const conteudo = lerArquivo(f);
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      endpoints: extrairEndpointsExpress(conteudo || ''),
    };
  });

  // Modelos MongoDB
  const modelos = modelsArquivos.map(f => {
    const conteudo = lerArquivo(f);
    const nome = path.basename(f, '.js').replace('.model', '');
    // Extrair campos do schema
    const campos = [];
    if (conteudo) {
      const matches = [...conteudo.matchAll(/(\w+)\s*:\s*\{[^}]*type:\s*(\w+)/g)];
      matches.forEach(m => campos.push({ campo: m[1], tipo: m[2] }));
    }
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      nome_modelo: nome,
      campos: campos.slice(0, 20),
      tem_timestamps: conteudo ? conteudo.includes('timestamps') : false,
      tem_index: conteudo ? (conteudo.match(/index\s*:/g) || []).length : 0,
    };
  });

  // Services
  const services = servicesArquivos.map(f => {
    const conteudo = lerArquivo(f);
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      linhas: contarLinhas(conteudo),
      exports: extrairExports(conteudo),
    };
  });

  // Controllers resumo
  const controllersResumo = controllers.map(f => {
    const conteudo = lerArquivo(f);
    const funcoes = conteudo ? [...conteudo.matchAll(/(?:async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*async/g)].map(m => m[1] || m[2]).filter(Boolean) : [];
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      linhas: contarLinhas(conteudo),
      funcoes: funcoes.slice(0, 30),
      tem_openai: conteudo ? conteudo.includes('openai') || conteudo.includes('gpt') : false,
      tem_sqlserver: conteudo ? conteudo.includes('mssql') || conteudo.includes('sql.connect') : false,
      tem_mongodb: conteudo ? conteudo.includes('mongoose') || conteudo.includes('.save()') : false,
    };
  });

  // App.js para extrair middlewares e configurações
  const appJs = lerArquivo(path.join(apiDir, 'app.js'));
  const middlewares = appJs ? [...appJs.matchAll(/app\.use\(([^)]+)\)/g)].map(m => m[1].trim()) : [];

  // Package.json da API
  let pkgJson = {};
  try { pkgJson = JSON.parse(lerArquivo(path.join(BASE, 'axion-ia-panel/api/package.json')) || '{}'); } catch {}

  const totalEndpoints = endpointsGlobais.length + endpointsPorRota.reduce((a, r) => a + r.endpoints.length, 0);

  return {
    framework: 'Node.js + Express',
    porta: 3100,
    versao: pkgJson.version || '—',
    dependencias: Object.keys(pkgJson.dependencies || {}),
    bancos_de_dados: ['MongoDB (mongoose)', 'SQL Server (mssql) × 3'],
    estatisticas: {
      total_controllers: controllers.length,
      total_modelos: modelos.length,
      total_services: services.length,
      total_endpoints_globais: endpointsGlobais.length,
      total_arquivos_rota: rotasArquivos.length,
      total_endpoints_estimado: totalEndpoints,
    },
    middlewares,
    endpoints_globais: endpointsGlobais,
    endpoints_por_rota: endpointsPorRota,
    modelos_mongodb: modelos,
    controllers: controllersResumo,
    services,
  };
}

// ─── Análise dos portais Docusaurus ───────────────────────────────────────────

function analisarPortalDocusaurus(nome, dir) {
  if (!fs.existsSync(dir)) return { nome, erro: `Diretório não encontrado: ${dir}` };

  const docsDir = path.join(dir, 'docs');
  const srcDir = path.join(dir, 'src');

  const docsArquivos = listarRecursivo(docsDir, ['.md', '.mdx']);
  const srcArquivos = listarRecursivo(srcDir, ['.jsx', '.tsx', '.js', '.ts', '.css']);

  // Estrutura de docs
  const estruturaDocs = {};
  docsArquivos.forEach(f => {
    const rel = path.relative(docsDir, f);
    const partes = rel.split(path.sep);
    if (partes.length > 1) {
      const categoria = partes[0];
      if (!estruturaDocs[categoria]) estruturaDocs[categoria] = [];
      estruturaDocs[categoria].push(partes.slice(1).join('/'));
    } else {
      if (!estruturaDocs['_raiz']) estruturaDocs['_raiz'] = [];
      estruturaDocs['_raiz'].push(partes[0]);
    }
  });

  // Config
  let config = {};
  const configTs = lerArquivo(path.join(dir, 'docusaurus.config.ts'));
  const configJs = lerArquivo(path.join(dir, 'docusaurus.config.js'));
  const configConteudo = configTs || configJs || '';
  const tituloMatch = configConteudo.match(/title:\s*['"]([^'"]+)['"]/);
  const urlMatch = configConteudo.match(/url:\s*['"]([^'"]+)['"]/);
  const baseUrlMatch = configConteudo.match(/baseUrl:\s*['"]([^'"]+)['"]/);
  config = {
    titulo: tituloMatch?.[1] || '—',
    url: urlMatch?.[1] || '—',
    baseUrl: baseUrlMatch?.[1] || '—',
  };

  let pkgJson = {};
  try { pkgJson = JSON.parse(lerArquivo(path.join(dir, 'package.json')) || '{}'); } catch {}

  return {
    nome,
    framework: `Docusaurus ${pkgJson.dependencies?.['@docusaurus/core'] || '?'}`,
    config,
    estatisticas: {
      total_docs: docsArquivos.length,
      total_src: srcArquivos.length,
      total_categorias_docs: Object.keys(estruturaDocs).length,
    },
    estrutura_docs: estruturaDocs,
    dependencias: Object.keys(pkgJson.dependencies || {}),
  };
}

// ─── Análise de ciclos de processo ────────────────────────────────────────────

function analisarCiclosProcesso() {
  // Lê o App.jsx para extrair ciclos baseado nos grupos de menu
  const appConteudo = lerArquivo(path.join(BASE, 'axion-ia-panel/src/App.jsx')) || '';

  return {
    ciclos_identificados: [
      {
        nome: 'Ciclo de Atendimento ao Cliente',
        modulos: ['Chat IA', 'WhatsApp', 'Helpdesk Jitbit', 'Fila de Revisão', 'SLA Compliance'],
        rotas: ['/chat', '/whatsapp', '/helpdesk', '/confianca-revisao', '/sla-compliance'],
        integracao: 'Jitbit Helpdesk API + OpenAI + WhatsApp Web',
        descricao: 'Fluxo completo: ticket recebido → classificação IA → resposta automática → revisão humana → resolução',
      },
      {
        nome: 'Ciclo de Gestão de Sites',
        modulos: ['Dashboard Executivo', 'Visão Geral', 'Comparador Global', 'Health Check', 'Auditoria', 'Segurança', 'OCR', 'Equipamentos', 'APIs', 'Performance', 'Indicadores', 'Conformidade', 'IA Insights', 'Timeline'],
        rotas: ['/central-sites'],
        integracao: 'SQL Server AxHub/AxCross + Jitbit Helpdesk + sitesData.js',
        descricao: 'Ecossistema completo v3.0: 18 módulos para monitorar, comparar e analisar todos os sites clientes',
        versao: 'v3.0 — 18 módulos em 5 grupos',
      },
      {
        nome: 'Ciclo de Intelligence de Mercado',
        modulos: ['Busca Editais Gov.br', 'Análise Edital Avançada', 'Análise Multi-Produto', 'Roadmap', 'Specs', 'Conformidade'],
        rotas: ['/central-inteligencia', '/pipeline-editais', '/editais-gov', '/edital-avancado', '/analisa-multi', '/roadmap', '/specs', '/conformidade'],
        integracao: 'PNCP API + OpenAI + MongoDB',
        descricao: 'Pipeline completo: Buscar edital → Analisar com IA → Verificar conformidade → Planejar roadmap → Especificar features',
      },
      {
        nome: 'Ciclo de Validação e Qualidade',
        modulos: ['CUTI - Testes Inteligentes', 'Validation Hub', 'Gerenciador de Validação', 'Validação Visual', 'VARCO Monitor', 'Auditoria de Duplicidades'],
        rotas: ['/cuti', '/central-validacao', '/validation-hub', '/visual-validation', '/varco', '/duplicidade'],
        integracao: 'APIs dos sites + Puppeteer + OCR',
        descricao: 'Plataforma PIEQ: execução de scripts de validação, auditoria automática, diagnóstico de equipamentos',
      },
      {
        nome: 'Ciclo de Treinamento da IA',
        modulos: ['Knowledge Base', 'Treinamento', 'Logs', 'Fontes de Pesquisa'],
        rotas: ['/kb', '/treinamento', '/logs', '/fontes'],
        integracao: 'MongoDB (embeddings) + OpenAI Embeddings API',
        descricao: 'Alimentar KB → Gerar embeddings → Treinar classificador → Monitorar logs → Corrigir respostas',
      },
      {
        nome: 'Ciclo de Gestão Operacional',
        modulos: ['Operations Hub', 'Relatório de Fluxo', 'SLA Compliance', 'Planilha de Horas', 'Relatório por Contrato'],
        rotas: ['/operations-hub', '/relatorio-fluxo', '/sla-compliance', '/planilha-horas', '/relatorio-contrato'],
        integracao: 'Jitbit Helpdesk API + SQL Server AxHub',
        descricao: 'Monitorar operações em tempo real, gerar relatórios de fluxo, SLA e produtividade da equipe',
      },
      {
        nome: 'Ciclo de Análise de Imagens (OCR/IA)',
        modulos: ['Análise de Imagens', 'VARCO Monitor', 'Diagnóstico de Medição'],
        rotas: ['/analise-imagens', '/varco', '/diagnostico-medicao'],
        integracao: 'OpenAI Vision API + SQL Server + ITScam Pumatronix cameras',
        descricao: 'Capturar imagens → OCR/análise IA → Validar placas → Diagnosticar equipamentos com problemas de medição',
      },
      {
        nome: 'Ciclo de Documentação Automática',
        modulos: ['Gerador de Docs', 'Fontes de Pesquisa', 'Portais Docusaurus (AxHub, AxTon, AxCross)'],
        rotas: ['/gerar-doc', '/fontes'],
        integracao: 'OpenAI + Docusaurus + MongoDB',
        descricao: 'Importar fontes → Analisar lacunas com IA → Gerar documentação → Publicar no portal Docusaurus',
      },
      {
        nome: 'Ciclo de Monitoramento WhatsApp',
        modulos: ['WhatsApp Bot', 'Sessões', 'Integração Jitbit'],
        rotas: ['/whatsapp'],
        integracao: 'WhatsApp Web (whatsapp-web.js) + Jitbit Helpdesk + MongoDB',
        descricao: 'Receber mensagem WhatsApp → Identificar usuário (LGPD) → Criar ticket Jitbit → Responder com IA',
      },
    ],
  };
}

// ─── Análise de integrações externas ─────────────────────────────────────────

function analisarIntegracoes() {
  return {
    integracoes: [
      {
        nome: 'Jitbit Helpdesk',
        tipo: 'REST API',
        direcao: 'bidirectional',
        uso: 'Listar tickets, responder, criar, classificar, polling automático, SLA, horas técnico',
        endpoints_consumidos: ['GET /helpdesk/Tickets', 'POST /helpdesk/PostReply', 'GET /helpdesk/Categories'],
        autenticacao: 'Basic Auth (token)',
      },
      {
        nome: 'OpenAI API',
        tipo: 'REST API',
        direcao: 'outbound',
        uso: 'Chat completions, embeddings para KB, análise de imagens, geração de docs, classificação',
        modelos: ['gpt-4o', 'gpt-4o-mini', 'text-embedding-ada-002'],
      },
      {
        nome: 'SQL Server AxHub',
        tipo: 'Database',
        direcao: 'inbound',
        uso: 'Equipamentos, operações, infrações, heartbeat, passagens, triagens, tabelas',
        driver: 'mssql (node-mssql)',
      },
      {
        nome: 'SQL Server AxTon',
        tipo: 'Database',
        direcao: 'inbound',
        uso: 'Pesagens, infrações, heartbeat, tabelas',
        driver: 'mssql (node-mssql)',
      },
      {
        nome: 'SQL Server AxCross',
        tipo: 'Database',
        direcao: 'inbound',
        uso: 'Equipamentos, locais, operações, passagens, heartbeat',
        driver: 'mssql (node-mssql)',
      },
      {
        nome: 'MongoDB',
        tipo: 'Database',
        direcao: 'bidirectional',
        uso: 'Logs de chat, KB com embeddings, roadmaps, specs, conformidade, jobs, fontes, whatsapp sessions',
        driver: 'mongoose',
        collections: ['logs', 'kbs', 'roadmaps', 'specs', 'conformidades', 'jobs', 'fontes', 'whatsappsessaos', 'approvals'],
      },
      {
        nome: 'PNCP (Portal Nacional de Compras Públicas)',
        tipo: 'REST API',
        direcao: 'inbound',
        uso: 'Busca e importação automática de editais licitatórios',
        url: 'https://pncp.gov.br/api',
      },
      {
        nome: 'WhatsApp Web',
        tipo: 'WebSocket/Session',
        direcao: 'bidirectional',
        uso: 'Receber e enviar mensagens WhatsApp, gerenciar sessões',
        driver: 'whatsapp-web.js',
      },
      {
        nome: 'ITScam Pumatronix Cameras',
        tipo: 'REST API',
        direcao: 'inbound',
        uso: 'Validação de dispositivos, análise de incidentes, heartbeat de câmeras VARCO',
        integracao: 'VARCO Monitor + axhub-controller',
      },
    ],
  };
}

// ─── Análise de dados (sitesData.js) ─────────────────────────────────────────

function analisarDadosSites() {
  const conteudo = lerArquivo(path.join(BASE, 'axion-ia-panel/src/data/sitesData.js'));
  if (!conteudo) return { erro: 'sitesData.js não encontrado' };

  const axhubMatch = [...conteudo.matchAll(/id:\s*['"](\w+)['"]/g)];
  const nomeMatch = [...conteudo.matchAll(/nome:\s*['"]([^'"]+)['"]/g)];

  // Contar exports
  const exports = extrairExports(conteudo);

  // Extrair versões
  const versoes = {};
  const versoesMatch = [...conteudo.matchAll(/versao:\s*['"]([^'"]+)['"]/g)];
  versoesMatch.forEach(m => { versoes[m[1]] = (versoes[m[1]] || 0) + 1; });

  // Extrair estados
  const estados = {};
  const estadosMatch = [...conteudo.matchAll(/estado:\s*['"]([^'"]+)['"]/g)];
  estadosMatch.forEach(m => { estados[m[1]] = (estados[m[1]] || 0) + 1; });

  return {
    arquivo: 'axion-ia-panel/src/data/sitesData.js',
    linhas: contarLinhas(conteudo),
    exports,
    total_registros_id: axhubMatch.length,
    total_registros_nome: nomeMatch.length,
    versoes_distribuicao: versoes,
    estados_distribuicao: estados,
  };
}

// ─── Análise dos agentes ─────────────────────────────────────────────────────

function analisarAgentes() {
  const agentDir = path.join(BASE, 'axion-ia-panel/api/src/agent');
  if (!fs.existsSync(agentDir)) return { erro: 'Diretório agent não encontrado' };

  const arquivos = listarRecursivo(agentDir, ['.js']);
  return arquivos.map(f => {
    const conteudo = lerArquivo(f);
    const funcoes = conteudo ? [...conteudo.matchAll(/(?:async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(/g)].map(m => m[1] || m[2]).filter(Boolean) : [];
    return {
      arquivo: path.relative(BASE, f).replace(/\\/g, '/'),
      linhas: contarLinhas(conteudo),
      funcoes: funcoes.slice(0, 20),
    };
  });
}

// ─── Inventário de arquivos raiz ──────────────────────────────────────────────

function analisarArquivosRaiz() {
  const scripts = [];
  const analises = [];
  const docs = [];

  try {
    const itens = fs.readdirSync(BASE);
    for (const item of itens) {
      if (item.startsWith('.')) continue;
      const ext = path.extname(item);
      const full = path.join(BASE, item);
      try {
        const stat = fs.statSync(full);
        if (stat.isFile()) {
          if (['.mjs', '.js', '.ps1', '.sh'].includes(ext)) {
            scripts.push({ arquivo: item, tamanho_kb: Math.round(stat.size / 1024 * 10) / 10 });
          } else if (item.startsWith('ANALISE') || item.startsWith('AUDITORIA') || item.startsWith('RELATORIO')) {
            analises.push({ arquivo: item, tamanho_kb: Math.round(stat.size / 1024 * 10) / 10 });
          } else if (ext === '.md') {
            docs.push({ arquivo: item, tamanho_kb: Math.round(stat.size / 1024 * 10) / 10 });
          }
        }
      } catch {}
    }
  } catch {}

  return { scripts, analises_geradas: analises, documentos_md: docs };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('🚀 Iniciando análise completa do ecossistema AxionIA...\n');

const analise = {
  meta: {
    gerado_em: new Date().toISOString(),
    gerado_por: 'gerar-analise-json.mjs v2.0',
    workspace: BASE,
    descricao: 'Análise completa do ecossistema AxionIA — painel, API, portais, dados e ciclos de processo',
  },

  ecossistema: {
    nome: 'AxionIA Platform',
    versao: 'v4.0 — 22 Engines Ativos',
    componentes: [
      'axion-ia-panel (Frontend React/Vite)',
      'axion-ia-panel/api (Backend Node.js/Express)',
      'AxHub/docs-portal (Docusaurus)',
      'AxTon/docs-portal (Docusaurus)',
      'AxCross/docs-portal (Docusaurus)',
    ],
    portas: { painel: 3017, api: 3100, axhub_docs: 3010, axton_docs: 3011, axcross_docs: 3012 },
  },

  painel: (() => { console.log('  📱 Analisando painel (frontend)...'); return analisarPainel(); })(),
  api: (() => { console.log('  ⚙️  Analisando API (backend)...'); return analisarAPI(); })(),
  dados_sites: (() => { console.log('  🌐 Analisando dados de sites...'); return analisarDadosSites(); })(),
  agentes: (() => { console.log('  🤖 Analisando agentes de IA...'); return analisarAgentes(); })(),

  portais_docusaurus: {
    axhub: (() => { console.log('  📚 Analisando portal AxHub...'); return analisarPortalDocusaurus('AxHub', path.join(BASE, 'AxHub/docs-portal')); })(),
    axton: (() => { console.log('  📚 Analisando portal AxTon...'); return analisarPortalDocusaurus('AxTon', path.join(BASE, 'AxTon/docs-portal')); })(),
    axcross: (() => { console.log('  📚 Analisando portal AxCross...'); return analisarPortalDocusaurus('AxCross', path.join(BASE, 'AxCross/docs-portal')); })(),
  },

  ciclos_de_processo: (() => { console.log('  🔄 Mapeando ciclos de processo...'); return analisarCiclosProcesso(); })(),
  integracoes: (() => { console.log('  🔗 Mapeando integrações...'); return analisarIntegracoes(); })(),
  arquivos_raiz: (() => { console.log('  📁 Inventariando arquivos raiz...'); return analisarArquivosRaiz(); })(),

  resumo_executivo: null, // preenchido abaixo
};

// ─── Resumo executivo ─────────────────────────────────────────────────────────

const totalPaginas   = analise.painel?.estatisticas?.total_paginas || 0;
const totalRotas     = analise.painel?.app_jsx?.total_rotas || 0;
const totalEndpoints = analise.api?.estatisticas?.total_endpoints_estimado || 0;
const totalModelos   = analise.api?.estatisticas?.total_modelos || 0;
const totalDocs      = (analise.portais_docusaurus.axhub?.estatisticas?.total_docs || 0) +
                       (analise.portais_docusaurus.axton?.estatisticas?.total_docs || 0) +
                       (analise.portais_docusaurus.axcross?.estatisticas?.total_docs || 0);
const totalCiclos    = analise.ciclos_de_processo?.ciclos_identificados?.length || 0;
const totalIntegracoes = analise.integracoes?.integracoes?.length || 0;

analise.resumo_executivo = {
  data_analise: new Date().toISOString().split('T')[0],
  plataforma: 'AxionIA Platform v4.0',
  total_paginas_painel: totalPaginas,
  total_rotas_registradas: totalRotas,
  total_endpoints_api: totalEndpoints,
  total_modelos_mongodb: totalModelos,
  total_docs_publicados: totalDocs,
  total_ciclos_processo: totalCiclos,
  total_integracoes_externas: totalIntegracoes,
  linhas_codigo_painel: analise.painel?.estatisticas?.linhas_paginas || 0,
  tecnologias_principais: [
    'React 18 + Vite',
    'Node.js + Express',
    'MongoDB (mongoose)',
    'SQL Server × 3 (mssql)',
    'OpenAI API (GPT-4o + Embeddings)',
    'Docusaurus 3 × 3',
    'React Router v6',
    'WhatsApp Web',
    'Jitbit Helpdesk API',
    'PNCP API',
  ],
  status_geral: 'OPERACIONAL',
  modulos_ativos_central_sites: 18,
  versao_central_sites: 'v3.0',
};

// ─── Salvar JSON ──────────────────────────────────────────────────────────────

const json = JSON.stringify(analise, null, 2);
fs.writeFileSync(OUTPUT, json, 'utf-8');

const tamanhoMb = (json.length / 1024 / 1024).toFixed(2);

console.log('\n✅ Análise concluída!\n');
console.log(`📄 Arquivo: ${path.basename(OUTPUT)}`);
console.log(`📦 Tamanho: ${tamanhoMb} MB (${json.length.toLocaleString()} caracteres)`);
console.log('\n📊 Resumo Executivo:');
console.log(`   • Páginas no painel:        ${totalPaginas}`);
console.log(`   • Rotas registradas:         ${totalRotas}`);
console.log(`   • Endpoints da API:          ${totalEndpoints}`);
console.log(`   • Modelos MongoDB:           ${totalModelos}`);
console.log(`   • Docs publicados:           ${totalDocs}`);
console.log(`   • Ciclos de processo:        ${totalCiclos}`);
console.log(`   • Integrações externas:      ${totalIntegracoes}`);
console.log(`   • Linhas de código (painel): ${(analise.painel?.estatisticas?.linhas_paginas || 0).toLocaleString()}`);
console.log('\n🎯 Use o arquivo JSON para análise em IA, LLM ou dashboards.\n');
