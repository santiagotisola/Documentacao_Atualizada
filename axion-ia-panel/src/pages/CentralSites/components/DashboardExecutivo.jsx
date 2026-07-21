import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Globe, Wifi, WifiOff, Tag, Monitor, Camera, LayoutGrid, Zap, CheckCircle, ShieldCheck, BookOpen, ScanLine, AlertTriangle, Bell, HeartPulse, ClipboardCheck, Download, FileText, X, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

/* ═══════════════════════════════════════════════════════════════════
   Dashboard Executivo — 16 indicadores globais de todos os sites
   ═══════════════════════════════════════════════════════════════════ */

// ─── Exportar Excel .xlsx (SheetJS — sem aviso de formato) ───────────────────
function exportarExcel(sites, nomeArquivo) {
  const data = new Date().toLocaleDateString('pt-BR');

  // Linha de cabeçalho informativo
  const info = [
    ['Relatório de Sites — Axion Tecnologia', '', `Data: ${data}`, `Total: ${sites.length} sites`],
    [],
  ];

  // Dados
  const cabecalho = ['Site', 'Sistema', 'Estado', 'Status', 'Versão', 'Equipamentos', 'OCR (%)', 'Health (%)', 'URL', 'Chamados Abertos', 'Chamados Críticos'];
  const linhas = sites.map(s => {
    const equip = typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos;
    return [
      s.nome ?? '',
      s.sistema ?? '',
      s.estado ?? '',
      s.status ?? '',
      s.versao ?? '',
      equip ?? '',
      s.ocr ? parseFloat(s.ocr.toFixed(2)) : '',
      s.healthScore ?? '',
      s.url ?? '',
      s.chamados?.abertos ?? 0,
      s.chamados?.criticos ?? 0,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([...info, cabecalho, ...linhas]);

  // Largura das colunas
  ws['!cols'] = [
    { wch: 18 }, { wch: 10 }, { wch: 7 }, { wch: 8 }, { wch: 10 },
    { wch: 13 }, { wch: 9 }, { wch: 10 }, { wch: 40 }, { wch: 16 }, { wch: 16 },
  ];

  // Estilo cabeçalho (linha 3 = índice 2 após as 2 linhas de info)
  const cabRow = 2; // 0-indexed
  cabecalho.forEach((_, ci) => {
    const cellRef = XLSX.utils.encode_cell({ r: cabRow, c: ci });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1D4ED8' } },
      alignment: { horizontal: 'center' },
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sites');

  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}

// ─── Exportar CSV (UTF-8 BOM para Excel) ─────────────────────────────────────
function exportarCSV(sites, nomeArquivo) {
  const cabecalho = ['Site', 'Sistema', 'Estado', 'Status', 'Versão', 'Equipamentos', 'OCR (%)', 'Health (%)', 'URL', 'Cham. Abertos', 'Cham. Críticos'];
  const esc = v => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const linhas = sites.map(s => {
    const equip = typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos;
    return [
      s.nome, s.sistema, s.estado || '', s.status, s.versao || '',
      equip || '', s.ocr ? s.ocr.toFixed(2) : '', s.healthScore || '',
      s.url || '', s.chamados?.abertos ?? 0, s.chamados?.criticos ?? 0,
    ].map(esc).join(',');
  });
  const bom = '\uFEFF';
  const blob = new Blob([bom + [cabecalho.join(','), ...linhas].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nomeArquivo;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Exportar PDF (janela de impressão formatada) ─────────────────────────────
// ─── Gera HTML do relatório PDF ───────────────────────────────────────────────
function gerarHTMLRelatorio(sites, titulo) {
  const data = new Date().toLocaleDateString('pt-BR');
  const linhas = sites.map((s, i) => {
    const equip = typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos;
    const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const hc = (s.healthScore || 0) >= 80 ? '#16a34a' : (s.healthScore || 0) >= 60 ? '#d97706' : '#dc2626';
    const sc = s.sistema === 'AxHub' ? '#2563eb' : '#7c3aed';
    return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td><a href="${esc(s.url)}" style="color:#2563eb;text-decoration:none">${esc(s.nome)}</a></td>
      <td style="color:${sc};font-weight:600">${esc(s.sistema)}</td>
      <td>${esc(s.estado || '—')}</td>
      <td><span style="background:${s.status === 'ativo' ? '#dcfce7' : '#fee2e2'};color:${s.status === 'ativo' ? '#166534' : '#991b1b'};padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600">${esc(s.status)}</span></td>
      <td style="font-weight:600">${esc(s.versao || '—')}</td>
      <td>${equip || '—'}</td>
      <td>${s.ocr ? s.ocr.toFixed(1) + '%' : '—'}</td>
      <td style="font-weight:700;color:${hc}">${s.healthScore || 0}%</td>
      <td>${s.chamados?.abertos ?? 0}${(s.chamados?.criticos || 0) > 0 ? ` · ${s.chamados.criticos} crít.` : ''}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html lang="pt-BR">
<head><meta charset="UTF-8"><title>${titulo}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
  body { margin: 0; padding: 0; font-size: 11px; color: #1e293b; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
  .logo { font-size: 18px; font-weight: 800; color: #2563eb; }
  .logo span { color: #7c3aed; }
  .meta { text-align: right; font-size: 10px; color: #64748b; }
  .title { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #1d4ed8; color: #fff; padding: 6px 7px; text-align: left; font-weight: 600; white-space: nowrap; }
  td { padding: 5px 7px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
  .footer { margin-top: 12px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 6px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="logo">A<span>AXION</span> Tecnologia</div>
      <div class="title">${titulo}</div>
    </div>
    <div class="meta">
      <div>Data: <strong>${data}</strong></div>
      <div>Total: <strong>${sites.length} sites</strong></div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>Site</th><th>Sistema</th><th>UF</th><th>Status</th>
      <th>Versão</th><th>Equip.</th><th>OCR</th><th>Health</th><th>Chamados</th>
    </tr></thead>
    <tbody>${linhas}</tbody>
  </table>
  <div class="footer">Axion Tecnologia · Gerado em ${data} · ${sites.length} registros</div>
</body></html>`;
}

const C = {
  bg: 'var(--cs-surface)',
  surface: 'var(--cs-background)',
  border: 'var(--cs-border)',
  text: 'var(--cs-text-primary)',
  muted: 'var(--cs-text-secondary)',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

function KpiCard({ icon: Icon, label, value, sub, color = C.accent, trend }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      borderTop: `3px solid ${color}`,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 11, fontWeight: 600 }}>
        <Icon size={14} style={{ color }} />
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ fontSize: 11, color: trend >= 0 ? C.success : C.danger }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs. mês anterior
        </div>
      )}
    </div>
  );
}

const FILTRO_INICIAL = {
  cliente: '',
  estado: '',
  produto: 'todos',
  versao: '',
  ambiente: 'todos',
  status: 'todos',
};

export default function DashboardExecutivo({ todosSites = [], sitesComScore = [], chamadosData }) {
  const [filtros, setFiltros] = useState(FILTRO_INICIAL);
  const [expand, setExpand] = useState(false);
  const [pdfHtml, setPdfHtml] = useState(null); // modal PDF
  const iframeRef = useRef(null);

  // ─── Ordenação multi-coluna ───────────────────────────────────────────
  // sortKeys: array de { key, dir } — prioridade da esquerda para a direita
  const [sortKeys, setSortKeys] = useState([]);

  const COL_KEYS = {
    'Site':     s => s.nome || '',
    'Sistema':  s => s.sistema || '',
    'Estado':   s => s.estado || '',
    'Status':   s => s.status || '',
    'Versão':   s => s.versao || '',
    'Equip.':   s => (typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos) || 0,
    'OCR %':    s => s.ocr || 0,
    'Health':   s => s.healthScore || 0,
    'Chamados': s => s.chamados?.abertos || 0,
  };

  const handleSortClick = (colLabel, e) => {
    setSortKeys(prev => {
      const existIdx = prev.findIndex(k => k.key === colLabel);
      if (existIdx >= 0) {
        // Já está: alterna asc→desc→remove
        const cur = prev[existIdx];
        if (cur.dir === 'asc') {
          return prev.map((k, i) => i === existIdx ? { ...k, dir: 'desc' } : k);
        } else {
          return prev.filter((_, i) => i !== existIdx);
        }
      } else {
        // Ctrl/Shift = adiciona ao sort; clique simples = substitui
        if (e.ctrlKey || e.shiftKey) {
          return [...prev, { key: colLabel, dir: 'asc' }];
        }
        return [{ key: colLabel, dir: 'asc' }];
      }
    });
  };

  /* ── Filtrar + Ordenar sites ──────────────────────────────── */
  const sitesFiltrados = useMemo(() => {
    let lista = sitesComScore.filter(s => {
      if (filtros.produto !== 'todos' && s.sistema?.toLowerCase() !== filtros.produto.toLowerCase()) return false;
      if (filtros.status !== 'todos' && s.status !== filtros.status) return false;
      if (filtros.estado && !s.estado?.toLowerCase().includes(filtros.estado.toLowerCase())) return false;
      if (filtros.versao && s.versao && !s.versao.includes(filtros.versao)) return false;
      return true;
    });

    if (sortKeys.length > 0) {
      lista = [...lista].sort((a, b) => {
        for (const { key, dir } of sortKeys) {
          const fn = COL_KEYS[key];
          if (!fn) continue;
          const va = fn(a), vb = fn(b);
          const cmp = typeof va === 'string'
            ? va.localeCompare(vb, 'pt-BR')
            : va - vb;
          if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }
    return lista;
  }, [sitesComScore, filtros, sortKeys]);

  /* ── KPIs calculados ─────────────────────────────────────── */
  const kpis = useMemo(() => {
    const ativos = sitesFiltrados.filter(s => s.status === 'ativo');
    const inativos = sitesFiltrados.filter(s => s.status !== 'ativo');

    const versoes = [...new Set(ativos.map(s => s.versao).filter(Boolean))];
    const maxVersao = versoes.sort().reverse()[0] || '—';

    const totalEquip = ativos.reduce((acc, s) => {
      const eq = typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos;
      return acc + (eq || 0);
    }, 0);

    const withOcr = ativos.filter(s => s.ocr != null);
    const avgOcr = withOcr.length
      ? Math.round(withOcr.reduce((a, s) => a + s.ocr, 0) / withOcr.length)
      : 0;

    const totalMenus = ativos.reduce((acc, s) => acc + (s.menuCount || 0), 0);

    const healthScores = ativos.map(s => s.healthScore || 0);
    const avgHealth = healthScores.length
      ? Math.round(healthScores.reduce((a, v) => a + v, 0) / healthScores.length)
      : 0;
    const highHealth = healthScores.filter(h => h >= 80).length;

    const chamadosAbertos = (chamadosData?.ranking || []).reduce((acc, r) => acc + (r.abertos || 0), 0);
    const chamadosCriticos = (chamadosData?.ranking || []).reduce((acc, r) => acc + (r.criticos || 0), 0);
    const chamadosTotal = (chamadosData?.ranking || []).reduce((acc, r) => acc + (r.total || 0), 0);

    const disponibilidade = ativos.length > 0
      ? Math.round((ativos.length / sitesFiltrados.length) * 100)
      : 0;

    return {
      totalSites: sitesFiltrados.length,
      online: ativos.length,
      offline: inativos.length,
      versaoLatest: maxVersao,
      totalEquip,
      avgOcr,
      totalMenus,
      avgHealth,
      disponibilidade,
      seguranca: 100 - chamadosCriticos * 10 > 0 ? 100 - chamadosCriticos * 10 : 0,
      cobertura: highHealth,
      scansTotal: chamadosTotal,
      criticos: chamadosCriticos,
      alertas: chamadosAbertos,
      healthOk: highHealth,
      ultimaAuditoria: chamadosData ? 'Hoje' : '—',
    };
  }, [sitesFiltrados, chamadosData]);

  const handleFiltro = (key, val) => setFiltros(f => ({ ...f, [key]: val }));

  const estados = useMemo(() => [...new Set(todosSites.map(s => s.estado).filter(Boolean))].sort(), [todosSites]);

  return (
    <>
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Filtros ─────────────────────────────────────────── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expand ? 12 : 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Filtros</span>
          <button
            onClick={() => setExpand(e => !e)}
            style={{ fontSize: 12, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {expand ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>
        {expand && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { key: 'produto', label: 'Produto', options: [['todos', 'Todos'], ['axhub', 'AxHub'], ['axcross', 'AxCross']] },
              { key: 'status', label: 'Status', options: [['todos', 'Todos'], ['ativo', 'Ativo'], ['inativo', 'Inativo']] },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</label>
                <select
                  value={filtros[key]}
                  onChange={e => handleFiltro(key, e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.bg, color: C.text }}
                >
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 4 }}>Estado</label>
              <select
                value={filtros.estado}
                onChange={e => handleFiltro('estado', e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.bg, color: C.text }}
              >
                <option value="">Todos</option>
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: C.muted, marginBottom: 4 }}>Versão</label>
              <input
                value={filtros.versao}
                onChange={e => handleFiltro('versao', e.target.value)}
                placeholder="Ex: v.1.2"
                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.bg, color: C.text, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => setFiltros(FILTRO_INICIAL)}
                style={{ width: '100%', padding: '7px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.muted, fontSize: 12, cursor: 'pointer' }}
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Grid de KPIs ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
        <KpiCard icon={Globe}         label="Sites"           value={kpis.totalSites}           sub="Total cadastrado"         color={C.accent} />
        <KpiCard icon={Wifi}          label="Online"          value={kpis.online}               sub="Sites ativos"             color={C.success} />
        <KpiCard icon={WifiOff}       label="Offline"         value={kpis.offline}              sub="Sites inativos"           color={kpis.offline > 0 ? C.danger : C.muted} />
        <KpiCard icon={Tag}           label="Versão"          value={kpis.versaoLatest}         sub="Versão mais recente"      color="#8b5cf6" />
        <KpiCard icon={Monitor}       label="Equipamentos"    value={kpis.totalEquip}           sub="Total nos sites ativos"   color="#0ea5e9" />
        <KpiCard icon={Camera}        label="OCR Médio"       value={`${kpis.avgOcr}%`}         sub="Taxa de leitura"          color={kpis.avgOcr >= 80 ? C.success : kpis.avgOcr >= 60 ? C.warning : C.danger} />
        <KpiCard icon={LayoutGrid}    label="Menus"           value={kpis.totalMenus}           sub="Total de menus habilitados" color="#f97316" />
        <KpiCard icon={Zap}           label="Performance"     value={`${kpis.avgHealth}%`}      sub="Health score médio"       color={kpis.avgHealth >= 80 ? C.success : C.warning} />
        <KpiCard icon={CheckCircle}   label="Disponibilidade" value={`${kpis.disponibilidade}%`} sub="Uptime geral"            color={kpis.disponibilidade >= 90 ? C.success : C.warning} />
        <KpiCard icon={ShieldCheck}   label="Segurança"       value={`${kpis.seguranca}%`}      sub="Score de segurança"       color={kpis.seguranca >= 80 ? C.success : C.danger} />
        <KpiCard icon={BookOpen}      label="Cobertura"       value={kpis.cobertura}            sub="Sites com health ≥ 80%"  color="#06b6d4" />
        <KpiCard icon={ScanLine}      label="Scans"           value={kpis.scansTotal}           sub="Total de chamados"        color="#84cc16" />
        <KpiCard icon={AlertTriangle} label="Críticos"        value={kpis.criticos}             sub="Chamados críticos"        color={kpis.criticos > 0 ? C.danger : C.success} />
        <KpiCard icon={Bell}          label="Alertas"         value={kpis.alertas}              sub="Chamados abertos"         color={kpis.alertas > 5 ? C.warning : C.muted} />
        <KpiCard icon={HeartPulse}    label="Health Check"    value={`${kpis.healthOk}`}        sub="Sites com score alto"     color="#ec4899" />
        <KpiCard icon={ClipboardCheck} label="Última Auditoria" value={kpis.ultimaAuditoria}   sub="Data da última revisão"   color="#64748b" />
      </div>

      {/* ── Tabela resumo por site ───────────────────────────── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
            Resumo por Site ({sitesFiltrados.length} sites)
          </span>
          {sortKeys.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted }}>
              <span>Ordenado por:</span>
              {sortKeys.map((k, i) => (
                <span key={k.key} style={{ background: '#eff6ff', color: '#3b82f6', borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>
                  {i + 1}. {k.key} {k.dir === 'asc' ? '↑' : '↓'}
                </span>
              ))}
              <button
                onClick={() => setSortKeys([])}
                style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 11, padding: '2px 6px' }}
                title="Limpar ordenação"
              >✕ limpar</button>
            </div>
          )}
        </div>
        {sortKeys.length === 0 && (
          <div style={{ padding: '4px 20px 8px', fontSize: 11, color: C.muted }}>
            💡 Clique no cabeçalho para ordenar · <kbd style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: '0 4px' }}>Ctrl</kbd> + clique para ordenação múltipla
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['Site', 'Sistema', 'Estado', 'Status', 'Versão', 'Equip.', 'OCR %', 'Health', 'Chamados'].map(h => {
                  const sortIdx = sortKeys.findIndex(k => k.key === h);
                  const isActive = sortIdx >= 0;
                  const dir = isActive ? sortKeys[sortIdx].dir : null;
                  return (
                    <th
                      key={h}
                      onClick={e => handleSortClick(h, e)}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        color: isActive ? '#3b82f6' : C.muted,
                        fontWeight: 600,
                        borderBottom: `1px solid ${C.border}`,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: isActive ? '#eff6ff' : C.bg,
                        transition: 'background 0.15s',
                      }}
                      title={`Ordenar por ${h} · Ctrl+clique para multi-coluna`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {h}
                        {isActive
                          ? <span style={{ fontSize: 10, fontWeight: 700 }}>{dir === 'asc' ? '↑' : '↓'}{sortKeys.length > 1 && <sup style={{ fontSize: 9 }}>{sortIdx + 1}</sup>}</span>
                          : <span style={{ fontSize: 10, color: '#d1d5db', opacity: 0.6 }}>↕</span>
                        }
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sitesFiltrados.map((s, i) => {
                const equip = typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos;
                const health = s.healthScore || 0;
                const healthColor = health >= 80 ? C.success : health >= 60 ? C.warning : C.danger;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                    <td style={{ padding: '9px 12px', fontWeight: 600 }}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: C.text, textDecoration: 'none' }}
                        title={s.url}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {s.nome}
                      </a>
                    </td>
                    <td style={{ padding: '9px 12px', color: s.sistema === 'AxHub' ? '#3b82f6' : '#8b5cf6', fontWeight: 600 }}>{s.sistema}</td>
                    <td style={{ padding: '9px 12px', color: C.muted }}>{s.estado || '—'}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{
                        background: s.status === 'ativo' ? '#dcfce7' : '#fee2e2',
                        color: s.status === 'ativo' ? '#166534' : '#991b1b',
                        borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600
                      }}>{s.status}</span>
                    </td>
                    <td style={{ padding: '9px 12px', color: C.muted }}>{s.versao || '—'}</td>
                    <td style={{ padding: '9px 12px', color: C.text }}>{equip || '—'}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: s.ocr >= 80 ? C.success : s.ocr >= 60 ? C.warning : C.danger }}>
                      {s.ocr ? `${s.ocr}%` : '—'}
                    </td>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: healthColor }}>{health}%</td>
                    <td style={{ padding: '9px 12px', color: (s.chamados?.abertos || 0) > 2 ? C.warning : C.text }}>
                      {s.chamados?.abertos ?? 0} abertos
                      {(s.chamados?.criticos || 0) > 0 && <span style={{ color: C.danger, marginLeft: 6 }}>· {s.chamados.criticos} crítico(s)</span>}
                    </td>
                  </tr>
                );
              })}           
            </tbody>
          </table>
        </div>
        {/* ── Rodapé com exportação ──────────────────────────────────── */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: C.bg,
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span style={{ fontSize: 11, color: C.muted }}>
            {sitesFiltrados.length} registro{sitesFiltrados.length !== 1 ? 's' : ''} · atualizado em {new Date().toLocaleDateString('pt-BR')}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => exportarCSV(sitesFiltrados, `Axion_Sites_${new Date().toISOString().slice(0,10)}.csv`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 6,
                border: '1.5px solid #16a34a', background: '#f0fdf4',
                color: '#15803d', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
              title="Exportar como CSV"
            >
              <Download size={13} /> CSV
            </button>
            <button
              onClick={() => exportarExcel(sitesFiltrados, `Axion_Sites_${new Date().toISOString().slice(0,10)}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 6,
                border: '1.5px solid #2563eb', background: '#eff6ff',
                color: '#1d4ed8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
              title="Exportar como Excel (.xlsx)"
            >
              <Download size={13} /> Excel (.xlsx)
            </button>
            <button
              onClick={() => setPdfHtml(gerarHTMLRelatorio(sitesFiltrados, `Relatório Sites ${new Date().toLocaleDateString('pt-BR')}`))}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 6,
                border: '1.5px solid #dc2626', background: '#fef2f2',
                color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
              title="Exportar como PDF"
            >
              <FileText size={13} /> PDF
            </button>
          </div>
        </div>
      </div>

    </div>

    {/* ─── Modal PDF ──────────────────────────────────────────── */}
    {pdfHtml && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Barra de ações */}
        <div style={{
          background: '#1d4ed8', color: '#fff',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>
            📄 Pré-visualização do Relatório
          </span>
          <button
            onClick={() => {
              if (iframeRef.current) iframeRef.current.contentWindow.print();
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 20px', borderRadius: 6,
              background: '#fff', color: '#1d4ed8',
              border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            🖨️ Imprimir / Salvar PDF
          </button>
          <button
            onClick={() => setPdfHtml(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '8px 16px', borderRadius: 6,
              background: '#ef4444', color: '#fff',
              border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <X size={14} /> Fechar
          </button>
        </div>
        {/* iframe com o conteúdo */}
        <iframe
          ref={iframeRef}
          srcDoc={pdfHtml}
          style={{ flex: 1, border: 'none', background: '#fff' }}
          title="Relatório PDF"
        />
      </div>
    )}
    </>
  );
}
