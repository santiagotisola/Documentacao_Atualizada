import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ALL_CREDENCIAIS, CREDENCIAIS_AXHUB, CREDENCIAIS_AXCROSS, STATUS_CREDENCIAL } from '../data/sitesCredentials';
import './CredenciaisManager.css';

const STORAGE_KEY = 'axion-credenciais-state';
const AUDIT_KEY = 'axion-credenciais-audit';
const CUSTOM_SITES_KEY = 'axion-credenciais-custom';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadAudit() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAudit(audit) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(audit));
}

function loadCustomSites() {
  try {
    const raw = localStorage.getItem(CUSTOM_SITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomSites(sites) {
  localStorage.setItem(CUSTOM_SITES_KEY, JSON.stringify(sites));
}

function maskPassword(pwd) {
  if (!pwd || pwd.length <= 2) return '***';
  return pwd[0] + '*'.repeat(pwd.length - 2) + pwd[pwd.length - 1];
}

function validatePassword(pwd) {
  const errors = [];
  if (pwd.length < 8) errors.push('Mínimo de 8 caracteres');
  if (!/[A-Z]/.test(pwd)) errors.push('Deve conter letra maiúscula');
  if (!/[0-9]/.test(pwd)) errors.push('Deve conter número');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) errors.push('Deve conter caractere especial');
  return errors;
}

/* ═══════════════════════════════════════════════════════════════════
   MODAL: Alteração de Senha
   ═══════════════════════════════════════════════════════════════════ */
function ModalAlterarSenha({ sites, onClose, onConfirm }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validatePassword(novaSenha);
    if (novaSenha !== confirmacao) validationErrors.push('Senha e confirmação devem ser iguais');
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    onConfirm(novaSenha);
  };

  return (
    <div className="cred-modal-overlay" onClick={onClose}>
      <div className="cred-modal" onClick={e => e.stopPropagation()}>
        <div className="cred-modal-header">
          <h3>🔑 Alteração de Senha</h3>
          <button className="cred-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="cred-modal-sites">
          <strong>Sites selecionados ({sites.length}):</strong>
          <div className="cred-modal-site-tags">
            {sites.map(s => (
              <span key={s.id} className={`cred-tag cred-tag-${s.sistema.toLowerCase()}`}>
                {s.nome} ({s.sistema})
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="cred-modal-form">
          <div className="cred-field">
            <label>Nova Senha</label>
            <div className="cred-pwd-input">
              <input
                type={showPwd ? 'text' : 'password'}
                value={novaSenha}
                onChange={e => { setNovaSenha(e.target.value); setErrors([]); }}
                placeholder="Digite a nova senha"
                autoFocus
              />
              <button type="button" className="cred-toggle-pwd" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="cred-field">
            <label>Confirmar Senha</label>
            <div className="cred-pwd-input">
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmacao}
                onChange={e => { setConfirmacao(e.target.value); setErrors([]); }}
                placeholder="Confirme a nova senha"
              />
            </div>
          </div>

          {/* Requisitos de senha */}
          <div className="cred-requirements">
            <span className={novaSenha.length >= 8 ? 'ok' : ''}>✓ Mín. 8 caracteres</span>
            <span className={/[A-Z]/.test(novaSenha) ? 'ok' : ''}>✓ Letra maiúscula</span>
            <span className={/[0-9]/.test(novaSenha) ? 'ok' : ''}>✓ Número</span>
            <span className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(novaSenha) ? 'ok' : ''}>✓ Caractere especial</span>
            <span className={novaSenha && novaSenha === confirmacao ? 'ok' : ''}>✓ Senhas iguais</span>
          </div>

          {errors.length > 0 && (
            <div className="cred-errors">
              {errors.map((err, i) => <p key={i}>⚠️ {err}</p>)}
            </div>
          )}

          <div className="cred-modal-actions">
            <button type="button" className="cred-btn cred-btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="cred-btn cred-btn-confirm">🔑 Confirmar Alteração</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODAL: Adicionar Novo Site
   ═══════════════════════════════════════════════════════════════════ */
function ModalAdicionarSite({ onClose, onConfirm, existingIds }) {
  const [form, setForm] = useState({
    nome: '',
    url: '',
    estado: '',
    tipo: 'Metrologia',
    login: '',
    senha: '',
    sistema: 'AxHub',
  });
  const [errors, setErrors] = useState([]);

  const tipos = ['Metrologia', 'Trânsito Municipal', 'Trânsito Estadual', 'Rodovias', 'Fiscal', 'Homologação'];
  const estados = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO','—'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = [];
    if (!form.nome.trim()) errs.push('Nome é obrigatório');
    if (!form.url.trim()) errs.push('URL é obrigatória');
    if (!form.login.trim()) errs.push('Login é obrigatório');
    if (!form.senha.trim()) errs.push('Senha é obrigatória');
    if (form.url && !/^https?:\/\/.+/.test(form.url)) errs.push('URL deve iniciar com http:// ou https://');
    const id = `${form.sistema.toLowerCase()}-${form.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (existingIds.includes(id)) errs.push('Site já existe com este nome e sistema');
    if (errs.length > 0) { setErrors(errs); return; }
    onConfirm({ ...form, id });
  };

  return (
    <div className="cred-modal-overlay" onClick={onClose}>
      <div className="cred-modal cred-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="cred-modal-header">
          <h3>➕ Adicionar Novo Site</h3>
          <button className="cred-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="cred-modal-form">
          <div className="cred-form-grid">
            <div className="cred-field">
              <label>Nome do Site *</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: DETRANRJ" />
            </div>
            <div className="cred-field">
              <label>Sistema *</label>
              <select value={form.sistema} onChange={e => setForm({ ...form, sistema: e.target.value })}>
                <option value="AxHub">AxHub</option>
                <option value="AxCross">AxCross</option>
              </select>
            </div>
            <div className="cred-field">
              <label>URL *</label>
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://site.axhub.axion.ws" />
            </div>
            <div className="cred-field">
              <label>Estado</label>
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                <option value="">Selecione</option>
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="cred-field">
              <label>Tipo</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="cred-field">
              <label>Login *</label>
              <input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} placeholder="Admin" />
            </div>
            <div className="cred-field">
              <label>Senha *</label>
              <input value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Senha inicial" />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="cred-errors">
              {errors.map((err, i) => <p key={i}>⚠️ {err}</p>)}
            </div>
          )}

          <div className="cred-modal-actions">
            <button type="button" className="cred-btn cred-btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="cred-btn cred-btn-confirm">➕ Adicionar Site</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODAL: Auditoria
   ═══════════════════════════════════════════════════════════════════ */
function ModalAuditoria({ audit, onClose }) {
  return (
    <div className="cred-modal-overlay" onClick={onClose}>
      <div className="cred-modal cred-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="cred-modal-header">
          <h3>📋 Histórico de Alterações</h3>
          <button className="cred-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cred-audit-list">
          {audit.length === 0 && <p className="cred-empty">Nenhuma alteração registrada.</p>}
          {audit.slice().reverse().map((entry, i) => (
            <div key={i} className={`cred-audit-item cred-audit-${entry.status.toLowerCase()}`}>
              <div className="cred-audit-header">
                <strong>{entry.cliente}</strong>
                <span className={`cred-status-badge cred-status-${entry.status.toLowerCase()}`}>{entry.status}</span>
              </div>
              <div className="cred-audit-meta">
                <span>🏢 {entry.tipoSistema}</span>
                <span>🔗 {entry.url}</span>
                <span>📅 {entry.dataHora}</span>
              </div>
              <div className="cred-audit-details">
                <span>👤 {entry.usuario}</span>
                <span>🔄 {entry.acao}</span>
                {entry.senhaAnterior && <span>🔒 Anterior: {entry.senhaAnterior}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="cred-modal-actions">
          <button className="cred-btn cred-btn-cancel" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: CredenciaisManager
   ═══════════════════════════════════════════════════════════════════ */
export default function CredenciaisManager() {
  const [credState, setCredState] = useState(loadState);
  const [audit, setAudit] = useState(loadAudit);
  const [customSites, setCustomSites] = useState(loadCustomSites);
  const [selecionados, setSelecionados] = useState([]);
  const [modo, setModo] = useState('individual'); // individual | lote
  const [grupo, setGrupo] = useState('Todos'); // Todos | AxHub | AxCross
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(null); // 'alterar' | 'adicionar' | 'auditoria'
  const [showPasswords, setShowPasswords] = useState({});

  // Persist state changes
  useEffect(() => { saveState(credState); }, [credState]);
  useEffect(() => { saveAudit(audit); }, [audit]);
  useEffect(() => { saveCustomSites(customSites); }, [customSites]);

  // All sites including custom
  const allSites = useMemo(() => {
    return [...ALL_CREDENCIAIS, ...customSites];
  }, [customSites]);

  // Filtered sites
  const sitesFiltrados = useMemo(() => {
    return allSites.filter(s => {
      if (grupo !== 'Todos' && s.sistema !== grupo) return false;
      if (busca) {
        const term = busca.toLowerCase();
        return s.nome.toLowerCase().includes(term) ||
          s.url.toLowerCase().includes(term) ||
          s.login.toLowerCase().includes(term) ||
          s.estado.toLowerCase().includes(term) ||
          s.tipo.toLowerCase().includes(term);
      }
      return true;
    });
  }, [allSites, grupo, busca]);

  // Get current password (overridden or original)
  const getCurrentPassword = useCallback((site) => {
    return credState[site.id]?.senha || site.senha;
  }, [credState]);

  // Get status for a site
  const getStatus = useCallback((site) => {
    return credState[site.id]?.status || STATUS_CREDENCIAL.PENDENTE;
  }, [credState]);

  // Get last change date
  const getLastChange = useCallback((site) => {
    return credState[site.id]?.ultimaAlteracao || null;
  }, [credState]);

  // Toggle selection
  const toggleSelect = (id) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Select all visible
  const selectAll = () => {
    const allIds = sitesFiltrados.map(s => s.id);
    const allSelected = allIds.every(id => selecionados.includes(id));
    if (allSelected) {
      setSelecionados(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelecionados(prev => [...new Set([...prev, ...allIds])]);
    }
  };

  // Select by group
  const selectByGroup = (sistema) => {
    const ids = allSites.filter(s => s.sistema === sistema).map(s => s.id);
    setSelecionados(ids);
  };

  // Handle password change confirmation — modo tracker manual
  const handlePasswordChange = (novaSenha) => {
    const sitesToChange = allSites.filter(s => selecionados.includes(s.id));
    const now = new Date().toLocaleString('pt-BR');
    const newState = { ...credState };
    const newAudit = [...audit];

    setShowModal(null);

    // Registrar nova senha localmente para todos os sites selecionados
    sitesToChange.forEach(site => {
      const senhaAnterior = getCurrentPassword(site);
      newState[site.id] = {
        senha: novaSenha,
        status: STATUS_CREDENCIAL.ALTERADA,
        ultimaAlteracao: now,
      };
      newAudit.push({
        usuario: 'Operador',
        cliente: site.nome,
        url: site.url,
        tipoSistema: site.sistema,
        dataHora: now,
        acao: 'Nova senha registrada — alterar manualmente no site',
        status: STATUS_CREDENCIAL.ALTERADA,
        senhaAnterior: maskPassword(senhaAnterior),
      });
    });

    setCredState(newState);
    setAudit(newAudit);
    setSelecionados([]);

    // Perguntar se quer abrir os sites para alterar
    const count = sitesToChange.length;
    const abrir = window.confirm(
      `✅ Nova senha registrada para ${count} site(s).\n\n` +
      `Deseja abrir os ${count} site(s) para alterar a senha manualmente?\n\n` +
      `Após alterar, clique em ✅ (Validar) para confirmar.`
    );
    if (abrir) {
      sitesToChange.forEach(s => window.open(s.url, '_blank', 'noopener,noreferrer'));
    }
  };

  // Validate access — marca manualmente como validado após confirmação do usuário
  const handleValidateAccess = (siteId) => {
    const now = new Date().toLocaleString('pt-BR');
    const site = allSites.find(s => s.id === siteId);
    const pwd = getCurrentPassword(site);

    const confirmar = window.confirm(
      `Confirma que conseguiu acessar ${site.nome} com a senha atual?\n\n` +
      `URL: ${site.url}\nLogin: ${site.login}\nSenha: ${maskPassword(pwd)}\n\n` +
      `Clique OK para marcar como VALIDADA.`
    );

    if (!confirmar) return;

    setCredState(prev => ({
      ...prev,
      [siteId]: { ...prev[siteId], status: STATUS_CREDENCIAL.VALIDADA, ultimaAlteracao: now },
    }));
    setAudit(prev => [...prev, {
      usuario: 'Operador',
      cliente: site.nome,
      url: site.url,
      tipoSistema: site.sistema,
      dataHora: now,
      acao: 'Acesso validado manualmente',
      status: STATUS_CREDENCIAL.VALIDADA,
    }]);
  };

  // Add new site
  const handleAddSite = (siteData) => {
    setCustomSites(prev => [...prev, siteData]);
    setShowModal(null);
  };

  // Open site in new tab
  const openSite = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Toggle password visibility
  const togglePwdVisibility = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Stats
  const stats = useMemo(() => {
    const total = allSites.length;
    const alteradas = allSites.filter(s => getStatus(s) === STATUS_CREDENCIAL.ALTERADA).length;
    const validadas = allSites.filter(s => getStatus(s) === STATUS_CREDENCIAL.VALIDADA).length;
    const pendentes = total - alteradas - validadas;
    return { total, alteradas, validadas, pendentes };
  }, [allSites, getStatus]);

  return (
    <div className="cred-container">
      {/* Header com KPIs */}
      <div className="cred-header">
        <div className="cred-kpis">
          <div className="cred-kpi">
            <span className="cred-kpi-value">{stats.total}</span>
            <span className="cred-kpi-label">Total Sites</span>
          </div>
          <div className="cred-kpi cred-kpi-pending">
            <span className="cred-kpi-value">{stats.pendentes}</span>
            <span className="cred-kpi-label">Pendentes</span>
          </div>
          <div className="cred-kpi cred-kpi-changed">
            <span className="cred-kpi-value">{stats.alteradas}</span>
            <span className="cred-kpi-label">Alteradas</span>
          </div>
          <div className="cred-kpi cred-kpi-validated">
            <span className="cred-kpi-value">{stats.validadas}</span>
            <span className="cred-kpi-label">Validadas</span>
          </div>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="cred-controls">
        <div className="cred-filters">
          <div className="cred-filter-group">
            <label>Modo</label>
            <div className="cred-radio-group">
              <label className={modo === 'individual' ? 'active' : ''}>
                <input type="radio" name="modo" value="individual" checked={modo === 'individual'} onChange={() => setModo('individual')} />
                Individual
              </label>
              <label className={modo === 'lote' ? 'active' : ''}>
                <input type="radio" name="modo" value="lote" checked={modo === 'lote'} onChange={() => setModo('lote')} />
                Em Lote
              </label>
            </div>
          </div>

          <div className="cred-filter-group">
            <label>Grupo</label>
            <div className="cred-radio-group">
              {['Todos', 'AxHub', 'AxCross'].map(g => (
                <label key={g} className={grupo === g ? 'active' : ''}>
                  <input type="radio" name="grupo" value={g} checked={grupo === g} onChange={() => setGrupo(g)} />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <div className="cred-filter-group cred-filter-search">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Nome, URL, estado..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="cred-actions-bar">
          {modo === 'lote' && (
            <>
              <button className="cred-btn cred-btn-sm" onClick={() => selectByGroup('AxHub')} title="Selecionar todos AxHub">
                Sel. AxHub
              </button>
              <button className="cred-btn cred-btn-sm" onClick={() => selectByGroup('AxCross')} title="Selecionar todos AxCross">
                Sel. AxCross
              </button>
            </>
          )}
          <button
            className="cred-btn cred-btn-primary"
            disabled={selecionados.length === 0}
            onClick={() => setShowModal('alterar')}
          >
            🔑 Alterar Senha ({selecionados.length})
          </button>
          <button className="cred-btn cred-btn-add" onClick={() => setShowModal('adicionar')}>
            ➕ Novo Site
          </button>
          <button className="cred-btn cred-btn-audit" onClick={() => setShowModal('auditoria')}>
            📋 Histórico ({audit.length})
          </button>
        </div>
      </div>

      {/* Tabela de Credenciais */}
      <div className="cred-table-wrap">
        <table className="cred-table">
          <thead>
            <tr>
              <th className="cred-col-check">
                <input type="checkbox" onChange={selectAll} checked={sitesFiltrados.length > 0 && sitesFiltrados.every(s => selecionados.includes(s.id))} />
              </th>
              <th>Cliente</th>
              <th>URL</th>
              <th>Tipo</th>
              <th>Usuário</th>
              <th>Senha Atual</th>
              <th>Status</th>
              <th>Última Alteração</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sitesFiltrados.map(site => {
              const status = getStatus(site);
              const lastChange = getLastChange(site);
              const pwd = getCurrentPassword(site);
              const isSelected = selecionados.includes(site.id);

              return (
                <tr key={site.id} className={isSelected ? 'cred-row-selected' : ''}>
                  <td className="cred-col-check">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(site.id)} />
                  </td>
                  <td className="cred-col-cliente">
                    <strong>{site.nome}</strong>
                    <span className={`cred-sys-badge cred-sys-${site.sistema.toLowerCase()}`}>{site.sistema}</span>
                    <small>{site.estado}</small>
                  </td>
                  <td className="cred-col-url">
                    <a href={site.url} target="_blank" rel="noopener noreferrer" title={site.url}>
                      {site.url.replace('https://', '').replace('http://', '')}
                    </a>
                  </td>
                  <td>{site.tipo}</td>
                  <td className="cred-col-user">{site.login}</td>
                  <td className="cred-col-pwd">
                    <span className="cred-pwd-display">
                      {showPasswords[site.id] ? pwd : maskPassword(pwd)}
                    </span>
                    <button className="cred-btn-icon" onClick={() => togglePwdVisibility(site.id)} title="Mostrar/ocultar">
                      {showPasswords[site.id] ? '🙈' : '👁️'}
                    </button>
                    <button className="cred-btn-icon" onClick={() => navigator.clipboard.writeText(pwd)} title="Copiar senha">
                      📋
                    </button>
                  </td>
                  <td>
                    <span className={`cred-status-badge cred-status-${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>
                  <td className="cred-col-date">{lastChange || '—'}</td>
                  <td className="cred-col-actions">
                    <button
                      className="cred-btn-icon"
                      title="Alterar senha"
                      onClick={() => { setSelecionados([site.id]); setShowModal('alterar'); }}
                    >
                      🔑
                    </button>
                    <button
                      className="cred-btn-icon"
                      title="Validar acesso (testar login)"
                      onClick={() => handleValidateAccess(site.id)}
                    >
                      ✅
                    </button>
                    <button
                      className="cred-btn-icon"
                      title="Abrir site"
                      onClick={() => openSite(site.url)}
                    >
                      🔗
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sitesFiltrados.length === 0 && (
        <p className="cred-empty">Nenhum site encontrado com os filtros aplicados.</p>
      )}

      {/* Modais */}
      {showModal === 'alterar' && selecionados.length > 0 && (
        <ModalAlterarSenha
          sites={allSites.filter(s => selecionados.includes(s.id))}
          onClose={() => setShowModal(null)}
          onConfirm={handlePasswordChange}
        />
      )}

      {showModal === 'adicionar' && (
        <ModalAdicionarSite
          onClose={() => setShowModal(null)}
          onConfirm={handleAddSite}
          existingIds={allSites.map(s => s.id)}
        />
      )}

      {showModal === 'auditoria' && (
        <ModalAuditoria
          audit={audit}
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  );
}
