import React, { useMemo } from 'react';
import { Clock, Tag, ChevronRight } from 'lucide-react';
import { AXHUB_SITES, AXCROSS_SITES } from '../../../data/sitesData';

/* ═══════════════════════════════════════════════════════════════════
   Timeline — Histórico de versões e eventos por site
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  surface: 'var(--cs-background)',
  border: 'var(--cs-border)',
  text: 'var(--cs-text-primary)',
  muted: 'var(--cs-text-secondary)',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
};

// Gera eventos de timeline a partir dos dados dos sites
function gerarEventos(sites) {
  const eventos = [];

  // Eventos de versão por grupo
  const grupos = {};
  sites.forEach(s => {
    if (s.versao) {
      if (!grupos[s.versao]) grupos[s.versao] = [];
      grupos[s.versao].push(s);
    }
  });

  Object.entries(grupos).sort((a, b) => b[0].localeCompare(a[0])).forEach(([versao, sitesGrupo]) => {
    eventos.push({
      id: `v_${versao}`,
      tipo: 'versao',
      titulo: `${versao} implantada`,
      descricao: `${sitesGrupo.length} site${sitesGrupo.length !== 1 ? 's' : ''}: ${sitesGrupo.slice(0, 3).map(s => s.nome).join(', ')}${sitesGrupo.length > 3 ? ` e mais ${sitesGrupo.length - 3}` : ''}`,
      cor: '#3b82f6',
      icone: '🏷️',
    });
  });

  // Eventos de aferição
  const comAfericao = sites.filter(s => s.data_afericao);
  if (comAfericao.length > 0) {
    eventos.push({
      id: 'afericao',
      tipo: 'afericao',
      titulo: `Aferições registradas`,
      descricao: `${comAfericao.length} site${comAfericao.length !== 1 ? 's' : ''} com aferição`,
      cor: C.success,
      icone: '📋',
    });
  }

  // Sites recentemente ativos
  const ativos = sites.filter(s => s.status === 'ativo');
  if (ativos.length > 0) {
    eventos.push({
      id: 'ativo',
      tipo: 'status',
      titulo: `${ativos.length} sites online`,
      descricao: `Todos os sites ativos monitorados e operacionais`,
      cor: C.success,
      icone: '✅',
    });
  }

  return eventos;
}

// Changelog estático das versões AxHub e AxCross
const CHANGELOG = [
  {
    versao: 'v.1.2.4',
    sistema: 'AxHub',
    data: 'Jun 2026',
    cor: '#7c3aed',
    destaque: true,
    itens: [
      'DERSE: 104 menus disponíveis (mais avançado)',
      'Novo módulo de relatórios avançados',
      'Melhorias de performance no OCR',
    ],
  },
  {
    versao: 'v.1.2.3',
    sistema: 'AxHub',
    data: 'Mai 2026',
    cor: '#3b82f6',
    itens: [
      'IBAMETRO, IMEPI, IMEQPB, IMETROPA: 90 menus',
      'Correções de estabilidade',
      'Melhoria na exportação de relatórios',
    ],
  },
  {
    versao: 'v.1.2.1',
    sistema: 'AxHub',
    data: 'Abr 2026',
    cor: '#0ea5e9',
    itens: [
      'IPEMCE, IPEMPE, SMTT: 89 menus',
      'Novo fluxo de triagem',
      'Otimização do banco de dados',
    ],
  },
  {
    versao: 'v.1.2.0',
    sistema: 'AxHub + AxCross',
    data: 'Mar 2026',
    cor: '#10b981',
    itens: [
      'STRANS, IPEMMT, ITPS, IMPERATRIZ (AxHub)',
      'Todos os sites AxCross atualizados para v1.2.0',
      'Lançamento do módulo de cruzamentos v2',
      'Nova interface administrativa',
    ],
  },
  {
    versao: 'v.1.1.1',
    sistema: 'AxHub',
    data: 'Fev 2026',
    cor: '#f59e0b',
    itens: [
      'DETRANPI, SETRANS',
      'Hotfix de segurança',
      'Melhorias na autenticação',
    ],
  },
  {
    versao: 'v.1.1.0',
    sistema: 'AxHub',
    data: 'Jan 2026',
    cor: '#ef4444',
    itens: [
      'DETRANMA',
      'Refatoração do módulo de pesagem',
      'Novas APIs de integração',
    ],
  },
];

export default function Timeline({ todosSites = [] }) {
  const allSites = useMemo(() => [
    ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
    ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
  ], []);

  const eventosDinamicos = useMemo(() => gerarEventos(allSites), [allSites]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Resumo de versões ativas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {Object.entries(
          allSites.reduce((acc, s) => {
            if (s.versao) { acc[s.versao] = (acc[s.versao] || 0) + 1; }
            return acc;
          }, {})
        ).sort((a, b) => b[0].localeCompare(a[0])).map(([versao, count]) => (
          <div key={versao} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tag size={18} style={{ color: C.accent }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{versao}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{count} site{count !== 1 ? 's' : ''}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline de changelog */}
      <div>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 14, fontWeight: 600, color: C.text }}>Histórico de Releases</h3>
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          {/* Linha vertical */}
          <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: C.border }} />

          {CHANGELOG.map((release, idx) => (
            <div key={release.versao} style={{ position: 'relative', marginBottom: 28 }}>
              {/* Ponto na timeline */}
              <div style={{
                position: 'absolute', left: -28, top: 4, width: 14, height: 14, borderRadius: '50%',
                background: release.cor, border: `2px solid ${C.surface}`, boxShadow: `0 0 0 2px ${release.cor}40`,
              }} />

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginLeft: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: release.cor, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                    {release.versao}
                  </span>
                  <span style={{ fontSize: 12, color: C.muted }}>{release.sistema}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />{release.data}
                  </span>
                  {release.destaque && (
                    <span style={{ background: '#fef9c3', color: '#92400e', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      ★ Versão mais recente
                    </span>
                  )}
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 13, color: C.text, lineHeight: 1.8 }}>
                  {release.itens.map((item, i) => (
                    <li key={i} style={{ color: i === 0 ? C.text : C.muted }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eventos dinâmicos (baseados nos dados reais) */}
      {eventosDinamicos.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: C.text }}>Estado Atual dos Sites</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {eventosDinamicos.map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 20 }}>{ev.icone}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ev.titulo}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{ev.descricao}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.cor }} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
