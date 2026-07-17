import React, { useState, useMemo } from "react";
import { AXHUB_SITES, AXCROSS_SITES } from "../data/sitesData";
import "./PainelProcessos.css";

/* ═══════════════════════════════════════════════════════════════════
   PAINEL DE PROCESSOS — Mapeamento completo AxHub / AxCross / AxTon
   Sites, módulos, acessos e processos operacionais
   ═══════════════════════════════════════════════════════════════════ */

// ─── Processos detalhados por sistema ──────────────────────────────
const PROCESSOS_AXHUB = [
  {
    modulo: "Infrações", icone: "🚨",
    itens: [
      "Triagem (validação de infrações)",
      "Auditoria (revisão de triagens)",
      "Consulta de Infrações",
      "Exportação (envio para órgãos)",
      "Exceções (regras automáticas)",
      "Infrações Descartadas",
    ]
  },
  {
    modulo: "Operações", icone: "🔧",
    itens: [
      "Cadastro de Operações",
      "Aferições (certificados INMETRO)",
      "Faixas (monitoramento)",
      "Monitoramento Online",
      "Eventos de Equipamentos",
      "Consulta de Placas",
    ]
  },
  {
    modulo: "Equipamentos", icone: "📡",
    itens: [
      "Fabricantes",
      "Tipos de Equipamentos",
      "Modelos de Equipamentos",
      "Grupos de Equipamentos",
      "Lista de Equipamentos",
    ]
  },
  {
    modulo: "Medição", icone: "📏",
    itens: [
      "Contratos",
      "Índices de Performance",
      "Criar Medição",
      "Interrupções",
      "Medições Finalizadas",
      "Recursos",
    ]
  },
  {
    modulo: "Pesagem / Balança", icone: "⚖️",
    itens: [
      "Postos de Pesagem",
      "Tickets em Aberto",
      "Tickets Fechados",
      "Liberar Pesagem",
      "Reclassificação",
      "Motivos",
    ]
  },
  {
    modulo: "Cronotacógrafo", icone: "⏱️",
    itens: [
      "Triagem Cronotacógrafo",
      "Consulta Cronotacógrafo",
    ]
  },
  {
    modulo: "Relatórios / BI", icone: "📈",
    itens: [
      "Relatório de Infrações",
      "Eventos de Equipamentos",
      "Passagens / Fluxo",
      "Fluxo Diário",
      "Falhas Sequenciais",
      "Discrepâncias",
      "Logs de Envios",
      "Lote de Importação",
      "Power BI (dashboards)",
    ]
  },
  {
    modulo: "Veículos", icone: "🚗",
    itens: [
      "Tipos", "Espécies", "Marcas", "Modelos",
      "Cores", "Categorias", "Classificações", "Municípios",
    ]
  },
  {
    modulo: "Controle de Acesso", icone: "🔐",
    itens: [
      "Usuários", "Perfis de Acesso",
      "Permissões", "Logs de Acesso", "Restrição por IP",
    ]
  },
  {
    modulo: "Administração", icone: "⚙️",
    itens: [
      "Configurações do Sistema", "Arcos", "Enquadramentos",
      "Formas de Autuação", "Layouts de Arquivos",
      "Motivos de Descarte", "Regiões", "Sequenciais",
      "Tarjas", "Tipos de Aferições", "Tipos de Imagens",
      "Webhooks", "Configuração Power BI",
    ]
  },
];

const PROCESSOS_AXCROSS = [
  {
    modulo: "Veículos Monitorados", icone: "🚗",
    itens: [
      "Lista de Veículos Monitorados",
      "Tipos de Ocorrências (vigência automática)",
      "Alertas em Tempo Real",
      "Classificações de Veículos",
      "Importação em Lote",
    ]
  },
  {
    modulo: "Equipamentos", icone: "📡",
    itens: [
      "Lista de Equipamentos",
      "Grupos de Equipamentos",
      "Áreas (regiões geográficas)",
      "Importação em Lote",
    ]
  },
  {
    modulo: "Monitoramento Online", icone: "🗺️",
    itens: [
      "Monitoramento em Tempo Real (SignalR)",
      "Mapa de Equipamentos (Google Maps)",
    ]
  },
  {
    modulo: "Relatórios", icone: "📈",
    itens: [
      "Passagens (filtros avançados)",
      "Mapeamento de Rotas",
      "Rastreamento de Placas",
      "Veículos Monitorados",
      "Ocorrências e Alertas",
      "PDFs Gerados",
    ]
  },
  {
    modulo: "MDF-e (Fiscal)", icone: "📄",
    itens: [
      "Painel Fiscal / Operacional",
      "OCR + SEFAZ (MDF-e)",
      "Monitoramento de Manifesto Eletrônico",
    ]
  },
  {
    modulo: "Configurações", icone: "⚙️",
    itens: [
      "Sistema", "Usuários", "Perfis",
      "Permissões", "Logs", "Sincronização",
    ]
  },
];

// ─── Sites AxCross adicionais (não presentes em AXCROSS_SITES) ─────
const AXCROSS_EXTRA = [
  { id: "detranpi-cross", nome: "DETRANPI", url: "https://detranpi.axcross.axion.ws", estado: "PI", status: "ativo" },
  { id: "ipemmt-cross", nome: "IPEMMT", url: "https://ipemmt.axcross.axion.ws", estado: "MT", status: "ativo" },
  { id: "derse-cross", nome: "DERSE", url: "https://derse.axcross.axion.ws", estado: "SE", status: "ativo" },
  { id: "ipemce-cross", nome: "IPEMCE", url: "https://ipemce.axcross.axion.ws", estado: "CE", status: "ativo" },
  { id: "setrans-cross", nome: "SETRANS", url: "https://setrans.axcross.axion.ws", estado: "GO", status: "ativo" },
  { id: "detranma-cross", nome: "DETRANMA", url: "https://detranma.axcross.axion.ws", estado: "MA", status: "ativo" },
  { id: "imperatriz-cross", nome: "IMPERATRIZ", url: "https://imperatriz.axcross.axion.ws", estado: "MA", status: "ativo" },
  { id: "ipempe-cross", nome: "IPEMPE", url: "https://ipempe.axcross.axion.ws", estado: "PE", status: "ativo" },
  { id: "sefazpi-cross", nome: "SEFAZPI", url: "https://sefazpi.axcross.axion.ws", estado: "PI", status: "ativo" },
  { id: "goiania-cross", nome: "GOIÂNIA", url: "https://goiania.axcross.axion.ws", estado: "GO", status: "ativo" },
  { id: "economia-cross", nome: "ECONOMIA", url: "https://economia.axcross.axion.ws", estado: "GO", status: "ativo" },
  { id: "homologacao-cross", nome: "HOMOLOGAÇÃO", url: "https://homologacao.axcross.axion.ws", estado: "—", status: "ativo" },
];

// ─── Serviços auxiliares ───────────────────────────────────────────
const SERVICOS_AUXILIARES = [
  { id: "economia", nome: "Economia", url: "https://economia.axion.ws", tipo: "Serviço" },
  { id: "identity", nome: "Identity Server", url: "https://identity.axion.ws", tipo: "Auth" },
  { id: "goiania-portal", nome: "Goiânia Portal", url: "https://goiania.axion.ws", tipo: "Portal" },
  { id: "goiania-id", nome: "Goiânia Identity", url: "https://goiania.id.axion.ws", tipo: "Auth" },
];

// ─── Grupos de acesso — referência operacional ───────────────────
const GRUPOS_ACESSO = [
  {
    grupo: "Grupo Axion (suporte)",
    login: "Axion@2026",
    senha: "Axion@2026",
    sites: [
      "homologacao.axhub.axion.ws", "goiania.axhub.axion.ws",
      "imepi.axhub.axion.ws", "ipemmt.axcross.axion.ws",
      "derse.axcross.axion.ws", "economia.axion.ws",
      "economia.axcross.axion.ws", "homologacao.axcross.axion.ws",
      "identity.axion.ws", "ipemce.axcross.axion.ws",
      "strans.axhub.axion.ws",
    ]
  },
  {
    grupo: "Grupo Admin (operação)",
    login: "Admin",
    senha: "labor5383",
    sites: [
      "smtt.axhub.axion.ws", "ipemmt.axhub.axion.ws",
      "derse.axhub.axion.ws", "detranma.axhub.axion.ws",
      "detranpi.axhub.axion.ws", "goiania.id.axion.ws",
      "homologacao.axhub.axion.ws", "ibametro.axhub.axion.ws",
      "imepi.axhub.axion.ws", "imeqpb.axhub.axion.ws",
      "imetropa.axhub.axion.ws", "imperatriz.axhub.axion.ws",
      "ipemce.axhub.axion.ws", "itps.axhub.axion.ws",
      "setrans.axhub.axion.ws", "strans.axhub.axion.ws",
    ]
  },
  {
    grupo: "Grupo Admin (alt login)",
    login: "admin",
    senha: "Labor5383",
    sites: [
      "goiania.id.axion.ws", "ipempe.axhub.axion.ws", "strans.axhub.axion.ws",
    ]
  },
  {
    grupo: "Grupo AxCross (Axion 2025)",
    login: "Axion@2026",
    senha: "Axion@2026",
    sites: [
      "setrans.axcross.axion.ws", "detranma.axcross.axion.ws",
      "goiania.axion.ws", "goiania.id.axion.ws",
      "goiania.axcross.axion.ws",
      "imperatriz.axcross.axion.ws", "ipempe.axcross.axion.ws",
      "sefazpi.axcross.axion.ws",
    ]
  },
  {
    grupo: "AxCross DETRANPI",
    login: "detranpi",
    senha: "Axion@2025",
    sites: ["detranpi.axcross.axion.ws"],
  },
  {
    grupo: "AxCross IPEMCE",
    login: "ipemce",
    senha: "Axion#2023",
    sites: ["ipemce.axhub.axion.ws"],
  },
];

export default function PainelProcessos() {
  const [aba, setAba] = useState("sites");
  const [filtroSistema, setFiltroSistema] = useState("todos");
  const [busca, setBusca] = useState("");
  const [siteDetalhe, setSiteDetalhe] = useState(null);

  // Consolidar todos os sites
  const todosSites = useMemo(() => {
    const axhub = AXHUB_SITES.map(s => ({ ...s, sistema: "AxHub" }));
    const axcross = AXCROSS_SITES.map(s => ({ ...s, sistema: "AxCross" }));
    const extras = AXCROSS_EXTRA
      .filter(e => !AXCROSS_SITES.some(s => s.id === e.id))
      .map(s => ({ ...s, sistema: "AxCross" }));
    return [...axhub, ...axcross, ...extras];
  }, []);

  const sitesFiltrados = useMemo(() => {
    let lista = todosSites;
    if (filtroSistema !== "todos") lista = lista.filter(s => s.sistema === filtroSistema);
    if (busca) {
      const q = busca.toLowerCase();
      lista = lista.filter(s =>
        s.nome.toLowerCase().includes(q) ||
        (s.estado || "").toLowerCase().includes(q) ||
        (s.url || "").toLowerCase().includes(q)
      );
    }
    return lista;
  }, [todosSites, filtroSistema, busca]);

  const totalAxhub = todosSites.filter(s => s.sistema === "AxHub").length;
  const totalAxcross = todosSites.filter(s => s.sistema === "AxCross").length;
  const totalAtivos = todosSites.filter(s => s.status === "ativo").length;
  const totalEquip = todosSites.reduce((a, s) => {
    const eq = typeof s.equipamentos === "object" ? (s.equipamentos?.total || 0) : (s.equipamentos || 0);
    return a + eq;
  }, 0);
  const totalVeiculos = todosSites.reduce((a, s) => a + (s.veiculos || 0), 0);
  const totalPassagens = todosSites.reduce((a, s) => a + (s.passagensDia || 0), 0);

  const ABAS = [
    { id: "sites", label: "🏢 Sites", count: todosSites.length },
    { id: "processos-axhub", label: "🚨 Processos AxHub", count: PROCESSOS_AXHUB.length },
    { id: "processos-axcross", label: "🗺️ Processos AxCross", count: PROCESSOS_AXCROSS.length },
    { id: "acessos", label: "🔑 Grupos de Acesso", count: GRUPOS_ACESSO.length },
    { id: "servicos", label: "🌐 Serviços", count: SERVICOS_AUXILIARES.length },
  ];

  return (
    <div className="pp-container">
      {/* Stats */}
      <div className="pp-stats">
        <div className="pp-stat">
          <div className="pp-stat-value">{todosSites.length}</div>
          <div className="pp-stat-label">Sites Total</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-value" style={{ color: "#60a5fa" }}>{totalAxhub}</div>
          <div className="pp-stat-label">AxHub</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-value" style={{ color: "#f97316" }}>{totalAxcross}</div>
          <div className="pp-stat-label">AxCross</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-value" style={{ color: "#22c55e" }}>{totalAtivos}</div>
          <div className="pp-stat-label">Ativos</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-value">{totalEquip.toLocaleString("pt-BR")}</div>
          <div className="pp-stat-label">Equipamentos</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-value">{totalVeiculos.toLocaleString("pt-BR")}</div>
          <div className="pp-stat-label">Veículos Monit.</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-value">{totalPassagens.toLocaleString("pt-BR")}</div>
          <div className="pp-stat-label">Passagens/Dia</div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="pp-tabs">
        {ABAS.map(a => (
          <button key={a.id} className={`pp-tab ${aba === a.id ? "active" : ""}`} onClick={() => setAba(a.id)}>
            {a.label} ({a.count})
          </button>
        ))}
      </nav>

      {/* ─── ABA: Sites ──────────────────────────────── */}
      {aba === "sites" && (
        <div className="pp-section">
          <div className="pp-filtros">
            <div className="pp-filtro-group">
              <label>Sistema</label>
              <select value={filtroSistema} onChange={e => setFiltroSistema(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="AxHub">AxHub</option>
                <option value="AxCross">AxCross</option>
              </select>
            </div>
            <input
              className="pp-search" placeholder="Buscar site..."
              value={busca} onChange={e => setBusca(e.target.value)}
            />
            <div className="pp-filtro-count">{sitesFiltrados.length} sites</div>
          </div>

          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Sistema</th>
                  <th>UF</th>
                  <th>URL</th>
                  <th>Versão</th>
                  <th>Equip.</th>
                  <th>Faixas</th>
                  <th>Veículos</th>
                  <th>Pass./Dia</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sitesFiltrados.map(s => (
                  <tr
                    key={s.id}
                    className={siteDetalhe?.id === s.id ? "active-row" : ""}
                    onClick={() => setSiteDetalhe(siteDetalhe?.id === s.id ? null : s)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ fontWeight: 600 }}>{s.nome}</td>
                    <td>
                      <span className={`pp-badge pp-badge-${s.sistema.toLowerCase()}`}>
                        {s.sistema}
                      </span>
                    </td>
                    <td>{s.estado || "—"}</td>
                    <td>
                      <a href={s.url} target="_blank" rel="noreferrer" className="pp-link"
                        onClick={e => e.stopPropagation()}>
                        {(s.url || "").replace("https://", "")}
                      </a>
                    </td>
                    <td>{s.versao || "—"}</td>
                    <td>{typeof s.equipamentos === "object" ? (s.equipamentos?.total ?? "—") : (s.equipamentos ?? "—")}</td>
                    <td>{s.faixas ?? "—"}</td>
                    <td>{s.veiculos != null ? s.veiculos.toLocaleString("pt-BR") : "—"}</td>
                    <td>{s.passagensDia != null ? s.passagensDia.toLocaleString("pt-BR") : "—"}</td>
                    <td>
                      <span className={`pp-badge pp-badge-${s.status === "ativo" ? "ativo" : "inativo"}`}>
                        {s.status === "ativo" ? "● Ativo" : "● Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detalhe do site selecionado */}
          {siteDetalhe && (
            <div className="pp-detail">
              <h3>
                <span className={`pp-badge pp-badge-${siteDetalhe.sistema.toLowerCase()}`}>{siteDetalhe.sistema}</span>
                {siteDetalhe.nome} — {siteDetalhe.estado}
              </h3>
              <div className="pp-detail-grid">
                <div className="pp-detail-item">
                  <label>URL</label>
                  <span>
                    <a href={siteDetalhe.url} target="_blank" rel="noreferrer" className="pp-link">
                      {siteDetalhe.url}
                    </a>
                  </span>
                </div>
                <div className="pp-detail-item">
                  <label>Órgão</label>
                  <span>{siteDetalhe.orgao || "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Tipo</label>
                  <span>{siteDetalhe.tipo || "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Versão</label>
                  <span>{siteDetalhe.versao || "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Equipamentos</label>
                  <span>{typeof siteDetalhe.equipamentos === "object" ? (siteDetalhe.equipamentos?.total ?? "—") : (siteDetalhe.equipamentos ?? "—")}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Faixas</label>
                  <span>{siteDetalhe.faixas ?? "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Veículos Monitorados</label>
                  <span>{siteDetalhe.veiculos != null ? siteDetalhe.veiculos.toLocaleString("pt-BR") : "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Alertas</label>
                  <span>{siteDetalhe.alertas ?? "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Passagens/Dia</label>
                  <span>{siteDetalhe.passagensDia != null ? siteDetalhe.passagensDia.toLocaleString("pt-BR") : "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Fabricantes</label>
                  <span>{siteDetalhe.fabricantes?.join(", ") || "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>OCR</label>
                  <span>{siteDetalhe.ocr ? `${siteDetalhe.ocr}%` : "—"}</span>
                </div>
                <div className="pp-detail-item">
                  <label>Telas (menu)</label>
                  <span>{siteDetalhe.menuCount || "—"}</span>
                </div>
              </div>
              {siteDetalhe.bi?.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                    Dashboards Power BI
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.3rem" }}>
                    {siteDetalhe.bi.map((b, i) => (
                      <span key={i} className="pp-cred-site">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              {siteDetalhe.observacoes && (
                <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", background: "rgba(245,158,11,0.08)", borderRadius: 6, borderLeft: "3px solid #f59e0b", fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>
                  {siteDetalhe.observacoes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── ABA: Processos AxHub ────────────────────── */}
      {aba === "processos-axhub" && (
        <div className="pp-section">
          <h3>📋 Processos Operacionais — AxHub ({PROCESSOS_AXHUB.reduce((a, p) => a + p.itens.length, 0)} itens em {PROCESSOS_AXHUB.length} módulos)</h3>
          <div className="pp-proc-grid">
            {PROCESSOS_AXHUB.map(p => (
              <div key={p.modulo} className="pp-proc-card">
                <h4>{p.icone} {p.modulo} <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>({p.itens.length})</span></h4>
                <ul className="pp-proc-list">
                  {p.itens.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ABA: Processos AxCross ──────────────────── */}
      {aba === "processos-axcross" && (
        <div className="pp-section">
          <h3>📋 Processos Operacionais — AxCross ({PROCESSOS_AXCROSS.reduce((a, p) => a + p.itens.length, 0)} itens em {PROCESSOS_AXCROSS.length} módulos)</h3>
          <div className="pp-proc-grid">
            {PROCESSOS_AXCROSS.map(p => (
              <div key={p.modulo} className="pp-proc-card">
                <h4>{p.icone} {p.modulo} <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>({p.itens.length})</span></h4>
                <ul className="pp-proc-list">
                  {p.itens.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ABA: Grupos de Acesso ───────────────────── */}
      {aba === "acessos" && (
        <div className="pp-section">
          <h3>🔑 Grupos de Acesso ({GRUPOS_ACESSO.length} grupos)</h3>
          <div className="pp-cred-grid">
            {GRUPOS_ACESSO.map((g, i) => (
              <div key={i} className="pp-cred-card">
                <h4>{g.grupo}</h4>
                <div className="pp-cred-info">
                  <span>👤 {g.login}</span>
                  <span>•</span>
                  <span>🔒 {g.senha}</span>
                  <span>•</span>
                  <span>{g.sites.length} sites</span>
                </div>
                <div className="pp-cred-sites">
                  {g.sites.map((s, j) => (
                    <a key={j} href={`https://${s}`} target="_blank" rel="noreferrer"
                      className="pp-cred-site" style={{ cursor: "pointer", textDecoration: "none", color: "#e2e8f0" }}>
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ABA: Serviços Auxiliares ────────────────── */}
      {aba === "servicos" && (
        <div className="pp-section">
          <h3>🌐 Serviços Auxiliares</h3>
          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Tipo</th>
                  <th>URL</th>
                </tr>
              </thead>
              <tbody>
                {SERVICOS_AUXILIARES.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.nome}</td>
                    <td>
                      <span className="pp-badge" style={{ background: "#6366f1" }}>{s.tipo}</span>
                    </td>
                    <td>
                      <a href={s.url} target="_blank" rel="noreferrer" className="pp-link">{s.url}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


