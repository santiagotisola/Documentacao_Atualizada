import React, { useState, useMemo } from 'react';
import { AXHUB_SITES, AXCROSS_SITES, MODULOS, TIPOS_CONTRATO, FEATURE_FLAGS } from '../data/sitesData';
import GuiaSites from './GuiaSites';
import IntelligenceDashboard from './IntelligenceDashboard';
import CredenciaisManager from '../components/CredenciaisManager';
import './AnalisesSites.css';

/* ═══════════════════════════════════════════════════════════════════════
   Painel Explicativo — Metodologia & Glossário
   ═══════════════════════════════════════════════════════════════════════ */

function PainelMetodologia({ aberto, toggle }) {
  return (
    <div className="metodologia-painel">
      <button className="metodologia-toggle" onClick={toggle}>
        📖 {aberto ? 'Ocultar' : 'Entenda esta Análise'} — Critérios, Campos e Metodologia
        <span className={`metodologia-seta ${aberto ? 'aberto' : ''}`}>▼</span>
      </button>

      {aberto && (
        <div className="metodologia-conteudo">
          {/* Metodologia */}
          <div className="metodologia-secao">
            <h3>🔬 Como esta análise foi feita</h3>
            <p>
              Cada site <strong>AxHub</strong> e <strong>AxCross</strong> foi acessado individualmente via navegador automatizado.
              Os dados foram coletados diretamente das telas do sistema em produção, sem acesso ao banco de dados.
              A análise reflete o <strong>estado real</strong> de cada contrato no momento da coleta.
            </p>
            <ul>
              <li><strong>Período:</strong> Maio de 2026</li>
              <li><strong>Método:</strong> Login no sistema → navegação por todas as telas → extração de contagens, versões e configurações visíveis</li>
              <li><strong>Cobertura AxHub:</strong> 14 de 15 sites acessados (ITPS inacessível por credenciais)</li>
              <li><strong>Cobertura AxCross:</strong> 8 de 9 sites acessados (SETRANS inacessível por timeout)</li>
            </ul>
          </div>

          {/* Abas */}
          <div className="metodologia-secao">
            <h3>📑 As 4 Abas de Visualização</h3>
            <div className="glossario-grid">
              <div className="glossario-item">
                <strong>📊 Visão Geral</strong>
                <p>Cards resumidos de cada site. Mostra nome, estado, tipo de contrato, versão, quantidade de menus, BI reports, equipamentos e OCR. Clique em um card para selecioná-lo para comparação ou detalhe.</p>
              </div>
              <div className="glossario-item">
                <strong>⚖️ Comparar</strong>
                <p>Tabela lado a lado dos sites selecionados (ou todos os ativos). Compara Funcionalidades Ativas, relatórios BI disponíveis e métricas gerais. Ideal para identificar diferenças entre contratos.</p>
              </div>
              <div className="glossario-item">
                <strong>🔍 Detalhe Individual</strong>
                <p>Ficha completa de um site específico com todas as informações coletadas: dados gerais, funcionalidades ativas, lista de relatórios BI, equipamentos, grupos operacionais e observações.</p>
              </div>
              <div className="glossario-item">
                <strong>🧩 Por Módulo</strong>
                <p>Visualização centrada nos módulos do sistema (Infrações, Cronotacógrafo, Balança, MDF-e, etc.). Mostra quais sites têm cada módulo disponível.</p>
              </div>
            </div>
          </div>

          {/* Campos AxHub */}
          <div className="metodologia-secao">
            <h3>📋 Campos Analisados — AxHub</h3>
            <table className="glossario-tabela">
              <thead>
                <tr><th>Campo</th><th>O que é</th><th>Como foi coletado</th><th>Por que importa</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Versão</strong></td>
                  <td>Versão do sistema AxHub instalada no site (ex: v.1.0.0, v.1.2.0)</td>
                  <td>Rodapé da página — link com texto "AxHub v.X.X.X"</td>
                  <td>Indica quão atualizado está o site. Versões mais novas (v.1.2.0) têm mais funcionalidades</td>
                </tr>
                <tr>
                  <td><strong>Menu Count</strong></td>
                  <td>Quantidade total de itens visíveis no menu lateral do sistema</td>
                  <td>Contagem de todos os elementos <code>.menu-link</code> na sidebar</td>
                  <td>Baseline é 80 menus. Sites com 82-84 menus possuem Funcionalidades Ativas (funcionalidades extras)</td>
                </tr>
                <tr>
                  <td><strong>Funcionalidades Ativas</strong></td>
                  <td>Menus que excedem a base padrão de 80 itens</td>
                  <td>Comparação da lista de menus contra o baseline de 80 menus padrão</td>
                  <td>Funcionalidades opcionais habilitadas por contrato: Infrações Descartadas, Consulta de Placas, Bloqueio de Operação, Acessos Por IP</td>
                </tr>
                <tr>
                  <td><strong>Relatórios BI</strong></td>
                  <td>Dashboards Power BI integrados ao sistema, acessíveis em Relatórios → Relatórios BI</td>
                  <td>Navegação à tela <code>/relatorio/relatoriobi</code> e listagem dos links disponíveis</td>
                  <td>Variam muito entre contratos. Alguns são exclusivos de um site (ex: "Infrações Arrecadadas por Equip." no SMTT)</td>
                </tr>
                <tr>
                  <td><strong>Equipamentos</strong></td>
                  <td>Dispositivos de fiscalização cadastrados (radares, câmeras OCR, balanças)</td>
                  <td>Tela de Operações — contagem de linhas na tabela de equipamentos</td>
                  <td>Reflete o tamanho do parque instalado do contrato</td>
                </tr>
                <tr>
                  <td><strong>Grupos</strong></td>
                  <td>Agrupamentos operacionais dos equipamentos (ex: FOCALLE, BLITZ, LOTE 01)</td>
                  <td>Cabeçalhos de grupo na tela de Operações</td>
                  <td>Indica como o órgão organiza seus equipamentos — por fabricante, lote licitatório ou tipo</td>
                </tr>
                <tr>
                  <td><strong>Fabricantes</strong></td>
                  <td>Fabricantes dos equipamentos de fiscalização (ex: FOCALLE, PERKONS, VIZENTEC)</td>
                  <td>Coluna "Fabricante" na tela de Operações</td>
                  <td>Mostra a diversidade de fornecedores de hardware em cada contrato</td>
                </tr>
                <tr>
                  <td><strong>OCR %</strong></td>
                  <td>Taxa de reconhecimento óptico de caracteres nas placas dos veículos</td>
                  <td>Dashboard principal — widget de Triagem Mensal</td>
                  <td>Métrica de qualidade: indica a precisão na leitura automática de placas. Varia de ~50% a ~97%</td>
                </tr>
                <tr>
                  <td><strong>Colunas Operações</strong></td>
                  <td>Quais colunas aparecem na tabela da tela de Operações</td>
                  <td>Cabeçalhos da tabela na tela <code>/operacao</code></td>
                  <td>Sites v.1.0.0 usam layout metrológico (Fim Op., Dt. Aceite, Homol., Monit.). Sites v.1.1+ usam layout trânsito (Grupo, Fabricante, Instalação)</td>
                </tr>
                <tr>
                  <td><strong>Passagens/dia</strong></td>
                  <td>Volume médio de passagens de veículos registradas por dia</td>
                  <td>Dashboard principal — widget de passagens diárias (quando disponível)</td>
                  <td>Indica o volume de tráfego monitorado pelo contrato</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Campos AxCross */}
          <div className="metodologia-secao">
            <h3>🔀 Campos Analisados — AxCross</h3>
            <table className="glossario-tabela">
              <thead>
                <tr><th>Campo</th><th>O que é</th><th>Como foi coletado</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Equipamentos</strong></td>
                  <td>Quantidade de pontos de monitoramento cadastrados</td>
                  <td>Dashboard principal — card "Equipamentos"</td>
                </tr>
                <tr>
                  <td><strong>Faixas</strong></td>
                  <td>Total de faixas de rolamento monitoradas (cada equipamento pode cobrir múltiplas faixas)</td>
                  <td>Dashboard principal — card "Faixas"</td>
                </tr>
                <tr>
                  <td><strong>Alertas</strong></td>
                  <td>Alertas de cruzamento ativos (veículo monitorado detectado por câmera)</td>
                  <td>Dashboard principal — card "Alertas"</td>
                </tr>
                <tr>
                  <td><strong>Veículos Monitorados</strong></td>
                  <td>Placas cadastradas para monitoramento (veículos de interesse)</td>
                  <td>Dashboard principal — card "Veículos Monitorados"</td>
                </tr>
                <tr>
                  <td><strong>Passagens/dia</strong></td>
                  <td>Volume diário de leituras de placas pelas câmeras</td>
                  <td>Dashboard principal — card "Passagens"</td>
                </tr>
                <tr>
                  <td><strong>MDF-e</strong></td>
                  <td>Módulo de Manifesto Digital de Documentos Fiscais Eletrônicos (exclusivo SEFAZPI)</td>
                  <td>Menu lateral — item adicional "MDF-e" e respectivas sub-telas</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tipos de Contrato */}
          <div className="metodologia-secao">
            <h3>🏷️ Tipos de Contrato</h3>
            <div className="glossario-grid">
              <div className="glossario-item" style={{ borderLeft: '4px solid #3498db' }}>
                <strong>Metrologia</strong>
                <p>Contratos com Institutos de Pesos e Medidas (IPEM/IMETRO). Verificação metrológica de equipamentos de fiscalização. Inclui módulo Cronotacógrafo e padrão de BI com relatórios "Crono".</p>
              </div>
              <div className="glossario-item" style={{ borderLeft: '4px solid #e74c3c' }}>
                <strong>Trânsito Municipal</strong>
                <p>Contratos com prefeituras/superintendências municipais de trânsito. Fiscalização eletrônica de velocidade dentro do município. Geralmente versões mais recentes (v.1.2.0).</p>
              </div>
              <div className="glossario-item" style={{ borderLeft: '4px solid #e67e22' }}>
                <strong>Trânsito Estadual</strong>
                <p>Contratos com DETRANs estaduais. Fiscalização de velocidade em rodovias estaduais. Podem incluir pesagem veicular e múltiplos fabricantes de equipamentos.</p>
              </div>
              <div className="glossario-item" style={{ borderLeft: '4px solid #2ecc71' }}>
                <strong>Rodovias</strong>
                <p>Contratos com departamentos rodoviários (ex: DERSE). Foco em fiscalização rodoviária incluindo pesagem. Geralmente o maior parque de equipamentos.</p>
              </div>
              <div className="glossario-item" style={{ borderLeft: '4px solid #9b59b6' }}>
                <strong>Fiscal</strong>
                <p>Contratos com secretarias de fazenda/economia. Foco em monitoramento fiscal de cargas e veículos. Inclui módulos exclusivos como MDF-e (SEFAZPI) ou OCR avançado (ECONOMIA).</p>
              </div>
            </div>
          </div>

          {/* Critérios de classificação */}
          <div className="metodologia-secao">
            <h3>📐 Critérios de Classificação</h3>
            <table className="glossario-tabela">
              <thead>
                <tr><th>Critério</th><th>Regra</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Status Ativo/Inacessível</strong></td>
                  <td>Ativo = login bem-sucedido e dados coletados. Inacessível = credenciais inválidas ou timeout de rede.</td>
                </tr>
                <tr>
                  <td><strong>Menu base (80)</strong></td>
                  <td>Todos os sites possuem pelo menos 80 menus. Menus adicionais (81-84) são Funcionalidades Ativas opcionais habilitadas por contrato.</td>
                </tr>
                <tr>
                  <td><strong>BI Exclusivo</strong></td>
                  <td>Relatório BI que aparece em apenas um ou dois sites, não sendo parte do pacote padrão.</td>
                </tr>
                <tr>
                  <td><strong>Layout Metrologia vs Trânsito</strong></td>
                  <td>Operações com colunas "Fim Op./Dt. Aceite/Homol./Monit." = metrologia. Colunas "Grupo/Fabricante/Instalação/Início Op." = trânsito.</td>
                </tr>
                <tr>
                  <td><strong>Versão do Sistema</strong></td>
                  <td>v.1.0.0 = base original (metrologia). v.1.1.0/v.1.1.1 = intermediária. v.1.2.0 = mais recente com todas as funcionalidades.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Descrições contextuais por aba
   ═══════════════════════════════════════════════════════════════════════ */

const DESCRICOES_ABAS = {
  'visao-geral': {
    titulo: 'Visão geral de todos os sites',
    texto: 'Cada card representa um contrato/site em produção. O indicador verde (●) significa que o site foi acessado com sucesso. Clique nos cards para selecioná-los e usar nas abas Comparar e Detalhe.',
  },
  'comparar': {
    titulo: 'Comparação lado a lado',
    texto: 'Tabelas cruzando Funcionalidades Ativas, Relatórios BI (dashboards Power BI disponíveis) e Métricas Gerais. Se nenhum site estiver selecionado, todos os ativos são exibidos.',
  },
  'detalhe': {
    titulo: 'Ficha completa do site',
    texto: 'Todas as informações coletadas de um site específico: dados gerais, funcionalidades ativadas, lista completa de relatórios BI, detalhes de equipamentos, grupos operacionais e observações.',
  },
  'modulos': {
    titulo: 'Disponibilidade por módulo',
    texto: 'Visualização centrada nos módulos do sistema. Mostra quais sites possuem cada módulo ativo, útil para entender o alcance funcional de cada contrato.',
  },
  'guia': {
    titulo: 'Manual operacional por site',
    texto: 'Ficha detalhada de cada site com funcionalidades ativas, relatórios BI (exclusivos vs padrão), equipamentos, fabricantes, colunas de operações e observações. Selecione um site para ver seu guia completo.',
  },
};

function DescricaoAba({ tab }) {
  const desc = DESCRICOES_ABAS[tab];
  if (!desc) return null;
  return (
    <div className="descricao-aba">
      <strong>{desc.titulo}</strong> — {desc.texto}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Componentes auxiliares
   ═══════════════════════════════════════════════════════════════════════ */

function Badge({ tipo }) {
  const t = TIPOS_CONTRATO.find(tc => {
    if (tc.id === 'metrologia' && tipo === 'Metrologia') return true;
    if (tc.id === 'transito-municipal' && tipo === 'Trânsito Municipal') return true;
    if (tc.id === 'transito-estadual' && tipo === 'Trânsito Estadual') return true;
    if (tc.id === 'rodovias' && tipo === 'Rodovias') return true;
    if (tc.id === 'fiscal' && (tipo === 'Fiscal')) return true;
    return false;
  });
  return (
    <span className="site-card-badge" style={{ background: t?.cor || '#666' }}>
      {tipo}
    </span>
  );
}

function StatusDot({ status }) {
  const cor = status === 'ativo' ? '#27ae60' : '#e74c3c';
  return <span style={{ color: cor, fontSize: '0.7rem' }}>●</span>;
}

/* ═══════════════════════════════════════════════════════════════════════
   Vista: Cards de Sites (visão geral)
   ═══════════════════════════════════════════════════════════════════════ */

function VistaSites({ sites, sistema, selecionados, toggleSelecionado }) {
  return (
    <div className="sites-grid">
      {sites.map(site => (
        <div
          key={site.id}
          className={`site-card ${selecionados.includes(site.id) ? 'selected' : ''}`}
          onClick={() => toggleSelecionado(site.id)}
        >
          <div className="site-card-header">
            <h4 className="site-card-nome">
              <StatusDot status={site.status} /> {site.nome}
            </h4>
            <Badge tipo={site.tipo} />
          </div>
          <div className="site-card-meta">
            <span>📍 {site.estado}</span>
            {sistema === 'axhub' && site.versao && <span>🏷️ {site.versao}</span>}
            {sistema === 'axhub' && site.menuCount && <span>📋 {site.menuCount} menus</span>}
          </div>
          {sistema === 'axhub' && site.status === 'ativo' && (
            <div className="site-card-stats">
              <div className="stat-item">
                <div className="stat-valor">{site.bi?.length || 0}</div>
                <div className="stat-label">BI Reports</div>
              </div>
              <div className="stat-item">
                <div className="stat-valor">{site.equipamentos?.total || '—'}</div>
                <div className="stat-label">Equip.</div>
              </div>
              <div className="stat-item">
                <div className="stat-valor">{site.ocr ? `${site.ocr}%` : '—'}</div>
                <div className="stat-label">OCR</div>
              </div>
            </div>
          )}
          {sistema === 'axcross' && site.status === 'ativo' && (
            <div className="site-card-stats">
              <div className="stat-item">
                <div className="stat-valor">{site.equipamentos}</div>
                <div className="stat-label">Equip.</div>
              </div>
              <div className="stat-item">
                <div className="stat-valor">{site.faixas}</div>
                <div className="stat-label">Faixas</div>
              </div>
              <div className="stat-item">
                <div className="stat-valor">{site.passagensDia?.toLocaleString('pt-BR') || '—'}</div>
                <div className="stat-label">Pass/dia</div>
              </div>
            </div>
          )}
          {site.observacoes && (
            <p style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.5rem', marginBottom: 0 }}>
              {site.observacoes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Vista: Comparação lado a lado
   ═══════════════════════════════════════════════════════════════════════ */

function VistaComparacao({ selecionados, sistema }) {
  const allSites = sistema === 'axhub' ? AXHUB_SITES : AXCROSS_SITES;
  const sites = selecionados.length > 0
    ? allSites.filter(s => selecionados.includes(s.id))
    : allSites.filter(s => s.status === 'ativo');

  if (sites.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>Selecione sites para comparar nos cards acima.</p>;
  }

  if (sistema === 'axhub') {
    // Todos os BI reports únicos
    const allBI = [...new Set(sites.flatMap(s => s.bi || []))].sort();
    const allExtras = [...new Set(sites.flatMap(s => s.extras || []))];

    return (
      <div className="comparacao-container">
        <h3>Comparação de Funcionalidades — {sites.length} sites</h3>

        <h4 style={{ marginTop: '1.5rem' }}>Funcionalidades Ativas</h4>
        <table className="comparacao-table">
          <thead>
            <tr>
              <th>Funcionalidade</th>
              {sites.map(s => <th key={s.id}>{s.nome}</th>)}
            </tr>
          </thead>
          <tbody>
            {allExtras.map(extra => (
              <tr key={extra}>
                <td>{extra}</td>
                {sites.map(s => (
                  <td key={s.id}>
                    {s.extras.includes(extra)
                      ? <span className="check-sim">✓</span>
                      : <span className="check-nao">✗</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <h4 style={{ marginTop: '1.5rem' }}>Relatórios BI</h4>
        <table className="comparacao-table">
          <thead>
            <tr>
              <th>Relatório</th>
              {sites.map(s => <th key={s.id}>{s.nome}</th>)}
            </tr>
          </thead>
          <tbody>
            {allBI.map(bi => (
              <tr key={bi}>
                <td>{bi}</td>
                {sites.map(s => (
                  <td key={s.id}>
                    {(s.bi || []).includes(bi)
                      ? <span className="check-sim">✓</span>
                      : <span className="check-nao">✗</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <h4 style={{ marginTop: '1.5rem' }}>Métricas Gerais</h4>
        <table className="comparacao-table">
          <thead>
            <tr>
              <th>Métrica</th>
              {sites.map(s => <th key={s.id}>{s.nome}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Versão</td>
              {sites.map(s => <td key={s.id}>{s.versao || '—'}</td>)}
            </tr>
            <tr>
              <td>Menu Count</td>
              {sites.map(s => <td key={s.id}>{s.menuCount || '—'}</td>)}
            </tr>
            <tr>
              <td>Total Equipamentos</td>
              {sites.map(s => <td key={s.id}>{s.equipamentos?.total || '—'}</td>)}
            </tr>
            <tr>
              <td>OCR %</td>
              {sites.map(s => <td key={s.id}>{s.ocr ? `${s.ocr}%` : '—'}</td>)}
            </tr>
            <tr>
              <td>Fabricantes</td>
              {sites.map(s => <td key={s.id} style={{ fontSize: '0.75rem' }}>{s.fabricantes?.join(', ') || '—'}</td>)}
            </tr>
            <tr>
              <td>Grupos</td>
              {sites.map(s => <td key={s.id} style={{ fontSize: '0.75rem' }}>{s.equipamentos?.grupos?.join(', ') || '—'}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // AxCross comparison
  return (
    <div className="comparacao-container">
      <h3>Comparação AxCross — {sites.length} sites</h3>
      <table className="comparacao-table">
        <thead>
          <tr>
            <th>Métrica</th>
            {sites.map(s => <th key={s.id}>{s.nome}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Equipamentos</td>
            {sites.map(s => <td key={s.id}><strong>{s.equipamentos}</strong></td>)}
          </tr>
          <tr>
            <td>Faixas</td>
            {sites.map(s => <td key={s.id}>{s.faixas}</td>)}
          </tr>
          <tr>
            <td>Alertas</td>
            {sites.map(s => <td key={s.id}>{s.alertas}</td>)}
          </tr>
          <tr>
            <td>Veículos Monitorados</td>
            {sites.map(s => <td key={s.id}>{s.veiculos?.toLocaleString('pt-BR') || '0'}</td>)}
          </tr>
          <tr>
            <td>Passagens/dia</td>
            {sites.map(s => <td key={s.id}><strong>{s.passagensDia?.toLocaleString('pt-BR') || '—'}</strong></td>)}
          </tr>
          <tr>
            <td>Menu Extra (MDF-e)</td>
            {sites.map(s => (
              <td key={s.id}>
                {s.menuExtra
                  ? <span className="check-sim">✓ {s.menuExtra}</span>
                  : <span className="check-nao">✗</span>}
              </td>
            ))}
          </tr>
          <tr>
            <td>Tipo Contrato</td>
            {sites.map(s => <td key={s.id}>{s.tipo}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Vista: Detalhe Individual
   ═══════════════════════════════════════════════════════════════════════ */

function VistaDetalhe({ siteId, sistema }) {
  const allSites = sistema === 'axhub' ? AXHUB_SITES : AXCROSS_SITES;
  const site = allSites.find(s => s.id === siteId);

  if (!site) {
    return <p style={{ textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>Selecione um site nos cards acima para ver detalhes.</p>;
  }

  if (sistema === 'axhub') {
    return (
      <div className="site-detalhe">
        <div className="site-detalhe-header">
          <div>
            <h2>{site.nome} <Badge tipo={site.tipo} /></h2>
            <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-600)' }}>{site.orgao}</p>
          </div>
          <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem' }}>
            🔗 Acessar Site
          </a>
        </div>

        <div className="detalhe-secoes">
          <div className="detalhe-secao">
            <h4>📋 Informações Gerais</h4>
            <ul className="detalhe-lista">
              <li><strong>URL:</strong> {site.url}</li>
              <li><strong>Estado:</strong> {site.estado}</li>
              <li><strong>Versão:</strong> {site.versao || '—'}</li>
              <li><strong>Menus:</strong> {site.menuCount || '—'} itens</li>
              <li><strong>Tipo:</strong> {site.tipo}</li>
              <li><strong>Status:</strong> {site.status === 'ativo' ? '🟢 Ativo' : '🔴 Inacessível'}</li>
            </ul>
          </div>

          <div className="detalhe-secao">
            <h4>🔧 Funcionalidades Ativas</h4>
            {site.extras.length > 0 ? (
              <ul className="detalhe-lista">
                {site.extras.map(e => <li key={e}>✅ {e}</li>)}
              </ul>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-500)' }}>Nenhuma funcionalidade extra (menu base 80)</p>
            )}
          </div>

          <div className="detalhe-secao">
            <h4>📈 Relatórios BI ({site.bi?.length || 0})</h4>
            <ul className="detalhe-lista">
              {(site.bi || []).map(b => <li key={b}>📊 {b}</li>)}
            </ul>
          </div>

          <div className="detalhe-secao">
            <h4>📡 Equipamentos</h4>
            <ul className="detalhe-lista">
              <li><strong>Total:</strong> {site.equipamentos?.total || '—'}</li>
              <li><strong>Grupos:</strong> {site.equipamentos?.grupos?.join(', ') || '—'}</li>
              <li><strong>Fabricantes:</strong> {site.fabricantes?.join(', ') || '—'}</li>
              {site.ocr && <li><strong>OCR:</strong> {site.ocr}%</li>}
            </ul>
          </div>

          <div className="detalhe-secao">
            <h4>🔧 Operações — Colunas</h4>
            {site.operacoesColunas?.length > 0 ? (
              <ul className="detalhe-lista">
                {site.operacoesColunas.map(c => <li key={c}>{c}</li>)}
              </ul>
            ) : (
              <p style={{ fontSize: '0.85rem' }}>—</p>
            )}
          </div>

          {site.observacoes && (
            <div className="detalhe-secao">
              <h4>💡 Observações</h4>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>{site.observacoes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AxCross detail
  return (
    <div className="site-detalhe">
      <div className="site-detalhe-header">
        <div>
          <h2>{site.nome} <Badge tipo={site.tipo} /></h2>
          <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-600)' }}>{site.orgao}</p>
        </div>
        <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem' }}>
          🔗 Acessar Site
        </a>
      </div>

      <div className="detalhe-secoes">
        <div className="detalhe-secao">
          <h4>📋 Informações Gerais</h4>
          <ul className="detalhe-lista">
            <li><strong>URL:</strong> {site.url}</li>
            <li><strong>Estado:</strong> {site.estado}</li>
            <li><strong>Tipo:</strong> {site.tipo}</li>
            <li><strong>Status:</strong> {site.status === 'ativo' ? '🟢 Ativo' : '🔴 Inacessível'}</li>
            {site.menuExtra && <li><strong>Menu Extra:</strong> 🆕 {site.menuExtra}</li>}
          </ul>
        </div>

        <div className="detalhe-secao">
          <h4>📊 Métricas</h4>
          <ul className="detalhe-lista">
            <li><strong>Equipamentos:</strong> {site.equipamentos}</li>
            <li><strong>Faixas:</strong> {site.faixas}</li>
            <li><strong>Alertas:</strong> {site.alertas}</li>
            <li><strong>Veículos Monitorados:</strong> {site.veiculos?.toLocaleString('pt-BR') || '0'}</li>
            <li><strong>Passagens/dia:</strong> {site.passagensDia?.toLocaleString('pt-BR') || '—'}</li>
          </ul>
        </div>

        {site.mdfe && (
          <div className="detalhe-secao" style={{ gridColumn: '1 / -1' }}>
            <h4>📄 Módulo MDF-e (Exclusivo)</h4>
            <ul className="detalhe-lista">
              <li><strong>Título:</strong> {site.mdfe.titulo}</li>
              <li><strong>Subtítulo:</strong> {site.mdfe.subtitulo}</li>
              <li><strong>Sub-menus:</strong> {site.mdfe.subMenus.join(', ')}</li>
              <li><strong>Métricas:</strong> {site.mdfe.metricas.join(', ')}</li>
              <li><strong>Tabelas:</strong> {site.mdfe.tabelas.join(', ')}</li>
              <li><strong>Colunas MDF-e:</strong> {site.mdfe.colunasMDFe.join(', ')}</li>
            </ul>
          </div>
        )}

        {site.observacoes && (
          <div className="detalhe-secao">
            <h4>💡 Observações</h4>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>{site.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Vista: Por Módulo
   ═══════════════════════════════════════════════════════════════════════ */

function VistaModulo({ moduloFiltro }) {
  const modulos = moduloFiltro
    ? MODULOS.filter(m => m.id === moduloFiltro)
    : MODULOS;

  const getModuloDisponibilidade = (modulo) => {
    if (modulo.sistema === 'axhub' || modulo.sistema === 'ambos') {
      return AXHUB_SITES.filter(s => s.status === 'ativo').map(site => {
        let disponivel = true;
        if (modulo.id === 'cronotacografo') {
          disponivel = (site.bi || []).some(b => b.toLowerCase().includes('crono'));
        } else if (modulo.id === 'balanca') {
          disponivel = (site.equipamentos?.grupos || []).some(g => g.toLowerCase().includes('balança') || g.toLowerCase().includes('pesagem'));
        } else if (modulo.id === 'mdfe') {
          disponivel = false;
        }
        return { ...site, disponivel, sistema: 'AxHub' };
      });
    }
    if (modulo.sistema === 'axcross') {
      return AXCROSS_SITES.filter(s => s.status === 'ativo').map(site => {
        let disponivel = true;
        if (modulo.id === 'mdfe') {
          disponivel = !!site.menuExtra;
        }
        return { ...site, disponivel, sistema: 'AxCross' };
      });
    }
    return [];
  };

  return (
    <div>
      {modulos.map(modulo => {
        const sites = getModuloDisponibilidade(modulo);
        const ativos = sites.filter(s => s.disponivel).length;
        return (
          <div key={modulo.id} className="modulo-card">
            <div className="modulo-header">
              <span className="modulo-icone">{modulo.icone}</span>
              <h3>{modulo.nome}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
                ({ativos}/{sites.length} sites)
              </span>
              <Badge tipo={modulo.sistema === 'axhub' ? 'AxHub' : modulo.sistema === 'axcross' ? 'AxCross' : 'Ambos'} />
            </div>
            <div className="modulo-sites-tags">
              {sites.map(site => (
                <span
                  key={site.id}
                  className={`modulo-site-tag ${site.disponivel ? 'ativo' : 'inativo'}`}
                >
                  {site.disponivel ? '✓' : '✗'} {site.nome} ({site.sistema})
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Página Principal
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'intelligence', label: '🧠 Intelligence' },
  { id: 'credenciais', label: '🔑 Credenciais' },
  { id: 'visao-geral', label: '📊 Visão Geral' },
  { id: 'comparar', label: '⚖️ Comparar' },
  { id: 'detalhe', label: '🔍 Detalhe Individual' },
  { id: 'modulos', label: '🧩 Por Módulo' },
  { id: 'guia', label: '📋 Guia por Site' },
];

function AnalisesSites() {
  const [tab, setTab] = useState('intelligence');
  const [sistema, setSistema] = useState('axhub');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [selecionados, setSelecionados] = useState([]);
  const [moduloFiltro, setModuloFiltro] = useState('');
  const [metodologiaAberta, setMetodologiaAberta] = useState(false);

  const allSites = sistema === 'axhub' ? AXHUB_SITES : AXCROSS_SITES;

  const sitesFiltrados = useMemo(() => {
    return allSites.filter(site => {
      if (tipoFiltro && site.tipo !== tipoFiltro) return false;
      if (estadoFiltro && site.estado !== estadoFiltro) return false;
      if (busca) {
        const term = busca.toLowerCase();
        return site.nome.toLowerCase().includes(term) ||
          site.orgao?.toLowerCase().includes(term) ||
          site.url.toLowerCase().includes(term) ||
          site.estado?.toLowerCase().includes(term);
      }
      return true;
    });
  }, [allSites, tipoFiltro, estadoFiltro, busca]);

  const estados = [...new Set(allSites.map(s => s.estado).filter(Boolean))].sort();
  const tipos = [...new Set(allSites.map(s => s.tipo).filter(Boolean))].sort();

  const toggleSelecionado = (id) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      <div className="analise-page">
        <h1>🔬 Análise Comparativa de Sites</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '1.5rem' }}>
          Analise, compare e filtre dados de todos os contratos AxHub e AxCross.
          Selecione sites clicando nos cards para comparar lado a lado.
        </p>

        <PainelMetodologia aberto={metodologiaAberta} toggle={() => setMetodologiaAberta(v => !v)} />

        {/* Tabs */}
        <div className="analise-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`analise-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="filtros-container">
          <div className="filtro-grupo">
            <label>Sistema</label>
            <select value={sistema} onChange={e => { setSistema(e.target.value); setSelecionados([]); setTipoFiltro(''); }}>
              <option value="axhub">AxHub (Fiscalização)</option>
              <option value="axcross">AxCross (Cruzamento)</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Tipo Contrato</label>
            <select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
              <option value="">Todos</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Estado</label>
            <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
              <option value="">Todos</option>
              {estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Nome, URL, órgão..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          {tab === 'modulos' && (
            <div className="filtro-grupo">
              <label>Módulo</label>
              <select value={moduloFiltro} onChange={e => setModuloFiltro(e.target.value)}>
                <option value="">Todos os Módulos</option>
                {MODULOS.map(m => <option key={m.id} value={m.id}>{m.icone} {m.nome}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="status-bar">
          <span>Exibindo: <span className="status-count">{sitesFiltrados.length}</span> sites</span>
          {selecionados.length > 0 && (
            <>
              <span>|</span>
              <span>Selecionados: <span className="status-count">{selecionados.length}</span></span>
              <button
                onClick={() => setSelecionados([])}
                style={{ marginLeft: 'auto', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px', padding: '0.25rem 0.5rem', background: 'none' }}
              >
                Limpar seleção
              </button>
            </>
          )}
        </div>

        <DescricaoAba tab={tab} />

        {/* Conteúdo baseado na tab ativa */}
        {tab === 'visao-geral' && (
          <VistaSites
            sites={sitesFiltrados}
            sistema={sistema}
            selecionados={selecionados}
            toggleSelecionado={toggleSelecionado}
          />
        )}

        {tab === 'comparar' && (
          <>
            {selecionados.length < 2 && (
              <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', color: '#fbbf24' }}>
                💡 <strong>Dica:</strong> Selecione 2 ou mais sites na aba "Visão Geral" para comparar, ou a comparação mostrará todos os sites ativos.
              </div>
            )}
            <VistaComparacao selecionados={selecionados} sistema={sistema} />
          </>
        )}

        {tab === 'detalhe' && (
          <>
            {selecionados.length === 0 && (
              <div style={{ padding: '1rem', background: '#d1ecf1', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                ℹ️ Selecione um site na aba "Visão Geral" para ver seus detalhes completos.
              </div>
            )}
            {selecionados.map(id => (
              <VistaDetalhe key={id} siteId={id} sistema={sistema} />
            ))}
          </>
        )}

        {tab === 'modulos' && (
          <VistaModulo moduloFiltro={moduloFiltro} />
        )}

        {tab === 'guia' && (
          <GuiaSites embedded />
        )}

        {tab === 'intelligence' && (
          <IntelligenceDashboard />
        )}

        {tab === 'credenciais' && (
          <CredenciaisManager />
        )}
      </div>
    </>
  );
}

export default AnalisesSites;
