import React, { useMemo, useState } from 'react';
import { Monitor, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   Equipamentos — Visão consolidada de equipamentos por site
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

export default function EquipamentosSites({ sitesComScore = [], liveEquipData = {}, isSyncingEquip, lastSyncEquip, onSincronizarEquip }) {
  const [filtroSistema, setFiltroSistema] = useState('todos');

  const sitesAtivos = useMemo(() => {
    return sitesComScore.filter(s => s.status === 'ativo');
  }, [sitesComScore]);

  const filtered = useMemo(() => {
    if (filtroSistema === 'todos') return sitesAtivos;
    return sitesAtivos.filter(s => s.sistema?.toLowerCase() === filtroSistema);
  }, [sitesAtivos, filtroSistema]);

  const totais = useMemo(() => {
    return filtered.reduce((acc, s) => {
      const eq = typeof s.equipamentos === 'object' ? s.equipamentos : { total: s.equipamentos || 0 };
      acc.total += eq.total || 0;
      acc.online += eq.online || eq.ativos || 0;
      acc.offline += eq.offline || eq.inativos || 0;
      return acc;
    }, { total: 0, online: 0, offline: 0 });
  }, [filtered]);

  const comLive = useMemo(() => {
    return filtered.filter(s => liveEquipData[s.id]).length;
  }, [filtered, liveEquipData]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const eqA = typeof a.equipamentos === 'object' ? a.equipamentos?.total || 0 : a.equipamentos || 0;
      const eqB = typeof b.equipamentos === 'object' ? b.equipamentos?.total || 0 : b.equipamentos || 0;
      return eqB - eqA;
    });
  }, [filtered]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header com sync */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Equipamentos por Site</h3>
          {lastSyncEquip && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
              Última sincronização: {lastSyncEquip.toLocaleTimeString('pt-BR')} · {comLive} sites com dados ao vivo
            </p>
          )}
        </div>
        {onSincronizarEquip && (
          <button
            onClick={() => onSincronizarEquip()}
            disabled={isSyncingEquip}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.text, cursor: 'pointer', fontSize: 12 }}
          >
            <RefreshCw size={13} style={{ animation: isSyncingEquip ? 'spin 1s linear infinite' : 'none' }} />
            {isSyncingEquip ? 'Sincronizando…' : 'Sincronizar ao vivo'}
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'TOTAL GERAL', value: totais.total, color: C.accent, icon: Monitor },
          { label: 'ONLINE', value: totais.online || '—', color: C.success, icon: Wifi },
          { label: 'OFFLINE', value: totais.offline || '—', color: C.danger, icon: WifiOff },
          { label: 'SITES COM EQUIP.', value: filtered.filter(s => (typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos) > 0).length, color: '#8b5cf6', icon: Monitor },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, borderTop: `3px solid ${kpi.color}` }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filtro por sistema */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[['todos', 'Todos'], ['axhub', 'AxHub'], ['axcross', 'AxCross']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFiltroSistema(v)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: `1px solid ${filtroSistema === v ? C.accent : C.border}`,
              background: filtroSistema === v ? '#eff6ff' : C.bg,
              color: filtroSistema === v ? C.accent : C.muted,
              fontWeight: filtroSistema === v ? 600 : 400,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Tabela de equipamentos */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['Site', 'Sistema', 'Estado', 'Total Equip.', 'Online', 'Offline', 'Fabricantes', 'Fonte'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => {
                const eq = typeof s.equipamentos === 'object' ? s.equipamentos : { total: s.equipamentos || 0 };
                const live = liveEquipData[s.id];
                const isLive = !!live;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.surface : C.bg }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text }}>{s.nome}</td>
                    <td style={{ padding: '10px 14px', color: s.sistema === 'AxHub' ? '#3b82f6' : '#8b5cf6', fontWeight: 600 }}>{s.sistema}</td>
                    <td style={{ padding: '10px 14px', color: C.muted }}>{s.estado || '—'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: C.text, fontSize: 15 }}>
                      {isLive ? (live.total ?? eq.total ?? '—') : (eq.total ?? '—')}
                    </td>
                    <td style={{ padding: '10px 14px', color: C.success }}>
                      {isLive ? (live.online ?? live.ativos ?? '—') : (eq.online ?? eq.ativos ?? '—')}
                    </td>
                    <td style={{ padding: '10px 14px', color: C.danger }}>
                      {isLive ? (live.offline ?? live.inativos ?? '—') : (eq.offline ?? eq.inativos ?? '—')}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: C.muted }}>
                      {s.fabricantes?.join(', ') || '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: isLive ? '#dcfce7' : '#f1f5f9',
                        color: isLive ? '#166534' : C.muted,
                        borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600
                      }}>
                        {isLive ? '🟢 Ao vivo' : '📦 Estático'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: C.muted }}>Nenhum site encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
