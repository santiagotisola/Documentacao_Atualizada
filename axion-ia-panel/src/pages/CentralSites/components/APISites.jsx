import React, { useState, useMemo } from 'react';
import { Zap, ExternalLink, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../../../services/api';

/* ═══════════════════════════════════════════════════════════════════
   APIs — Status e saúde das APIs por site
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  bg: 'var(--cs-surface)',
  surface: 'var(--cs-background)',
  border: 'var(--cs-border)',
  text: 'var(--cs-text-primary)',
  muted: 'var(--cs-text-secondary)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  accent: '#3b82f6',
};

function StatusDot({ ok }) {
  if (ok === null || ok === undefined) return <span style={{ fontSize: 10, color: C.muted }}>●</span>;
  return <span style={{ fontSize: 10, color: ok ? C.success : C.danger }}>●</span>;
}

export default function APISites({ sitesComScore = [] }) {
  const [statusMap, setStatusMap] = useState({});
  const [checking, setChecking] = useState({});

  const sitesAtivos = useMemo(() => sitesComScore.filter(s => s.status === 'ativo' && s.url), [sitesComScore]);

  async function verificarAPI(siteId, url) {
    setChecking(c => ({ ...c, [siteId]: true }));
    try {
      const resp = await api.get('/varco/heartbeat', { params: { url } });
      setStatusMap(m => ({ ...m, [siteId]: { ok: true, code: 200, ts: new Date() } }));
    } catch (err) {
      const code = err.response?.status || 0;
      setStatusMap(m => ({ ...m, [siteId]: { ok: false, code, ts: new Date() } }));
    } finally {
      setChecking(c => ({ ...c, [siteId]: false }));
    }
  }

  async function verificarTodos() {
    for (const site of sitesAtivos) {
      if (site.url) verificarAPI(site.id, site.url);
    }
  }

  const resumo = useMemo(() => {
    const verificados = Object.values(statusMap);
    return {
      online: verificados.filter(v => v.ok).length,
      offline: verificados.filter(v => !v.ok).length,
      total: sitesAtivos.length,
    };
  }, [statusMap, sitesAtivos]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Status de APIs por Site</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
            {Object.keys(statusMap).length > 0
              ? `${resumo.online} online · ${resumo.offline} offline de ${Object.keys(statusMap).length} verificados`
              : 'Clique em "Verificar Todos" para checar as APIs'}
          </p>
        </div>
        <button
          onClick={verificarTodos}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: 'none', background: C.accent, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
        >
          <RefreshCw size={13} />
          Verificar Todos
        </button>
      </div>

      {/* KPIs de verificação */}
      {Object.keys(statusMap).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'VERIFICADOS', value: Object.keys(statusMap).length, color: C.accent },
            { label: 'ONLINE', value: resumo.online, color: C.success },
            { label: 'OFFLINE', value: resumo.offline, color: C.danger },
          ].map(k => (
            <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${k.color}` }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de APIs */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['Site', 'Sistema', 'URL', 'Status', 'Ação'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sitesAtivos.map((s, i) => {
                const st = statusMap[s.id];
                const isChecking = checking[s.id];
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{s.nome}</td>
                    <td style={{ padding: '10px 14px', color: s.sistema === 'AxHub' ? '#3b82f6' : '#8b5cf6', fontWeight: 600 }}>{s.sistema}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.accent, textDecoration: 'none', fontSize: 11, fontFamily: 'monospace' }}>
                        {s.url}
                        <ExternalLink size={11} />
                      </a>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {isChecking ? (
                        <span style={{ color: C.muted, fontSize: 12 }}>Verificando…</span>
                      ) : st ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <StatusDot ok={st.ok} />
                          <span style={{ color: st.ok ? C.success : C.danger, fontWeight: 600 }}>
                            {st.ok ? 'Online' : `Offline${st.code ? ` (${st.code})` : ''}`}
                          </span>
                          <span style={{ color: C.muted, fontSize: 11 }}>{st.ts?.toLocaleTimeString('pt-BR')}</span>
                        </span>
                      ) : (
                        <span style={{ color: C.muted, fontSize: 12 }}>Não verificado</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button
                        onClick={() => verificarAPI(s.id, s.url)}
                        disabled={isChecking}
                        style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, cursor: 'pointer', fontSize: 11 }}
                      >
                        {isChecking ? <RefreshCw size={10} /> : 'Checar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sitesAtivos.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: C.muted }}>Nenhum site com URL configurada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
