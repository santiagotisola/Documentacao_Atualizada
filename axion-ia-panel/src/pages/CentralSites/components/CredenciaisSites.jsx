import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, Save, ExternalLink, ShieldCheck, Settings } from 'lucide-react';
import { AXHUB_SITES, AXCROSS_SITES } from '../../../data/sitesData';
import { apiFetch } from '../../../services/api';

/* ═══════════════════════════════════════════════════════════════
   CredenciaisSites — Gerenciamento unificado de credenciais
   Integrado ao CentralSites para ter tudo em um só lugar
   ═══════════════════════════════════════════════════════════════ */

const produtoInfo = {
  axhub:   { icon: '🚦', cor: '#ef4444', label: 'AxHub',   credGlobal: 'AxHub (Admin/Suporte)' },
  axcross: { icon: '📡', cor: '#10b981', label: 'AxCross', credGlobal: 'AxCross' },
  axton:   { icon: '⚖️', cor: '#f59e0b', label: 'AxTon',   credGlobal: 'AxTon' },
};

const ambienteBadge = (amb) => ({
  homologacao: { label: 'Homologação', bg: '#dbeafe', color: '#1d4ed8' },
  producao:    { label: 'Produção',    bg: '#dcfce7', color: '#15803d' },
}[amb] || { label: amb, bg: '#f3f4f6', color: '#374151' });

// ── Sub-componente: card de site configurado (tem credenciais individuais na API)
const CardConfigurado = ({ site }) => {
  const [url, setUrl]       = useState(site.url || '');
  const [senha, setSenha]   = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [status, setStatus] = useState(null); // null | 'saving' | 'ok' | 'erro'
  const [ativo, setAtivo]   = useState(false);
  const info = produtoInfo[site.produto] || { cor: '#6b7280' };
  const badge = ambienteBadge(site.ambiente);

  const aplicar = async () => {
    setStatus('saving');
    try {
      const r = await apiFetch('/manual-scripts/special/sites/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: site.id, url, login: site.login, ...(senha ? { senha } : {}) }),
      });
      const d = await r.json();
      if (d.success) {
        setStatus('ok'); setAtivo(true);
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus('erro');
      }
    } catch { setStatus('erro'); }
  };

  return (
    <div style={{
      padding: '12px 16px', borderTop: `1px solid ${info.cor}15`,
      background: ativo ? `${info.cor}06` : 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color }}>{badge.label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{site.perfil}</span>
        <span style={{ fontSize: 11, color: '#6b7280' }}>{site.login}</span>
        {ativo && <span style={{ fontSize: 10, color: info.cor, fontWeight: 700, marginLeft: 'auto' }}>● ATIVO</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* URL */}
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', flex: '2 1 200px', background: 'white' }}>
          <span style={{ padding: '5px 8px', fontSize: 10, color: '#9ca3af', background: '#f9fafb', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>URL</span>
          <input value={url} onChange={e => setUrl(e.target.value)} type="text" placeholder="https://..."
            style={{ flex: 1, padding: '5px 8px', fontSize: 12, border: 'none', outline: 'none', background: 'white', minWidth: 0 }}
            autoComplete="off" spellCheck={false} />
          {url && <a href={url} target="_blank" rel="noopener noreferrer" style={{ padding: '0 6px', color: '#6b7280' }}><ExternalLink size={11} /></a>}
        </div>
        {/* Senha */}
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', flex: '1 1 130px', background: 'white' }}>
          <span style={{ padding: '5px 8px', fontSize: 10, color: '#9ca3af', background: '#f9fafb', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>Senha</span>
          <input value={senha} onChange={e => setSenha(e.target.value)} type={showSenha ? 'text' : 'password'}
            placeholder={site.temSenha ? '(salva)' : 'Senha...'}
            style={{ flex: 1, padding: '5px 8px', fontSize: 12, border: 'none', outline: 'none', background: 'white', width: 80 }}
            autoComplete="off" />
          <button onClick={() => setShowSenha(p => !p)} style={{ padding: '0 6px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            {showSenha ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        {/* Botão aplicar */}
        <button onClick={aplicar} disabled={status === 'saving'}
          style={{
            padding: '5px 14px', background: ativo ? info.cor : '#f1f5f9',
            color: ativo ? 'white' : '#374151', border: `1px solid ${ativo ? info.cor : '#d1d5db'}`,
            borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
          {status === 'saving' ? '⏳' : status === 'ok' ? '✅ Ativo' : ativo ? '✅ Ativo' : 'Aplicar →'}
        </button>
        {status === 'erro' && <span style={{ fontSize: 11, color: '#ef4444' }}>❌ Erro</span>}
      </div>
    </div>
  );
};

// ── Sub-componente: card de site com credenciais globais (sitesData.js sem match na API)
const CardGlobal = ({ site, produto }) => {
  const info = produtoInfo[produto] || { cor: '#6b7280', label: produto };
  return (
    <div style={{
      padding: '10px 16px', borderTop: `1px solid ${info.cor}15`,
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
          {site.nome}
          {site.estado && <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 6, fontWeight: 400 }}>{site.estado}</span>}
        </div>
        <a href={site.url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 10, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {site.url} <ExternalLink size={9} />
        </a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: `${info.cor}10`, border: `1px solid ${info.cor}25`, borderRadius: 20 }}>
        <ShieldCheck size={11} color={info.cor} />
        <span style={{ fontSize: 10, color: info.cor, fontWeight: 600 }}>Credencial global {info.label}</span>
      </div>
    </div>
  );
};

// ── Componente principal
const CredenciaisSites = () => {
  const [apiSites, setApiSites] = useState([]);
  const [creds, setCreds]       = useState({ axhub_admin_login: '', axhub_admin_senha: '', axhub_suporte_login: '', axhub_suporte_senha: '', axcross_login: '', axcross_senha: '', axton_login: '', axton_senha: '' });
  const [visible, setVisible]   = useState({});
  const [statusGlobal, setStatusGlobal] = useState(null);
  const [secaoAberta, setSecaoAberta] = useState({ axhub: true, axcross: true });

  useEffect(() => {
    Promise.all([
      apiFetch('/manual-scripts/special/sites').then(r => r.json()).catch(() => []),
      apiFetch('/manual-scripts/special/credentials').then(r => r.json()).catch(() => ({})),
    ]).then(([sites, c]) => {
      setApiSites(Array.isArray(sites) ? sites : []);
      setCreds(prev => ({ ...prev, axhub_admin_login: c.axhub_admin_login || '', axhub_suporte_login: c.axhub_suporte_login || '', axcross_login: c.axcross_login || '', axton_login: c.axton_login || '' }));
    });
  }, []);

  const salvarGlobal = async () => {
    setStatusGlobal('saving');
    try {
      const r = await apiFetch('/manual-scripts/special/credentials', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const d = await r.json();
      setStatusGlobal(d.success ? 'ok' : 'erro');
    } catch { setStatusGlobal('erro'); }
    setTimeout(() => setStatusGlobal(null), 4000);
  };

  // Monta lookup das URLs da API para deduplicação
  const apiUrlSet = new Set(apiSites.map(s => s.url).filter(Boolean));

  // Sites do sitesData.js agrupados por produto, excluindo os que já estão na API
  const staticGroups = {
    axhub: AXHUB_SITES.filter(s => !apiUrlSet.has(s.url)),
    axcross: AXCROSS_SITES.filter(s => !apiUrlSet.has(s.url)),
  };

  // Grupos da API por produto
  const apiByProduto = apiSites.reduce((acc, s) => {
    const p = s.produto || 'outros';
    if (!acc[p]) acc[p] = [];
    acc[p].push(s);
    return acc;
  }, {});

  const gruposCredGlobal = [
    { titulo: '🚦 AxHub — Admin', desc: 'Ciclos: Admin Cycle, Admin Full, Operações', cor: '#ef4444', campos: [{ k: 'axhub_admin_login', label: 'E-mail', type: 'text' }, { k: 'axhub_admin_senha', label: 'Senha', type: 'password' }] },
    { titulo: '🚦 AxHub — Suporte', desc: 'Ciclo: Equipment Cycle', cor: '#6366f1', campos: [{ k: 'axhub_suporte_login', label: 'E-mail', type: 'text' }, { k: 'axhub_suporte_senha', label: 'Senha', type: 'password' }] },
    { titulo: '📡 AxCross', desc: 'Ciclo: AxCross Completo', cor: '#10b981', campos: [{ k: 'axcross_login', label: 'E-mail', type: 'text' }, { k: 'axcross_senha', label: 'Senha', type: 'password' }] },
    { titulo: '⚖️ AxTon', desc: 'Para uso futuro', cor: '#f59e0b', campos: [{ k: 'axton_login', label: 'E-mail', type: 'text' }, { k: 'axton_senha', label: 'Senha', type: 'password' }] },
  ];

  const toggleSecao = (key) => setSecaoAberta(p => ({ ...p, [key]: !p[key] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 860, padding: '4px 0' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <KeyRound size={22} color="#6366f1" />
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Sites e Credenciais</h2>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Sites com credenciais individuais configuradas + todos os demais sites com credenciais globais por produto.
          </p>
        </div>
      </div>

      {/* ══ SEÇÃO: SITES CONFIGURADOS INDIVIDUALMENTE ══ */}
      {Object.entries(apiByProduto).map(([produto, sitesList]) => {
        const info = produtoInfo[produto] || { icon: '🌐', cor: '#6b7280', label: produto };
        return (
          <div key={produto} style={{ border: `1.5px solid ${info.cor}33`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: `${info.cor}11`, padding: '10px 16px', borderBottom: `1px solid ${info.cor}22`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{info.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{info.label}</span>
              <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>— Sites Configurados</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, background: `${info.cor}20`, color: info.cor, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                {sitesList.length} site{sitesList.length !== 1 ? 's' : ''}
              </span>
            </div>
            {sitesList.map(site => <CardConfigurado key={site.id} site={site} />)}

            {/* Sites do sitesData.js sem credencial individual — aparecem no mesmo grupo */}
            {staticGroups[produto]?.length > 0 && (
              <>
                <div
                  onClick={() => toggleSecao(produto)}
                  style={{ padding: '8px 16px', background: '#f8fafc', borderTop: `1px solid ${info.cor}22`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <ShieldCheck size={12} color={info.cor} />
                  <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
                    {staticGroups[produto].length} site{staticGroups[produto].length !== 1 ? 's' : ''} com credencial global
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>{secaoAberta[produto] ? '▲' : '▼'}</span>
                </div>
                {secaoAberta[produto] && staticGroups[produto].map(s => (
                  <CardGlobal key={s.id} site={s} produto={produto} />
                ))}
              </>
            )}
          </div>
        );
      })}

      {/* ══ SEÇÃO: PRODUTOS SEM NENHUM SITE CONFIGURADO NA API (ex: AxTon) ══ */}
      {Object.entries(staticGroups)
        .filter(([p, list]) => list.length > 0 && !apiByProduto[p])
        .map(([produto, list]) => {
          const info = produtoInfo[produto] || { icon: '🌐', cor: '#6b7280', label: produto };
          return (
            <div key={produto} style={{ border: `1.5px solid ${info.cor}33`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: `${info.cor}11`, padding: '10px 16px', borderBottom: `1px solid ${info.cor}22`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{info.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{info.label}</span>
                <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>— Credenciais Globais</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, background: `${info.cor}20`, color: info.cor, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                  {list.length} site{list.length !== 1 ? 's' : ''}
                </span>
              </div>
              {list.map(s => <CardGlobal key={s.id} site={s} produto={produto} />)}
            </div>
          );
        })}

      {/* ══ DIVISOR ══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Settings size={13} color="#9ca3af" />
          <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>Credenciais Globais por Produto</span>
        </div>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      </div>
      <p style={{ margin: '-20px 0 0', fontSize: 11, color: '#6b7280' }}>
        Utilizadas por todos os sites que não possuem credenciais individuais configuradas.
      </p>

      {/* ══ FORM CREDENCIAIS GLOBAIS ══ */}
      {gruposCredGlobal.map(g => (
        <div key={g.titulo} style={{ border: `1.5px solid ${g.cor}33`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: `${g.cor}11`, padding: '10px 16px', borderBottom: `1px solid ${g.cor}22` }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{g.titulo}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{g.desc}</div>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {g.campos.map(({ k, label, type }) => (
              <div key={k} style={{ flex: '1 1 240px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#374151' }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden', background: 'white' }}>
                  <input
                    value={creds[k] || ''}
                    onChange={e => setCreds(p => ({ ...p, [k]: e.target.value }))}
                    type={type === 'password' && !visible[k] ? 'password' : 'text'}
                    placeholder={type === 'password' ? '••••••••' : 'usuario@empresa.com.br'}
                    style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: 'none', outline: 'none', background: 'transparent' }}
                    autoComplete="off"
                  />
                  {type === 'password' && (
                    <button onClick={() => setVisible(p => ({ ...p, [k]: !p[k] }))}
                      style={{ padding: '0 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                      {visible[k] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Botão salvar global */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={salvarGlobal} disabled={statusGlobal === 'saving'}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: statusGlobal === 'saving' ? 'not-allowed' : 'pointer', opacity: statusGlobal === 'saving' ? 0.7 : 1 }}>
          <Save size={14} /> {statusGlobal === 'saving' ? 'Salvando...' : 'Salvar Credenciais Globais'}
        </button>
        {statusGlobal === 'ok'   && <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>✅ Salvo!</span>}
        {statusGlobal === 'erro' && <span style={{ color: '#ef4444', fontSize: 13 }}>❌ Erro ao salvar.</span>}
      </div>

    </div>
  );
};

export default CredenciaisSites;
