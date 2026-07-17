/**
 * 🔍 AXCROSS — DIAGNÓSTICO DE CLASSIFICAÇÃO DE VEÍCULOS
 *
 * Analisa por que o campo CLASSIFICACAO não retorna dados
 * no mapa de equipamentos do AxCross (faixa de monitoramento).
 *
 * Recursos:
 * - Pesquisa por URL do sistema AxCross
 * - Consulta direto ao banco AxCross (via API)
 * - Análise de intercorrências e soluções
 * - Comparação da estrutura esperada vs atual
 */
import React, { useState, useCallback } from "react";
import {
  Search, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Database, Globe, Eye, Wrench, ChevronDown, ChevronUp,
  Copy, ExternalLink, Info, Table2, List, Code2, Lightbulb,
  AlertCircle, Play, Layers
} from "lucide-react";
import QuickSelect from "../components/QuickSelect.jsx";

const API_BASE = "http://localhost:3100";

// ─── Paleta de cores (herda as variáveis globais do portal) ──────
const C = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  raised: "var(--surface-raised)",
  border: "var(--border)",
  text: "var(--text)",
  textMuted: "var(--text-muted)",
  textSecondary: "var(--text-secondary)",
  accent: "var(--accent)",
  accentBg: "var(--accent-subtle)",
  success: "var(--success)",
  successBg: "var(--success-bg)",
  warning: "var(--warning)",
  warningBg: "var(--warning-bg)",
  danger: "var(--danger)",
  dangerBg: "var(--danger-bg)",
  tableHeader: "var(--table-header)",
  rowHover: "var(--table-row-hover)",
  cardBg: "var(--card-bg)",
};

// ─── Intercorrências mapeadas ────────────────────────────────────
const INTERCORRENCIAS = [
  {
    id: "IC-01",
    gravidade: "alta",
    titulo: "Campo ClassificacaoVeiculo ausente no banco de dados",
    descricao:
      "O banco AxCross (TBPassagens) pode não possuir coluna de classificação de veículos. " +
      "O equipamento ITSCAM 450 possui classificador embarcado, mas o dado pode não estar sendo " +
      "persistido no banco.",
    impacto: "Campo aparece em branco no mapa de equipamentos e relatórios de faixa.",
    solucao: [
      "Verificar se a coluna ClassificacaoVeiculo existe em TBPassagens",
      "Se ausente: criar a coluna (ALTER TABLE TBPassagens ADD ClassificacaoVeiculo VARCHAR(50) NULL)",
      "Configurar o receptor AxCross para persistir o campo recebido do ITSCAM",
    ],
    sql: `-- Verificar existência da coluna
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TBPassagens'
  AND COLUMN_NAME LIKE '%classif%'
ORDER BY ORDINAL_POSITION;

-- Criar coluna se ausente
ALTER TABLE TBPassagens
  ADD ClassificacaoVeiculo VARCHAR(50) NULL;`,
  },
  {
    id: "IC-02",
    gravidade: "alta",
    titulo: "Query do endpoint /passagens não inclui o campo",
    descricao:
      "A query SQL atual em statsPassagens (axcross-controller.js) retorna apenas: " +
      "Id, Placa, DataPassagem, Velocidade, Local, Faixa. " +
      "O campo ClassificacaoVeiculo existe na tabela mas não é selecionado.",
    impacto:
      "API retorna passagens sem o campo de classificação, front-end exibe campo vazio.",
    solucao: [
      "Editar a query em axcross-controller.js para incluir p.ClassificacaoVeiculo",
      "Atualizar o componente front-end do mapa para exibir o campo retornado",
    ],
    sql: `-- Query corrigida (adicionar p.ClassificacaoVeiculo)
SELECT TOP 10
  p.Id, p.Placa, p.DataPassagem, p.Velocidade,
  p.ClassificacaoVeiculo,  -- ← ADICIONAR ESTE CAMPO
  l.Nome AS Local,
  f.Nome AS Faixa
FROM TBPassagens p
LEFT JOIN TBLocais l ON p.LocalId = l.Id
LEFT JOIN TBFaixas f ON p.FaixaId = f.Id
ORDER BY p.DataPassagem DESC;`,
  },
  {
    id: "IC-03",
    gravidade: "media",
    titulo: "Classificador do ITSCAM 450 desabilitado ou não configurado",
    descricao:
      "O equipamento ITSCAM 450 possui módulo classificador de veículos (Classificador.enabled). " +
      "Se desabilitado, nenhum dado de classificação é enviado ao servidor.",
    impacto:
      "Todas as passagens chegam sem classificação de veículo — campo sempre nulo.",
    solucao: [
      "Verificar no VARCO Monitor: parâmetro Classificador.enabled deve ser true",
      "Verificar Classificador.minProbability (recomendado: 0.6 ou superior)",
      "Verificar Classificador.sceneType está adequado ao local",
    ],
    link: "/varco-monitor",
    linkLabel: "Abrir VARCO Monitor",
  },
  {
    id: "IC-04",
    gravidade: "media",
    titulo: "Campo com nome diferente na tabela (mapeamento incorreto)",
    descricao:
      "O campo pode estar salvo com nome diferente: TipoVeiculo, VehicleClass, " +
      "TipoClassificacao, ClasseVeiculo, etc. " +
      "O front-end pode estar buscando o nome errado.",
    impacto:
      "Dado existe mas não é exibido por divergência de nomenclatura.",
    solucao: [
      "Listar todas colunas de TBPassagens e identificar a de classificação",
      "Atualizar o campo buscado no frontend para corresponder ao nome real",
    ],
    sql: `-- Listar TODAS as colunas de TBPassagens
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TBPassagens'
ORDER BY ORDINAL_POSITION;`,
  },
  {
    id: "IC-05",
    gravidade: "baixa",
    titulo: "Tabela de tipos de veículos não relacionada corretamente",
    descricao:
      "A classificação pode ser armazenada como ID numérico em TBPassagens com JOIN " +
      "para uma tabela TBTiposVeiculos ou TBClassificacoes. " +
      "Se a tabela de referência não existir ou o JOIN estiver ausente, o campo aparece vazio.",
    impacto:
      "Campo exibe ID numérico ou fica vazio se a tabela de referência não for consultada.",
    solucao: [
      "Verificar se existe tabela TBTiposVeiculos, TBClassificacoes ou similar",
      "Adicionar JOIN na query para traduzir o ID para descrição",
    ],
    sql: `-- Verificar tabelas com 'tipo' ou 'classif'
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
  AND (TABLE_NAME LIKE '%Tipo%' OR TABLE_NAME LIKE '%Classif%' OR TABLE_NAME LIKE '%Veiculo%')
ORDER BY TABLE_NAME;`,
  },
  {
    id: "IC-06",
    gravidade: "baixa",
    titulo: "Front-end do mapa não consome o campo retornado pela API",
    descricao:
      "Mesmo que a API retorne ClassificacaoVeiculo, o componente React do mapa " +
      "pode não estar mapeando e exibindo o campo na infobox da faixa.",
    impacto:
      "Dado chega corretamente mas não é renderizado na interface.",
    solucao: [
      "Inspecionar o componente do mapa de equipamentos no sistema AxCross",
      "Verificar se o campo está sendo lido do objeto retornado pela API",
      "Atualizar o template HTML/JSX da infobox para exibir classificação",
    ],
  },
];

// ─── Gravidade badge ─────────────────────────────────────────────
function GravidadeBadge({ g }) {
  const map = {
    alta:  { bg: C.dangerBg,  color: C.danger,  label: "ALTA" },
    media: { bg: C.warningBg, color: C.warning,  label: "MÉDIA" },
    baixa: { bg: C.accentBg,  color: C.accent,   label: "BAIXA" },
  };
  const s = map[g] || map.baixa;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}`,
      borderRadius: "4px", padding: "2px 7px",
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px",
    }}>{s.label}</span>
  );
}

// ─── Stat card ───────────────────────────────────────────────────
function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: "8px", padding: "12px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color, marginBottom: "4px" }}>
        {icon}
        <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700, color }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

// ─── Código SQL copiável ─────────────────────────────────────────
function SqlBlock({ sql }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ position: "relative", marginTop: "8px" }}>
      <pre style={{
        background: "rgba(0,0,0,0.18)", border: `1px solid ${C.border}`,
        borderRadius: "6px", padding: "10px 12px", fontSize: "11px",
        fontFamily: "'Fira Code', 'Consolas', monospace", overflowX: "auto",
        color: "#a5d8ff", margin: 0, lineHeight: 1.6,
      }}>{sql}</pre>
      <button
        onClick={copy}
        title="Copiar SQL"
        style={{
          position: "absolute", top: "6px", right: "6px",
          background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "4px",
          color: copied ? C.success : C.textMuted, cursor: "pointer", padding: "4px 6px",
          fontSize: "10px", display: "flex", alignItems: "center", gap: "4px",
        }}
      >
        <Copy size={11} /> {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}

// ─── Card de intercorrência ──────────────────────────────────────
function IntercorrenciaCard({ ic, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: "8px",
      overflow: "hidden", marginBottom: "10px",
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", textAlign: "left", background: C.surface,
          border: "none", cursor: "pointer", padding: "12px 16px",
          display: "flex", alignItems: "center", gap: "10px",
          color: C.text,
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, minWidth: 44 }}>{ic.id}</span>
        <GravidadeBadge g={ic.gravidade} />
        <span style={{ flex: 1, fontWeight: 600, fontSize: "13px" }}>{ic.titulo}</span>
        {open ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
      </button>
      {open && (
        <div style={{ padding: "14px 16px", background: C.raised, borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: "13px", color: C.textSecondary, margin: "0 0 12px" }}>{ic.descricao}</p>
          <div style={{
            background: C.dangerBg, border: `1px solid ${C.danger}22`,
            borderRadius: "6px", padding: "8px 12px", marginBottom: "12px",
            fontSize: "12px", color: C.danger,
          }}>
            <strong>Impacto:</strong> {ic.impacto}
          </div>
          <div style={{ marginBottom: ic.sql ? "12px" : 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.success, marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Lightbulb size={12} /> Solução
            </div>
            <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: C.textSecondary, lineHeight: 1.8 }}>
              {ic.solucao.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
          {ic.link && (
            <a
              href={ic.link}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                fontSize: "12px", color: C.accent, marginTop: "8px",
                textDecoration: "none", borderBottom: `1px dashed ${C.accent}55`,
              }}
            >
              <ExternalLink size={12} /> {ic.linkLabel}
            </a>
          )}
          {ic.sql && <SqlBlock sql={ic.sql} />}
        </div>
      )}
    </div>
  );
}

// ─── Tabela de colunas ───────────────────────────────────────────
function ColunasTable({ colunas, destaque }) {
  if (!colunas || colunas.length === 0) return (
    <div style={{ color: C.textMuted, fontSize: "12px", padding: "10px" }}>Nenhuma coluna retornada</div>
  );
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ background: C.tableHeader }}>
            {["Coluna", "Tipo", "Nulo?"].map(h => (
              <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colunas.map((c, i) => {
            const isClassif = c.COLUMN_NAME?.toLowerCase().includes("classif") || c.COLUMN_NAME?.toLowerCase().includes("tipo");
            return (
              <tr key={i} style={{
                background: isClassif ? "rgba(96,205,255,0.07)" : (i % 2 === 0 ? "transparent" : C.raised),
                borderBottom: `1px solid ${C.border}22`,
              }}>
                <td style={{ padding: "6px 10px", fontWeight: isClassif ? 700 : 400, color: isClassif ? C.accent : C.text }}>
                  {isClassif && <span style={{ marginRight: "5px" }}>★</span>}
                  {c.COLUMN_NAME}
                </td>
                <td style={{ padding: "6px 10px", color: C.textSecondary }}>{c.DATA_TYPE}</td>
                <td style={{ padding: "6px 10px", color: c.IS_NULLABLE === "YES" ? C.warning : C.success }}>
                  {c.IS_NULLABLE === "YES" ? "Sim" : "Não"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────
export default function AxCrossClassificacaoDiag() {
  const [tab, setTab] = useState("resumo");
  const [url, setUrl] = useState("https://economia.axcross.axion.ws/monitoringonline/monitoring/equipmentmap");
  const [proxyLoading, setProxyLoading] = useState(false);
  const [proxyResult, setProxyResult] = useState(null);
  const [proxyError, setProxyError] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbResult, setDbResult] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [expandedUrl, setExpandedUrl] = useState(false);

  // ── Busca via proxy de URL ──
  const fetchUrl = useCallback(async () => {
    if (!url.trim()) return;
    setProxyLoading(true);
    setProxyError(null);
    setProxyResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/proxy/fetch-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Falha na requisição");
      setProxyResult(data);
    } catch (e) {
      setProxyError(e.message);
    } finally {
      setProxyLoading(false);
    }
  }, [url]);

  // ── Busca diagnóstico no banco AxCross ──
  const fetchDb = useCallback(async () => {
    setDbLoading(true);
    setDbError(null);
    setDbResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/axcross/diagnostico-classificacao`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Falha no diagnóstico");
      setDbResult(data.diagnostico);
    } catch (e) {
      setDbError(e.message);
    } finally {
      setDbLoading(false);
    }
  }, []);

  // ── Score resumo de intercorrências por gravidade ──
  const altas = INTERCORRENCIAS.filter(i => i.gravidade === "alta").length;
  const medias = INTERCORRENCIAS.filter(i => i.gravidade === "media").length;
  const baixas = INTERCORRENCIAS.filter(i => i.gravidade === "baixa").length;

  return (
    <div style={{ maxWidth: "100%", color: C.text }}>

      {/* ── Alerta de contexto ── */}
      <div style={{
        background: "rgba(251,113,133,0.08)", border: `1px solid rgba(251,113,133,0.3)`,
        borderRadius: "8px", padding: "12px 16px", marginBottom: "18px",
        display: "flex", gap: "12px", alignItems: "flex-start",
      }}>
        <AlertCircle size={18} color={C.danger} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "13px", color: C.danger, marginBottom: "4px" }}>
            Campo CLASSIFICACAO vazio no Mapa de Equipamentos AxCross
          </div>
          <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.6 }}>
            Na tela de mapa de equipamentos AxCross (faixa de monitoramento), o campo{" "}
            <code style={{ background: "rgba(251,113,133,0.15)", padding: "1px 5px", borderRadius: "3px", color: C.danger }}>CLASSIFICACAO</code>{" "}
            não retorna dados. Exemplo de URL afetada:{" "}
            <a href="https://economia.axcross.axion.ws/monitoringonline/monitoring/equipmentmap"
               target="_blank" rel="noreferrer"
               style={{ color: C.accent, fontSize: "11px" }}>
              economia.axcross.axion.ws/…/equipmentmap
            </a>
          </div>
        </div>
      </div>

      {/* ── Cards de resumo ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "10px", marginBottom: "18px" }}>
        <StatCard label="Intercorrências" value={INTERCORRENCIAS.length} color={C.accent} icon={<List size={16} />} sub="mapeadas" />
        <StatCard label="Gravidade Alta" value={altas} color={C.danger} icon={<XCircle size={16} />} sub="críticas" />
        <StatCard label="Gravidade Média" value={medias} color={C.warning} icon={<AlertTriangle size={16} />} sub="atenção" />
        <StatCard label="Gravidade Baixa" value={baixas} color={C.accent} icon={<Info size={16} />} sub="monitorar" />
        <StatCard
          label="Status DB"
          value={dbResult ? (dbResult.tem_classificacao ? "OK" : "FALTA") : "—"}
          color={dbResult ? (dbResult.tem_classificacao ? C.success : C.danger) : C.textMuted}
          icon={<Database size={16} />}
          sub="campo no banco"
        />
      </div>

      {/* ── Barra de pesquisa por URL ── */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: "8px", padding: "14px 16px", marginBottom: "16px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: C.accent, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe size={14} /> Pesquisar por URL do Sistema AxCross
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchUrl()}
            placeholder="https://economia.axcross.axion.ws/monitoringonline/monitoring/equipmentmap"
            style={{
              flex: 1, minWidth: "280px", padding: "8px 12px",
              background: C.raised, border: `1px solid ${C.border}`,
              borderRadius: "6px", color: C.text, fontSize: "12px",
              outline: "none",
            }}
          />
          <button
            onClick={fetchUrl}
            disabled={proxyLoading}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", background: C.accentBg, border: `1px solid ${C.accent}`,
              borderRadius: "6px", color: C.accent, cursor: proxyLoading ? "wait" : "pointer",
              fontSize: "12px", fontWeight: 600, opacity: proxyLoading ? 0.7 : 1,
            }}
          >
            <Search size={14} className={proxyLoading ? "spin" : ""} />
            {proxyLoading ? "Buscando..." : "Buscar URL"}
          </button>
          <button
            onClick={fetchDb}
            disabled={dbLoading}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", background: "rgba(110,231,183,0.08)", border: `1px solid ${C.success}`,
              borderRadius: "6px", color: C.success, cursor: dbLoading ? "wait" : "pointer",
              fontSize: "12px", fontWeight: 600, opacity: dbLoading ? 0.7 : 1,
            }}
          >
            <Database size={14} className={dbLoading ? "spin" : ""} />
            {dbLoading ? "Consultando..." : "Consultar Banco AxCross"}
          </button>
        </div>

        {/* URL sugeridas */}
        <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            "https://economia.axcross.axion.ws/monitoringonline/monitoring/equipmentmap",
            "https://economia.axcross.axion.ws/monitoringonline/api/passages",
            "https://economia.axcross.axion.ws/monitoringonline/api/equipments",
          ].map(u => (
            <button
              key={u}
              onClick={() => setUrl(u)}
              style={{
                fontSize: "10px", padding: "3px 8px",
                background: url === u ? C.accentBg : "transparent",
                border: `1px solid ${url === u ? C.accent : C.border}`,
                borderRadius: "4px", color: url === u ? C.accent : C.textMuted,
                cursor: "pointer",
              }}
            >{u.replace("https://economia.axcross.axion.ws", "…")}</button>
          ))}
        </div>

        {/* Resultado proxy */}
        {proxyError && (
          <div style={{ marginTop: "10px", padding: "8px 12px", background: C.dangerBg, border: `1px solid ${C.danger}44`, borderRadius: "6px", fontSize: "12px", color: C.danger }}>
            ❌ {proxyError}
          </div>
        )}
        {proxyResult && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{
                fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                background: proxyResult.ok ? C.successBg : C.dangerBg,
                color: proxyResult.ok ? C.success : C.danger,
                border: `1px solid ${proxyResult.ok ? C.success : C.danger}44`,
                fontWeight: 700,
              }}>
                HTTP {proxyResult.status} {proxyResult.statusText}
              </span>
              <span style={{ fontSize: "11px", color: C.textMuted }}>{proxyResult.contentType}</span>
              <button
                onClick={() => setExpandedUrl(v => !v)}
                style={{ marginLeft: "auto", fontSize: "11px", color: C.accent, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                {expandedUrl ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expandedUrl ? "Ocultar" : "Ver resposta"}
              </button>
            </div>
            {expandedUrl && (
              <div style={{
                background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}`,
                borderRadius: "6px", padding: "10px 12px", fontSize: "11px",
                fontFamily: "monospace", maxHeight: "300px", overflowY: "auto",
                color: "#a5d8ff", whiteSpace: "pre-wrap", wordBreak: "break-all",
              }}>
                {typeof proxyResult.data === "object"
                  ? JSON.stringify(proxyResult.data, null, 2)
                  : proxyResult.data?.substring(0, 5000)}
              </div>
            )}
            {/* Análise automática do campo classificacao na resposta */}
            <UrlResponseAnalysis data={proxyResult.data} />
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ padding: "4px 0 12px" }}>
        <QuickSelect
          options={[
            { id: "resumo",        label: "Resumo & Contexto" },
            { id: "intercorrencias", label: `Intercorrências (${INTERCORRENCIAS.length})` },
            { id: "banco",         label: "Análise do Banco" },
            { id: "solucoes",      label: "Soluções Rápidas" },
          ]}
          value={tab}
          onChange={setTab}
          color="#60cdff"
          label="Visão"
        />
      </div>

      {/* ── Tab: Resumo ── */}
      {tab === "resumo" && <TabResumo />}

      {/* ── Tab: Intercorrências ── */}
      {tab === "intercorrencias" && (
        <div>
          <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "12px" }}>
            {altas} de alta gravidade · {medias} de média · {baixas} de baixa — clique para expandir detalhes e SQL corretivo
          </div>
          {INTERCORRENCIAS.map((ic, i) => (
            <IntercorrenciaCard key={ic.id} ic={ic} defaultOpen={ic.gravidade === "alta" && i === 0} />
          ))}
        </div>
      )}

      {/* ── Tab: Banco ── */}
      {tab === "banco" && <TabBanco dbResult={dbResult} dbError={dbError} dbLoading={dbLoading} fetchDb={fetchDb} />}

      {/* ── Tab: Soluções ── */}
      {tab === "solucoes" && <TabSolucoes />}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 3px; font-size: 12px; font-family: 'Fira Code', monospace; }
      `}</style>
    </div>
  );
}

// ─── Análise automática da resposta da URL ───────────────────────
function UrlResponseAnalysis({ data }) {
  if (!data) return null;
  const str = typeof data === "object" ? JSON.stringify(data) : String(data);
  const temClassif = /classif|classification|tipoVeiculo|vehicleClass/i.test(str);
  const temFaixa = /faixa|lane|track/i.test(str);
  const temPassagem = /passag|passage|placa|plate/i.test(str);

  return (
    <div style={{
      marginTop: "10px", background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: "6px", padding: "10px 14px",
    }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: C.textSecondary, marginBottom: "8px" }}>
        🔎 Análise automática da resposta
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <AnalysisChip ok={temClassif} label="Campo classificação" />
        <AnalysisChip ok={temFaixa}   label="Campo faixa" />
        <AnalysisChip ok={temPassagem} label="Dados de passagem" />
      </div>
      {!temClassif && (
        <div style={{ marginTop: "8px", fontSize: "11px", color: C.warning }}>
          ⚠️ Nenhum campo de classificação encontrado na resposta — confirma IC-01 ou IC-02
        </div>
      )}
    </div>
  );
}

function AnalysisChip({ ok, label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600,
      background: ok ? C.successBg : C.dangerBg,
      color: ok ? C.success : C.danger,
      border: `1px solid ${ok ? C.success : C.danger}44`,
    }}>
      {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {label}
    </span>
  );
}

// ─── Tab: Resumo & Contexto ──────────────────────────────────────
function TabResumo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
      {/* Contexto do problema */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Eye size={15} color={C.accent} /> Contexto do Problema
        </div>
        <p style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.7, margin: "0 0 10px" }}>
          No mapa de equipamentos do AxCross, ao visualizar uma passagem por faixa, é exibido:
        </p>
        <div style={{
          background: "#1a1d2e", border: `2px solid ${C.danger}`,
          borderRadius: "6px", padding: "10px 14px", fontFamily: "monospace",
          fontSize: "12px", color: "#e2e8f0", lineHeight: 1.8,
        }}>
          <div>DATA PASSAGEM: <span style={{ color: "#a5d8ff" }}>12/07/2026 07:51:43</span></div>
          <div>CÓDIGO EQUIPAMENTO: <span style={{ color: "#a5d8ff" }}>GOEC6O003  MODELO: ITSCAM 450</span></div>
          <div>LOCAL: <span style={{ color: "#a5d8ff" }}>BR-060 Km 184 MUNICÍPIO: Guapó-GO  PLACA: OFU6A59</span></div>
          <div>
            SENTIDO: Guapó/Goiânia Faixa:{" "}
            <span style={{
              background: "rgba(251,113,133,0.25)", border: "1px solid #fb7185",
              padding: "0 5px", borderRadius: "3px", color: "#fb7185",
            }}>
              2 CLASSIFICACAO:
            </span>
            {" "}← <span style={{ color: "#fb7185" }}>VAZIO</span>
          </div>
        </div>
        <p style={{ fontSize: "11px", color: C.textMuted, marginTop: "8px", lineHeight: 1.6 }}>
          O campo <strong>CLASSIFICACAO</strong> (tipo/classe do veículo reconhecida pelo classificador embarcado do ITSCAM 450)
          está vazio/sem dados.
        </p>
      </div>

      {/* Fluxo de dados */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Layers size={15} color={C.accent} /> Fluxo de Dados (Esperado)
        </div>
        {[
          { step: "1", label: "ITSCAM 450", desc: "Capta veículo → classifica tipo (Carro, Moto, Caminhão…)", ok: true },
          { step: "2", label: "Transmissão", desc: "Envia metadata JSON com campo ClassificacaoVeiculo ao servidor AxCross", ok: null },
          { step: "3", label: "Banco TBPassagens", desc: "Salva passagem incluindo campo de classificação", ok: null },
          { step: "4", label: "API /passagens", desc: "Query SQL retorna ClassificacaoVeiculo na resposta JSON", ok: false },
          { step: "5", label: "Front-end mapa", desc: "Exibe CLASSIFICACAO: {valor} na infobox da faixa", ok: false },
        ].map(item => (
          <div key={item.step} style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            padding: "8px 0", borderBottom: `1px solid ${C.border}22`,
          }}>
            <span style={{
              minWidth: "22px", height: "22px", background: C.accentBg,
              border: `1px solid ${C.accent}44`, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: 700, color: C.accent,
            }}>{item.step}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{item.label}</div>
              <div style={{ fontSize: "11px", color: C.textSecondary }}>{item.desc}</div>
            </div>
            {item.ok === true && <CheckCircle2 size={14} color={C.success} style={{ marginTop: 4 }} />}
            {item.ok === false && <XCircle size={14} color={C.danger} style={{ marginTop: 4 }} />}
            {item.ok === null && <AlertTriangle size={14} color={C.warning} style={{ marginTop: 4 }} />}
          </div>
        ))}
      </div>

      {/* Equipamento envolvido */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Database size={15} color={C.accent} /> Equipamento & Sistema
        </div>
        {[
          ["Equipamento", "GOEC6O003 — ITSCAM 450 (Pumatronix)"],
          ["Local", "BR-060 Km 184, Guapó-GO"],
          ["Sistema", "AxCross — Monitoramento de Cruzamentos"],
          ["Modelo ITSCAM", "450 (possui classificador embarcado)"],
          ["URL afetada", "…/monitoringonline/monitoring/equipmentmap"],
          ["Campo ausente", "CLASSIFICACAO (tipo/classe do veículo)"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: "8px", padding: "5px 0", borderBottom: `1px solid ${C.border}22`, fontSize: "12px" }}>
            <span style={{ color: C.textMuted, minWidth: 110 }}>{k}:</span>
            <span style={{ color: C.text, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Causa mais provável */}
      <div style={{ background: "rgba(251,113,133,0.06)", border: `1px solid rgba(251,113,133,0.3)`, borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px", color: C.danger, display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={15} /> Causa Mais Provável
        </div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>
          IC-02: A query SQL do endpoint <code>/api/axcross/passagens</code> não seleciona o campo de classificação
        </div>
        <p style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.7, margin: "0 0 10px" }}>
          A query atual em <code>axcross-controller.js → statsPassagens</code> retorna apenas:
          <br /><code>Id, Placa, DataPassagem, Velocidade, Local, Faixa</code>
          <br />O campo <code>ClassificacaoVeiculo</code> (ou equivalente) não está sendo selecionado,
          portanto o front-end recebe null e exibe o campo vazio.
        </p>
        <div style={{ fontSize: "12px", color: C.textMuted }}>
          Execute a aba <strong>Análise do Banco</strong> para confirmar se o campo existe no banco.
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Banco ──────────────────────────────────────────────────
function TabBanco({ dbResult, dbError, dbLoading, fetchDb }) {
  if (dbLoading) return (
    <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>
      <RefreshCw size={24} className="spin" style={{ margin: "0 auto 10px", display: "block" }} />
      Consultando banco AxCross...
    </div>
  );
  if (!dbResult && !dbError) return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <Database size={36} color={C.textMuted} style={{ display: "block", margin: "0 auto 12px" }} />
      <div style={{ color: C.textMuted, fontSize: "13px", marginBottom: "16px" }}>
        Clique para consultar o banco AxCross e verificar a estrutura da tabela TBPassagens
      </div>
      <button
        onClick={fetchDb}
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", background: C.accentBg, border: `1px solid ${C.accent}`,
          borderRadius: "6px", color: C.accent, cursor: "pointer", fontWeight: 600, fontSize: "13px",
        }}
      >
        <Play size={15} /> Iniciar Diagnóstico do Banco
      </button>
    </div>
  );
  if (dbError) return (
    <div style={{ padding: "16px", background: C.dangerBg, border: `1px solid ${C.danger}44`, borderRadius: "8px", color: C.danger, fontSize: "13px" }}>
      ❌ Erro ao consultar banco: {dbError}
      <br /><span style={{ fontSize: "11px", color: C.textMuted }}>Verifique se a API está rodando e se as credenciais do AxCross estão configuradas no .env</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Banner de resultado */}
      <div style={{
        background: dbResult.tem_classificacao ? C.successBg : C.dangerBg,
        border: `1px solid ${dbResult.tem_classificacao ? C.success : C.danger}44`,
        borderRadius: "8px", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        {dbResult.tem_classificacao
          ? <CheckCircle2 size={22} color={C.success} />
          : <XCircle size={22} color={C.danger} />}
        <div>
          <div style={{ fontWeight: 700, fontSize: "14px", color: dbResult.tem_classificacao ? C.success : C.danger }}>
            {dbResult.tem_classificacao
              ? "✅ Campo de classificação EXISTE na tabela TBPassagens"
              : "❌ Campo de classificação NÃO EXISTE em TBPassagens"}
          </div>
          <div style={{ fontSize: "12px", color: C.textSecondary, marginTop: "3px" }}>
            {dbResult.query_atual_passagens?.problema_identificado}
          </div>
        </div>
      </div>

      {/* Colunas encontradas de classificação */}
      {dbResult.colunas_classificacao?.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
          <div style={{ fontWeight: 600, fontSize: "12px", color: C.success, marginBottom: "8px" }}>
            ✅ Colunas de classificação encontradas em TBPassagens:
          </div>
          <ColunasTable colunas={dbResult.colunas_classificacao} />
        </div>
      )}

      {/* Stats de nulos */}
      {dbResult.stats_classificacao && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
          <div style={{ fontWeight: 600, fontSize: "12px", color: C.textSecondary, marginBottom: "10px" }}>
            📊 Preenchimento do campo classificação em TBPassagens
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
            <StatCard label="Total registros" value={dbResult.stats_classificacao.total?.toLocaleString("pt-BR")} color={C.accent} icon={<Database size={14} />} />
            <StatCard label="Com classificação" value={dbResult.stats_classificacao.preenchidos?.toLocaleString("pt-BR")} color={C.success} icon={<CheckCircle2 size={14} />}
              sub={`${Math.round((dbResult.stats_classificacao.preenchidos / dbResult.stats_classificacao.total) * 100)}%`}
            />
            <StatCard label="Sem classificação" value={dbResult.stats_classificacao.nulos?.toLocaleString("pt-BR")} color={C.danger} icon={<XCircle size={14} />}
              sub={`${Math.round((dbResult.stats_classificacao.nulos / dbResult.stats_classificacao.total) * 100)}%`}
            />
          </div>
        </div>
      )}

      {/* Tabelas relacionadas */}
      {dbResult.tabelas_classificacao?.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
          <div style={{ fontWeight: 600, fontSize: "12px", color: C.textSecondary, marginBottom: "8px" }}>
            📋 Tabelas relacionadas a tipo/classificação de veículos
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {dbResult.tabelas_classificacao.map(t => (
              <span key={t.TABLE_NAME} style={{
                padding: "4px 10px", background: C.accentBg,
                border: `1px solid ${C.accent}44`, borderRadius: "4px",
                fontSize: "12px", color: C.accent,
              }}>{t.TABLE_NAME}</span>
            ))}
          </div>
        </div>
      )}

      {/* Colunas completas de TBPassagens */}
      {dbResult.colunas_tbpassagens && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
          <div style={{ fontWeight: 600, fontSize: "12px", color: C.textSecondary, marginBottom: "8px" }}>
            🗂 Estrutura completa de TBPassagens ({dbResult.colunas_tbpassagens.length} colunas)
            <span style={{ fontSize: "10px", color: C.accent, marginLeft: "8px" }}>★ = campo de classificação</span>
          </div>
          <ColunasTable colunas={dbResult.colunas_tbpassagens} />
        </div>
      )}

      {/* Amostra de passagens */}
      {dbResult.amostra_passagens && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px", overflowX: "auto" }}>
          <div style={{ fontWeight: 600, fontSize: "12px", color: C.textSecondary, marginBottom: "8px" }}>
            🔬 Amostra de passagens recentes (com classificação)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ background: C.tableHeader }}>
                {["ID", "Placa", "Data", "Faixa", "Local", "Classificação"].map(h => (
                  <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dbResult.amostra_passagens.map((p, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.raised, borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "5px 10px", color: C.textMuted }}>{p.Id}</td>
                  <td style={{ padding: "5px 10px", fontWeight: 600 }}>{p.Placa}</td>
                  <td style={{ padding: "5px 10px", color: C.textSecondary }}>{p.DataPassagem ? new Date(p.DataPassagem).toLocaleString("pt-BR") : "—"}</td>
                  <td style={{ padding: "5px 10px" }}>{p.Faixa || "—"}</td>
                  <td style={{ padding: "5px 10px", color: C.textSecondary }}>{p.Local || "—"}</td>
                  <td style={{ padding: "5px 10px" }}>
                    {p.ClassificacaoVeiculo
                      ? <span style={{ background: C.successBg, color: C.success, padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>{p.ClassificacaoVeiculo}</span>
                      : <span style={{ color: C.danger, fontSize: "11px" }}>⚠ nulo</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dbResult.campo_ausente && (
        <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}44`, borderRadius: "8px", padding: "14px", fontSize: "12px", color: C.danger }}>
          ⚠️ Nenhuma coluna com nome relacionado a "classif" encontrada em TBPassagens.
          Veja intercorrência <strong>IC-01</strong> para a solução.
        </div>
      )}
    </div>
  );
}

// ─── Tab: Soluções Rápidas ───────────────────────────────────────
function TabSolucoes() {
  const solucoes = [
    {
      cenario: "A — Campo existe no banco, só falta na query (IC-02)",
      prioridade: "RECOMENDADO",
      passos: [
        "Abrir axion-ia-panel/api/src/axcross-controller.js",
        "Localizar a função statsPassagens (linha ~37)",
        "Adicionar p.ClassificacaoVeiculo (ou nome real) ao SELECT",
        "Reiniciar a API (cd axion-ia-panel/api && node --env-file=.env src/app.js)",
        "Testar: GET http://localhost:3100/api/axcross/passagens",
      ],
      sql: `-- Correção: adicionar classificação na query de passagens
SELECT TOP 10
  p.Id,
  p.Placa,
  p.DataPassagem,
  p.Velocidade,
  p.ClassificacaoVeiculo,   -- ← LINHA ADICIONADA
  l.Nome AS Local,
  f.Nome AS Faixa
FROM TBPassagens p
LEFT JOIN TBLocais l ON p.LocalId = l.Id
LEFT JOIN TBFaixas f ON p.FaixaId = f.Id
ORDER BY p.DataPassagem DESC;`,
      color: C.success,
    },
    {
      cenario: "B — Campo não existe no banco (IC-01)",
      prioridade: "ESTRUTURAL",
      passos: [
        "Executar ALTER TABLE no banco AxCross (SQL abaixo)",
        "Verificar se o receptor/integrador AxCross envia o campo do ITSCAM",
        "Consultar documentação da API do ITSCAM 450 — campo classifier/vehicleType",
        "Configurar o receptor para persistir o valor recebido",
        "Após persistência, aplicar correção do Cenário A",
      ],
      sql: `-- Criar coluna ClassificacaoVeiculo em TBPassagens
ALTER TABLE TBPassagens
  ADD ClassificacaoVeiculo VARCHAR(50) NULL;

-- Confirmar criação
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TBPassagens'
  AND COLUMN_NAME = 'ClassificacaoVeiculo';`,
      color: C.warning,
    },
    {
      cenario: "C — Classificador ITSCAM desabilitado (IC-03)",
      prioridade: "CONFIGURAÇÃO",
      passos: [
        "Abrir VARCO Monitor → Inventário → buscar GOEC6O003",
        "Verificar parâmetro Classificador.enabled = true",
        "Se false: acessar interface do equipamento via túnel VARCO",
        "Habilitar em: Equipamento › Reconhecimento › aba Classifier",
        "Salvar e aguardar próximas capturas",
      ],
      sql: `-- Verificar no banco quando foi a última passagem com classificação
SELECT TOP 5
  p.DataPassagem,
  p.Placa,
  p.ClassificacaoVeiculo
FROM TBPassagens p
WHERE p.ClassificacaoVeiculo IS NOT NULL
ORDER BY p.DataPassagem DESC;`,
      color: C.accent,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "4px" }}>
        Aplique os cenários na ordem: primeiro identifique a causa via <strong>Análise do Banco</strong>, depois escolha o cenário adequado.
      </div>
      {solucoes.map((s, i) => (
        <div key={i} style={{
          background: C.surface, border: `1px solid ${s.color}44`,
          borderRadius: "8px", overflow: "hidden",
        }}>
          <div style={{
            background: `${s.color}0d`, borderBottom: `1px solid ${s.color}33`,
            padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{
              background: s.color, color: "#000", fontSize: "10px", fontWeight: 800,
              padding: "2px 8px", borderRadius: "3px", letterSpacing: "0.5px",
            }}>{s.prioridade}</span>
            <span style={{ fontWeight: 700, fontSize: "13px", color: C.text }}>{s.cenario}</span>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.textSecondary, marginBottom: "8px" }}>Passos:</div>
            <ol style={{ margin: "0 0 12px", paddingLeft: "18px", fontSize: "12px", color: C.textSecondary, lineHeight: 1.9 }}>
              {s.passos.map((p, j) => <li key={j}>{p}</li>)}
            </ol>
            {s.sql && <SqlBlock sql={s.sql} />}
          </div>
        </div>
      ))}

      {/* Link para VARCO Monitor */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: "8px", padding: "14px 16px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <Wrench size={18} color={C.accent} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "3px" }}>Verificar configuração do ITSCAM no VARCO Monitor</div>
          <div style={{ fontSize: "12px", color: C.textMuted }}>
            Confirme que o equipamento GOEC6O003 tem o classificador habilitado
          </div>
        </div>
        <a
          href="/varco-monitor"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", background: C.accentBg, border: `1px solid ${C.accent}`,
            borderRadius: "6px", color: C.accent, textDecoration: "none", fontSize: "12px", fontWeight: 600,
          }}
        >
          <ExternalLink size={13} /> VARCO Monitor
        </a>
      </div>
    </div>
  );
}
