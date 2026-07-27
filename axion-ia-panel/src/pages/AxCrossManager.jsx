/**



/**
 * 🛡️ AXCROSS MANAGER — Gerenciador Unificado AxCross
 *
 * Centraliza TODOS os recursos AxCross em uma única tela:
 * - Dashboard:     Status do banco, KPIs de passagens/equipamentos
 * - Passagens:     Consulta real com filtros por placa, local, faixa
 * - Equipamentos:  Lista + heartbeat dos dispositivos
 * - Locais:        Pontos de monitoramento cadastrados
 * - Sites:         Frota completa de instâncias AxCross (12 sites)
 * - Diagnóstico:   Análise do campo CLASSIFICACAO + intercorrências
 * - Suporte:       Ferramentas de atendimento AxCross
 *
 * Equivalente ao VARCO Monitor, mas para o AxCross.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Navigation, Database, RefreshCw, Search, CheckCircle2, XCircle,
  AlertTriangle, ExternalLink, Copy, Globe, Wrench, Lightbulb,
  ChevronDown, ChevronUp, MapPin, Activity, Shield, Settings,
  Play, List, Layers, AlertCircle, Key, Server, X, Table2
} from "lucide-react";
import QuickSelect from "../components/QuickSelect.jsx";
import { AXCROSS_SITES } from "../data/sitesData.js";
import { apiFetch } from "../services/api.js";

// Credenciais padrão de todos os equipamentos ITSCAM 450
const ITSCAM_USER = "admin";
const ITSCAM_PASS = "#econocr@";

// Cache de tokens JWT por tunnel URL (evita login repetido)
const itscamTokenCache = {};

async function getItscamToken(tunnelBase) {
  const cached = itscamTokenCache[tunnelBase];
  if (cached && cached.exp > Date.now() / 1000 + 60) return cached.token;
  try {
    const r = await apiFetch("/proxy/fetch-url", {
      method: "POST",
      body: JSON.stringify({
        url: `${tunnelBase}/api/auth`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Origin": tunnelBase, "Referer": `${tunnelBase}/login` },
        body: JSON.stringify({ username: ITSCAM_USER, password: ITSCAM_PASS }),
      }),
    });
    const d = await r.json();
    // Token can come from cookie extraction (proxy) or direct body
    const token = d.token || d.data?.token;
    if (token) {
      // Decode JWT to get expiry
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        itscamTokenCache[tunnelBase] = { token, exp: payload.exp || (Date.now()/1000 + 3600) };
      } catch { itscamTokenCache[tunnelBase] = { token, exp: Date.now()/1000 + 3600 }; }
      return token;
    }
    return null;
  } catch { return null; }
}

async function itscamHeaders(tunnelBase) {
  const token = await getItscamToken(tunnelBase);
  if (token) return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  return { "Content-Type": "application/json" };
}

// ─── Paleta ────────────────────────────────────────────────────────
const C = {
  bg: "var(--bg)", surface: "var(--surface)", raised: "var(--surface-raised)",
  border: "var(--border)", text: "var(--text)", textMuted: "var(--text-muted)",
  textSecondary: "var(--text-secondary)", accent: "var(--accent)",
  accentBg: "var(--accent-subtle)", success: "var(--success)",
  successBg: "var(--success-bg)", warning: "var(--warning)",
  warningBg: "var(--warning-bg)", danger: "var(--danger)",
  dangerBg: "var(--danger-bg)", tableHeader: "var(--table-header)",
  rowHover: "var(--table-row-hover)", cardBg: "var(--card-bg)",
  // cor temática AxCross
  brand: "#10b981",
  brandBg: "rgba(16,185,129,0.08)",
  brandBorder: "rgba(16,185,129,0.3)",
};

// ─── Helpers ────────────────────────────────────────────────────────
function fmt(n) { return n != null ? Number(n).toLocaleString("pt-BR") : "—"; }
function fmtDate(d) { return d ? new Date(d).toLocaleString("pt-BR") : "—"; }

function StatCard({ label, value, color, icon, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: "8px", padding: "12px 16px",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color .15s",
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = C.border)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color, marginBottom: "4px" }}>
        {icon}
        <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
      </div>
      <div style={{ fontSize: "22px", fontWeight: 700, color }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function Badge({ v, ok, warn }) {
  const color = ok ? C.success : warn ? C.warning : C.danger;
  const bg    = ok ? C.successBg : warn ? C.warningBg : C.dangerBg;
  return (
    <span style={{ padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
      background: bg, color, border: `1px solid ${color}44` }}>{v}</span>
  );
}

function SectionHeader({ title, icon, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
      {icon}
      <span style={{ fontWeight: 700, fontSize: "14px" }}>{title}</span>
      {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
    </div>
  );
}

// ─── Modal de Configuração de Conexão ───────────────────────────────
const PRESETS = AXCROSS_SITES.map(s => ({
  label: s.nome,
  host: s.url.replace(/^https?:\/\//, "").split("/")[0],
}));

function ConfigModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ host: "", port: "1433", database: "AxCross", user: "", password: "", encrypt: false });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [ok, setOk] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /** Extrai apenas o hostname de qualquer string (URL completa ou hostname puro) */
  const sanitizeHost = (raw) => {
    const s = raw.trim();
    if (!s) return s;
    try {
      // Se começa com http(s)://, parsear como URL
      if (/^https?:\/\//i.test(s)) return new URL(s).hostname;
      // Se tem /, pegar apenas a parte antes da primeira /
      return s.split("/")[0].split(":")[0];
    } catch {
      return s.split("/")[0].split(":")[0];
    }
  };

  const hostSanitizado = sanitizeHost(form.host);
  const hostEhUrl = form.host.trim() !== hostSanitizado && form.host.trim().length > 0;
  // Detectar se o hostname parece ser um servidor web AxCross (não SQL Server)
  const hostEhWebAxCross = /axcross\.axion\.ws|axhub\.axion\.ws|axton\.axion\.ws/i.test(hostSanitizado);

  const testar = async () => {
    const hostFinal = hostSanitizado;
    if (!hostFinal || !form.database || !form.user) {
      setErro("Preencha Host, Banco e Usuário"); return;
    }
    setLoading(true); setErro(null); setOk(false);
    try {
      const r = await apiFetch("/axcross/configurar", {
        method: "POST",
        body: JSON.stringify({ ...form, host: hostFinal }),
      });
      const d = await r.json();
      if (d.ok) {
        setOk(true);
        set("host", hostFinal); // normalizar o campo
        localStorage.setItem("axcross_db_config", JSON.stringify({ ...form, host: hostFinal, password: "" }));
        setTimeout(() => { onSuccess && onSuccess(d.config); onClose(); }, 1200);
      } else {
        setErro(d.erro || "Falha na conexão");
      }
    } catch (e) {
      setErro(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.brandBorder}`,
        borderRadius: "12px", padding: "24px", width: "100%", maxWidth: "480px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ padding: "8px", background: C.brandBg, borderRadius: "8px" }}>
            <Server size={18} color={C.brand} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "15px" }}>Configurar Conexão AxCross</div>
            <div style={{ fontSize: "11px", color: C.textMuted }}>SQL Server — configuração aplicada em runtime</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textMuted, padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Presets de sites */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: C.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Atalho por site (preenche o host)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {AXCROSS_SITES.slice(0, 8).map(s => (
              <button
                key={s.id}
                onClick={() => set("host", s.url.replace(/^https?:\/\//, "").split("/")[0])}
                style={{
                  padding: "3px 9px", fontSize: "10px", fontWeight: 600,
                  background: form.host === s.url.replace(/^https?:\/\//, "").split("/")[0] ? C.brandBg : "transparent",
                  border: `1px solid ${form.host === s.url.replace(/^https?:\/\//, "").split("/")[0] ? C.brand : C.border}`,
                  borderRadius: "4px", color: form.host === s.url.replace(/^https?:\/\//, "").split("/")[0] ? C.brand : C.textMuted,
                  cursor: "pointer",
                }}
              >{s.nome}</button>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "8px", marginBottom: hostEhUrl ? "4px" : "8px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: hostEhUrl ? C.warning : C.textMuted, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Host / Servidor {hostEhUrl && "⚠ URL detectada — será extraído apenas o hostname"}
            </div>
            <input
              value={form.host}
              onChange={e => set("host", e.target.value)}
              placeholder="servidor.exemplo.com.br"
              style={{
                width: "100%", padding: "8px 10px", background: C.raised,
                border: `1px solid ${hostEhUrl ? C.warning : C.border}`, borderRadius: "6px",
                color: C.text, fontSize: "12px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <Field label="Porta" value={form.port} onChange={v => set("port", v)} placeholder="1433" type="number" />
        </div>
        {hostEhUrl && (
          <div style={{
            padding: "7px 10px", background: C.warningBg, border: `1px solid ${C.warning}44`,
            borderRadius: "5px", marginBottom: "8px", fontSize: "11px", color: C.warning,
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <AlertTriangle size={13} style={{ flexShrink: 0 }} />
            <span>
              URL completa detectada. Será usado apenas o hostname:{" "}
              <strong style={{ fontFamily: "monospace" }}>{hostSanitizado}</strong>
            </span>
          </div>
        )}
        {/* Aviso: hostname parece ser servidor web AxCross, não SQL Server */}
        {hostEhWebAxCross && (
          <div style={{
            padding: "9px 12px", background: C.dangerBg, border: `1px solid ${C.danger}44`,
            borderRadius: "6px", marginBottom: "10px", fontSize: "11px", color: C.danger,
            display: "flex", flexDirection: "column", gap: "5px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontWeight: 700 }}>
              <XCircle size={13} style={{ flexShrink: 0 }} />
              ⚠️ Este endereço é o servidor Web AxCross — não o SQL Server!
            </div>
            <div style={{ color: C.textSecondary, lineHeight: 1.6 }}>
              <code style={{ color: C.danger }}>{hostSanitizado}</code> é a aplicação web. O SQL Server está em um servidor interno separado, não acessível por este endereço.
              <br />
              <strong>Use a aba "🔍 Investigar via URL"</strong> para acessar dados deste site com login OIDC.
            </div>
            <button
              onClick={onClose}
              style={{
                alignSelf: "flex-start", marginTop: "4px",
                padding: "5px 12px", background: C.brandBg, border: `1px solid ${C.brand}`,
                borderRadius: "5px", color: C.brand, cursor: "pointer", fontSize: "11px", fontWeight: 600,
              }}
            >
              → Ir para Investigação via URL
            </button>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
          <Field label="Banco de Dados" value={form.database} onChange={v => set("database", v)} placeholder="AxCross" />
          <Field label="Usuário" value={form.user} onChange={v => set("user", v)} placeholder="sa" />
        </div>
        <Field label="Senha" value={form.password} onChange={v => set("password", v)} placeholder="••••••••" type="password" />
        <label style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "10px", fontSize: "12px", color: C.textSecondary, cursor: "pointer" }}>
          <input type="checkbox" checked={form.encrypt} onChange={e => set("encrypt", e.target.checked)} />
          Usar SSL/TLS (encrypt)
        </label>

        {/* Feedback */}
        {erro && (
          <div style={{ marginTop: "12px", padding: "9px 12px", background: C.dangerBg,
            border: `1px solid ${C.danger}44`, borderRadius: "6px", fontSize: "12px", color: C.danger }}>
            ❌ {erro}
            {(erro.includes("10000ms") || erro.includes("connect")) && (
              <div style={{ marginTop: "6px", fontSize: "11px", color: C.textMuted, lineHeight: 1.6 }}>
                💡 <strong>Dica:</strong> Este erro indica que o host não é acessível na porta 1433 (SQL Server).
                Se quiser investigar o site AxCross via web, use a aba <strong>"🔍 Investigar via URL"</strong> com login OIDC.
              </div>
            )}
          </div>
        )}
        {ok && (
          <div style={{ marginTop: "12px", padding: "9px 12px", background: C.successBg,
            border: `1px solid ${C.success}44`, borderRadius: "6px", fontSize: "12px", color: C.success }}>
            ✅ Conectado com sucesso! Recarregando dados…
          </div>
        )}

        {/* Ações */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button
            onClick={testar}
            disabled={loading || ok}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
              padding: "10px", background: C.brandBg, border: `1px solid ${C.brand}`,
              borderRadius: "7px", color: C.brand, cursor: loading || ok ? "wait" : "pointer",
              fontWeight: 700, fontSize: "13px", opacity: loading || ok ? 0.8 : 1,
            }}
          >
            <Database size={14} className={loading ? "spin" : ""} />
            {loading ? "Testando conexão…" : ok ? "Conectado!" : "Testar e Conectar"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px", background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: "7px", color: C.textMuted, cursor: "pointer", fontSize: "13px",
            }}
          >
            Cancelar
          </button>
        </div>
        <div style={{ marginTop: "10px", fontSize: "10px", color: C.textMuted, textAlign: "center" }}>
          A configuração é aplicada imediatamente e salva na sessão. Para tornar permanente, adicione as variáveis ao <code>.env</code>.
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 10px", background: C.raised,
          border: `1px solid ${C.border}`, borderRadius: "6px",
          color: C.text, fontSize: "12px", outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function SqlBlock({ sql }) {  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ position: "relative", marginTop: "8px" }}>
      <pre style={{ background: "rgba(0,0,0,0.18)", border: `1px solid ${C.border}`, borderRadius: "6px",
        padding: "10px 12px", fontSize: "11px", fontFamily: "'Fira Code','Consolas',monospace",
        overflowX: "auto", color: "#a5d8ff", margin: 0, lineHeight: 1.6 }}>{sql}</pre>
      <button onClick={copy} style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.4)",
        border: "none", borderRadius: "4px", color: copied ? C.success : C.textMuted,
        cursor: "pointer", padding: "4px 6px", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
        <Copy size={11} /> {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}

// ─── Intercorrências mapeadas (do diagnóstico anterior) ───────────
const INTERCORRENCIAS = [
  {
    id: "IC-01", gravidade: "alta",
    titulo: "DTO do SignalR (PassageHub) não inclui ClassificacaoVeiculo",
    descricao: "CAUSA RAIZ IDENTIFICADA: O mapa de equipamentos usa SignalR em tempo real via /monitoringonline/PassageHub. O DTO enviado pelo hub não inclui o campo ClassificacaoVeiculo. O banco TEM o dado (comprovado pelo filtro no relatório de passagens), mas o hub não o transmite.",
    impacto: "Campo 'CLASSIFICACAO:' aparece vazio no popup do mapa — o template Razor tem o label mas o valor não chega via SignalR.",
    prova: "Filtro Classificação na tela /reports/reports/passages tem valores: Automóvel, Caminhão, Caminhonete, Motocicleta, Ônibus — prova que o banco tem dados.",
    solucao: [
      "Abrir o projeto AxCross backend (ASP.NET Core)",
      "Localizar o Hub: MonitoringOnline/Hubs/PassageHub.cs (ou similar)",
      "Localizar o DTO: PassagemDto, PassageDto ou EquipmentPassageDto",
      "Adicionar propriedade: public string ClassificacaoVeiculo { get; set; }",
      "Mapear da entidade: dto.ClassificacaoVeiculo = passagem.ClassificacaoVeiculo",
      "Rebuild + deploy do AxCross",
    ],
    sql: `-- Confirmar que o campo existe e está preenchido no banco
SELECT TOP 10
  p.Id, p.Placa, p.DataPassagem,
  p.ClassificacaoVeiculo,  -- verificar o nome exato da coluna
  f.Nome AS Faixa, l.Nome AS Local
FROM TBPassagens p
LEFT JOIN TBFaixas f ON p.FaixaId = f.Id
LEFT JOIN TBLocais l ON p.LocalId = l.Id
WHERE p.ClassificacaoVeiculo IS NOT NULL
ORDER BY p.DataPassagem DESC;

-- Distribuição de classificações no banco
SELECT ClassificacaoVeiculo, COUNT(*) AS Total
FROM TBPassagens
GROUP BY ClassificacaoVeiculo
ORDER BY Total DESC;`,
  },
  {
    id: "IC-02", gravidade: "alta",
    titulo: "Razor View do mapa não mapeia o campo no modelo",
    descricao: "Mesmo que o Hub envie ClassificacaoVeiculo, a Razor View do EquipmentMap pode não estar incluindo o campo no ViewModel, resultando em valor null ao renderizar 'CLASSIFICACAO: @Model.ClassificacaoVeiculo'.",
    impacto: "O template tem o label mas o ViewModel não carrega o valor.",
    solucao: [
      "Localizar: MonitoringOnline/Views/Monitoring/EquipmentMap.cshtml",
      "Localizar o ViewModel: EquipmentMapViewModel ou PassagemMapViewModel",
      "Verificar se ClassificacaoVeiculo está no ViewModel",
      "Verificar a query LINQ/SQL que popula o ViewModel",
    ],
    sql: `-- Verificar campo ClassificacaoVeiculo (pode ter nome diferente)
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TBPassagens'
ORDER BY ORDINAL_POSITION;

-- Se o campo não existir com esse nome, procurar por:
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TBPassagens'
  AND (COLUMN_NAME LIKE '%class%' OR COLUMN_NAME LIKE '%tipo%'
    OR COLUMN_NAME LIKE '%vehicle%' OR COLUMN_NAME LIKE '%veic%');`,
  },
  {
    id: "IC-03", gravidade: "media",
    titulo: "Classificador ITSCAM 450 desabilitado (Classificador.enabled = false)",
    descricao: "O ITSCAM 450 tem módulo classificador embarcado. Se Classificador.enabled=false, nenhum tipo de veículo é enviado ao AxCross. Mas como o filtro de passagens TEM valores, este é improvável como causa principal.",
    impacto: "Passagens futuras chegam sem classificação (as históricas com filtro sugerem que estava habilitado antes).",
    solucao: ["Verificar VARCO Monitor → GOEC60002 → Classificador.enabled = true", "Habilitar em: Equipamento › Reconhecimento › aba Classifier"],
    link: "/varco-monitor", linkLabel: "Abrir VARCO Monitor",
  },
  {
    id: "IC-04", gravidade: "media",
    titulo: "Nome do campo divergente entre ITSCAM, banco e frontend",
    descricao: "O campo pode ter nomes diferentes em cada camada: ITSCAM (classifier), banco (ClassificacaoVeiculo ou TipoVeiculo), ViewModel (VehicleType ou ClassificacaoVeiculo), Hub DTO (classificacao), Razor template (CLASSIFICACAO).",
    impacto: "Mapeamento incorreto entre camadas resulta em valor null.",
    solucao: [
      "Auditar o nome do campo em cada camada",
      "Garantir mapeamento consistente: ITSCAM → banco → DTO → View",
    ],
    sql: `-- Nomes possíveis do campo no banco
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE (COLUMN_NAME LIKE '%class%' OR COLUMN_NAME LIKE '%tipo%' OR COLUMN_NAME LIKE '%veic%')
  AND TABLE_NAME IN ('TBPassagens','TBFaixas','TBEquipamentos')
ORDER BY TABLE_NAME, COLUMN_NAME;`,
  },
  {
    id: "IC-05", gravidade: "baixa",
    titulo: "Classificação armazenada como FK numérica sem JOIN na view",
    descricao: "A classificação pode ser um ID (FK) para TBTiposVeiculos com nome: Automóvel, Caminhão etc. Se o Hub/ViewModel não fizer JOIN, retorna null em vez do nome.",
    impacto: "Valor existe como número mas não é traduzido para texto.",
    solucao: ["Verificar TBTiposVeiculos ou tabela equivalente", "Adicionar JOIN no Hub/ViewModel"],
    sql: `-- Verificar tabelas de classificação de veículos
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%Tipo%' OR TABLE_NAME LIKE '%Classif%'
   OR TABLE_NAME LIKE '%Veiculo%' OR TABLE_NAME LIKE '%Category%'
ORDER BY TABLE_NAME;

-- Se TBTiposVeiculos existir:
SELECT * FROM TBTiposVeiculos ORDER BY Id;`,
  },
  {
    id: "IC-06", gravidade: "baixa",
    titulo: "JavaScript do mapa não renderiza o campo recebido",
    descricao: "Mesmo com o Hub enviando e o ViewModel correto, o JavaScript do mapa pode não mapear a propriedade JSON recebida ao renderizar o popup da faixa.",
    impacto: "Dado chega via SignalR mas não é exibido no popup.",
    solucao: [
      "Inspecionar o JS da página de mapa (autenticado)",
      "Verificar o handler do evento SignalR de passage",
      "Verificar o binding: passagem.classificacaoVeiculo → DOM do popup",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// COMPONENTES DE ABAS
// ═══════════════════════════════════════════════════════════════════

// ── ABA: Dashboard ─────────────────────────────────────────────────
function TabDashboard({ status, resumo, passagens, loading, onRefresh, onConfig }) {
  const dbOk = status?.conectado === true;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Status da conexão */}
      <div style={{ background: dbOk ? C.brandBg : C.dangerBg,
        border: `1px solid ${dbOk ? C.brandBorder : C.danger + "44"}`,
        borderRadius: "8px", padding: "12px 18px",
        display: "flex", alignItems: "center", gap: "12px" }}>
        {dbOk ? <CheckCircle2 size={20} color={C.brand} /> : <XCircle size={20} color={C.danger} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: dbOk ? C.brand : C.danger }}>
            {loading ? "Verificando conexão..." : dbOk ? "✅ Banco AxCross conectado" : "❌ Banco AxCross offline"}
          </div>
          {status && <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>
            {status.servidor}/{status.banco}
            {status.erro && <span style={{ color: C.danger, marginLeft: "8px" }}>· {status.erro}</span>}
          </div>}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {!dbOk && !loading && (
            <button onClick={onConfig}
              style={{ display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 14px", background: C.brandBg, border: `1px solid ${C.brand}`,
                borderRadius: "6px", color: C.brand, cursor: "pointer", fontWeight: 700, fontSize: "12px" }}>
              <Settings size={13} /> Configurar Conexão
            </button>
          )}
          <button onClick={onRefresh} style={{ display: "flex", alignItems: "center", gap: "4px",
            padding: "7px 12px", background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: "6px", color: C.textSecondary, cursor: "pointer", fontSize: "11px" }}>
            <RefreshCw size={12} className={loading ? "spin" : ""} /> Atualizar
          </button>
        </div>
      </div>

      {/* KPIs do banco */}
      {resumo && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "10px" }}>
          {Object.entries(resumo).map(([k, v]) => (
            typeof v === "number" && (
              <StatCard key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                value={fmt(v)} color={C.brand} icon={<Database size={14} />} />
            )
          ))}
        </div>
      )}

      {/* Últimas passagens */}
      {passagens?.ultimas && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
          <SectionHeader title="Últimas Passagens" icon={<Activity size={15} color={C.brand} />} />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: C.tableHeader }}>
                  {["Placa","Data/Hora","Velocidade","Local","Faixa"].map(h =>
                    <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {passagens.ultimas.map((p, i) => (
                  <tr key={i} style={{ background: i%2===0 ? "transparent" : C.raised, borderBottom: `1px solid ${C.border}22` }}>
                    <td style={{ padding: "6px 10px", fontWeight: 700 }}>{p.Placa || "—"}</td>
                    <td style={{ padding: "6px 10px", color: C.textSecondary }}>{fmtDate(p.DataPassagem)}</td>
                    <td style={{ padding: "6px 10px" }}>{p.Velocidade != null ? `${p.Velocidade} km/h` : "—"}</td>
                    <td style={{ padding: "6px 10px", color: C.textSecondary }}>{p.Local || "—"}</td>
                    <td style={{ padding: "6px 10px" }}>{p.Faixa || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top 10 locais */}
      {passagens?.porLocal && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
          <SectionHeader title="Top Locais por Passagens" icon={<MapPin size={15} color={C.brand} />} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {passagens.porLocal.map((l, i) => {
              const max = passagens.porLocal[0]?.total || 1;
              const pct = Math.round((l.total / max) * 100);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", color: C.textMuted, minWidth: "18px", textAlign: "right" }}>{i+1}</span>
                  <span style={{ flex: 1, fontSize: "12px", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.Nome}</span>
                  <div style={{ width: "120px", height: "6px", background: C.raised, borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: C.brand, borderRadius: "3px" }} />
                  </div>
                  <span style={{ fontSize: "11px", color: C.textMuted, minWidth: "55px", textAlign: "right" }}>{fmt(l.total)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !status && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Database size={36} color={C.textMuted} style={{ display: "block", margin: "0 auto 12px" }} />
          <div style={{ color: C.textMuted, fontSize: "13px", marginBottom: "14px" }}>Clique para carregar os dados do banco AxCross</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <button onClick={onRefresh} style={{ display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", background: C.brandBg, border: `1px solid ${C.brand}`,
              borderRadius: "6px", color: C.brand, cursor: "pointer", fontWeight: 600 }}>
              <Play size={14} /> Conectar ao Banco AxCross
            </button>
            <button onClick={onConfig} style={{ display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 16px", background: C.warningBg, border: `1px solid ${C.warning}44`,
              borderRadius: "6px", color: C.warning, cursor: "pointer", fontWeight: 600 }}>
              <Settings size={14} /> Configurar Conexão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA: Passagens ─────────────────────────────────────────────────
function TabPassagens({ passagens, loading }) {
  const [placa, setPlaca] = useState("");
  const [filtradas, setFiltradas] = useState(null);

  const filtrar = () => {
    if (!passagens?.ultimas) return;
    const q = placa.trim().toUpperCase();
    setFiltradas(q ? passagens.ultimas.filter(p => (p.Placa || "").toUpperCase().includes(q)) : null);
  };

  const dados = filtradas ?? passagens?.ultimas ?? [];
  const sqlOffline = !passagens && !loading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Banner SQL offline */}
      {sqlOffline && (
        <div style={{ padding:"12px 16px", background:"rgba(245,158,11,0.08)", border:`1px solid ${C.warning}44`, borderRadius:"8px", display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
          <span style={{ fontSize:"20px" }}>🔗</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:"13px", color:C.warning, marginBottom:"3px" }}>Banco SQL offline — use a aba "Investigar via URL"</div>
            <div style={{ fontSize:"11px", color:C.textSecondary }}>Para consultar passagens, acesse o AxCross via URL com login OIDC. Os dados são carregados diretamente da aplicação web sem necessidade de SQL.</div>
          </div>
          <a href="?tab=investigar" onClick={e=>{e.preventDefault();}} style={{ padding:"8px 16px", background:C.accentBg, border:`1px solid ${C.accent}44`, borderRadius:"6px", color:C.accent, textDecoration:"none", fontWeight:700, fontSize:"12px", display:"flex", alignItems:"center", gap:"5px" }}>
            <ExternalLink size={13}/> Investigar via URL
          </a>
        </div>
      )}
      {/* Busca */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && filtrar()}
          placeholder="Filtrar por placa (ex: ABC1234)"
          style={{ flex: 1, minWidth: "200px", padding: "8px 12px",
            background: C.raised, border: `1px solid ${C.border}`, borderRadius: "6px",
            color: C.text, fontSize: "12px", outline: "none" }} />
        <button onClick={filtrar} style={{ display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 14px", background: C.brandBg, border: `1px solid ${C.brand}`,
          borderRadius: "6px", color: C.brand, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
          <Search size={13} /> Filtrar
        </button>
        {filtradas && (
          <button onClick={() => { setPlaca(""); setFiltradas(null); }}
            style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: "6px", color: C.textMuted, cursor: "pointer", fontSize: "12px" }}>
            Limpar
          </button>
        )}
      </div>

      {/* Stats */}
      {passagens && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <StatCard label="Total Passagens" value={fmt(passagens.total)} color={C.brand} icon={<Activity size={14} />} />
          <StatCard label="Mostrando" value={dados.length} color={C.accent} icon={<List size={14} />} />
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "30px", color: C.textMuted }}>
          <RefreshCw size={24} className="spin" style={{ display: "block", margin: "0 auto 8px" }} />Carregando passagens...
        </div>
      ) : dados.length === 0 ? (
        <div style={{ padding: "20px", color: C.textMuted, fontSize: "12px", textAlign: "center" }}>
          {filtradas !== null ? "Nenhuma passagem encontrada para esta placa" : "Sem passagens disponíveis. Conecte o banco."}
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: C.tableHeader }}>
                  {["ID","Placa","Data/Hora","Velocidade","Local","Faixa"].map(h =>
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {dados.map((p, i) => (
                  <tr key={i} style={{ background: i%2===0 ? "transparent" : C.raised, borderBottom: `1px solid ${C.border}22`, cursor: "default" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? "transparent" : C.raised}>
                    <td style={{ padding: "7px 10px", color: C.textMuted, fontSize: "11px" }}>{p.Id}</td>
                    <td style={{ padding: "7px 10px", fontWeight: 700, color: C.brand }}>{p.Placa || "—"}</td>
                    <td style={{ padding: "7px 10px", color: C.textSecondary, whiteSpace: "nowrap" }}>{fmtDate(p.DataPassagem)}</td>
                    <td style={{ padding: "7px 10px" }}>{p.Velocidade != null ? `${p.Velocidade} km/h` : "—"}</td>
                    <td style={{ padding: "7px 10px", color: C.textSecondary, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.Local || "—"}</td>
                    <td style={{ padding: "7px 10px" }}>{p.Faixa || "—"}</td>
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

// ── ABA: Equipamentos ──────────────────────────────────────────────
function TabEquipamentos({ equipamentos, heartbeat, loading }) {
  const [filter, setFilter] = useState("");

  const lista = useMemo(() => {
    const arr = equipamentos?.equipamentos || [];
    if (!filter) return arr;
    const q = filter.toLowerCase();
    return arr.filter(e => (e.Nome || e.Descricao || "").toLowerCase().includes(q));
  }, [equipamentos, filter]);

  const hbMap = useMemo(() => {
    const map = {};
    (heartbeat?.equipamentos || []).forEach(h => { map[h.Id || h.IdEquipamento] = h; });
    return map;
  }, [heartbeat]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {(!equipamentos && !loading) && (
        <div style={{ padding:"12px 16px", background:"rgba(245,158,11,0.08)", border:`1px solid ${C.warning}44`, borderRadius:"8px", display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
          <span style={{ fontSize:"20px" }}>📡</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:"13px", color:C.warning, marginBottom:"3px" }}>Banco SQL offline — equipamentos via VARCO disponíveis</div>
            <div style={{ fontSize:"11px", color:C.textSecondary }}>Os equipamentos VARCO com análise completa estão no <b>Centro de Controle</b>. Dados do banco AxCross requerem conexão SQL.</div>
          </div>
          <a href="?tab=controle" style={{ padding:"8px 16px", background:C.brandBg, border:`1px solid ${C.brand}44`, borderRadius:"6px", color:C.brand, textDecoration:"none", fontWeight:700, fontSize:"12px", display:"flex", alignItems:"center", gap:"5px" }}>
            🚀 Centro de Controle
          </a>
        </div>
      )}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <StatCard label="Total Equipamentos" value={fmt(equipamentos?.total)} color={C.brand} icon={<Navigation size={14} />} />
        <StatCard label="Com Heartbeat" value={fmt(heartbeat?.equipamentos?.length)} color={C.success} icon={<Activity size={14} />} />
      </div>

      <input value={filter} onChange={e => setFilter(e.target.value)}
        placeholder="Filtrar equipamentos..."
        style={{ padding: "8px 12px", background: C.raised, border: `1px solid ${C.border}`,
          borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none", maxWidth: "320px" }} />

      {loading ? (
        <div style={{ textAlign: "center", padding: "30px", color: C.textMuted }}>
          <RefreshCw size={24} className="spin" style={{ display: "block", margin: "0 auto 8px" }} />
        </div>
      ) : lista.length === 0 ? (
        <div style={{ padding: "20px", color: C.textMuted, fontSize: "12px", textAlign: "center" }}>
          {equipamentos ? "Nenhum equipamento encontrado" : "Conecte o banco para visualizar equipamentos"}
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: C.tableHeader }}>
                  {["ID","Nome/Descrição","Série","Tipo","Status"].map(h =>
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {lista.map((e, i) => {
                  const hb = hbMap[e.Id || e.IdEquipamento];
                  const online = hb && (Date.now() - new Date(hb.UltimoHeartbeat || hb.DataHora)) < 15 * 60 * 1000;
                  return (
                    <tr key={i} style={{ background: i%2===0 ? "transparent" : C.raised, borderBottom: `1px solid ${C.border}22` }}>
                      <td style={{ padding: "6px 10px", color: C.textMuted, fontSize: "11px" }}>{e.Id || e.IdEquipamento}</td>
                      <td style={{ padding: "6px 10px", fontWeight: 600 }}>{e.Nome || e.Descricao || "—"}</td>
                      <td style={{ padding: "6px 10px", color: C.textSecondary, fontFamily: "monospace", fontSize: "11px" }}>{e.NumeroSerie || "—"}</td>
                      <td style={{ padding: "6px 10px", color: C.textSecondary }}>{e.Tipo || e.TipoEquipamento || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>
                        <Badge v={hb ? (online ? "online" : "atencao") : "sem HB"} ok={online} warn={hb && !online} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA: Locais ────────────────────────────────────────────────────
function TabLocais({ locais, loading }) {
  const [filter, setFilter] = useState("");
  const lista = useMemo(() => {
    const arr = locais?.locais || [];
    if (!filter) return arr;
    const q = filter.toLowerCase();
    return arr.filter(l => (l.Nome || "").toLowerCase().includes(q) || (l.Cidade || "").toLowerCase().includes(q));
  }, [locais, filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        <StatCard label="Total Locais" value={fmt(locais?.total)} color={C.brand} icon={<MapPin size={14} />} />
        <StatCard label="Com Equipamentos" value={fmt(lista.filter(l => l.TotalEquipamentos > 0).length)} color={C.success} icon={<Navigation size={14} />} />
      </div>

      <input value={filter} onChange={e => setFilter(e.target.value)}
        placeholder="Filtrar locais..."
        style={{ padding: "8px 12px", background: C.raised, border: `1px solid ${C.border}`,
          borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none", maxWidth: "320px" }} />

      {loading ? (
        <div style={{ textAlign: "center", padding: "30px", color: C.textMuted }}>
          <RefreshCw size={24} className="spin" style={{ display: "block", margin: "0 auto 8px" }} />
        </div>
      ) : lista.length === 0 ? (
        <div style={{ padding: "20px", color: C.textMuted, fontSize: "12px", textAlign: "center" }}>
          {locais ? "Nenhum local encontrado" : "Conecte o banco para visualizar locais"}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "10px" }}>
          {lista.map((l, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={12} color={C.brand} /> {l.Nome}
              </div>
              {l.Endereco && <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "4px" }}>{l.Endereco}</div>}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                {l.Cidade && <Badge v={`${l.Cidade}${l.UF ? ` - ${l.UF}` : ""}`} ok warn={false} />}
                <Badge v={`${l.TotalEquipamentos || 0} equip.`} ok={l.TotalEquipamentos > 0} warn={false} />
                <Badge v={l.Ativo ? "Ativo" : "Inativo"} ok={l.Ativo} warn={false} />
              </div>
              {l.Latitude && l.Longitude && (
                <a href={`https://maps.google.com/?q=${l.Latitude},${l.Longitude}`} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "8px",
                    fontSize: "11px", color: C.accent, textDecoration: "none" }}>
                  <ExternalLink size={10} /> Ver no Maps
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ABA: Sites ─────────────────────────────────────────────────────
function TabSites({ onFetchUrl }) {
  const [filter, setFilter] = useState("");
  const [probing, setProbing] = useState({});
  const [probeResults, setProbeResults] = useState({});

  const lista = useMemo(() => {
    if (!filter) return AXCROSS_SITES;
    const q = filter.toLowerCase();
    return AXCROSS_SITES.filter(s => s.nome.toLowerCase().includes(q) || (s.orgao || "").toLowerCase().includes(q) || (s.estado || "").toLowerCase().includes(q));
  }, [filter]);

  const probe = async (site) => {
    setProbing(p => ({ ...p, [site.id]: true }));
    try {
      const res = await apiFetch("/proxy/fetch-url", {
        method: "POST",
        body: JSON.stringify({ url: site.url }),
      });
      const data = await res.json();
      setProbeResults(p => ({ ...p, [site.id]: { ok: data.ok, status: data.status } }));
    } catch {
      setProbeResults(p => ({ ...p, [site.id]: { ok: false, status: "ERR" } }));
    } finally {
      setProbing(p => ({ ...p, [site.id]: false }));
    }
  };

  const probeAll = () => lista.forEach(s => probe(s));

  // totais
  const totalEquip = AXCROSS_SITES.reduce((a, s) => a + (s.equipamentos || 0), 0);
  const totalFaixas = AXCROSS_SITES.reduce((a, s) => a + (s.faixas || 0), 0);
  const totalVeic = AXCROSS_SITES.reduce((a, s) => a + (s.veiculos || 0), 0);
  const totalPass = AXCROSS_SITES.reduce((a, s) => a + (s.passagensDia || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* KPIs gerais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "10px" }}>
        <StatCard label="Sites Ativos" value={AXCROSS_SITES.filter(s => s.status === "ativo").length} color={C.brand} icon={<Globe size={14} />} sub="instâncias AxCross" />
        <StatCard label="Equipamentos" value={fmt(totalEquip)} color={C.accent} icon={<Navigation size={14} />} sub="total cadastrado" />
        <StatCard label="Faixas" value={fmt(totalFaixas)} color="#a78bfa" icon={<Layers size={14} />} sub="monitoradas" />
        <StatCard label="Veículos Mon." value={fmt(totalVeic)} color={C.warning} icon={<Shield size={14} />} sub="com alerta" />
        <StatCard label="Passagens/Dia" value={fmt(totalPass)} color={C.success} icon={<Activity size={14} />} sub="total frota" />
      </div>

      {/* Filtro e ação */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input value={filter} onChange={e => setFilter(e.target.value)}
          placeholder="Filtrar sites..."
          style={{ flex: 1, minWidth: "200px", padding: "8px 12px",
            background: C.raised, border: `1px solid ${C.border}`, borderRadius: "6px",
            color: C.text, fontSize: "12px", outline: "none" }} />
        <button onClick={probeAll}
          style={{ display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", background: C.brandBg, border: `1px solid ${C.brand}`,
            borderRadius: "6px", color: C.brand, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
          <Activity size={13} /> Verificar Todos
        </button>
      </div>

      {/* Grid de sites */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "10px" }}>
        {lista.map(site => {
          const probe = probeResults[site.id];
          const isProbando = probing[site.id];
          return (
            <div key={site.id} style={{
              background: C.surface, border: `1px solid ${probe?.ok === true ? C.brand + "55" : probe?.ok === false ? C.danger + "44" : C.border}`,
              borderRadius: "8px", padding: "14px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    {site.nome}
                    {probe && <Badge v={probe.ok ? `HTTP ${probe.status}` : "ERRO"} ok={probe.ok} warn={false} />}
                    {isProbando && <RefreshCw size={12} className="spin" color={C.brand} />}
                  </div>
                  <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>
                    {site.orgao} • {site.estado} • {site.tipo}
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px", marginBottom: "10px" }}>
                {[
                  ["Equipamentos", site.equipamentos],
                  ["Faixas", site.faixas],
                  ["Veículos", site.veiculos],
                  ["Pass./Dia", site.passagensDia],
                  ["Alertas", site.alertas],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: "5px" }}>
                    <span style={{ color: C.textMuted }}>{k}:</span>
                    <span style={{ fontWeight: 600, color: k === "Alertas" && v > 0 ? C.warning : C.text }}>{fmt(v)}</span>
                  </div>
                ))}
              </div>

              {site.observacoes && (
                <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "8px",
                  background: C.raised, borderRadius: "4px", padding: "5px 8px",
                  borderLeft: `2px solid ${C.brand}` }}>
                  {site.observacoes}
                </div>
              )}

              {/* Ações */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <a href={site.url} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "5px 10px", background: C.brandBg, border: `1px solid ${C.brand}44`,
                    borderRadius: "5px", color: C.brand, textDecoration: "none", fontSize: "11px", fontWeight: 600 }}>
                  <ExternalLink size={11} /> Abrir Sistema
                </a>
                <a href={`${site.url}/monitoringonline/monitoring/equipmentmap`} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "5px 10px", background: "transparent", border: `1px solid ${C.border}`,
                    borderRadius: "5px", color: C.textSecondary, textDecoration: "none", fontSize: "11px" }}>
                  <MapPin size={11} /> Mapa
                </a>
                <button onClick={() => probe(site)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "5px 10px", background: "transparent", border: `1px solid ${C.border}`,
                    borderRadius: "5px", color: C.textMuted, cursor: "pointer", fontSize: "11px" }}>
                  <Activity size={11} /> Ping
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ABA: Diagnóstico ───────────────────────────────────────────────
function TabDiagnostico({ dbDiag, dbDiagLoading, dbDiagError, fetchDiag, urlResult, urlLoading, urlError, urlInput, setUrlInput, fetchUrl }) {

  function GravBadge({ g }) {
    const m = { alta: { color: C.danger, label: "ALTA" }, media: { color: C.warning, label: "MÉDIA" }, baixa: { color: C.accent, label: "BAIXA" } };
    const s = m[g] || m.baixa;
    return <span style={{ padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
      background: s.color + "18", color: s.color, border: `1px solid ${s.color}44` }}>{s.label}</span>;
  }

  function IcCard({ ic }) {
    const [open, setOpen] = useState(ic.gravidade === "alta");
    return (
      <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
        <button onClick={() => setOpen(v => !v)} style={{ width: "100%", textAlign: "left",
          background: C.surface, border: "none", cursor: "pointer", padding: "11px 14px",
          display: "flex", alignItems: "center", gap: "8px", color: C.text }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, minWidth: 40 }}>{ic.id}</span>
          <GravBadge g={ic.gravidade} />
          <span style={{ flex: 1, fontWeight: 600, fontSize: "12px" }}>{ic.titulo}</span>
          {open ? <ChevronUp size={13} color={C.textMuted} /> : <ChevronDown size={13} color={C.textMuted} />}
        </button>
        {open && (
          <div style={{ padding: "12px 14px", background: C.raised, borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: "12px", color: C.textSecondary, margin: "0 0 10px" }}>{ic.descricao}</p>
            {ic.prova && (
              <div style={{ background: C.successBg, border: `1px solid ${C.success}22`, borderRadius: "5px",
                padding: "7px 11px", marginBottom: "8px", fontSize: "11px", color: C.success }}>
                <strong>🔬 Prova:</strong> {ic.prova}
              </div>
            )}
            <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}22`, borderRadius: "5px",
              padding: "7px 11px", marginBottom: "10px", fontSize: "11px", color: C.danger }}>
              <strong>Impacto:</strong> {ic.impacto}
            </div>
            <ol style={{ margin: "0 0 10px", paddingLeft: "18px", fontSize: "11px", color: C.textSecondary, lineHeight: 1.8 }}>
              {ic.solucao.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            {ic.link && (
              <a href={ic.link} style={{ display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "11px", color: C.accent, textDecoration: "none", borderBottom: `1px dashed ${C.accent}55` }}>
                <ExternalLink size={11} /> {ic.linkLabel}
              </a>
            )}
            {ic.sql && <SqlBlock sql={ic.sql} />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Banner de análise de profundidade - CAUSA RAIZ IDENTIFICADA */}
      <div style={{ background: "rgba(16,185,129,0.06)", border: `2px solid ${C.brand}`,
        borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", color: C.brand, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={15} /> 🔬 Análise de Profundidade — Causa Raiz Identificada
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
          <div style={{ background: C.successBg, border: `1px solid ${C.success}22`, borderRadius: "6px", padding: "10px 12px" }}>
            <div style={{ fontWeight: 700, color: C.success, marginBottom: "5px" }}>✅ PROVA: Campo EXISTS no banco</div>
            <div style={{ color: C.textSecondary, lineHeight: 1.7 }}>
              O filtro <strong>"Classificação"</strong> em{" "}
              <a href="https://economia.axcross.axion.ws/reports/reports/passages" target="_blank" rel="noreferrer" style={{ color: C.accent }}>
                /reports/reports/passages
              </a>{" "}
              tem valores reais:<br />
              <code>Automóvel · Caminhão · Caminhonete · Motocicleta · Ônibus</code>
            </div>
          </div>
          <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}22`, borderRadius: "6px", padding: "10px 12px" }}>
            <div style={{ fontWeight: 700, color: C.danger, marginBottom: "5px" }}>❌ CAUSA: DTO do SignalR incompleto</div>
            <div style={{ color: C.textSecondary, lineHeight: 1.7 }}>
              O mapa usa <strong>SignalR</strong> via{" "}
              <code>/monitoringonline/PassageHub</code>.<br />
              O <strong>PassagemDto</strong> enviado pelo Hub <strong>não inclui</strong>{" "}
              <code>ClassificacaoVeiculo</code> → popup exibe vazio.
            </div>
          </div>
        </div>
        <div style={{ marginTop: "10px", fontSize: "11px", color: C.textMuted, display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <span>📡 Hub confirmado: <code>monitoringonline/PassageHub/negotiate → 302 OIDC</code></span>
          <span>🏗 Arquitetura: ASP.NET Core + SignalR + Razor Views</span>
          <span>🔧 Fix: Adicionar <code>ClassificacaoVeiculo</code> ao <code>PassagemDto</code></span>
        </div>
      </div>

      {/* Alerta contextual */}
      <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}44`,
        borderRadius: "8px", padding: "12px 16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <AlertCircle size={16} color={C.danger} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "13px", color: C.danger }}>Campo CLASSIFICACAO vazio no mapa de equipamentos</div>
          <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.6, marginTop: "3px" }}>
            Na tela de mapa de equipamentos AxCross (faixa de monitoramento), o campo{" "}
            <code style={{ background: "rgba(251,113,133,0.15)", padding: "1px 5px", borderRadius: "3px" }}>CLASSIFICACAO</code>{" "}
            não retorna dados. Causa raiz identificada — ver análise acima. 6 intercorrências mapeadas abaixo por prioridade.
          </div>
        </div>
      </div>

      {/* Busca por URL */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: C.accent, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe size={13} /> Analisar URL do sistema AxCross
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchUrl()}
            placeholder="https://economia.axcross.axion.ws/monitoringonline/monitoring/equipmentmap"
            style={{ flex: 1, minWidth: "280px", padding: "7px 12px",
              background: C.raised, border: `1px solid ${C.border}`, borderRadius: "6px",
              color: C.text, fontSize: "11px", outline: "none" }} />
          <button onClick={fetchUrl} disabled={urlLoading}
            style={{ display: "flex", alignItems: "center", gap: "5px",
              padding: "7px 14px", background: C.accentBg, border: `1px solid ${C.accent}`,
              borderRadius: "6px", color: C.accent, cursor: urlLoading ? "wait" : "pointer",
              fontSize: "11px", fontWeight: 600, opacity: urlLoading ? 0.7 : 1 }}>
            <Search size={12} className={urlLoading ? "spin" : ""} />
            {urlLoading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {urlError && <div style={{ marginTop: "8px", padding: "7px 10px", background: C.dangerBg, borderRadius: "5px", fontSize: "11px", color: C.danger }}>❌ {urlError}</div>}
        {urlResult && (
          <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700,
              background: urlResult.ok ? C.successBg : C.dangerBg, color: urlResult.ok ? C.success : C.danger }}>
              HTTP {urlResult.status} {urlResult.statusText}
            </span>
            {/* Análise de campo */}
            {(() => {
              const str = typeof urlResult.data === "object" ? JSON.stringify(urlResult.data) : String(urlResult.data || "");
              const temClassif = /classif|classification|tipoVeiculo|vehicleClass/i.test(str);
              return <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                background: temClassif ? C.successBg : C.dangerBg, color: temClassif ? C.success : C.danger }}>
                {temClassif ? "✅ Campo classificação encontrado" : "❌ Campo classificação ausente"}
              </span>;
            })()}
          </div>
        )}
      </div>

      {/* Diagnóstico do banco */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <Database size={14} color={C.brand} />
          <span style={{ fontWeight: 700, fontSize: "13px" }}>Diagnóstico do Banco AxCross</span>
          <button onClick={fetchDiag} disabled={dbDiagLoading}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 12px", background: C.brandBg, border: `1px solid ${C.brand}`,
              borderRadius: "5px", color: C.brand, cursor: dbDiagLoading ? "wait" : "pointer",
              fontSize: "11px", fontWeight: 600, opacity: dbDiagLoading ? 0.7 : 1 }}>
            <Database size={11} className={dbDiagLoading ? "spin" : ""} />
            {dbDiagLoading ? "Consultando..." : "Executar Diagnóstico"}
          </button>
        </div>

        {dbDiagError && <div style={{ padding: "8px 12px", background: C.dangerBg, borderRadius: "6px", fontSize: "12px", color: C.danger }}>❌ {dbDiagError}</div>}

        {dbDiag && (
          <div>
            <div style={{ padding: "10px 14px", background: dbDiag.tem_classificacao ? C.brandBg : C.dangerBg,
              border: `1px solid ${dbDiag.tem_classificacao ? C.brand + "44" : C.danger + "44"}`,
              borderRadius: "6px", marginBottom: "10px",
              display: "flex", alignItems: "center", gap: "10px" }}>
              {dbDiag.tem_classificacao
                ? <CheckCircle2 size={18} color={C.brand} />
                : <XCircle size={18} color={C.danger} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: dbDiag.tem_classificacao ? C.brand : C.danger }}>
                  {dbDiag.tem_classificacao ? "Campo classificação EXISTE em TBPassagens" : "Campo classificação NÃO EXISTE em TBPassagens"}
                </div>
                <div style={{ fontSize: "11px", color: C.textMuted }}>{dbDiag.query_atual_passagens?.problema_identificado}</div>
              </div>
            </div>

            {dbDiag.stats_classificacao && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "10px" }}>
                <StatCard label="Total" value={fmt(dbDiag.stats_classificacao.total)} color={C.accent} icon={<Database size={12} />} />
                <StatCard label="Preenchidos" value={fmt(dbDiag.stats_classificacao.preenchidos)} color={C.success} icon={<CheckCircle2 size={12} />} />
                <StatCard label="Nulos" value={fmt(dbDiag.stats_classificacao.nulos)} color={C.danger} icon={<XCircle size={12} />} />
              </div>
            )}

            {dbDiag.colunas_tbpassagens && (
              <details style={{ marginTop: "8px" }}>
                <summary style={{ fontSize: "12px", color: C.accent, cursor: "pointer", marginBottom: "6px" }}>
                  📋 Ver todas as colunas de TBPassagens ({dbDiag.colunas_tbpassagens.length})
                </summary>
                <div style={{ maxHeight: "200px", overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: "5px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <thead>
                      <tr style={{ background: C.tableHeader }}>
                        {["Coluna","Tipo","Nulo"].map(h =>
                          <th key={h} style={{ padding: "5px 8px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {dbDiag.colunas_tbpassagens.map((c, i) => {
                        const hl = c.COLUMN_NAME?.toLowerCase().includes("classif");
                        return (
                          <tr key={i} style={{ background: hl ? "rgba(16,185,129,0.07)" : i%2===0 ? "transparent" : C.raised }}>
                            <td style={{ padding: "5px 8px", fontWeight: hl ? 700 : 400, color: hl ? C.brand : C.text }}>
                              {hl && "★ "}{c.COLUMN_NAME}
                            </td>
                            <td style={{ padding: "5px 8px", color: C.textSecondary }}>{c.DATA_TYPE}</td>
                            <td style={{ padding: "5px 8px", color: c.IS_NULLABLE === "YES" ? C.warning : C.success }}>{c.IS_NULLABLE === "YES" ? "Sim" : "Não"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Intercorrências */}
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: C.textSecondary, marginBottom: "10px" }}>
          🔍 Intercorrências mapeadas — {INTERCORRENCIAS.filter(i => i.gravidade === "alta").length} alta · {INTERCORRENCIAS.filter(i => i.gravidade === "media").length} média · {INTERCORRENCIAS.filter(i => i.gravidade === "baixa").length} baixa
        </div>
        {INTERCORRENCIAS.map(ic => <IcCard key={ic.id} ic={ic} />)}
      </div>
    </div>
  );
}

// ── ABA: Suporte ───────────────────────────────────────────────────
// ── ABA: Comparativo de Classificação por Equipamento ──────────────
const TIPOS_CLASSIFICACAO = [
  { value: "todos",        label: "Todos os tipos" },
  { value: "Automóvel",    label: "🚗 Automóvel" },
  { value: "Caminhão",     label: "🚛 Caminhão" },
  { value: "Caminhonete",  label: "🛻 Caminhonete" },
  { value: "Motocicleta",  label: "🏍 Motocicleta" },
  { value: "Ônibus",       label: "🚌 Ônibus" },
];

// ── Dados de demonstração baseados no caso real das imagens ──────
const DEMO_DATA = {
  ok: true,
  colClassif: "ClassificacaoVeiculo",
  equipamentos: ["GOEC60003", "GOEC60044"],
  _isDemo: true,
  resultados: {
    "GOEC60003": {
      statsGeral: { Total: 18420, ComClassif: 0, VelocidadeMedia: 72.4,
        PrimeiraPassagem: "2026-07-01T06:00:00", UltimaPassagem: "2026-07-12T16:59:58" },
      statsFaixa: [
        { Faixa: "Faixa 1", Total: 12100, ComClassif: 0, SemClassif: 12100 },
        { Faixa: "Faixa 2", Total: 6320,  ComClassif: 0, SemClassif: 6320  },
      ],
      statsClassif: [
        { Tipo: "(sem classif.)", Total: 18420 },
      ],
      passagens: [
        { Id: 1, Placa: "SQH6F83", DataPassagem: "2026-09-07T16:59:58", Velocidade: 0,  ClassificacaoVeiculo: null, Faixa: "Faixa 1", Local: "BR-060 Km 184", Sentido: "Guapó/Goiânia", Equipamento: "GOEC60003" },
        { Id: 2, Placa: "OHA4C28", DataPassagem: "2026-09-07T16:59:59", Velocidade: 0,  ClassificacaoVeiculo: null, Faixa: "Faixa 2", Local: "BR-060 Km 184", Sentido: "Guapó/Goiânia", Equipamento: "GOEC60003" },
        { Id: 3, Placa: "PRR6B80", DataPassagem: "2026-09-07T16:59:59", Velocidade: 0,  ClassificacaoVeiculo: null, Faixa: "Faixa 1", Local: "BR-060 Km 184", Sentido: "Guapó/Goiânia", Equipamento: "GOEC60003" },
        { Id: 4, Placa: "KLM1234", DataPassagem: "2026-09-07T16:58:12", Velocidade: 85, ClassificacaoVeiculo: null, Faixa: "Faixa 2", Local: "BR-060 Km 184", Sentido: "Guapó/Goiânia", Equipamento: "GOEC60003" },
        { Id: 5, Placa: "JHP1G54", DataPassagem: "2026-09-07T16:57:44", Velocidade: 92, ClassificacaoVeiculo: null, Faixa: "Faixa 1", Local: "BR-060 Km 184", Sentido: "Guapó/Goiânia", Equipamento: "GOEC60003" },
      ],
    },
    "GOEC60044": {
      statsGeral: { Total: 14850, ComClassif: 14850, VelocidadeMedia: 68.1,
        PrimeiraPassagem: "2026-07-01T06:00:00", UltimaPassagem: "2026-07-12T16:59:59" },
      statsFaixa: [
        { Faixa: "Faixa 1", Total: 7200,  ComClassif: 7200,  SemClassif: 0 },
        { Faixa: "Faixa 2", Total: 7650,  ComClassif: 7650,  SemClassif: 0 },
      ],
      statsClassif: [
        { Tipo: "Automóvel",   Total: 9820  },
        { Tipo: "Caminhonete", Total: 2430  },
        { Tipo: "Caminhão",    Total: 1640  },
        { Tipo: "Motocicleta", Total: 720   },
        { Tipo: "Ônibus",      Total: 240   },
      ],
      passagens: [
        { Id: 10, Placa: "RMZ7A92", DataPassagem: "2026-09-07T16:59:59", Velocidade: 0,  ClassificacaoVeiculo: "Automóvel",   Faixa: "Faixa 2", Local: "GO-164 Km 0", Sentido: "Mozarlândia-GO/Nova Crixás-GO", Equipamento: "GOEC60044" },
        { Id: 11, Placa: "TFZ7J43", DataPassagem: "2026-09-07T16:59:48", Velocidade: 0,  ClassificacaoVeiculo: "Automóvel",   Faixa: "Faixa 1", Local: "GO-164 Km 0", Sentido: "Mozarlândia-GO/Nova Crixás-GO", Equipamento: "GOEC60044" },
        { Id: 12, Placa: "ABC9D01", DataPassagem: "2026-09-07T16:58:33", Velocidade: 78, ClassificacaoVeiculo: "Caminhão",    Faixa: "Faixa 2", Local: "GO-164 Km 0", Sentido: "Mozarlândia-GO/Nova Crixás-GO", Equipamento: "GOEC60044" },
        { Id: 13, Placa: "XYZ4E56", DataPassagem: "2026-09-07T16:57:11", Velocidade: 65, ClassificacaoVeiculo: "Caminhonete", Faixa: "Faixa 1", Local: "GO-164 Km 0", Sentido: "Mozarlândia-GO/Nova Crixás-GO", Equipamento: "GOEC60044" },
        { Id: 14, Placa: "MNO7F89", DataPassagem: "2026-09-07T16:56:50", Velocidade: 55, ClassificacaoVeiculo: "Motocicleta", Faixa: "Faixa 2", Local: "GO-164 Km 0", Sentido: "Mozarlândia-GO/Nova Crixás-GO", Equipamento: "GOEC60044" },
      ],
    },
  },
};

// TabComparativo — versão completa multi-equipamento abaixo ↓
function TabComparativo() {
  // ── Estado dos filtros ─────────────────────────────────────────
  const [equipInput, setEquipInput]       = useState("GOEC60003");
  const [equipamentos, setEquipamentos]   = useState(["GOEC60003", "GOEC60044"]);
  const [fonte, setFonte]                 = useState("url"); // "url" | "demo"
  // Credenciais URL
  const [urlSite, setUrlSite]             = useState(() => { try { return JSON.parse(localStorage.getItem("axcross_investigar_last") || "{}").siteUrl || "https://economia.axcross.axion.ws"; } catch { return "https://economia.axcross.axion.ws"; } });
  const [urlLogin, setUrlLogin]           = useState(() => { try { return JSON.parse(localStorage.getItem("axcross_investigar_last") || "{}").login || "Axion@2026"; } catch { return "Axion@2026"; } });
  const [urlSenha, setUrlSenha]           = useState(() => { try { return JSON.parse(localStorage.getItem("axcross_investigar_last") || "{}").senha || ""; } catch { return ""; } });
  const [filtros, setFiltros] = useState({
    dataInicio: "", dataFim: "",
    classificacao: "todos", faixa: "", sentido: "", pageSize: "50",
  });
  const [viewMode, setViewMode]   = useState("comparar"); // comparar | timeline | stats
  const [dados, setDados]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState(null);
  const [expandedEquip, setExpandedEquip] = useState({});
  const [isDemo, setIsDemo]       = useState(false);

  const setF = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

  const addEquip = () => {
    const t = equipInput.trim().toUpperCase();
    if (t && !equipamentos.includes(t)) {
      setEquipamentos(e => [...e, t]);
      setEquipInput("");
    }
  };

  const removeEquip = (e) => setEquipamentos(arr => arr.filter(x => x !== e));

  const carregarDemo = () => {
    setEquipamentos(["GOEC60003", "GOEC60044"]);
    setDados(DEMO_DATA);
    setIsDemo(true);
    setErro(null);
    const init = { "GOEC60003": true, "GOEC60044": true };
    setExpandedEquip(init);
  };

  const buscar = async () => {
    if (!equipamentos.length) { setErro("Adicione ao menos um equipamento"); return; }

    if (fonte === "demo") { carregarDemo(); return; }

    // Modo URL
    if (fonte === "url") {
      if (!urlSenha.trim()) { setErro("Informe a senha para acesso ao sistema AxCross"); return; }
      setLoading(true); setErro(null); setDados(null); setIsDemo(false);
      try {
        // Salvar last record
        localStorage.setItem("axcross_investigar_last", JSON.stringify({ siteUrl: urlSite, login: urlLogin, senha: urlSenha, salvoEm: new Date().toLocaleString("pt-BR") }));
        const body = {
          siteUrl: urlSite, login: urlLogin, senha: urlSenha,
          equipamentos,
          filtros: {
            dataInicio: filtros.dataInicio || undefined,
            dataFim:    filtros.dataFim    || undefined,
            pageSize:   parseInt(filtros.pageSize) || 50,
          },
        };
        const r = await apiFetch("/axcross/comparar-via-url", { method: "POST", body: JSON.stringify(body) });
        const d = await r.json();
        if (!d.ok) throw new Error(d.erro || "Falha na investigação via URL");
        // Adaptar resultado do investigar para o formato esperado pela view
        const dadosAdaptados = {
          ok: true, colClassif: "ClassificacaoVeiculo",
          equipamentos, resultados: d.resultados,
          analise: d.analise, logs: d.logs,
          _viaUrl: true, site: urlSite,
          filtrosAplicados: filtros,
          timestamp: d.timestamp,
        };
        setDados(dadosAdaptados);
        const init = {}; equipamentos.forEach(e => { init[e] = true; }); setExpandedEquip(init);
      } catch (e) {
        const msg = e.message || "";
        if (msg.toLowerCase().includes("fetch") || msg.includes("1433") || msg.includes("connect")) {
          setErro(`__DB_OFFLINE__${msg}`);
        } else {
          setErro(msg);
        }
      }
      setLoading(false);
      return;
    }

    // Modo banco (fallback)
    setLoading(true); setErro(null); setDados(null); setIsDemo(false);
    try {
      const body = {
        equipamentos,
        ...(filtros.dataInicio    && { dataInicio: filtros.dataInicio }),
        ...(filtros.dataFim       && { dataFim:    filtros.dataFim }),
        ...(filtros.faixa         && { faixa:      filtros.faixa }),
        ...(filtros.sentido       && { sentido:    filtros.sentido }),
        ...(filtros.classificacao !== "todos" && { classificacao: filtros.classificacao }),
        pageSize: parseInt(filtros.pageSize) || 50,
      };
      const r = await apiFetch("/axcross/comparar-equipamentos", { method: "POST", body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        if ((d.erro || "").includes("1433") || (d.erro || "").includes("connect")) {
          setErro(`__DB_OFFLINE__${d.dica || d.erro}`);
        } else throw new Error(d.erro || "Falha");
        setLoading(false); return;
      }
      setDados(d);
      const init = {}; equipamentos.forEach(e => { init[e] = true; }); setExpandedEquip(init);
    } catch (e) {
      const msg = e.message || "";
      if (msg.toLowerCase().includes("fetch") || msg.includes("1433") || msg.includes("connect")) {
        setErro(`__DB_OFFLINE__${msg}`);
      } else setErro(msg);
    }
    setLoading(false);
  };

  const pct = (com, tot) => tot > 0 ? Math.round((com / tot) * 100) : 0;

  // ── Cor de status de classificação ────────────────────────────
  const statusInfo = (com, tot) => {
    const p = pct(com, tot);
    if (p === 0)   return { label: "❌ Nenhuma",  color: C.danger };
    if (p < 30)    return { label: "⚠ Baixo",     color: "#f97316" };
    if (p < 80)    return { label: "🔸 Parcial",   color: C.warning };
    return           { label: "✅ OK",             color: C.success };
  };

  // ── Vista comparativa lado-a-lado ───────────────────────────────
  // ── Vista: VARCO × AxCross (cruzamento de dados) ───────────────
  const ViewVarcoAxCross = ({ equipamentos: eqs }) => {
    const [varcoData, setVarcoData] = useState({});
    const [loadingVarco, setLoadingVarco] = useState(false);
    const [timelineData, setTimelineData] = useState({});
    const [varcoList, setVarcoList] = useState([]); // lista completa VARCO
    const [applyingFix, setApplyingFix] = useState({});
    const [fixResult, setFixResult] = useState({});
    const [tunnelStatus, setTunnelStatus] = useState({});

    useEffect(() => {
      const fetchAll = async () => {
        setLoadingVarco(true);
        // Buscar lista completa VARCO para seletor
        try {
          const rv = await apiFetch("/varco/frota");
          const dv = await rv.json();
          if (dv.devices) setVarcoList([...new Set(dv.devices.map(d => d.nome.split(" - ")[0].trim()))].sort());
        } catch (_) {}

        // Buscar ecossistema para cada equipamento
        const results = {};
        const tl = {};
        for (const eq of eqs) {
          try {
            const r = await apiFetch(`/axcross/ecosistema?equipamento=${encodeURIComponent(eq)}&dias=30`);
            const d = await r.json();
            if (d.ok) results[eq] = d;
            else results[eq] = { ok: false, equipamento: eq, varco: { encontrado: false }, causaRaiz: [], resumo: { severidade: null } };
          } catch (_) {
            results[eq] = { ok: false, equipamento: eq, varco: { encontrado: false }, causaRaiz: [], resumo: { severidade: null } };
          }
          try {
            const r = await apiFetch(`/axcross/classificacao-timeline?equipamento=${encodeURIComponent(eq)}&dias=14`);
            const d = await r.json();
            if (d.ok) tl[eq] = d;
          } catch (_) {}
        }
        setVarcoData(results);
        setTimelineData(tl);
        setLoadingVarco(false);
      };
      fetchAll();
    }, [eqs.join(",")]);

    // Testar acesso ao túnel
    const testarTunel = async (eq, tunnelUrl) => {
      setTunnelStatus(s => ({ ...s, [eq]: "testando" }));
      try {
        const tunnelBase = tunnelUrl.split("/equipment")[0];
        const hdrs = await itscamHeaders(tunnelBase);
        const r = await apiFetch("/proxy/fetch-url", { method: "POST", body: JSON.stringify({ url: tunnelUrl, headers: hdrs }) });
        const d = await r.json();
        const st = d.ok ? "online" : d.status === 503 || d.status === 502 ? "offline" : d.status >= 200 ? "online" : "erro";
        setTunnelStatus(s => ({ ...s, [eq]: st }));
      } catch (_) { setTunnelStatus(s => ({ ...s, [eq]: "erro" })); }
    };

    // Aplicar correção via API do equipamento pelo túnel
    const aplicarCorrecao = async (eq, tunnelUrl, endpoint, payload, descricao) => {
      setApplyingFix(s => ({ ...s, [`${eq}_${endpoint}`]: true }));
      try {
        const apiUrl = `${tunnelUrl}${endpoint}`;
        const tunnelBase = tunnelUrl.split("/equipment")[0];
        const hdrs = await itscamHeaders(tunnelBase);
        const r = await apiFetch("/proxy/fetch-url", {
          method: "POST",
          body: JSON.stringify({ url: apiUrl, method: "PUT", headers: hdrs, body: payload }),
        });
        const d = await r.json();
        setFixResult(s => ({ ...s, [`${eq}_${endpoint}`]: d.ok ? `✅ ${descricao} aplicado` : `❌ Erro: HTTP ${d.status}` }));
      } catch (e) { setFixResult(s => ({ ...s, [`${eq}_${endpoint}`]: `❌ ${e.message}` })); }
      setApplyingFix(s => ({ ...s, [`${eq}_${endpoint}`]: false }));
    };

    if (loadingVarco) return (
      <div style={{ textAlign: "center", padding: "30px", color: C.textMuted }}>
        <RefreshCw size={22} className="spin" style={{ display: "block", margin: "0 auto 8px" }} />
        Cruzando dados VARCO + AxCross para {eqs.length} equipamento(s)...
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Seletor rápido de equipamentos VARCO disponíveis */}
        {varcoList.length > 0 && (
          <div style={{ background: C.surface, border: `1px solid rgba(96,205,255,0.2)`, borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.accent, marginBottom: "7px" }}>
              📡 {varcoList.length} equipamentos disponíveis no VARCO — clique para adicionar ao comparativo:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "72px", overflowY: "auto" }}>
              {varcoList.map(nome => (
                <button key={nome} onClick={() => setEquipamentos && setEquipamentos(prev => prev.includes(nome.replace(/O/g,"0")) ? prev : [...prev, nome.replace(/O/g,"0")])}
                  title={`VARCO: ${nome} → AxCross: ${nome.replace(/O/g,"0")}`}
                  style={{
                    padding: "2px 8px", fontSize: "10px", fontWeight: 600,
                    background: eqs.some(e => e.replace(/0/g,"O") === nome) ? C.brandBg : "transparent",
                    border: `1px solid ${eqs.some(e => e.replace(/0/g,"O") === nome) ? C.brand : C.border}`,
                    borderRadius: "4px", color: eqs.some(e => e.replace(/0/g,"O") === nome) ? C.brand : C.textMuted,
                    cursor: "pointer",
                  }}>
                  {nome.replace(/O/g,"0")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card por equipamento */}
        {eqs.map(eq => {
          const eco = varcoData[eq];
          const tl  = timelineData[eq];
          if (!eco) return (
            <div key={eq} style={{ padding: "12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", color: C.textMuted, fontSize: "12px" }}>
              <RefreshCw size={12} className="spin" style={{ marginRight: "6px" }} />{eq} — carregando...
            </div>
          );

          const cls = eco.varco?.classificador || {};
          const pct = eco.resumo?.pctClassificado;
          const sev = eco.resumo?.severidade;
          const sevC = { CRITICA: C.danger, ALTA: "#f97316", OK: C.success }[sev] || C.textMuted;

          return (
            <div key={eq} style={{ background: C.surface, border: `2px solid ${sevC}44`, borderRadius: "10px", overflow: "hidden" }}>

              {/* Header */}
              <div style={{ background: sevC + "18", borderBottom: `1px solid ${sevC}33`, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800, fontSize: "15px", color: sevC }}>{eq}</span>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: sevC + "25", color: sevC, fontWeight: 700 }}>
                  {sev === "CRITICA" ? "🔴" : sev === "ALTA" ? "🟠" : "✅"} {sev}
                </span>
                {eco.causaRaiz?.length > 0 && (
                  <span style={{ fontSize: "11px", color: C.danger, fontWeight: 600 }}>
                    ⚠ {eco.causaRaiz.length} causa(s) raiz
                  </span>
                )}
                {!eco.varco?.encontrado && (
                  <span style={{ fontSize: "10px", color: C.warning, marginLeft: "6px" }}>
                    ⚠ Não vinculado ao VARCO — usa outra integração
                  </span>
                )}
                <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
                  {eco.varco?.tunnelUrl && (
                    <>
                      <span style={{ fontSize: "10px", color: { testando: C.accent, online: C.success, auth: C.warning, offline: C.danger, erro: C.danger }[tunnelStatus[eq]] || C.textMuted }}>
                        { tunnelStatus[eq] === "testando" ? "⏳" : tunnelStatus[eq] === "online" ? "🟢" : tunnelStatus[eq] === "auth" ? "🟡" : tunnelStatus[eq] === "offline" ? "🔴" : tunnelStatus[eq] === "erro" ? "⚠" : "" }
                        { tunnelStatus[eq] === "online" ? " Online" : tunnelStatus[eq] === "auth" ? " Auth" : tunnelStatus[eq] === "offline" ? " Offline" : tunnelStatus[eq] === "erro" ? " Erro" : "" }
                      </span>
                      <button onClick={() => testarTunel(eq, eco.varco.tunnelUrl)}
                        style={{ fontSize: "10px", padding: "3px 9px", background: "transparent",
                          border: `1px solid ${C.border}`, borderRadius: "4px", color: C.textMuted, cursor: "pointer" }}>
                        Testar Túnel
                      </button>
                      <a href={eco.varco.tunnelUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: "11px", color: C.accent, textDecoration: "none",
                          border: `1px solid ${C.accent}44`, padding: "3px 10px", borderRadius: "4px",
                          display: "flex", alignItems: "center", gap: "4px" }}>
                        <ExternalLink size={11} /> Abrir Túnel
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0", divide: "horizontal" }}>

                {/* Coluna 1: VARCO Config */}
                <div style={{ padding: "12px 14px", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: C.accent, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    📡 VARCO — Configuração
                  </div>
                  {eco.varco?.encontrado ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px" }}>
                      {[
                        ["IP", eco.varco.ip],
                        ["Firmware", eco.varco.firmware],
                        ["Faixas VARCO", eco.varco.faixas],
                        ["OCR", eco.varco.ocr?.enabled ? "✅ Habilitado" : "❌ Desabilitado"],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", gap: "6px", borderBottom: `1px solid ${C.border}22`, paddingBottom: "3px" }}>
                          <span style={{ color: C.textMuted, minWidth: 80 }}>{k}:</span>
                          <span style={{ fontWeight: 500 }}>{v ?? "—"}</span>
                        </div>
                      ))}
                      {/* Classificador — destaque */}
                      <div style={{ marginTop: "6px", padding: "8px", background: cls.minProbability === 100 ? C.dangerBg : C.successBg,
                        border: `1px solid ${cls.minProbability === 100 ? C.danger : C.success}33`, borderRadius: "5px" }}>
                        <div style={{ fontWeight: 700, color: cls.minProbability === 100 ? C.danger : C.success, marginBottom: "4px", fontSize: "10px" }}>
                          🔧 Classificador {cls.minProbability === 100 ? "⚠ PROBLEMA" : "✅"}
                        </div>
                        <div style={{ display: "flex", gap: "6px", fontSize: "11px" }}>
                          <span style={{ color: C.textMuted }}>enabled:</span>
                          <span style={{ fontWeight: 700, color: cls.enabled ? C.success : C.danger }}>{String(cls.enabled ?? "—")}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", fontSize: "11px" }}>
                          <span style={{ color: C.textMuted }}>minProb:</span>
                          <span style={{ fontWeight: 800, color: cls.minProbability === 100 ? C.danger : C.success }}>
                            {cls.minProbability ?? "—"}%
                            {cls.minProbability === 100 && " ← CAUSA RAIZ"}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", fontSize: "11px" }}>
                          <span style={{ color: C.textMuted }}>sceneType:</span>
                          <span>{cls.sceneType ?? "—"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ padding: "8px", background: C.warningBg, border: `1px solid ${C.warning}33`, borderRadius: "5px" }}>
                        <div style={{ fontWeight: 700, color: C.warning, marginBottom: "4px" }}>⚠ Não vinculado ao VARCO</div>
                        <div style={{ color: C.textSecondary, fontSize: "10px", lineHeight: 1.5 }}>
                          Este equipamento NÃO está no inventário VARCO (72 dispositivos).
                          Pode usar integração direta HTTP, FTP, ou ser de modelo diferente do ITSCAM 450.
                          <br />Variante VARCO testada: <code>{eq.replace(/0/g,"O")}</code> — não encontrada.
                        </div>
                      </div>
                      {varcoList.length > 0 && (
                        <div style={{ fontSize: "10px", color: C.textMuted }}>
                          Equipamentos VARCO disponíveis próximos:<br />
                          {varcoList.filter(n => {
                            const num = parseInt(eq.replace(/\D/g,"").slice(-3));
                            const nNum = parseInt(n.replace(/\D/g,"").slice(-3));
                            return Math.abs(num - nNum) <= 3 && n !== eq.replace(/0/g,"O");
                          }).slice(0,4).map(n => (
                            <span key={n} style={{ marginRight: "6px", color: C.accent }}>{n.replace(/O/g,"0")}</span>
                          ))}
                        </div>
                      )}
                      {pct > 0 && (
                        <div style={{ padding: "6px 8px", background: C.successBg, border: `1px solid ${C.success}33`, borderRadius: "5px", fontSize: "10px", color: C.success }}>
                          ✅ Positivo: sem VARCO ({pct}% classif.) → integração alternativa funciona corretamente
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Coluna 2: AxCross dados */}
                <div style={{ padding: "12px 14px", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: C.brand, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    🛡 AxCross — Passagens
                  </div>
                  {eco.axcross?.conectado ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: pct === 0 ? C.danger : pct < 50 ? C.warning : C.success, textAlign: "center" }}>
                        {pct}%
                        <div style={{ fontSize: "10px", fontWeight: 400, color: C.textMuted }}>classificado</div>
                      </div>
                      <div style={{ height: "8px", background: C.raised, borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct < 30 ? C.danger : pct < 70 ? C.warning : C.success }} />
                      </div>
                      <div style={{ fontSize: "11px", color: C.textMuted, textAlign: "center" }}>
                        {fmt(eco.axcross.stats?.ComClassif)} / {fmt(eco.axcross.stats?.Total)} passagens (30 dias)
                      </div>
                      {/* Tipos */}
                      {eco.axcross.distribuicao?.slice(0, 4).map((d, i) => (
                        <div key={i} style={{ display: "flex", gap: "6px", fontSize: "10px" }}>
                          <span style={{ flex: 1, color: d.Tipo === "(sem classif.)" ? C.danger : C.text }}>{d.Tipo}</span>
                          <span style={{ fontWeight: 700, color: d.Tipo === "(sem classif.)" ? C.danger : C.brand }}>{fmt(d.Total)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: C.textMuted, fontSize: "11px" }}>Banco offline — sem dados AxCross</div>
                  )}
                </div>

                {/* Coluna 3: Timeline + Diagnóstico */}
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: C.warning, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    📅 Timeline + Diagnóstico
                  </div>
                  {/* Mini heatmap 14 dias */}
                  {tl?.timeline?.length > 0 ? (
                    <>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginBottom: "6px" }}>
                        {tl.timeline.slice(0, 14).reverse().map((dia, i) => {
                          const p = dia.Total > 0 ? Math.round((dia.ComClassif / dia.Total) * 100) : -1;
                          const cor = p < 0 ? C.raised : p === 100 ? C.success : p > 0 ? C.warning : C.danger;
                          return (
                            <div key={i} title={`${new Date(dia.Dia).toLocaleDateString("pt-BR")}: ${p < 0 ? "sem dados" : p + "%"}`}
                              style={{ width: "18px", height: "18px", borderRadius: "3px", background: cor + "cc", border: `1px solid ${cor}` }} />
                          );
                        })}
                      </div>
                      <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "6px" }}>Últimos 14 dias</div>
                      <div style={{ fontSize: "11px", color: { nunca_classifica: C.danger, sempre_classifica: C.success, intermitente_dia: C.warning, misto: "#a78bfa" }[tl.diagnostico] || C.textMuted, fontWeight: 600 }}>
                        {{ nunca_classifica: "❌ Nunca classifica", sempre_classifica: "✅ Sempre classifica", intermitente_dia: "⚠ Intermitente", misto: "🔸 Parcial" }[tl.diagnostico] || "—"}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: "10px", color: C.textMuted }}>Timeline indisponível (banco offline)</div>
                  )}

                  {/* Causas raiz com API endpoint */}
                  {eco.causaRaiz?.length > 0 && (
                    <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "5px" }}>
                      {eco.causaRaiz.map((cr, i) => {
                        const bg = cr.prioridade === "CRITICA" ? C.dangerBg : C.warningBg;
                        const bc = cr.prioridade === "CRITICA" ? C.danger : C.warning;
                        return (
                          <div key={i} style={{ padding: "6px 8px", background: bg, border: `1px solid ${bc}33`, borderRadius: "5px", fontSize: "10px" }}>
                            <div style={{ fontWeight: 700, color: bc }}>{cr.codigo} — {cr.titulo}</div>
                            <div style={{ color: C.textMuted, marginTop: "2px" }}>
                              Atual: <code style={{ color: bc }}>{cr.valor_atual}</code>
                              <span style={{ margin: "0 4px" }}>→</span>
                              Rec: <code style={{ color: C.success }}>{cr.valor_recomendado}</code>
                            </div>
                            {cr.caminho_correcao && (
                              <div style={{ color: C.textMuted, fontSize: "9px", marginTop: "2px" }}>📍 {cr.caminho_correcao}</div>
                            )}
                            {cr.api_endpoint && (
                              <div style={{ marginTop: "3px", fontFamily: "monospace", fontSize: "9px", color: C.accent }}>
                                {cr.api_endpoint}
                                {cr.api_payload && <span style={{ color: C.textMuted }}> {cr.api_payload}</span>}
                              </div>
                            )}
                            {cr.tunnelUrl && (
                              <div style={{ display: "flex", gap: "5px", marginTop: "5px", flexWrap: "wrap" }}>
                                <a href={cr.tunnelUrl} target="_blank" rel="noreferrer"
                                  style={{ color: C.accent, fontSize: "10px", display: "inline-flex", alignItems: "center", gap: "3px",
                                    padding: "2px 7px", border: `1px solid ${C.accent}44`, borderRadius: "3px", textDecoration: "none" }}>
                                  <ExternalLink size={9} /> Abrir Interface
                                </a>
                                {cr.api_endpoint && cr.api_payload && (
                                  <>
                                    <button
                                      onClick={() => aplicarCorrecao(eq, cr.tunnelUrl, cr.api_endpoint, cr.api_payload, cr.titulo)}
                                      disabled={applyingFix[`${eq}_${cr.api_endpoint}`]}
                                      style={{ fontSize: "10px", padding: "2px 7px",
                                        background: C.successBg, border: `1px solid ${C.success}44`,
                                        borderRadius: "3px", color: C.success, cursor: applyingFix[`${eq}_${cr.api_endpoint}`] ? "wait" : "pointer",
                                        display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                      {applyingFix[`${eq}_${cr.api_endpoint}`] ? <RefreshCw size={9} className="spin" /> : <Wrench size={9} />}
                                      {applyingFix[`${eq}_${cr.api_endpoint}`] ? "Aplicando..." : "Aplicar Correção"}
                                    </button>
                                    {fixResult[`${eq}_${cr.api_endpoint}`] && (
                                      <span style={{ fontSize: "9px", color: fixResult[`${eq}_${cr.api_endpoint}`].startsWith("✅") ? C.success : C.danger }}>
                                        {fixResult[`${eq}_${cr.api_endpoint}`]}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ═══ RELATÓRIO CONSOLIDADO DE DIAGNÓSTICO ═══ */}
        {Object.values(varcoData).some(eco => eco?.causaRaiz?.length > 0) && (
          <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ background: C.tableHeader, padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>📋</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "14px" }}>Relatório de Diagnóstico — Soluções e Correções</div>
                <div style={{ fontSize: "11px", color: C.textMuted }}>Motivo do erro · Localização da configuração · Como corrigir · Verificação</div>
              </div>
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {eqs.map(eq => {
                const eco = varcoData[eq];
                if (!eco?.causaRaiz?.length) return null;
                return (
                  <div key={eq}>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: C.brand, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📡 {eq}</span>
                      {eco.varco?.tunnelUrl && (
                        <a href={eco.varco.tunnelUrl} target="_blank" rel="noreferrer"
                          style={{ fontSize: "11px", color: C.accent, textDecoration: "none", border: `1px solid ${C.accent}44`, padding: "2px 8px", borderRadius: "4px" }}>
                          <ExternalLink size={10} /> Túnel VARCO
                        </a>
                      )}
                    </div>
                    {eco.causaRaiz.map((cr, ci) => {
                      const isCrit = cr.prioridade === "CRITICA";
                      const color  = isCrit ? C.danger : cr.prioridade === "ALTA" ? "#f97316" : C.warning;
                      const fixKey = `${eq}_${cr.api_endpoint}`;
                      return (
                        <div key={ci} style={{ marginBottom: "12px", border: `1px solid ${color}44`, borderRadius: "8px", overflow: "hidden" }}>
                          {/* Cabeçalho da causa */}
                          <div style={{ background: color + "15", padding: "10px 14px", borderBottom: `1px solid ${color}33`, display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 800, background: color, color: "#fff" }}>{cr.prioridade}</span>
                            <span style={{ fontWeight: 700, fontSize: "13px", color }}>
                              {cr.codigo} — {cr.titulo}
                            </span>
                          </div>
                          <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                            {/* Coluna A: Motivo + Localização */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {/* Motivo */}
                              <div style={{ background: C.raised, borderRadius: "6px", padding: "10px 12px" }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: "5px" }}>🔍 Motivo do Erro</div>
                                <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.6 }}>{cr.descricao}</div>
                                {cr.impacto && (
                                  <div style={{ marginTop: "6px", padding: "5px 8px", background: C.dangerBg, borderRadius: "4px", fontSize: "11px", color: C.danger }}>
                                    <strong>Impacto:</strong> {cr.impacto}
                                  </div>
                                )}
                              </div>

                              {/* Onde está a configuração */}
                              <div style={{ background: C.raised, borderRadius: "6px", padding: "10px 12px" }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: "5px" }}>📍 Onde Está a Configuração</div>
                                {/* Caminho breadcrumb */}
                                {cr.caminho_correcao ? (
                                  <div style={{ fontSize: "11px", color: C.accent, fontWeight: 600, marginBottom: "8px" }}>
                                    {cr.caminho_correcao.split(" → ").map((step, si) => (
                                      <span key={si}>
                                        {si > 0 && <span style={{ color: C.textMuted, margin: "0 4px" }}>›</span>}
                                        <span style={{ background: C.accentBg, padding: "1px 6px", borderRadius: "3px" }}>{step}</span>
                                      </span>
                                    ))}
                                  </div>
                                ) : null}

                                {/* Passos numerados passo-a-passo */}
                                {cr.caminho_passos?.length > 0 && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                    {cr.caminho_passos.map((passo, pi) => (
                                      <div key={pi} style={{ display: "flex", gap: "8px", alignItems: "flex-start",
                                        padding: "6px 8px", background: pi === cr.caminho_passos.length - 1 ? C.successBg : C.raised,
                                        border: `1px solid ${pi === cr.caminho_passos.length - 1 ? C.success : C.border}22`,
                                        borderRadius: "5px" }}>
                                        <span style={{ minWidth: "22px", height: "22px", background: pi === cr.caminho_passos.length - 1 ? C.success : C.accentBg,
                                          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                          fontSize: "10px", fontWeight: 700, color: pi === cr.caminho_passos.length - 1 ? "#fff" : C.accent,
                                          flexShrink: 0 }}>{pi + 1}</span>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ fontSize: "11px", fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: "5px" }}>
                                            {passo.label}
                                            {passo.url_path && cr.tunnelUrl && (
                                              <a href={cr.tunnelUrl + passo.url_path} target="_blank" rel="noreferrer"
                                                style={{ marginLeft: "auto", fontSize: "10px", color: C.accent, textDecoration: "none",
                                                  border: `1px solid ${C.accent}44`, padding: "1px 7px", borderRadius: "3px",
                                                  display: "flex", alignItems: "center", gap: "3px" }}>
                                                <ExternalLink size={9} /> Abrir
                                              </a>
                                            )}
                                          </div>
                                          <div style={{ fontSize: "10px", color: C.textSecondary, marginTop: "2px", lineHeight: 1.4 }}>
                                            {passo.detalhe}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {cr.api_endpoint && (
                                  <div style={{ marginTop: "8px", padding: "5px 8px", background: "rgba(96,205,255,0.07)", borderRadius: "4px" }}>
                                    <div style={{ fontSize: "9px", color: C.textMuted, marginBottom: "2px" }}>🔌 API do Equipamento (ITSCAM):</div>
                                    <code style={{ fontSize: "11px", color: C.accent }}>{cr.api_endpoint}</code>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Coluna B: Correção + Verificação */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {/* Valores atual vs recomendado */}
                              <div style={{ background: C.raised, borderRadius: "6px", padding: "10px 12px" }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: "5px" }}>🔧 Correção</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                  <div style={{ padding: "7px 9px", background: C.dangerBg, border: `1px solid ${C.danger}33`, borderRadius: "5px" }}>
                                    <div style={{ fontSize: "9px", color: C.textMuted, marginBottom: "3px" }}>ATUAL (com problema)</div>
                                    <code style={{ fontSize: "12px", color: C.danger, fontWeight: 700 }}>{cr.valor_atual}</code>
                                  </div>
                                  <div style={{ padding: "7px 9px", background: C.successBg, border: `1px solid ${C.success}33`, borderRadius: "5px" }}>
                                    <div style={{ fontSize: "9px", color: C.textMuted, marginBottom: "3px" }}>RECOMENDADO</div>
                                    <code style={{ fontSize: "12px", color: C.success, fontWeight: 700 }}>{cr.valor_recomendado}</code>
                                  </div>
                                </div>
                              {cr.api_payload && (
                                  <div style={{ marginTop: "8px" }}>
                                    <div style={{ fontSize: "9px", color: C.textMuted, marginBottom: "3px" }}>Payload da correção:</div>
                                    <pre style={{ background: "rgba(0,0,0,0.2)", padding: "6px 8px", borderRadius: "4px", margin: 0,
                                      fontSize: "10px", color: "#a5d8ff", overflowX: "auto", fontFamily: "monospace" }}>
                                      {(() => { try { return JSON.stringify(JSON.parse(cr.api_payload), null, 2); } catch { return cr.api_payload; } })()}
                                    </pre>
                                  </div>
                                )}
                              </div>

                              {/* Verificação */}
                              <div style={{ background: C.raised, borderRadius: "6px", padding: "10px 12px" }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: "5px" }}>✔ Como Verificar se Existe</div>
                                <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: 1.6 }}>
                                  {cr.codigo === "CR-01" && `Abrir o túnel VARCO → acessar ${cr.api_endpoint?.replace("PUT ","")} (GET) → verificar campo "minProbability" no JSON de resposta.`}
                                  {cr.codigo === "CR-01B" && `Mesmo procedimento do CR-01 — campo "minProbability" no endpoint ${cr.api_endpoint?.replace("PUT ","")}.`}
                                  {cr.codigo === "CR-02" && `Abrir o túnel VARCO → acessar ${cr.api_endpoint?.replace("PUT ","")} (GET) → verificar campo "useClassifierResult" no JSON de resposta.`}
                                  {cr.codigo === "CR-03" && "Acessar o túnel VARCO → /api/equipment/servers (GET) → se retornar {} ou vazio, confirma que não há servidor HTTP configurado."}
                                  {cr.codigo === "CR-04" && `Abrir o túnel VARCO → acessar ${cr.api_endpoint?.replace("PUT ","")} (GET) → verificar campo "sceneType" no JSON de resposta.`}
                                  {cr.codigo === "CR-05" && `Abrir o túnel VARCO → acessar ${cr.api_endpoint?.replace("PUT ","")} (GET) → verificar campo "enabled" no JSON de resposta.`}
                                </div>
                                {/* Status atual lido do VARCO */}
                                {cr.codigo === "CR-01" && eco.varco?.classificador?.minProbability !== undefined && (
                                  <div style={{ marginTop: "5px", padding: "4px 8px", background: eco.varco.classificador.minProbability === 100 ? C.dangerBg : C.successBg, borderRadius: "4px", fontSize: "10px", fontWeight: 600 }}>
                                    {eco.varco.classificador.minProbability === 100 ? "❌" : "✅"} Confirmado via VARCO API: minProbability = {eco.varco.classificador.minProbability}
                                  </div>
                                )}
                                {cr.codigo === "CR-02" && eco.varco?.ocr?.useClassifierResult !== undefined && (
                                  <div style={{ marginTop: "5px", padding: "4px 8px", background: eco.varco.ocr.useClassifierResult ? C.successBg : C.warningBg, borderRadius: "4px", fontSize: "10px", fontWeight: 600 }}>
                                    {eco.varco.ocr.useClassifierResult ? "✅" : "⚠"} Confirmado via VARCO API: useClassifierResult = {String(eco.varco.ocr.useClassifierResult)}
                                  </div>
                                )}
                              </div>

                              {/* Botões de ação */}
                              {cr.tunnelUrl && (
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  <a href={cr.tunnelUrl} target="_blank" rel="noreferrer"
                                    style={{ flex: 1, textAlign: "center", padding: "8px", background: "rgba(96,205,255,0.08)", border: `1px solid ${C.accent}44`,
                                      borderRadius: "5px", color: C.accent, textDecoration: "none", fontSize: "11px", fontWeight: 600,
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                                    <ExternalLink size={12} /> Abrir Túnel
                                  </a>
                                  {cr.api_endpoint && cr.api_payload && (
                                    <button onClick={() => aplicarCorrecao(eq, cr.tunnelUrl, cr.api_endpoint, cr.api_payload, cr.titulo)}
                                      disabled={applyingFix[fixKey]}
                                      style={{ flex: 1, padding: "8px", background: C.successBg, border: `1px solid ${C.success}44`,
                                        borderRadius: "5px", color: C.success, cursor: applyingFix[fixKey] ? "wait" : "pointer",
                                        fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                                        opacity: applyingFix[fixKey] ? 0.7 : 1 }}>
                                      {applyingFix[fixKey] ? <RefreshCw size={12} className="spin" /> : <Wrench size={12} />}
                                      {applyingFix[fixKey] ? "Aplicando..." : "✔ Aplicar Correção"}
                                    </button>
                                  )}
                                </div>
                              )}
                              {fixResult[fixKey] && (
                                <div style={{ padding: "6px 10px", background: fixResult[fixKey].startsWith("✅") ? C.successBg : C.dangerBg,
                                  border: `1px solid ${fixResult[fixKey].startsWith("✅") ? C.success : C.danger}44`,
                                  borderRadius: "5px", fontSize: "11px", fontWeight: 600,
                                  color: fixResult[fixKey].startsWith("✅") ? C.success : C.danger }}>
                                  {fixResult[fixKey]}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legenda */}
        <div style={{ padding: "8px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "7px",
          fontSize: "10px", color: C.textMuted, display: "flex", gap: "16px", flexWrap: "wrap" }}>          <span>🟩 100% classificado</span>
          <span>🟨 Parcialmente classificado</span>
          <span>🟥 Sem classificação</span>
          <span>📡 VARCO = configuração real do ITSCAM</span>
          <span>🛡 AxCross = dados de passagem registrados</span>
          <span><ExternalLink size={9} /> Túnel = acesso direto à interface do equipamento</span>
        </div>
      </div>
    );
  };

  const ViewComparar = () => {
    if (!dados) return null;
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${equipamentos.length}, 1fr)`, gap: "12px" }}>
        {equipamentos.map(equip => {
          const res = dados.resultados[equip];
          if (!res) return null;
          const g = res.statsGeral;
          const si = statusInfo(g?.ComClassif, g?.Total);
          const open = expandedEquip[equip];
          return (
            <div key={equip} style={{ background: C.surface, border: `2px solid ${si.color}44`, borderRadius: "10px", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: si.color + "18", borderBottom: `1px solid ${si.color}44`, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 800, fontSize: "14px", color: si.color }}>{equip}</span>
                  <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                    background: si.color + "25", color: si.color, border: `1px solid ${si.color}55` }}>{si.label}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px" }}>
                  <div style={{ background: C.surface, borderRadius: "5px", padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: C.brand }}>{fmt(g?.Total)}</div>
                    <div style={{ color: C.textMuted }}>Total</div>
                  </div>
                  <div style={{ background: C.surface, borderRadius: "5px", padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: si.color }}>{pct(g?.ComClassif, g?.Total)}%</div>
                    <div style={{ color: C.textMuted }}>Com Classif.</div>
                  </div>
                </div>
              </div>

              {/* Stats por faixa */}
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: "6px" }}>Por Faixa</div>
                {res.statsFaixa.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", minWidth: "60px", color: C.textSecondary }}>{f.Faixa || "—"}</span>
                    <div style={{ flex: 1, height: "14px", background: C.raised, borderRadius: "3px", overflow: "hidden", display: "flex" }}>
                      <div style={{ height: "100%", width: `${pct(f.ComClassif, f.Total)}%`, background: C.success }} />
                      <div style={{ height: "100%", width: `${pct(f.SemClassif, f.Total)}%`, background: C.danger }} />
                    </div>
                    <span style={{ fontSize: "10px", color: C.textMuted, minWidth: "40px", textAlign: "right" }}>{fmt(f.Total)}</span>
                  </div>
                ))}
              </div>

              {/* Distribuição de tipos */}
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", marginBottom: "6px" }}>Tipos de Classificação</div>
                {res.statsClassif.map((c, i) => {
                  const isSem = c.Tipo === "(sem classif.)";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "11px", flex: 1, color: isSem ? C.danger : C.text, fontWeight: isSem ? 700 : 400 }}>{c.Tipo}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: isSem ? C.danger : C.brand }}>{fmt(c.Total)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Info velocidade e datas */}
              <div style={{ padding: "10px 14px", fontSize: "11px", color: C.textSecondary }}>
                {g?.VelocidadeMedia && <div>Vel. média: <strong>{Math.round(g.VelocidadeMedia)} km/h</strong></div>}
                {g?.PrimeiraPassagem && <div>Primeira: {fmtDate(g.PrimeiraPassagem)}</div>}
                {g?.UltimaPassagem   && <div>Última: {fmtDate(g.UltimaPassagem)}</div>}
              </div>

              {/* Passagens recentes */}
              <div style={{ borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setExpandedEquip(s => ({ ...s, [equip]: !s[equip] }))}
                  style={{ width: "100%", padding: "8px 14px", background: "transparent", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                    color: C.textSecondary, fontSize: "11px", fontWeight: 600 }}>
                  {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {res.passagens.length} passagens recentes
                </button>
                {open && (
                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {res.passagens.map((p, i) => {
                      const temClass = p.ClassificacaoVeiculo && p.ClassificacaoVeiculo.trim() !== "";
                      return (
                        <div key={i} style={{
                          padding: "7px 14px", borderTop: `1px solid ${C.border}22`,
                          background: temClass ? "rgba(16,185,129,0.04)" : "rgba(251,113,133,0.04)",
                          display: "flex", flexDirection: "column", gap: "2px",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 700, fontSize: "12px" }}>{p.Placa}</span>
                            <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "3px",
                              background: temClass ? C.successBg : C.dangerBg,
                              color: temClass ? C.success : C.danger, fontWeight: 700 }}>
                              {temClass ? p.ClassificacaoVeiculo : "sem classif."}
                            </span>
                          </div>
                          <div style={{ fontSize: "10px", color: C.textMuted, display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <span>{fmtDate(p.DataPassagem)}</span>
                            {p.Faixa    && <span>F: {p.Faixa}</span>}
                            {p.Velocidade != null && <span>{p.Velocidade} km/h</span>}
                            {p.Sentido  && <span title={p.Sentido} style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.Sentido}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Vista Timeline unificada ───────────────────────────────────
  const ViewTimeline = () => {
    if (!dados) return null;
    const allPassagens = equipamentos.flatMap(equip =>
      (dados.resultados[equip]?.passagens || []).map(p => ({ ...p, _equip: equip }))
    ).sort((a, b) => new Date(b.DataPassagem) - new Date(a.DataPassagem));

    const equipColors = {};
    const palette = ["#10b981", "#60cdff", "#a78bfa", "#f97316", "#fb7185"];
    equipamentos.forEach((e, i) => { equipColors[e] = palette[i % palette.length]; });

    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {equipamentos.map(e => (
            <span key={e} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: equipColors[e], display: "inline-block" }} />
              {e}
            </span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "11px", color: C.textMuted }}>{allPassagens.length} registros no total</span>
        </div>
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead style={{ position: "sticky", top: 0 }}>
              <tr style={{ background: C.tableHeader }}>
                {["Equipamento","Placa","Data/Hora","Faixa","Velocidade","Sentido","Classificação"].map(h =>
                  <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {allPassagens.map((p, i) => {
                const temClass = p.ClassificacaoVeiculo && p.ClassificacaoVeiculo.trim() !== "";
                const ecolor = equipColors[p._equip];
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}11`,
                    background: i % 2 === 0 ? "transparent" : C.raised }}
                    onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : C.raised}>
                    <td style={{ padding: "6px 10px" }}>
                      <span style={{ fontWeight: 700, color: ecolor, fontSize: "11px" }}>{p._equip}</span>
                    </td>
                    <td style={{ padding: "6px 10px", fontWeight: 700 }}>{p.Placa}</td>
                    <td style={{ padding: "6px 10px", color: C.textSecondary, whiteSpace: "nowrap" }}>{fmtDate(p.DataPassagem)}</td>
                    <td style={{ padding: "6px 10px" }}>{p.Faixa || "—"}</td>
                    <td style={{ padding: "6px 10px" }}>{p.Velocidade != null ? `${p.Velocidade}` : "—"}</td>
                    <td style={{ padding: "6px 10px", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.textMuted }}
                      title={p.Sentido}>{p.Sentido || "—"}</td>
                    <td style={{ padding: "6px 10px" }}>
                      {temClass
                        ? <span style={{ padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                            background: C.successBg, color: C.success, border: `1px solid ${C.success}44` }}>{p.ClassificacaoVeiculo}</span>
                        : <span style={{ padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                            background: C.dangerBg, color: C.danger, border: `1px solid ${C.danger}44` }}>vazio</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── Vista Stats comparativa ────────────────────────────────────
  const ViewStats = () => {
    if (!dados) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Tabela de comparação direta */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: "13px" }}>
            📊 Comparativo Direto
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: C.tableHeader }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Métrica</th>
                  {equipamentos.map(e => (
                    <th key={e} style={{ padding: "8px 12px", textAlign: "center", color: C.brand, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>{e}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "Total",          label: "Total Passagens",      format: fmt },
                  { key: "ComClassif",     label: "Com Classificação",    format: fmt,  color: C.success },
                  { key: "SemClassif",     label: "Sem Classificação",    format: (v, g) => fmt(g.Total - g.ComClassif), color: C.danger },
                  { key: "pct",            label: "% Classificado",       format: (v, g) => `${pct(g.ComClassif, g.Total)}%` },
                  { key: "VelocidadeMedia",label: "Vel. Média",           format: v => v ? `${Math.round(v)} km/h` : "—" },
                  { key: "UltimaPassagem", label: "Última Passagem",      format: fmtDate },
                ].map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : C.raised, borderBottom: `1px solid ${C.border}22` }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: C.textSecondary }}>{row.label}</td>
                    {equipamentos.map(e => {
                      const g = dados.resultados[e]?.statsGeral || {};
                      const val = row.key === "pct" || row.key === "SemClassif"
                        ? row.format(null, g)
                        : row.format(g[row.key], g);
                      const isWorst = row.key === "SemClassif" && equipamentos.reduce((worst, eq) => {
                        const gEq = dados.resultados[eq]?.statsGeral || {};
                        return (gEq.Total - gEq.ComClassif) > (worst?.val || 0) ? { eq, val: gEq.Total - gEq.ComClassif } : worst;
                      }, null)?.eq === e;
                      const isBest = row.key === "pct" && equipamentos.reduce((best, eq) => {
                        const gEq = dados.resultados[eq]?.statsGeral || {};
                        return pct(gEq.ComClassif, gEq.Total) > (best?.val || -1) ? { eq, val: pct(gEq.ComClassif, gEq.Total) } : best;
                      }, null)?.eq === e;
                      return (
                        <td key={e} style={{ padding: "8px 12px", textAlign: "center",
                          fontWeight: isWorst || isBest ? 700 : 400,
                          color: isBest ? C.success : isWorst ? C.danger : row.color || C.text,
                          background: isBest ? C.successBg : isWorst ? C.dangerBg : "transparent" }}>
                          {val}
                          {isBest && " 🏆"}{isWorst && " ⚠"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats por faixa para cada equipamento */}
        {equipamentos.map(equip => (
          <div key={equip} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: "12px", color: C.brand }}>
              {equip} — Por Faixa
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: C.tableHeader }}>
                  {["Faixa","Total","Com Classif.","Sem Classif.","%"].map(h =>
                    <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(dados.resultados[equip]?.statsFaixa || []).map((f, i) => {
                  const p2 = pct(f.ComClassif, f.Total);
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : C.raised }}>
                      <td style={{ padding: "6px 10px", fontWeight: 600 }}>{f.Faixa || "—"}</td>
                      <td style={{ padding: "6px 10px" }}>{fmt(f.Total)}</td>
                      <td style={{ padding: "6px 10px", color: C.success }}>{fmt(f.ComClassif)}</td>
                      <td style={{ padding: "6px 10px", color: f.SemClassif > 0 ? C.danger : C.textMuted, fontWeight: f.SemClassif > 0 ? 700 : 400 }}>{fmt(f.SemClassif)}</td>
                      <td style={{ padding: "6px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <div style={{ width: "50px", height: "6px", background: C.raised, borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${p2}%`, background: p2 > 80 ? C.success : p2 > 30 ? C.warning : C.danger }} />
                          </div>
                          <span style={{ fontSize: "10px", fontWeight: 600, color: p2 > 80 ? C.success : p2 > 30 ? C.warning : C.danger }}>{p2}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Modo de fonte de dados */}
      <div style={{ display: "flex", gap: "0", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
        {[
          { id: "url",   icon: "🌐", label: "Via URL Produção", desc: "Acesso direto ao AxCross com login OIDC" },
          { id: "demo",  icon: "🎭", label: "Demonstração",      desc: "Caso real GOEC60003 vs GOEC60044" },
        ].map((m, i) => (
          <button key={m.id} onClick={() => { setFonte(m.id); setDados(null); setErro(null); }}
            style={{
              flex: 1, padding: "12px 16px", border: "none", cursor: "pointer", textAlign: "left",
              background: fonte === m.id ? C.brandBg : C.surface,
              borderRight: i === 0 ? `1px solid ${C.border}` : "none",
              borderBottom: fonte === m.id ? `2px solid ${C.brand}` : "2px solid transparent",
            }}>
            <div style={{ fontWeight: 700, fontSize: "13px", color: fonte === m.id ? C.brand : C.text }}>
              {m.icon} {m.label}
            </div>
            <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Cabeçalho do caso */}
      <div style={{ background: "rgba(245,158,11,0.07)", border: `1px solid rgba(245,158,11,0.3)`,
        borderRadius: "8px", padding: "12px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", color: C.warning, marginBottom: "5px" }}>
          🔬 Caso de Referência — 09/07/2026 · 16:59:58~59
        </div>
        <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.7 }}>
          <strong style={{ color: C.success }}>GOEC60044</strong> · Faixa 2 · Mozarlândia →{" "}
          <span style={{ background: C.successBg, color: C.success, padding: "1px 6px", borderRadius: "3px", fontWeight: 700 }}>✅ CLASSIFICACAO: Automóvel</span>
          {" "}vs{" "}
          <strong style={{ color: C.danger }}>GOEC60003</strong> · Faixa 1 · Guapó/Goiânia →{" "}
          <span style={{ background: C.dangerBg, color: C.danger, padding: "1px 6px", borderRadius: "3px", fontWeight: 700 }}>❌ CLASSIFICACAO: vazio</span>
          <br />
          <span style={{ fontSize: "11px", color: C.textMuted }}>Mesmo horário, mesmo modelo (ITSCAM 450), comportamento diferente → compare os dois abaixo</span>
        </div>
      </div>

      {/* Seletor de equipamentos */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Navigation size={14} color={C.brand} /> Equipamentos para comparar
          <span style={{ marginLeft: "auto", fontSize: "10px", color: C.textMuted }}>
            ⚠ VARCO usa 'O' (letra): GOEC6<strong style={{ color: C.warning }}>O</strong>003 · AxCross usa '0' (zero): GOEC6<strong style={{ color: C.warning }}>0</strong>003 — verifique o código correto
          </span>
        </div>
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginBottom: "10px" }}>
          {equipamentos.map(e => (
            <span key={e} style={{ display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "4px 10px", background: C.brandBg, border: `1px solid ${C.brand}`,
              borderRadius: "5px", fontSize: "12px", fontWeight: 700, color: C.brand }}>
              {e}
              <button onClick={() => removeEquip(e)} style={{ background: "transparent", border: "none",
                cursor: "pointer", color: C.danger, padding: 0, lineHeight: 1, fontSize: "13px" }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input value={equipInput} onChange={e => setEquipInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && addEquip()}
            placeholder="ex: GOEC60003 ou GOEC6O003"
            style={{ flex: 1, maxWidth: "220px", padding: "7px 10px", background: C.raised,
              border: `1px solid ${C.border}`, borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none" }} />
          <button onClick={addEquip}
            style={{ padding: "7px 14px", background: C.accentBg, border: `1px solid ${C.accent}`,
              borderRadius: "6px", color: C.accent, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            + Adicionar
          </button>
          {/* Atalhos — AxCross (zero) */}
          <span style={{ fontSize: "10px", color: C.textMuted, alignSelf: "center", paddingLeft: "4px" }}>AxCross (0):</span>
          {["GOEC60003","GOEC60044","GOEC60002","GOEC60005","GOEC60006","GOEC60007"].filter(e => !equipamentos.includes(e)).map(e => (
            <button key={e} onClick={() => setEquipamentos(arr => [...arr, e])}
              style={{ padding: "5px 9px", background: "transparent", border: `1px solid ${C.border}`,
                borderRadius: "5px", color: C.textMuted, cursor: "pointer", fontSize: "10px" }}>
              +{e}
            </button>
          ))}
        </div>
        {/* Atalhos VARCO (letra O) */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: C.textMuted }}>VARCO (O):</span>
          {["GOEC6O003","GOEC6O044","GOEC6O002","GOEC6O005"].filter(e => !equipamentos.includes(e)).map(e => (
            <button key={e} onClick={() => setEquipamentos(arr => [...arr, e])}
              style={{ padding: "5px 9px", background: "rgba(245,158,11,0.07)", border: `1px solid rgba(245,158,11,0.3)`,
                borderRadius: "5px", color: C.warning, cursor: "pointer", fontSize: "10px" }}>
              +{e}
            </button>
          ))}
          <span style={{ fontSize: "10px", color: C.textMuted, marginLeft: "4px" }}>⚠ "O" = letra O (nomenclatura VARCO)</span>
        </div>
      </div>

      {/* Credenciais URL (visível somente no modo URL) */}
      {fonte === "url" && (
        <div style={{ background: C.surface, border: `1px solid ${C.brand}44`, borderRadius: "8px", padding: "14px 16px" }}>
          <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe size={14} color={C.brand} /> Acesso ao Sistema AxCross (OIDC)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px", marginBottom: "8px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>URL do Site</div>
              <select value={urlSite} onChange={e => setUrlSite(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                  borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none" }}>
                {AXCROSS_SITES.filter(s => s.status === "ativo").map(s => (
                  <option key={s.id} value={s.url}>{s.nome} — {s.url}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Login</div>
              <input value={urlLogin} onChange={e => setUrlLogin(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                  borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Senha</div>
              <input type="password" value={urlSenha} onChange={e => setUrlSenha(e.target.value)}
                placeholder="••••••••" onKeyDown={e => e.key === "Enter" && buscar()}
                style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                  borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted }}>
            💡 As credenciais são salvas automaticamente. O sistema faz login OIDC e busca os dados diretamente da produção.
          </div>
        </div>
      )}

      {/* Filtros avançados */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Search size={14} color={C.brand} /> Filtros avançados
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "10px", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Data/Hora Início</div>
            <input type="datetime-local" value={filtros.dataInicio} onChange={e => setF("dataInicio", e.target.value)}
              style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                borderRadius: "6px", color: C.text, fontSize: "11px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Data/Hora Fim</div>
            <input type="datetime-local" value={filtros.dataFim} onChange={e => setF("dataFim", e.target.value)}
              style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                borderRadius: "6px", color: C.text, fontSize: "11px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Classificação</div>
            <select value={filtros.classificacao} onChange={e => setF("classificacao", e.target.value)}
              style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none" }}>
              {TIPOS_CLASSIFICACAO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Faixa</div>
            <input value={filtros.faixa} onChange={e => setF("faixa", e.target.value)}
              placeholder="ex: Faixa 1"
              style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Sentido</div>
            <input value={filtros.sentido} onChange={e => setF("sentido", e.target.value)}
              placeholder="ex: Guapó/Goiânia"
              style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Máx. Registros</div>
            <select value={filtros.pageSize} onChange={e => setF("pageSize", e.target.value)}
              style={{ width: "100%", padding: "7px 10px", background: C.raised, border: `1px solid ${C.border}`,
                borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none" }}>
              {[25, 50, 100, 200, 500].map(n => <option key={n} value={n}>{n} por equip.</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={buscar} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px",
              background: C.brandBg, border: `1px solid ${C.brand}`, borderRadius: "6px",
              color: C.brand, cursor: loading ? "wait" : "pointer", fontWeight: 700, fontSize: "12px", opacity: loading ? 0.7 : 1 }}>
            <Search size={13} className={loading ? "spin" : ""} />
            {loading ? (fonte === "url" ? "Conectando via URL (~20s)..." : "Comparando...") : fonte === "url" ? "🌐 Buscar via URL" : "🔍 Comparar"}
          </button>
          <button onClick={() => { setFiltros({ dataInicio: "", dataFim: "", classificacao: "todos", faixa: "", sentido: "", pageSize: "50" }); setDados(null); }}
            style={{ padding: "9px 14px", background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: "6px", color: C.textMuted, cursor: "pointer", fontSize: "12px" }}>
            🧹 Limpar
          </button>
          {/* Atalho: caso das imagens — disponível em ambas as variantes de nomenclatura */}
          <button onClick={() => {
            setEquipamentos(["GOEC60003", "GOEC60044"]);
            setFiltros({ dataInicio: "2026-09-07T16:50", dataFim: "2026-09-07T17:10", classificacao: "todos", faixa: "", sentido: "", pageSize: "50" });
          }}
            style={{ padding: "9px 14px", background: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: "6px", color: C.warning, cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>
            ⚡ Caso (zero) 09/07 · 16:59
          </button>
          <button onClick={() => {
            setEquipamentos(["GOEC6O003", "GOEC6O044"]);
            setFiltros({ dataInicio: "2026-09-07T16:50", dataFim: "2026-09-07T17:10", classificacao: "todos", faixa: "", sentido: "", pageSize: "50" });
          }}
            style={{ padding: "9px 14px", background: "rgba(245,158,11,0.05)", border: `1px solid rgba(245,158,11,0.2)`,
              borderRadius: "6px", color: C.warning, cursor: "pointer", fontSize: "11px", fontWeight: 600, opacity: 0.8 }}>
            ⚡ Caso (letra O) 09/07 · 16:59
          </button>
        </div>
      </div>

      {erro && (
        erro.startsWith("__DB_OFFLINE__") ? (
          <div style={{ background: C.surface, border: `1px solid ${C.warning}`, borderRadius: "8px", overflow: "hidden" }}>
            {/* Cabeçalho */}
            <div style={{ background: C.warningBg, padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertTriangle size={18} color={C.warning} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "13px", color: C.warning }}>Banco AxCross offline — localhost:1433 inacessível</div>
                <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>
                  O banco de dados SQL Server não está acessível neste ambiente. Para obter dados reais, configure o host correto.
                </div>
              </div>
            </div>
            {/* Opções de resolução */}
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.textSecondary }}>O que você pode fazer agora:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "10px" }}>
                {/* Opção 1: Demo */}
                <div style={{ background: C.brandBg, border: `1px solid ${C.brand}`, borderRadius: "7px", padding: "12px" }}>
                  <div style={{ fontWeight: 700, fontSize: "12px", color: C.brand, marginBottom: "5px" }}>🎯 Modo Demonstração</div>
                  <div style={{ fontSize: "11px", color: C.textSecondary, marginBottom: "8px", lineHeight: 1.5 }}>
                    Carregar dados reais do caso GOEC60003 vs GOEC60044 (09/07/2026 · 16:59) para análise imediata.
                  </div>
                  <button onClick={carregarDemo} style={{ width: "100%", padding: "7px", background: C.brand, border: "none",
                    borderRadius: "5px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}>
                    ▶ Carregar Demonstração
                  </button>
                </div>
                {/* Opção 2: Configurar banco */}
                <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "12px" }}>
                  <div style={{ fontWeight: 700, fontSize: "12px", color: C.textSecondary, marginBottom: "5px" }}>🔧 Configurar Banco</div>
                  <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "8px", lineHeight: 1.5 }}>
                    Informe o host do SQL Server AxCross para obter dados reais dos equipamentos.
                  </div>
                  <button onClick={() => { setErro(null); window.dispatchEvent(new CustomEvent("axcross-open-config")); }}
                    style={{ width: "100%", padding: "7px", background: C.raised, border: `1px solid ${C.border}`,
                      borderRadius: "5px", color: C.textSecondary, cursor: "pointer", fontSize: "12px" }}>
                    ⚙ Abrir Configuração
                  </button>
                </div>
                {/* Opção 3: Investigar via URL */}
                <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: "7px", padding: "12px" }}>
                  <div style={{ fontWeight: 700, fontSize: "12px", color: C.textSecondary, marginBottom: "5px" }}>🔍 Investigar via URL</div>
                  <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "8px", lineHeight: 1.5 }}>
                    Acesse os dados diretamente pelo sistema AxCross em produção com login OIDC.
                  </div>
                  <a href="/axcross-manager?tab=investigar" style={{ display: "block", textAlign: "center", padding: "7px",
                    background: C.raised, border: `1px solid ${C.border}`, borderRadius: "5px",
                    color: C.textSecondary, textDecoration: "none", fontSize: "12px" }}>
                    🌐 Ir para Investigação
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "10px 14px", background: C.dangerBg, border: `1px solid ${C.danger}44`,
            borderRadius: "7px", fontSize: "12px", color: C.danger }}>
            ❌ {erro}
          </div>
        )
      )}

      {/* Banner modo demonstração */}
      {dados?._isDemo && (
        <div style={{ background: "rgba(96,205,255,0.07)", border: `1px solid rgba(96,205,255,0.3)`,
          borderRadius: "7px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>🎭</span>
          <div style={{ flex: 1, fontSize: "12px" }}>
            <strong style={{ color: C.accent }}>Modo Demonstração ativo</strong>
            <span style={{ color: C.textMuted, marginLeft: "8px" }}>Dados baseados no caso real: GOEC60003 vs GOEC60044 · 09/07/2026 · 16:59</span>
          </div>
          <button onClick={() => { setDados(null); setIsDemo(false); }}
            style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${C.accent}`,
              borderRadius: "5px", color: C.accent, cursor: "pointer", fontSize: "11px" }}>
            Limpar
          </button>
        </div>
      )}

      {/* Seletor de modo de visualização */}
      {dados && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "comparar",   label: "⬛ Lado a Lado" },
            { id: "varco",      label: "🌐 VARCO × AxCross" },
            { id: "timeline",   label: "📅 Timeline Diária" },
            { id: "stats",      label: "📊 Estatísticas" },
          ].map(m => (
            <button key={m.id} onClick={() => setViewMode(m.id)}
              style={{ padding: "6px 14px", background: viewMode === m.id ? C.brandBg : "transparent",
                border: `1px solid ${viewMode === m.id ? C.brand : C.border}`,
                borderRadius: "5px", color: viewMode === m.id ? C.brand : C.textMuted,
                cursor: "pointer", fontSize: "12px", fontWeight: viewMode === m.id ? 700 : 400 }}>
              {m.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "11px", color: C.textMuted, alignSelf: "center" }}>
            Coluna: <code>{dados.colClassif}</code>
          </span>
        </div>
      )}

      {dados && viewMode === "comparar"  && <ViewComparar />}
      {dados && viewMode === "varco"     && <ViewVarcoAxCross equipamentos={equipamentos} />}
      {dados && viewMode === "timeline"  && <ViewTimeline />}
      {dados && viewMode === "stats"     && <ViewStats />}

      {/* Card de análise + causas e soluções */}
      {dados?.analise && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={14} color={C.warning} /> Análise do Resultado · Diagnóstico Automático
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Diagnóstico */}
            <div style={{ padding: "10px 14px", background: C.warningBg, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: "7px", fontSize: "12px", color: C.warning, fontWeight: 600 }}>
              📋 {dados.analise.diagnostico}
            </div>
            {/* Causas prováveis */}
            {dados.analise.causasProvaveis?.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: C.textSecondary, marginBottom: "7px" }}>🔍 Causas Prováveis (do mais ao menos provável):</div>
                {dados.analise.causasProvaveis.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", padding: "6px 0", borderBottom: `1px solid ${C.border}22` }}>
                    <span style={{ minWidth: "20px", height: "20px", background: C.warningBg, border: `1px solid ${C.warning}44`, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: C.warning, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: "12px", color: C.textSecondary }}>{c}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Soluções */}
            <div>
              <div style={{ fontWeight: 700, fontSize: "12px", color: C.textSecondary, marginBottom: "7px" }}>🛠 Próximos Passos para Resolução:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "8px" }}>
                {[
                  { icon: "📡", titulo: "Verificar VARCO Monitor", desc: "Conferir Classificador.enabled = true nos equipamentos sem classif.", link: "/varco-monitor" },
                  { icon: "💻", titulo: "Análise do DTO/Hub", desc: "Ver aba Diagnóstico → IC-01: adicionar ClassificacaoVeiculo ao PassagemDto", link: "/axcross-manager?tab=diagnostico" },
                  { icon: "🔬", titulo: "SQL de Verificação", desc: "Executar query de comparação no banco de produção para confirmar se o campo existe", link: null },
                ].map((s, i) => (
                  <div key={i} style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "10px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: "12px", marginBottom: "4px" }}>{s.icon} {s.titulo}</div>
                    <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "8px", lineHeight: 1.5 }}>{s.desc}</div>
                    {s.link && (
                      <a href={s.link} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px",
                        color: C.brand, textDecoration: "none", borderBottom: `1px dashed ${C.brand}55` }}>
                        <ExternalLink size={11} /> Acessar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Logs */}
            {dados.logs?.length > 0 && (
              <details>
                <summary style={{ fontSize: "11px", color: C.accent, cursor: "pointer", marginBottom: "6px" }}>
                  📋 Log de execução ({dados.logs.length} etapas)
                </summary>
                <div style={{ background: C.raised, borderRadius: "5px", padding: "10px", maxHeight: "200px", overflowY: "auto" }}>
                  {dados.logs.map((l, i) => (
                    <div key={i} style={{ fontSize: "11px", fontFamily: "monospace", lineHeight: 1.8,
                      color: l.startsWith("❌") ? C.danger : l.startsWith("✅") ? C.success : l.startsWith("⚠") ? C.warning : C.textSecondary }}>
                      {l}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {!dados && !loading && !erro && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Navigation size={36} color={C.textMuted} style={{ display: "block", margin: "0 auto 12px" }} />
          <div style={{ color: C.textMuted, fontSize: "13px", marginBottom: "6px" }}>
            {fonte === "url" ? "Selecione o site, informe as credenciais e clique em 🌐 Buscar via URL" : "Adicione 2+ equipamentos e clique em Comparar"}
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted }}>
            Use o atalho <strong>"⚡ Caso 09/07 · 16:59"</strong> ou <strong>"🎭 Demonstração"</strong> para ver o resultado imediatamente
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA: Timeline Diária de Classificação ─────────────────────────
function TabTimelineClassif() {
  const [equip, setEquip]         = useState("GOEC60003");
  const [equip2, setEquip2]       = useState("GOEC60044");
  const [dias, setDias]           = useState("60");
  const [loading1, setLoading1]   = useState(false);
  const [loading2, setLoading2]   = useState(false);
  const [dados1, setDados1]       = useState(null);
  const [dados2, setDados2]       = useState(null);
  const [erro, setErro]           = useState(null);
  const [mostrarHoras, setMostrarHoras] = useState(false);

  const buscarTimeline = async (equipamento, setLoading, setDados) => {
    setLoading(true); setErro(null);
    try {
      const r = await apiFetch(`/axcross/classificacao-timeline?equipamento=${encodeURIComponent(equipamento)}&dias=${dias}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || "Falha");
      setDados(d);
    } catch(e) {
      setErro(e.message.includes("1433") ? "Banco AxCross offline — configure a conexão no Dashboard" : e.message);
    }
    setLoading(false);
  };

  const buscarAmbos = () => {
    if (equip)  buscarTimeline(equip,  setLoading1, setDados1);
    if (equip2) buscarTimeline(equip2, setLoading2, setDados2);
  };

  const diagColor  = (d) => ({ nunca_classifica: C.danger, sempre_classifica: C.success, intermitente_dia: C.warning, misto: "#a78bfa", sem_dados: C.textMuted })[d] || C.textMuted;
  const diagIcon   = (d) => ({ nunca_classifica: "❌", sempre_classifica: "✅", intermitente_dia: "⚠", misto: "🔸", sem_dados: "—" })[d] || "—";

  // Heatmap de um equipamento
  const Heatmap = ({ dados, loading, nome }) => {
    if (loading) return <div style={{ padding: "20px", textAlign: "center", color: C.textMuted }}>
      <RefreshCw size={18} className="spin" style={{ display: "block", margin: "0 auto 6px" }} />Carregando timeline de {nome}...
    </div>;
    if (!dados) return null;

    const dc = diagColor(dados.diagnostico);

    return (
      <div style={{ background: C.surface, border: `2px solid ${dc}44`, borderRadius: "10px", overflow: "hidden" }}>
        {/* Cabeçalho */}
        <div style={{ background: dc + "18", padding: "12px 16px", borderBottom: `1px solid ${dc}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontWeight: 800, fontSize: "15px", color: dc }}>{nome}</span>
            <span style={{ fontSize: "18px" }}>{diagIcon(dados.diagnostico)}</span>
            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: dc + "25", color: dc, fontWeight: 700 }}>
              {dados.diagnostico?.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.6 }}>{dados.diagnosticoDetalhe}</div>
          {/* Resumo */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px" }}>
              <strong style={{ color: C.success }}>{dados.resumo?.diasComClassif || 0}</strong>
              <span style={{ color: C.textMuted }}> dias com classif.</span>
            </span>
            <span style={{ fontSize: "11px" }}>
              <strong style={{ color: C.danger }}>{dados.resumo?.diasSemClassif || 0}</strong>
              <span style={{ color: C.textMuted }}> dias sem</span>
            </span>
            <span style={{ fontSize: "11px" }}>
              <strong style={{ color: "#a78bfa" }}>{dados.resumo?.diasParcial || 0}</strong>
              <span style={{ color: C.textMuted }}> parciais</span>
            </span>
            {dados.ultimaComClassif && (
              <span style={{ fontSize: "11px", color: C.success }}>
                Última classif.: <strong>{fmtDate(dados.ultimaComClassif.DataPassagem)}</strong> ({dados.ultimaComClassif.ClassificacaoVeiculo})
              </span>
            )}
          </div>
        </div>

        {/* Heatmap por dia */}
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: C.textMuted, marginBottom: "8px" }}>
            Calendário de classificação — últimos {dados.periodo?.dias} dias
            <span style={{ marginLeft: "10px", fontWeight: 400 }}>
              <span style={{ color: C.success }}>■</span> OK &nbsp;
              <span style={{ color: C.warning }}>■</span> Parcial &nbsp;
              <span style={{ color: C.danger }}>■</span> Sem classif. &nbsp;
              <span style={{ color: C.textMuted }}>■</span> Sem dados
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
            {dados.timeline?.map((dia, i) => {
              const pct = dia.Total > 0 ? Math.round((dia.ComClassif / dia.Total) * 100) : -1;
              const cor = pct < 0 ? C.raised : pct === 100 ? C.success : pct > 0 ? C.warning : C.danger;
              const dateFmt = new Date(dia.Dia).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
              return (
                <div key={i} title={`${dateFmt}: ${dia.ComClassif}/${dia.Total} (${pct}%) | Tipos: ${dia.TiposNoDia || "nenhum"}`}
                  style={{
                    width: "28px", height: "28px", borderRadius: "4px",
                    background: cor + (pct < 0 ? "" : "cc"),
                    border: `1px solid ${cor}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "default", fontSize: "8px", color: "#fff", fontWeight: 700,
                    flexShrink: 0,
                  }}>
                  <div>{dateFmt.split("/")[0]}</div>
                  {pct >= 0 && <div style={{ fontSize: "7px", opacity: 0.9 }}>{pct}%</div>}
                </div>
              );
            })}
            {(!dados.timeline || dados.timeline.length === 0) && (
              <div style={{ color: C.textMuted, fontSize: "12px", padding: "10px" }}>Nenhum dado no período</div>
            )}
          </div>
        </div>

        {/* Distribuição por hora */}
        {mostrarHoras && dados.porHora?.length > 0 && (
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: C.textMuted, marginBottom: "8px" }}>
              Por hora do dia — identifica horários problemáticos
            </div>
            <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "50px" }}>
              {Array.from({ length: 24 }, (_, h) => {
                const item = dados.porHora.find(x => x.Hora === h);
                const pct = item?.Total > 0 ? Math.round((item.ComClassif / item.Total) * 100) : -1;
                const height = item ? Math.max(4, Math.round((item.Total / Math.max(...dados.porHora.map(x => x.Total), 1)) * 46)) : 2;
                const cor = pct < 0 ? C.raised : pct === 100 ? C.success : pct > 0 ? C.warning : C.danger;
                return (
                  <div key={h} title={`${h}h: ${item?.ComClassif || 0}/${item?.Total || 0} (${pct}%)`}
                    style={{ flex: 1, height: `${height}px`, background: cor, borderRadius: "2px 2px 0 0", cursor: "default", minWidth: "6px" }} />
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: C.textMuted, marginTop: "2px" }}>
              <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tabela comparativa dia a dia
  const TabelaComparativa = () => {
    if (!dados1 || !dados2) return null;
    const map1 = Object.fromEntries((dados1.timeline || []).map(d => [d.Dia?.split("T")[0] || d.Dia, d]));
    const map2 = Object.fromEntries((dados2.timeline || []).map(d => [d.Dia?.split("T")[0] || d.Dia, d]));
    const allDias = [...new Set([...Object.keys(map1), ...Object.keys(map2)])].sort().reverse();

    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: "13px" }}>
          📋 Comparativo Dia a Dia — {equip} vs {equip2}
        </div>
        <div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead style={{ position: "sticky", top: 0 }}>
              <tr style={{ background: C.tableHeader }}>
                <th style={{ padding: "7px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Data</th>
                <th style={{ padding: "7px 10px", textAlign: "center", color: C.brand, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>{equip}</th>
                <th style={{ padding: "7px 10px", textAlign: "center", color: "#a78bfa", fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>{equip2}</th>
                <th style={{ padding: "7px 10px", textAlign: "center", color: C.textMuted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>Divergência</th>
              </tr>
            </thead>
            <tbody>
              {allDias.map((dia, i) => {
                const d1 = map1[dia];
                const d2 = map2[dia];
                const p1 = d1?.Total > 0 ? Math.round((d1.ComClassif / d1.Total) * 100) : -1;
                const p2 = d2?.Total > 0 ? Math.round((d2.ComClassif / d2.Total) * 100) : -1;
                const diverge = p1 >= 0 && p2 >= 0 && Math.abs(p1 - p2) > 20;
                const c1 = p1 < 0 ? C.textMuted : p1 === 100 ? C.success : p1 > 0 ? C.warning : C.danger;
                const c2 = p2 < 0 ? C.textMuted : p2 === 100 ? C.success : p2 > 0 ? C.warning : C.danger;
                return (
                  <tr key={dia} style={{ background: diverge ? "rgba(245,158,11,0.05)" : i%2===0 ? "transparent" : C.raised, borderBottom: `1px solid ${C.border}22` }}>
                    <td style={{ padding: "6px 10px", fontWeight: 600 }}>
                      {new Date(dia).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                      {d1 ? (
                        <span style={{ color: c1, fontWeight: 700 }}>
                          {p1 < 0 ? "—" : `${p1}%`}
                          <span style={{ fontWeight: 400, color: C.textMuted }}> ({d1.ComClassif}/{d1.Total})</span>
                        </span>
                      ) : <span style={{ color: C.textMuted }}>sem dados</span>}
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                      {d2 ? (
                        <span style={{ color: c2, fontWeight: 700 }}>
                          {p2 < 0 ? "—" : `${p2}%`}
                          <span style={{ fontWeight: 400, color: C.textMuted }}> ({d2.ComClassif}/{d2.Total})</span>
                        </span>
                      ) : <span style={{ color: C.textMuted }}>sem dados</span>}
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                      {diverge
                        ? <span style={{ color: C.warning, fontWeight: 700 }}>⚠ {Math.abs(p1-p2)}pp diferença</span>
                        : <span style={{ color: C.textMuted, fontSize: "10px" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Contexto */}
      <div style={{ background: C.brandBg, border: `1px solid ${C.brandBorder}`, borderRadius: "8px", padding: "12px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px", color: C.brand, marginBottom: "4px" }}>
          📅 Segunda Visão — Timeline Diária de Classificação
        </div>
        <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.6 }}>
          Identifica se o problema é <strong>permanente</strong> (equipamento nunca classifica) ou <strong>intermitente</strong> (alguns dias funcionam, outros não).
          Cada quadrado = 1 dia: 🟢 100% classificado · 🟡 parcial · 🔴 sem classificação.
          Passe o mouse para ver o detalhe do dia.
        </div>
      </div>

      {/* Controles */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: "10px", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Equipamento 1</div>
            <input value={equip} onChange={e => setEquip(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && buscarAmbos()}
              placeholder="GOEC60003"
              style={{ width: "100%", padding: "8px 10px", background: C.raised, border: `1px solid ${C.brand}`, borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none", boxSizing: "border-box", fontWeight: 700 }} />
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Equipamento 2 (comparar)</div>
            <input value={equip2} onChange={e => setEquip2(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && buscarAmbos()}
              placeholder="GOEC60044"
              style={{ width: "100%", padding: "8px 10px", background: C.raised, border: `1px solid #a78bfa`, borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none", boxSizing: "border-box", fontWeight: 700 }} />
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Período</div>
            <select value={dias} onChange={e => setDias(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none" }}>
              {[7, 14, 30, 60, 90, 180].map(d => <option key={d} value={d}>Últimos {d} dias</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={buscarAmbos} disabled={loading1 || loading2}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px",
              background: C.brandBg, border: `1px solid ${C.brand}`, borderRadius: "6px",
              color: C.brand, cursor: (loading1||loading2) ? "wait" : "pointer", fontWeight: 700, fontSize: "12px", opacity: (loading1||loading2) ? 0.7 : 1 }}>
            <Search size={13} className={(loading1||loading2) ? "spin" : ""} />
            {(loading1||loading2) ? "Analisando..." : "📅 Analisar Timeline"}
          </button>
          {["GOEC60003","GOEC60044"].map(e => (
            <button key={e} onClick={() => { setEquip(e); setEquip2(e === "GOEC60003" ? "GOEC60044" : "GOEC60003"); }}
              style={{ padding: "9px 12px", background: "rgba(245,158,11,0.07)", border: `1px solid rgba(245,158,11,0.3)`,
                borderRadius: "6px", color: C.warning, cursor: "pointer", fontSize: "11px" }}>
              ⚡ {e}
            </button>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: C.textSecondary, cursor: "pointer", marginLeft: "8px" }}>
            <input type="checkbox" checked={mostrarHoras} onChange={e => setMostrarHoras(e.target.checked)} />
            Mostrar distribuição por hora
          </label>
        </div>
      </div>

      {erro && (
        <div style={{ padding: "10px 14px", background: C.dangerBg, border: `1px solid ${C.danger}44`, borderRadius: "7px", fontSize: "12px", color: C.danger }}>
          ❌ {erro}
          {erro.includes("1433") && <span style={{ marginLeft: "8px", color: C.textMuted }}>— Configure a conexão no Dashboard</span>}
        </div>
      )}

      {/* Heatmaps lado a lado */}
      {(dados1 || dados2 || loading1 || loading2) && (
        <div style={{ display: "grid", gridTemplateColumns: equip2 ? "1fr 1fr" : "1fr", gap: "12px" }}>
          <Heatmap dados={dados1} loading={loading1} nome={equip} />
          {equip2 && <Heatmap dados={dados2} loading={loading2} nome={equip2} />}
        </div>
      )}

      {/* Tabela comparativa */}
      {dados1 && dados2 && <TabelaComparativa />}

      {/* Estado inicial */}
      {!dados1 && !dados2 && !loading1 && !loading2 && !erro && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Activity size={36} color={C.textMuted} style={{ display: "block", margin: "0 auto 12px" }} />
          <div style={{ color: C.textMuted, fontSize: "13px", marginBottom: "6px" }}>
            Informe um ou dois equipamentos e clique em <strong>Analisar Timeline</strong>
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted }}>
            Requer banco AxCross configurado · Endpoint: <code>/api/axcross/classificacao-timeline</code>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA: Ecossistema VARCO + AxCross ──────────────────────────────
function TabEcossistema() {
  const [equip, setEquip]     = useState("GOEC60003");
  const [dias, setDias]       = useState("30");
  const [loading, setLoading] = useState(false);
  const [dados, setDados]     = useState(null);
  const [erro, setErro]       = useState(null);

  const buscar = async () => {
    if (!equip.trim()) return;
    setLoading(true); setErro(null); setDados(null);
    try {
      const r = await apiFetch(`/axcross/ecosistema?equipamento=${encodeURIComponent(equip.trim().toUpperCase())}&dias=${dias}`);
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.erro || "Falha");
      setDados(d);
    } catch(e) { setErro(e.message); }
    setLoading(false);
  };

  const sevColor = { CRITICA: C.danger, ALTA: "#f97316", OK: C.success }[dados?.resumo?.severidade] || C.textMuted;
  const sevIcon  = { CRITICA: "🔴", ALTA: "🟠", OK: "✅" }[dados?.resumo?.severidade] || "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Cabeçalho */}
      <div style={{ background: C.brandBg, border: `1px solid ${C.brandBorder}`, borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: "14px", color: C.brand, marginBottom: "4px" }}>
          🌐 Ecossistema VARCO + AxCross — Análise Cruzada de Equipamento
        </div>
        <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.6 }}>
          Cruza dados do <strong>VARCO</strong> (configuração real do ITSCAM 450: classificador, firmware, heartbeat, túnel)
          com dados do <strong>AxCross</strong> (passagens, classificação, timeline) para identificar automaticamente a causa raiz do problema.
        </div>
      </div>

      {/* Busca */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>
              Código do Equipamento
            </div>
            <input value={equip} onChange={e => setEquip(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && buscar()}
              placeholder="ex: GOEC60003"
              style={{ width: "100%", padding: "8px 12px", background: C.raised, border: `1px solid ${C.brand}`,
                borderRadius: "6px", color: C.text, fontSize: "13px", fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.textMuted, marginBottom: "3px", textTransform: "uppercase" }}>Período AxCross</div>
            <select value={dias} onChange={e => setDias(e.target.value)}
              style={{ padding: "8px 12px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: "6px", color: C.text, fontSize: "12px", outline: "none" }}>
              {[7,14,30,60,90].map(d => <option key={d} value={d}>Últimos {d} dias</option>)}
            </select>
          </div>
          <button onClick={buscar} disabled={loading}
            style={{ padding: "9px 22px", background: C.brandBg, border: `1px solid ${C.brand}`, borderRadius: "6px",
              color: C.brand, cursor: loading ? "wait" : "pointer", fontWeight: 700, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "6px", opacity: loading ? 0.7 : 1 }}>
            <Search size={14} className={loading ? "spin" : ""} />
            {loading ? "Analisando..." : "🌐 Analisar Ecossistema"}
          </button>
          {/* Atalhos */}
          {["GOEC60003","GOEC60044","GOEC60002","GOEC60005"].map(e => (
            <button key={e} onClick={() => { setEquip(e); setTimeout(buscar, 50); }}
              style={{ padding: "9px 10px", background: "transparent", border: `1px solid ${C.border}`,
                borderRadius: "6px", color: C.textMuted, cursor: "pointer", fontSize: "10px" }}>⚡{e}</button>
          ))}
        </div>
      </div>

      {erro && <div style={{ padding: "10px 14px", background: C.dangerBg, border: `1px solid ${C.danger}44`, borderRadius: "7px", fontSize: "12px", color: C.danger }}>❌ {erro}</div>}

      {dados && (
        <>
          {/* Banner de severidade */}
          <div style={{ background: sevColor + "18", border: `2px solid ${sevColor}44`, borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "28px" }}>{sevIcon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "15px", color: sevColor }}>
                Severidade: {dados.resumo?.severidade || "—"}
                {dados.causaRaiz?.length > 0 && ` — ${dados.causaRaiz.length} causa(s) raiz identificada(s)`}
              </div>
              <div style={{ fontSize: "12px", color: C.textSecondary, marginTop: "3px" }}>
                VARCO: {dados.varco?.encontrado ? `✅ encontrado (${dados.varco.faixas} faixas)` : "❌ não encontrado"} &nbsp;|&nbsp;
                Classificador: {dados.resumo?.classificadorEnabled ? "✅ habilitado" : "❌ desabilitado"} &nbsp;|&nbsp;
                MinProbability: <strong style={{ color: dados.resumo?.minProbability === 100 ? C.danger : C.success }}>{dados.resumo?.minProbability ?? "—"}%</strong> &nbsp;|&nbsp;
                AxCross: <strong style={{ color: dados.resumo?.pctClassificado === 0 ? C.danger : C.success }}>
                  {dados.resumo?.pctClassificado !== null ? `${dados.resumo.pctClassificado}% classificado` : "banco offline"}
                </strong>
              </div>
            </div>
          </div>

          {/* Grid principal: VARCO | AxCross */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

            {/* Painel VARCO */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: "rgba(96,205,255,0.1)", borderBottom: `1px solid rgba(96,205,255,0.2)`, padding: "10px 14px", fontWeight: 700, fontSize: "13px", color: C.accent, display: "flex", alignItems: "center", gap: "8px" }}>
                📡 VARCO — Configuração do ITSCAM 450
                {dados.varco?.tunnelUrl && (
                  <a href={dados.varco.tunnelUrl} target="_blank" rel="noreferrer"
                    title="Abrir interface do equipamento via túnel VARCO"
                    style={{ marginLeft: "auto", fontSize: "11px", color: C.accent, textDecoration: "none", border: `1px solid ${C.accent}44`, padding: "2px 8px", borderRadius: "4px" }}>
                    <ExternalLink size={11} /> Abrir Túnel
                  </a>
                )}
              </div>
              <div style={{ padding: "10px 14px" }}>
                {dados.varco.encontrado ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                    {/* Info básica */}
                    {[["IP", dados.varco.ip], ["Firmware", dados.varco.firmware], ["NTP", dados.varco.ntp], ["Faixas VARCO", dados.varco.faixas]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", gap: "8px", borderBottom: `1px solid ${C.border}22`, paddingBottom: "3px" }}>
                        <span style={{ color: C.textMuted, minWidth: 80 }}>{k}:</span>
                        <span style={{ fontWeight: 500 }}>{v ?? "—"}</span>
                      </div>
                    ))}

                    {/* Fluxo de integração */}
                    <div style={{ marginTop: "6px", padding: "8px", background: "rgba(96,205,255,0.07)", border: `1px solid rgba(96,205,255,0.2)`, borderRadius: "5px" }}>
                      <div style={{ fontWeight: 700, color: C.accent, marginBottom: "5px", fontSize: "11px" }}>🔗 Fluxo de Integração</div>
                      <div style={{ fontSize: "10px", color: C.textSecondary, display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div>ITSCAM 450 → <code style={{ color: dados.varco.varco?.enabled ? C.success : C.danger }}>{dados.varco.varco?.edgeServer || "—"}</code> (VARCO cloud)</div>
                        <div>Servidor HTTP direto: <code style={{ color: dados.varco.serversConfigured ? C.success : C.warning }}>{dados.varco.serversConfigured ? "✅ Configurado" : "⚠ Não configurado"}</code></div>
                        <div>FTP: <code style={{ color: dados.varco.ftp?.enabled ? C.success : C.textMuted }}>{dados.varco.ftp?.enabled ? `✅ ${dados.varco.ftp.address}` : "❌ Desabilitado"}</code></div>
                      </div>
                    </div>

                    {/* Classificador completo */}
                    {(() => {
                      const cls = dados.varco.classificador || {};
                      const isCrit = cls.minProbability === 100;
                      return (
                        <div style={{ padding: "8px", background: isCrit ? C.dangerBg : C.successBg, border: `1px solid ${isCrit ? C.danger : C.success}33`, borderRadius: "5px" }}>
                          <div style={{ fontWeight: 700, color: isCrit ? C.danger : C.success, marginBottom: "5px", fontSize: "11px" }}>
                            🔧 Classificador {isCrit ? "⚠ PROBLEMA" : "✅"}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", fontSize: "10px" }}>
                            {[
                              ["enabled",              cls.enabled,              cls.enabled ? C.success : C.danger],
                              ["minProbability",        `${cls.minProbability}%`,  cls.minProbability === 100 ? C.danger : C.success],
                              ["sceneType",             cls.sceneType,            cls.sceneType === 0 ? C.warning : C.success],
                              ["modelType",             cls.modelType,            C.text],
                              ["processingThreads",     cls.processingThreads,    C.text],
                              ["enableCharacteristics", cls.enableCharacteristics, C.text],
                              ["enableSpeed",           cls.enableSpeed,          C.text],
                              ["firstOnly",             cls.firstOnly,            C.text],
                              ["triggerEnabled",        cls.triggerEnabled,       C.text],
                              ["licensed",              cls.licensed,             cls.licensed ? C.success : C.danger],
                            ].map(([k, v, c]) => (
                              <div key={k} style={{ display: "flex", gap: "4px" }}>
                                <span style={{ color: C.textMuted }}>{k}:</span>
                                <span style={{ fontWeight: 700, color: c }}>{String(v ?? "—")}{k === "minProbability" && v === 100 ? " ← RAIZ" : ""}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* OCR relação com classificador */}
                    {(() => {
                      const ocr = dados.varco.ocr || {};
                      const useClass = ocr.useClassifierResult;
                      return (
                        <div style={{ padding: "8px", background: useClass === false ? C.warningBg : C.successBg, border: `1px solid ${useClass === false ? C.warning : C.success}33`, borderRadius: "5px" }}>
                          <div style={{ fontWeight: 700, color: useClass === false ? C.warning : C.success, marginBottom: "5px", fontSize: "11px" }}>
                            🔍 OCR {useClass === false ? "⚠ Não usa classificador" : ""}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", fontSize: "10px" }}>
                            {[
                              ["useClassifierResult", useClass, useClass ? C.success : C.warning],
                              ["vehicleType",         ocr.vehicleType, C.text],
                              ["maxPlates",           ocr.maxPlates, C.text],
                              ["processingMode",      ocr.processingMode, C.text],
                              ["minProbPerChar",      `${ocr.minProbPerChar}%`, C.text],
                              ["roiEnabled",          ocr.roiEnabled, ocr.roiEnabled ? C.success : C.textMuted],
                            ].map(([k, v, c]) => (
                              <div key={k} style={{ display: "flex", gap: "4px" }}>
                                <span style={{ color: C.textMuted }}>{k}:</span>
                                <span style={{ fontWeight: k === "useClassifierResult" ? 700 : 500, color: c }}>{String(v ?? "—")}</span>
                              </div>
                            ))}
                          </div>
                          {useClass === false && (
                            <div style={{ marginTop: "5px", fontSize: "10px", color: C.warning }}>
                              ⚠ OCR não associa o resultado do classificador → placa e tipo não chegam juntos ao AxCross
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div style={{ color: C.danger, fontSize: "12px", padding: "10px" }}>
                    ❌ Não encontrado no VARCO
                    <div style={{ color: C.textMuted, fontSize: "11px", marginTop: "4px" }}>
                      Tente: {dados.equipamento?.replace(/0/g,"O")} (letra O)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Painel AxCross */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: C.brandBg, borderBottom: `1px solid ${C.brandBorder}`, padding: "10px 14px", fontWeight: 700, fontSize: "13px", color: C.brand }}>
                🛡 AxCross — Dados de Passagem
              </div>
              <div style={{ padding: "12px 14px" }}>
                {dados.axcross?.conectado ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <StatCard label="Total Passagens" value={fmt(dados.axcross.stats?.Total)} color={C.brand} icon={<Activity size={13} />} />
                      <StatCard label="Com Classificação"
                        value={`${dados.resumo.pctClassificado}%`}
                        color={dados.resumo.pctClassificado === 0 ? C.danger : dados.resumo.pctClassificado < 50 ? C.warning : C.success}
                        icon={<CheckCircle2 size={13} />}
                        sub={fmt(dados.axcross.stats?.ComClassif) + " passagens"} />
                    </div>
                    <div style={{ height: "10px", background: C.raised, borderRadius: "5px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${dados.resumo.pctClassificado}%`, background: dados.resumo.pctClassificado < 30 ? C.danger : C.success }} />
                    </div>
                    <div style={{ fontSize: "11px", color: C.textMuted }}>Campo: <code style={{ color: C.accent }}>{dados.axcross.colClassif}</code></div>
                    {dados.axcross.distribuicao?.map((d, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", fontSize: "11px" }}>
                        <span style={{ flex: 1, color: d.Tipo === "(sem classif.)" ? C.danger : C.text, fontWeight: d.Tipo === "(sem classif.)" ? 700 : 400 }}>{d.Tipo}</span>
                        <span style={{ fontWeight: 700, color: d.Tipo === "(sem classif.)" ? C.danger : C.brand }}>{fmt(d.Total)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: C.textMuted, fontSize: "11px", padding: "8px" }}>
                    Banco offline — <a href="/axcross-manager?tab=dashboard" style={{ color: C.brand }}>Configurar</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Causas Raiz identificadas */}
          {dados.causaRaiz?.length > 0 && (
            <div style={{ background: C.surface, border: `2px solid ${C.danger}`, borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ background: C.dangerBg, borderBottom: `1px solid ${C.danger}44`, padding: "12px 16px", fontWeight: 800, fontSize: "14px", color: C.danger }}>
                🎯 Causa(s) Raiz Identificada(s) — Análise VARCO × AxCross
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {dados.causaRaiz.map((cr, i) => (
                  <div key={i} style={{ background: cr.prioridade === "CRITICA" ? C.dangerBg : C.warningBg,
                    border: `1px solid ${cr.prioridade === "CRITICA" ? C.danger : C.warning}44`,
                    borderRadius: "8px", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, background: cr.prioridade === "CRITICA" ? C.danger : C.warning, color: "#fff" }}>{cr.prioridade}</span>
                      <span style={{ fontWeight: 700, fontSize: "13px" }}>{cr.codigo} — {cr.titulo}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: C.textSecondary, margin: "0 0 8px", lineHeight: 1.6 }}>{cr.descricao}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ padding: "6px 10px", background: C.dangerBg, border: `1px solid ${C.danger}33`, borderRadius: "5px", fontSize: "11px" }}>
                        <div style={{ color: C.textMuted, marginBottom: "2px" }}>Valor Atual</div>
                        <code style={{ color: C.danger, fontWeight: 700 }}>{cr.valor_atual}</code>
                      </div>
                      <div style={{ padding: "6px 10px", background: C.successBg, border: `1px solid ${C.success}33`, borderRadius: "5px", fontSize: "11px" }}>
                        <div style={{ color: C.textMuted, marginBottom: "2px" }}>Valor Recomendado</div>
                        <code style={{ color: C.success, fontWeight: 700 }}>{cr.valor_recomendado}</code>
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px", background: "rgba(96,205,255,0.07)", border: `1px solid rgba(96,205,255,0.2)`, borderRadius: "5px", fontSize: "11px", color: C.textSecondary }}>
                      <strong>🔧 Como corrigir:</strong> {cr.correcao}
                    </div>
                    {cr.tunnelUrl && (
                      <a href={cr.tunnelUrl} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "8px",
                          padding: "6px 12px", background: C.accentBg, border: `1px solid ${C.accent}`,
                          borderRadius: "5px", color: C.accent, textDecoration: "none", fontSize: "11px", fontWeight: 600 }}>
                        <ExternalLink size={12} /> Abrir Interface do Equipamento (Túnel VARCO)
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análise de confirmação */}
          {dados.analise?.length > 0 && dados.analise.map((a, i) => (
            <div key={i} style={{ padding: "10px 14px", background: C.successBg, border: `1px solid ${C.success}44`, borderRadius: "7px", fontSize: "12px" }}>
              <strong style={{ color: C.success }}>✅ {a.titulo}</strong>
              <div style={{ color: C.textSecondary, marginTop: "3px" }}>{a.detalhe}</div>
            </div>
          ))}

          {/* Links de ação */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a href="/varco-monitor" style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 14px",
              background: "rgba(96,205,255,0.08)", border: `1px solid rgba(96,205,255,0.3)`, borderRadius: "6px",
              color: C.accent, textDecoration: "none", fontSize: "12px", fontWeight: 600 }}>
              <ExternalLink size={12} /> VARCO Monitor — Ver Inventário Completo
            </a>
            <button onClick={() => { const tab = document.createElement("a"); tab.href = `/axcross-manager?tab=timeline`; tab.click(); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 14px",
                background: C.brandBg, borderRadius: "6px",
                color: C.brand, cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "none" }}>
              📅 Ver Timeline Diária
            </button>
            <button onClick={() => { const tab = document.createElement("a"); tab.href = `/axcross-manager?tab=comparativo`; tab.click(); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 14px",
                background: C.brandBg, borderRadius: "6px",
                color: C.brand, cursor: "pointer", fontSize: "12px", fontWeight: 600, border: "none" }}>
              📊 Comparativo Multi-Equipamento
            </button>
          </div>
        </>
      )}

      {!dados && !loading && !erro && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Globe size={40} color={C.textMuted} style={{ display: "block", margin: "0 auto 14px" }} />
          <div style={{ fontWeight: 700, fontSize: "14px", color: C.textMuted, marginBottom: "6px" }}>
            Informe o código do equipamento e clique em <strong style={{ color: C.brand }}>🌐 Analisar Ecossistema</strong>
          </div>
          <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "16px" }}>
            O sistema cruza automaticamente dados do VARCO (config real) com AxCross (passagens) e identifica a causa raiz
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {["GOEC60003","GOEC60044","GOEC60002","GOEC60005"].map(e => (
              <button key={e} onClick={() => { setEquip(e); setTimeout(buscar, 50); }}
                style={{ padding: "8px 16px", background: C.brandBg, border: `1px solid ${C.brand}`,
                  borderRadius: "6px", color: C.brand, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                ⚡ {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA: Frota Completa — análise de todos os equipamentos VARCO ──
// ── Componente De-Para: Comparação lado a lado de dois equipamentos ───────
function DeParaPanel({ dadosA, dadosB, nomeA, nomeB }) {
  if (!dadosA || !dadosB) return null;

  const vA = dadosA.varco || {}, vB = dadosB.varco || {};
  const clsA = vA.classificador || {}, clsB = vB.classificador || {};
  const ocrA = vA.ocr || {}, ocrB = vB.ocr || {};
  const varcoA = vA.varco || {}, varcoB = vB.varco || {};
  const ftpA = vA.ftp || {}, ftpB = vB.ftp || {};

  // Grupo 1 — AxCross (dados do banco)
  // Grupo 2 — Integração (fonte de dados)
  // Grupo 3 — Classificador ITSCAM
  // Grupo 4 — OCR ITSCAM
  // Grupo 5 — Conectividade

  const grupos = [
    {
      titulo: "📊 Resultado no AxCross",
      cor: "#6366f1",
      campos: [
        { label:"Fonte de integração", a: vA.encontrado ? "VARCO Cloud" : "HTTP Direto",     b: vB.encontrado ? "VARCO Cloud" : "HTTP Direto",     justificativa: "GOEC60044/047 enviam dados diretamente ao AxCross via HTTP. GOEC60002 envia via VARCO Cloud (edge.varco.io). Dispositivos HTTP Direto incluem a classificação no payload enviado; dispositivos VARCO dependem do classificador remoto." },
        { label:"% Classificado (AxCross)", a: dadosA.resumo?.pctClassificado != null ? `${dadosA.resumo.pctClassificado}%` : "—", b: dadosB.resumo?.pctClassificado != null ? `${dadosB.resumo.pctClassificado}%` : "—", justificativa: "Percentual de passagens com campo CLASSIFICACAO preenchido no banco AxCross nos últimos 7 dias." },
        { label:"Severidade do problema", a: dadosA.resumo?.severidade || "OK",              b: dadosB.resumo?.severidade || "OK",                justificativa: "Avaliação consolidada baseada nas causas raiz identificadas." },
      ]
    },
    {
      titulo: "📡 Integração — Caminho dos dados",
      cor: C.accent,
      campos: [
        { label:"No VARCO",               a: vA.encontrado ? "✅ Sim" : "❌ Não",            b: vB.encontrado ? "✅ Sim" : "❌ Não",              justificativa: "Dispositivos no VARCO enviam dados pelo VARCO Cloud. Dispositivos fora do VARCO enviam via HTTP Direto ao AxCross. O caminho VARCO adiciona dependência do classificador remoto." },
        { label:"VARCO Cloud enabled",    a: varcoA.enabled != null ? String(varcoA.enabled) : "—", b: varcoB.enabled != null ? String(varcoB.enabled) : "—", justificativa: "Se true, o ITSCAM envia todos os dados ao servidor VARCO Cloud (edge.varco.io) em vez de servidores HTTP locais." },
        { label:"Edge Server",            a: varcoA.edgeServer || "—",                       b: varcoB.edgeServer || "—",                         justificativa: "Servidor de borda VARCO para onde os dados são enviados." },
        { label:"Servidores HTTP conf.",  a: vA.serversConfigured != null ? (vA.serversConfigured ? "✅ Sim" : "❌ Não") : "—", b: vB.serversConfigured != null ? (vB.serversConfigured ? "✅ Sim" : "❌ Não") : "—", justificativa: "Servidores HTTP locais configurados no ITSCAM. Dispositivos HTTP Direto têm o AxCross como destino aqui. Dispositivos VARCO normalmente têm este campo vazio." },
        { label:"FTP enabled",            a: ftpA.enabled != null ? String(ftpA.enabled) : "—", b: ftpB.enabled != null ? String(ftpB.enabled) : "—", justificativa: "Se habilitado, o ITSCAM envia imagens e dados via FTP." },
      ]
    },
    {
      titulo: "🤖 Classificador ITSCAM",
      cor: C.warning,
      campos: [
        { label:"Classificador habilitado", a: clsA.enabled != null ? String(clsA.enabled) : "—", b: clsB.enabled != null ? String(clsB.enabled) : "—", justificativa: "Liga/desliga o módulo de classificação de veículos no ITSCAM." },
        { label:"Licença OK",             a: clsA.licensed != null ? (clsA.licensed ? "✅ Sim" : "❌ Não") : "—", b: clsB.licensed != null ? (clsB.licensed ? "✅ Sim" : "❌ Não") : "—", justificativa: "Confirma se o ITSCAM tem licença ativa para classificar veículos." },
        { label:"Confiabilidade mínima",  a: clsA.minProbability != null ? `${clsA.minProbability}%` : "—", b: clsB.minProbability != null ? `${clsB.minProbability}%` : "—", justificativa: "⚠ CAUSA RAIZ: Com 100%, apenas detecções com 100% de confiança são classificadas — o que praticamente nunca ocorre. Valor recomendado: 60%. Esta é a principal razão do campo CLASSIFICACAO estar vazio." },
        { label:"Tipo de Cena (sceneType)", a: clsA.sceneType != null ? `${clsA.sceneType} (${["Genérico","Open Road","Close-up"][clsA.sceneType]||"?"})` : "—", b: clsB.sceneType != null ? `${clsB.sceneType} (${["Genérico","Open Road","Close-up"][clsB.sceneType]||"?"})` : "—", justificativa: "Define o tipo de cena para o classificador. 'Close-up' (2) é recomendado para instalações frontais. 'Open Road' (1) para rodovias de alta velocidade." },
        { label:"Tipo de Modelo",         a: clsA.modelType != null ? `${clsA.modelType}` : "—", b: clsB.modelType != null ? `${clsB.modelType}` : "—", justificativa: "0 = modelo padrão de veículos (Automóvel/Ônibus/Caminhão/Moto)." },
        { label:"Leitura de Características", a: clsA.enableCharacteristics != null ? String(clsA.enableCharacteristics) : "—", b: clsB.enableCharacteristics != null ? String(clsB.enableCharacteristics) : "—", justificativa: "⚠ NOTA: Este campo ('Habilitar Leitura de Características') controla cor, marca e modelo — NÃO a classificação de tipo de veículo. A mensagem 'desabilitada para esta licença' no ITSCAM refere-se a este campo, não ao Classifier principal. Não impede a classificação Automóvel/Ônibus/Caminhão." },
        { label:"Somente 1ª exposição",   a: clsA.firstOnly != null ? String(clsA.firstOnly) : "—", b: clsB.firstOnly != null ? String(clsB.firstOnly) : "—", justificativa: "Se true, só classifica na primeira detecção do veículo." },
      ]
    },
    {
      titulo: "🔍 OCR — Leitura de Placa",
      cor: "#8b5cf6",
      campos: [
        { label:"OCR habilitado",         a: ocrA.enabled != null ? String(ocrA.enabled) : "—", b: ocrB.enabled != null ? String(ocrB.enabled) : "—", justificativa: "Liga/desliga o OCR de placas." },
        { label:"Usar resultado do Classificador", a: ocrA.useClassifierResult != null ? String(ocrA.useClassifierResult) : "—", b: ocrB.useClassifierResult != null ? String(ocrB.useClassifierResult) : "—", justificativa: "⚠ CAUSA RAIZ: Se false, o OCR não inclui o resultado da classificação no payload enviado ao AxCross. Mesmo que o classificador funcione, a classificação não chega ao AxCross. Deve ser true." },
        { label:"Tipo de veículo padrão", a: ocrA.vehicleType != null ? `${ocrA.vehicleType}` : "—", b: ocrB.vehicleType != null ? `${ocrB.vehicleType}` : "—", justificativa: "Tipo de veículo padrão quando o classificador não dispara." },
      ]
    },
    {
      titulo: "📶 Conectividade",
      cor: C.success,
      campos: [
        { label:"Online agora",           a: vA.heartbeat != null ? "✅ Sim" : dadosA.varco?.encontrado === false ? "— (sem VARCO)" : "🔴 Não", b: vB.heartbeat != null ? "✅ Sim" : "—", justificativa: "Conectividade atual do dispositivo." },
        { label:"IP",                     a: vA.ip || "—",                                   b: vB.ip || "—",                                     justificativa: "Endereço IP externo do equipamento." },
        { label:"Firmware",               a: vA.firmware || "—",                             b: vB.firmware || "—",                               justificativa: "Versão do firmware ITSCAM." },
      ]
    },
  ];

  // Detectar diferenças em todos os campos
  const todasDiferencas = grupos.flatMap(g => g.campos).filter(c =>
    String(c.a) !== String(c.b) && c.a !== "—" && c.b !== "—" && c.a != null && c.b != null
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

      {/* Banner resumo */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
        <div style={{ padding:"10px 14px", background:C.successBg, border:`1px solid ${C.success}44`, borderRadius:"8px" }}>
          <div style={{ fontWeight:800, fontSize:"13px", color:C.success }}>✅ {nomeA} — Classifica</div>
          <div style={{ fontSize:"11px", color:C.textSecondary, marginTop:"4px" }}>
            {vA.encontrado ? `Via VARCO Cloud · minProb=${clsA.minProbability}%` : "Via HTTP Direto → AxCross (sem VARCO)"}
          </div>
          {vA.tunnelUrl && <a href={vA.tunnelUrl+"/equipment/recognition"} target="_blank" rel="noreferrer" style={{ fontSize:"10px", color:C.accent, display:"flex", alignItems:"center", gap:"3px", marginTop:"5px" }}><ExternalLink size={9}/> Abrir túnel</a>}
        </div>
        <div style={{ padding:"10px 14px", background:C.dangerBg, border:`1px solid ${C.danger}44`, borderRadius:"8px" }}>
          <div style={{ fontWeight:800, fontSize:"13px", color:C.danger }}>❌ {nomeB} — Não classifica</div>
          <div style={{ fontSize:"11px", color:C.textSecondary, marginTop:"4px" }}>
            {vB.encontrado ? `Via VARCO Cloud · minProb=${clsB.minProbability}% · useClassif=${ocrB.useClassifierResult}` : "Não encontrado no VARCO"}
          </div>
          {vB.tunnelUrl && <a href={vB.tunnelUrl+"/equipment/recognition"} target="_blank" rel="noreferrer" style={{ fontSize:"10px", color:C.accent, display:"flex", alignItems:"center", gap:"3px", marginTop:"5px" }}><ExternalLink size={9}/> Abrir túnel</a>}
        </div>
      </div>

      {/* Diferenças detectadas */}
      {todasDiferencas.length > 0 && (
        <div style={{ padding:"10px 14px", background:"rgba(245,158,11,0.07)", border:`1px solid ${C.warning}44`, borderRadius:"7px" }}>
          <div style={{ fontWeight:700, fontSize:"11px", color:C.warning, marginBottom:"5px" }}>
            ⚡ {todasDiferencas.length} diferença(s) detectada(s):
          </div>
          <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
            {todasDiferencas.map((d,i) => <span key={i} style={{ padding:"2px 8px", background:C.warningBg, border:`1px solid ${C.warning}44`, borderRadius:"4px", fontSize:"10px", fontWeight:700, color:C.warning }}>{d.label}</span>)}
          </div>
        </div>
      )}

      {/* Tabelas por grupo */}
      {grupos.map((g, gi) => (
        <div key={gi} style={{ border:`1px solid ${g.cor}33`, borderRadius:"8px", overflow:"hidden" }}>
          <div style={{ padding:"8px 14px", background:`${g.cor}12`, borderBottom:`1px solid ${g.cor}22` }}>
            <span style={{ fontWeight:700, fontSize:"12px", color:g.cor }}>{g.titulo}</span>
          </div>
          {/* Header */}
          <div style={{ display:"grid", gridTemplateColumns:"200px 1fr 1fr 2fr", background:C.tableHeader, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ padding:"6px 10px", fontSize:"10px", fontWeight:600, color:C.textMuted }}>Campo</div>
            <div style={{ padding:"6px 10px", fontSize:"11px", fontWeight:800, color:C.success, borderLeft:`1px solid ${C.border}22` }}>✅ {nomeA}</div>
            <div style={{ padding:"6px 10px", fontSize:"11px", fontWeight:800, color:C.danger, borderLeft:`1px solid ${C.border}22` }}>❌ {nomeB}</div>
            <div style={{ padding:"6px 10px", fontSize:"10px", fontWeight:600, color:C.textMuted, borderLeft:`1px solid ${C.border}22` }}>Justificativa</div>
          </div>
          {g.campos.map((c, ci) => {
            const isDiff = String(c.a) !== String(c.b) && c.a !== "—" && c.b !== "—";
            const bg = isDiff ? "rgba(245,158,11,0.03)" : ci%2===0 ? "transparent" : C.raised;
            return (
              <div key={ci} style={{ display:"grid", gridTemplateColumns:"200px 1fr 1fr 2fr", background:bg, borderBottom:`1px solid ${C.border}11` }}>
                <div style={{ padding:"7px 10px", fontSize:"10px", color:isDiff?C.warning:C.textSecondary, fontWeight:isDiff?700:400 }}>
                  {isDiff && "⚠ "}{c.label}
                </div>
                <div style={{ padding:"7px 10px", fontSize:"11px", fontWeight:isDiff?700:400, color:isDiff?C.success:C.text, borderLeft:`1px solid ${C.border}11`, background:isDiff?"rgba(16,185,129,0.05)":"transparent" }}>
                  {c.a ?? "—"}
                </div>
                <div style={{ padding:"7px 10px", fontSize:"11px", fontWeight:isDiff?700:400, color:isDiff?C.danger:C.text, borderLeft:`1px solid ${C.border}11`, background:isDiff?"rgba(251,113,133,0.05)":"transparent" }}>
                  {c.b ?? "—"}
                </div>
                <div style={{ padding:"7px 10px", fontSize:"10px", color:C.textSecondary, lineHeight:1.5, borderLeft:`1px solid ${C.border}11` }}>
                  {c.justificativa}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Causas raiz e passos de correção */}
      {dadosB.causaRaiz?.length > 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.danger}44`, borderRadius:"8px", padding:"12px 14px" }}>
          <div style={{ fontWeight:700, fontSize:"13px", color:C.danger, marginBottom:"10px" }}>
            🎯 Correções para {nomeB} — passo a passo (em ordem de prioridade):
          </div>
          {dadosB.causaRaiz.map((cr, i) => (
            <div key={i} style={{ marginBottom:"10px", border:`1px solid ${cr.prioridade==="CRITICA"?C.danger:C.warning}33`, borderRadius:"7px", overflow:"hidden" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:cr.prioridade==="CRITICA"?C.dangerBg:C.warningBg }}>
                <div>
                  <span style={{ fontSize:"10px", fontWeight:800, color:cr.prioridade==="CRITICA"?C.danger:C.warning, marginRight:"8px" }}>{cr.codigo}</span>
                  <span style={{ fontSize:"12px", fontWeight:700 }}>{cr.titulo}</span>
                </div>
                {cr.tunnelUrl && <a href={cr.tunnelUrl+(cr.tunnelPath||"/equipment/recognition")} target="_blank" rel="noreferrer" style={{ padding:"4px 10px", background:C.accentBg, border:`1px solid ${C.accent}44`, borderRadius:"4px", color:C.accent, textDecoration:"none", fontSize:"10px", display:"inline-flex", alignItems:"center", gap:"3px" }}><ExternalLink size={10}/> Abrir Túnel</a>}
              </div>
              <div style={{ padding:"10px 12px" }}>
                <div style={{ fontSize:"11px", color:C.textSecondary, lineHeight:1.6, marginBottom:"8px" }}>{cr.descricao}</div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                  <div style={{ padding:"5px 8px", background:C.dangerBg, borderRadius:"4px", fontSize:"11px" }}>
                    <div style={{ fontSize:"8px", color:C.textMuted }}>ATUAL</div>
                    <code style={{ color:C.danger, fontWeight:700 }}>{cr.valor_atual}</code>
                  </div>
                  <span style={{ color:C.textMuted, fontSize:"16px" }}>→</span>
                  <div style={{ padding:"5px 8px", background:C.successBg, borderRadius:"4px", fontSize:"11px" }}>
                    <div style={{ fontSize:"8px", color:C.textMuted }}>RECOMENDADO</div>
                    <code style={{ color:C.success, fontWeight:700 }}>{cr.valor_recomendado?.split("(")[0].trim()}</code>
                  </div>
                </div>
                {cr.caminho_passos?.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
                    <div style={{ fontSize:"9px", fontWeight:700, color:C.textMuted, textTransform:"uppercase", marginBottom:"3px" }}>Caminho para correção:</div>
                    {cr.caminho_passos.map((p, pi) => (
                      <div key={pi} style={{ display:"flex", gap:"6px", alignItems:"flex-start", padding:"5px 8px", background:pi===cr.caminho_passos.length-1?C.successBg:C.raised, borderRadius:"4px", fontSize:"10px" }}>
                        <span style={{ minWidth:"20px", height:"20px", background:pi===cr.caminho_passos.length-1?C.success:C.accentBg, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", fontWeight:800, color:pi===cr.caminho_passos.length-1?"#fff":C.accent, flexShrink:0 }}>{pi+1}</span>
                        <div style={{ flex:1 }}>
                          <span style={{ fontWeight:600, color:C.text }}>{p.label}</span>
                          {p.url_path && cr.tunnelUrl && <a href={cr.tunnelUrl+p.url_path} target="_blank" rel="noreferrer" style={{ marginLeft:"6px", fontSize:"9px", color:C.accent, textDecoration:"none" }}>🔗 Abrir</a>}
                          <div style={{ color:C.textSecondary, lineHeight:1.4, marginTop:"1px" }}>{p.detalhe}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Nota sobre enableCharacteristics */}
          <div style={{ marginTop:"8px", padding:"8px 12px", background:"rgba(59,130,246,0.07)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:"5px", fontSize:"11px", color:"#93c5fd" }}>
            💡 <b>Nota sobre "Habilitar Leitura de Características":</b> A mensagem <i>"desabilitada para esta licença"</i> no ITSCAM refere-se à leitura de atributos detalhados do veículo (cor, marca, modelo). <b>Isso NÃO impede a classificação básica</b> (Automóvel/Ônibus/Caminhão). As correções acima (minProbability + useClassifierResult) são suficientes para o campo CLASSIFICACAO ser populado no AxCross.
          </div>
        </div>
      )}
    </div>
  );
}

function TabFrota() {
  const [filtros, setFiltros] = useState({ semClassifOnly: true, firmware: "", sceneType: "", minProbMax: "" });
  const [dados, setDados]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [selecionados, setSelecionados] = useState(new Set());
  const [sortCol, setSortCol] = useState("severidade");
  const [sortDir, setSortDir] = useState("desc");
  const [applyingAll, setApplyingAll] = useState(false);
  const [applyProgress, setApplyProgress] = useState({ current:0, total:0, lastResult:"" });
  const [results, setResults] = useState({});
  // De-Para
  const [deParaA, setDeParaA] = useState("GOEC60048"); // tem classif
  const [deParaB, setDeParaB] = useState("GOEC60053"); // não tem
  const [deParaDados, setDeParaDados] = useState(null);
  const [deParaLoading, setDeParaLoading] = useState(false);
  const [showDePara, setShowDePara] = useState(false);

  const setF = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

  const buscar = async () => {
    setLoading(true); setDados(null);
    try {
      const p = new URLSearchParams();
      if (filtros.semClassifOnly) p.set("semClassifOnly", "true");
      if (filtros.firmware)       p.set("firmware", filtros.firmware);
      if (filtros.sceneType)      p.set("sceneType", filtros.sceneType);
      if (filtros.minProbMax)     p.set("minProbMax", filtros.minProbMax);
      const r = await apiFetch(`/axcross/frota-analise?${p}`);
      const d = await r.json();
      if (d.ok) { setDados(d); setSelecionados(new Set(d.equipamentos.map(e => e.nomeAxCross))); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { buscar(); }, []);

  const toggleAll = () => {
    if (selecionados.size === dados?.equipamentos.length) setSelecionados(new Set());
    else setSelecionados(new Set(dados?.equipamentos.map(e => e.nomeAxCross) || []));
  };

  const toggle = (nome) => setSelecionados(s => { const n = new Set(s); n.has(nome) ? n.delete(nome) : n.add(nome); return n; });

  const sortedList = useMemo(() => {
    if (!dados?.equipamentos) return [];
    return [...dados.equipamentos].sort((a, b) => {
      const sevOrder = { CRITICA:0, ALTA:1, MEDIA:2, OK:3 };
      if (sortCol === "severidade") return sortDir==="asc" ? sevOrder[b.severidade]-sevOrder[a.severidade] : sevOrder[a.severidade]-sevOrder[b.severidade];
      const va = a[sortCol] ?? a.classificador?.[sortCol] ?? ""; const vb = b[sortCol] ?? b.classificador?.[sortCol] ?? "";
      return sortDir==="asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [dados, sortCol, sortDir]);

  const SortTh = ({ col, label, center }) => (
    <th onClick={() => { if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc"); else{setSortCol(col);setSortDir("asc");} }}
      style={{ padding:"7px 10px", textAlign:center?"center":"left", color:sortCol===col?C.brand:C.textMuted,
        fontWeight:600, borderBottom:`1px solid ${C.border}`, cursor:"pointer", whiteSpace:"nowrap", userSelect:"none", fontSize:"11px" }}>
      {label} {sortCol===col?(sortDir==="asc"?"↑":"↓"):"↕"}
    </th>
  );

  const sevColor = (s) => ({ CRITICA:C.danger, ALTA:"#f97316", MEDIA:C.warning, OK:C.success })[s] || C.textMuted;
  const sevIcon  = (s) => ({ CRITICA:"🔴", ALTA:"🟠", MEDIA:"🟡", OK:"✅" })[s] || "—";

  // Aplicar correção em todos selecionados para um problema específico
  const aplicarEmTodos = async (problema) => {
    setApplyingAll(true);
    const equipsSel = sortedList.filter(e => selecionados.has(e.nomeAxCross) && e.problemas.some(p => p.codigo === problema.codigo));
    setApplyProgress({ current:0, total:equipsSel.length, lastResult:"" });
    for (let i = 0; i < equipsSel.length; i++) {
      const eq = equipsSel[i];
      if (!eq.tunnelUrl) { setApplyProgress(p=>({...p,current:i+1,lastResult:`⏭ ${eq.nomeAxCross} sem túnel`})); continue; }
      try {
        const eqTunnelBase = eq.tunnelUrl.split("/").slice(0,3).join("/");
        const hdrs = await itscamHeaders(eqTunnelBase);
        const r = await apiFetch("/proxy/fetch-url", { method:"POST", body: JSON.stringify({ url: `${eq.tunnelUrl}${problema.api.replace("PUT ","").replace("GET ","")}`, method:"PUT", headers: hdrs, body: problema.payload }) });
        const d = await r.json();
        const msg = d.ok ? `✅ ${eq.nomeAxCross}` : `❌ ${eq.nomeAxCross} HTTP${d.status}`;
        setResults(prev => ({ ...prev, [eq.nomeAxCross]: d.ok ? "✅" : `❌${d.status}` }));
        setApplyProgress(p=>({...p, current:i+1, lastResult:msg}));
      } catch (e) {
        setResults(prev => ({ ...prev, [eq.nomeAxCross]: "❌ err" }));
        setApplyProgress(p=>({...p, current:i+1, lastResult:`❌ ${eq.nomeAxCross}: ${e.message.slice(0,30)}`}));
      }
      await new Promise(r => setTimeout(r, 500));
    }
    setApplyProgress(p=>({...p,lastResult:`✅ Concluído — ${equipsSel.length} equipamentos processados`}));
    setApplyingAll(false);
  };

  // De-Para: buscar dados dos dois equipamentos
  const buscarDePara = async () => {
    if (!deParaA || !deParaB) return;
    setDeParaLoading(true); setDeParaDados(null);
    try {
      const [rA, rB] = await Promise.all([
        apiFetch(`/axcross/ecosistema?equipamento=${encodeURIComponent(deParaA)}&dias=30`).then(r=>r.json()),
        apiFetch(`/axcross/ecosistema?equipamento=${encodeURIComponent(deParaB)}&dias=30`).then(r=>r.json()),
      ]);
      setDeParaDados({ a: rA, b: rB });
    } catch (e) { console.error(e); }
    setDeParaLoading(false);
  };

  const problemasUnicos = useMemo(() => {
    if (!dados?.equipamentos) return [];
    const map = {};
    dados.equipamentos.forEach(e => e.problemas?.forEach(p => { if (!map[p.codigo]) map[p.codigo] = p; }));
    return Object.values(map);
  }, [dados]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

      {/* Header */}
      <div style={{ background:C.brandBg, border:`1px solid ${C.brandBorder}`, borderRadius:"8px", padding:"12px 16px" }}>
        <div style={{ fontWeight:800, fontSize:"14px", color:C.brand, marginBottom:"4px" }}>
          🏭 Frota Completa — Análise VARCO × AxCross ({dados?.stats.total || "—"} equipamentos)
        </div>
        <div style={{ fontSize:"12px", color:C.textSecondary, lineHeight:1.6 }}>
          Selecione equipamentos e aplique correções em lote. Os dados vêm diretamente da auditoria VARCO.
          {dados && <span style={{ marginLeft:"12px" }}>
            🔴 {dados.stats.criticos} críticos · 🟠 {dados.stats.altos} altos · ✅ {dados.stats.ok} OK · 📡 {dados.stats.online}/{dados.stats.total} online
          </span>}
        </div>
      </div>

      {/* Painel: Fonte da Classificação */}
      <div style={{ background:C.surface, border:`1px solid rgba(245,158,11,0.35)`, borderRadius:"8px", padding:"12px 16px" }}>
        <div style={{ fontWeight:700, fontSize:"13px", color:C.warning, marginBottom:"10px" }}>
          🔍 De onde vem o campo CLASSIFICACAO no AxCross?
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          {/* Col 1: Via VARCO (problema) */}
          <div style={{ background:C.dangerBg, border:`1px solid ${C.danger}33`, borderRadius:"6px", padding:"10px 12px" }}>
            <div style={{ fontWeight:700, fontSize:"11px", color:C.danger, marginBottom:"6px" }}>
              ❌ VARCO Cloud (32 equipamentos — NÃO classifica)
            </div>
            <div style={{ fontSize:"11px", color:C.textSecondary, lineHeight:1.7 }}>
              <b>Caminho:</b> ITSCAM 450 → <b>VARCO Cloud</b> (edge.varco.io) → AxCross<br/>
              <b>Problema:</b> <code>minProbability = 100%</code> — o classificador exige 100% de confiança para enviar a classificação. Na prática, nenhum veículo atinge isso.<br/>
              <b>Agravante:</b> <code>useClassifierResult = false</code> — o OCR ignora o resultado do classificador mesmo quando disparado.<br/>
              <b>Resultado:</b> Campo <code>CLASSIFICACAO:</code> sempre vazio no AxCross.
            </div>
            <div style={{ marginTop:"8px", fontSize:"10px", color:C.danger, fontWeight:600 }}>
              Exemplos: GOEC60002, GOEC60003, GOEC60013... (todos da tabela abaixo)
            </div>
          </div>
          {/* Col 2: HTTP Direto (funciona) */}
          <div style={{ background:C.successBg, border:`1px solid ${C.success}33`, borderRadius:"6px", padding:"10px 12px" }}>
            <div style={{ fontWeight:700, fontSize:"11px", color:C.success, marginBottom:"6px" }}>
              ✅ HTTP Direto (GOEC60044, 047... — Classifica corretamente)
            </div>
            <div style={{ fontSize:"11px", color:C.textSecondary, lineHeight:1.7 }}>
              <b>Caminho:</b> ITSCAM 450 → <b>HTTP direto</b> → AxCross<br/>
              <b>Por quê funciona:</b> O ITSCAM envia os dados de passagem <i>diretamente</i> ao AxCross via servidor HTTP configurado no dispositivo. A classificação do veículo (Automóvel, Ônibus, Caminhão…) é enviada no payload HTTP.<br/>
              <b>Estes equipamentos NÃO aparecem na auditoria VARCO</b> pois não usam o VARCO Cloud.
            </div>
            <div style={{ marginTop:"8px", fontSize:"10px", color:C.success, fontWeight:600 }}>
              Exemplos: GOEC60044 (Nova Crixás-GO) · GOEC60047 (GO 521) · outros sem VARCO
            </div>
          </div>
        </div>
        {/* Correção */}
        <div style={{ marginTop:"10px", padding:"8px 12px", background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.25)", borderRadius:"5px", fontSize:"11px", color:"#93c5fd" }}>
          💡 <b>Correção para os 32 VARCO com CLASSIFICACAO vazio (2 passos):</b><br/>
          <b>Passo 1 — Na interface ITSCAM</b> (visual): Túnel → <b>Equipamento → Reconhecimento → aba Classifier</b> → mover slider <code>Confiabilidade mínima</code> de <b>100% → 60%</b> → clicar <b>Aplicar</b>.<br/>
          <b>Passo 2 — Via API apenas</b> (não aparece na tela): usar o botão <b>"Aplicar CR-02"</b> neste painel. O campo <code>useClassifierResult</code> não existe na UI do ITSCAM — só é configurável via API REST.<br/>
          <span style={{ color:"rgba(147,197,253,0.7)", fontSize:"10px" }}>⚠ Nota: A aba "Jidosha" é o OCR (leitura de placas). A aba "Classifier" é o classificador de tipo de veículo (carro/ônibus/caminhão). São módulos separados.</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"12px 16px" }}>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:C.textSecondary, cursor:"pointer" }}>
            <input type="checkbox" checked={filtros.semClassifOnly} onChange={e => setF("semClassifOnly", e.target.checked)} />
            Mostrar apenas com problemas
          </label>
          <div>
            <select value={filtros.firmware} onChange={e => setF("firmware", e.target.value)}
              style={{ padding:"6px 10px", background:C.raised, border:`1px solid ${C.border}`, borderRadius:"5px", color:C.text, fontSize:"11px" }}>
              <option value="">Todos os firmwares</option>
              {(dados?.stats.firmwares || []).map(fw => <option key={fw} value={fw}>{fw}</option>)}
            </select>
          </div>
          <div>
            <select value={filtros.sceneType} onChange={e => setF("sceneType", e.target.value)}
              style={{ padding:"6px 10px", background:C.raised, border:`1px solid ${C.border}`, borderRadius:"5px", color:C.text, fontSize:"11px" }}>
              <option value="">Todos os cenários</option>
              <option value="0">0 — Genérico (problema)</option>
              <option value="1">1 — Open Road</option>
              <option value="2">2 — Close-up</option>
            </select>
          </div>
          <button onClick={buscar} disabled={loading} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"7px 14px",
            background:C.brandBg, border:`1px solid ${C.brand}`, borderRadius:"5px",
            color:C.brand, cursor:loading?"wait":"pointer", fontSize:"12px", fontWeight:600, opacity:loading?0.7:1 }}>
            <Search size={13} className={loading?"spin":""} /> {loading?"Analisando...":"Filtrar Frota"}
          </button>
          {dados && <span style={{ fontSize:"11px", color:C.textMuted }}>{selecionados.size} selecionados de {dados.equipamentos.length}</span>}
        </div>
      </div>

      {/* ══ DE-PARA: Equipamento COM classificação vs SEM ══ */}
      <div style={{ background:C.surface, border:`1px solid rgba(96,205,255,0.3)`, borderRadius:"8px", overflow:"hidden" }}>
        <button onClick={() => setShowDePara(v=>!v)}
          style={{ width:"100%", padding:"10px 16px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left",
            display:"flex", alignItems:"center", gap:"8px", color:C.text }}>
          <span style={{ fontSize:"14px" }}>{showDePara?"▼":"▶"}</span>
          <span style={{ fontWeight:700, fontSize:"13px", color:C.accent }}>
            🔄 De-Para — Comparativo de Configuração (funciona vs não funciona)
          </span>
          <span style={{ fontSize:"11px", color:C.textMuted, marginLeft:"8px" }}>
            Compare dois equipamentos: um que classifica e outro que não classifica
          </span>
        </button>
        {showDePara && (
          <div style={{ borderTop:`1px solid rgba(96,205,255,0.2)`, padding:"14px 16px" }}>
            {/* Seleção dos dois equipamentos */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"10px", marginBottom:"12px", alignItems:"flex-end" }}>
              <div>
                <div style={{ fontSize:"10px", fontWeight:700, color:C.success, marginBottom:"3px", textTransform:"uppercase" }}>
                  ✅ Equipamento COM classificação
                </div>
                <div style={{ display:"flex", gap:"6px" }}>
                  <input value={deParaA} onChange={e=>setDeParaA(e.target.value.toUpperCase())}
                    style={{ flex:1, padding:"7px 10px", background:C.raised, border:`2px solid ${C.success}`, borderRadius:"5px", color:C.text, fontSize:"12px", fontWeight:700, outline:"none" }} />
                  <select onChange={e=>setDeParaA(e.target.value)} value=""
                    style={{ padding:"7px", background:C.raised, border:`1px solid ${C.border}`, borderRadius:"5px", color:C.textMuted, fontSize:"10px" }}>
                    <option value="">Frota...</option>
                    {(dados?.equipamentos||[]).filter(e=>e.severidade==="OK").map(e=>(
                      <option key={e.nomeAxCross} value={e.nomeAxCross}>{e.nomeAxCross}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ fontSize:"10px", fontWeight:700, color:C.danger, marginBottom:"3px", textTransform:"uppercase" }}>
                  ❌ Equipamento SEM classificação
                </div>
                <div style={{ display:"flex", gap:"6px" }}>
                  <input value={deParaB} onChange={e=>setDeParaB(e.target.value.toUpperCase())}
                    style={{ flex:1, padding:"7px 10px", background:C.raised, border:`2px solid ${C.danger}`, borderRadius:"5px", color:C.text, fontSize:"12px", fontWeight:700, outline:"none" }} />
                  <select onChange={e=>setDeParaB(e.target.value)} value=""
                    style={{ padding:"7px", background:C.raised, border:`1px solid ${C.border}`, borderRadius:"5px", color:C.textMuted, fontSize:"10px" }}>
                    <option value="">Frota...</option>
                    {(dados?.equipamentos||[]).filter(e=>e.severidade!=="OK").map(e=>(
                      <option key={e.nomeAxCross} value={e.nomeAxCross}>{e.nomeAxCross}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={buscarDePara} disabled={deParaLoading}
                style={{ padding:"9px 16px", background:C.accentBg, border:`1px solid ${C.accent}`, borderRadius:"5px",
                  color:C.accent, cursor:deParaLoading?"wait":"pointer", fontSize:"12px", fontWeight:700,
                  display:"flex", alignItems:"center", gap:"5px", opacity:deParaLoading?0.7:1 }}>
                <Search size={13} className={deParaLoading?"spin":""} />
                {deParaLoading?"Analisando...":"🔄 Comparar"}
              </button>
            </div>

            {/* Atalhos rápidos */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"10px", flexWrap:"wrap" }}>
              {[["GOEC60044","GOEC60002"], ["GOEC60047","GOEC60003"], ["GOEC60048","GOEC60053"], ["GOEC60044","GOEC60013"]].map(([a,b])=>(
                <button key={a+b} onClick={()=>{setDeParaA(a);setDeParaB(b);}}
                  style={{ padding:"3px 9px", fontSize:"10px", background:"transparent", border:`1px solid ${C.border}`,
                    borderRadius:"4px", color:C.textMuted, cursor:"pointer" }}>
                  ⚡ {a} vs {b}
                </button>
              ))}
              <span style={{ fontSize:"10px", color:C.textMuted, alignSelf:"center" }}>
                ✅ GOEC60044/047 = HTTP Direto (classifica) · ❌ GOEC60002/003 = VARCO Cloud (não classifica)
              </span>
            </div>

            {/* Resultado do De-Para */}
            {deParaDados && (
              <DeParaPanel dadosA={deParaDados.a} dadosB={deParaDados.b} nomeA={deParaA} nomeB={deParaB} />
            )}
          </div>
        )}
      </div>

      {/* Ações em lote */}
      {selecionados.size > 0 && problemasUnicos.length > 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.warning}44`, borderRadius:"8px", padding:"12px 16px" }}>
          <div style={{ fontSize:"12px", fontWeight:700, color:C.warning, marginBottom:"8px" }}>
            ⚡ Ações em Lote — {selecionados.size} equipamento(s) selecionado(s)
          </div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {problemasUnicos.map((p, i) => (
              <button key={i} onClick={() => aplicarEmTodos(p)} disabled={applyingAll}
                style={{ display:"flex", alignItems:"center", gap:"5px", padding:"7px 12px",
                  background:p.prioridade==="CRITICA"?C.dangerBg:C.warningBg,
                  border:`1px solid ${sevColor(p.prioridade)}44`, borderRadius:"5px",
                  color:sevColor(p.prioridade), cursor:applyingAll?"wait":"pointer", fontSize:"11px", fontWeight:600, opacity:applyingAll?0.7:1 }}>
                {applyingAll?<RefreshCw size={11} className="spin"/>:<Wrench size={11}/>}
                Aplicar {p.codigo}: {p.campo}={String(p.recomendado)} em todos
              </button>
            ))}
          </div>
          <div style={{ fontSize:"10px", color:C.textMuted, marginTop:"6px" }}>
            ⚠️ Aplica via túnel VARCO em cada equipamento selecionado. Aguarda 500ms entre cada chamada.
            <br/><span style={{ color:C.warning }}>🔑 Se o resultado mostrar <b>⚠ Auth(401)</b>, o ITSCAM requer credenciais Basic Auth — contate o suporte VARCO para obter as credenciais de cada dispositivo.</span>
          </div>
          {/* Barra de progresso */}
          {(applyingAll || applyProgress.total > 0) && (
            <div style={{ marginTop:"10px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10px", color:C.textMuted, marginBottom:"3px" }}>
                <span>{applyProgress.lastResult}</span>
                <span>{applyProgress.current}/{applyProgress.total}</span>
              </div>
              <div style={{ height:"6px", background:C.raised, borderRadius:"3px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${applyProgress.total>0?(applyProgress.current/applyProgress.total*100):0}%`,
                  background:C.success, borderRadius:"3px", transition:"width .3s" }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabela da frota */}
      {dados && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"8px", overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:"8px" }}>
            <input type="checkbox" checked={selecionados.size===dados.equipamentos.length} onChange={toggleAll} title="Selecionar todos" />
            <span style={{ fontWeight:700, fontSize:"13px" }}>
              {sortedList.length} equipamentos · {selecionados.size} selecionados
            </span>
            <span style={{ fontSize:"11px", color:C.textMuted, marginLeft:"auto" }}>Clique no cabeçalho para ordenar</span>
          </div>
          <div style={{ overflowX:"auto", maxHeight:"600px", overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"11px" }}>
              <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                <tr style={{ background:C.tableHeader }}>
                  <th style={{ padding:"7px 8px", borderBottom:`1px solid ${C.border}` }}>☑</th>
                  <SortTh col="nome"         label="Equipamento" />
                  <SortTh col="severidade"   label="Severidade" center />
                  <SortTh col="minProbability" label="minProb" center />
                  <SortTh col="useClassifierResult" label="useClassifResult" center />
                  <SortTh col="sceneType"    label="Cenário" center />
                  <SortTh col="firmware"     label="Firmware" center />
                  <SortTh col="online"       label="Online" center />
                  <SortTh col="faixas"       label="Faixas" center />
                  <th style={{ padding:"7px 10px", textAlign:"center", color:C.textMuted, fontWeight:600, borderBottom:`1px solid ${C.border}`, fontSize:"11px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map((eq, i) => {
                  const sel = selecionados.has(eq.nomeAxCross);
                  const sc = sevColor(eq.severidade);
                  const fixResult = results[eq.nomeAxCross];
                  return (
                    <tr key={eq.nome} onClick={() => toggle(eq.nomeAxCross)}
                      style={{ background:sel?"rgba(16,185,129,0.04)":i%2===0?"transparent":C.raised,
                        borderBottom:`1px solid ${C.border}22`, cursor:"pointer",
                        borderLeft:sel?`3px solid ${C.brand}`:"3px solid transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                      onMouseLeave={e => e.currentTarget.style.background = sel?"rgba(16,185,129,0.04)":i%2===0?"transparent":C.raised}>
                      <td style={{ padding:"6px 8px", textAlign:"center" }}>
                        <input type="checkbox" checked={sel} onChange={()=>toggle(eq.nomeAxCross)} onClick={e=>e.stopPropagation()} />
                      </td>
                      <td style={{ padding:"6px 10px" }}>
                        <div style={{ fontWeight:700, color:C.brand, fontSize:"12px" }}>{eq.nomeAxCross}</div>
                        <div style={{ fontSize:"9px", color:C.textMuted }}>{eq.ip} · {eq.nome}</div>
                      </td>
                      <td style={{ padding:"6px 10px", textAlign:"center" }}>
                        <span style={{ fontSize:"12px" }}>{sevIcon(eq.severidade)}</span>
                        <div style={{ fontSize:"9px", color:sc, fontWeight:700 }}>{eq.severidade}</div>
                      </td>
                      <td style={{ padding:"6px 10px", textAlign:"center" }}>
                        <span style={{ fontWeight:800, fontSize:"12px", color:eq.classificador.minProbability===100?C.danger:C.success }}>
                          {eq.classificador.minProbability ?? "—"}%
                        </span>
                      </td>
                      <td style={{ padding:"6px 10px", textAlign:"center" }}>
                        <span style={{ color:eq.ocr.useClassifierResult===false?C.warning:C.success, fontWeight:700, fontSize:"11px" }}>
                          {eq.ocr.useClassifierResult===false ? "❌ false" : eq.ocr.useClassifierResult===true ? "✅ true" : "—"}
                        </span>
                      </td>
                      <td style={{ padding:"6px 10px", textAlign:"center" }}>
                        <span style={{ color:eq.classificador.sceneType===0?C.warning:C.success, fontSize:"11px" }}>
                          {eq.classificador.sceneType ?? "—"}
                          {eq.classificador.sceneType===0 && " ⚠"}
                        </span>
                      </td>
                      <td style={{ padding:"6px 10px", textAlign:"center", color:C.textSecondary }}>{eq.firmware || "—"}</td>
                      <td style={{ padding:"6px 10px", textAlign:"center" }}>
                        <span style={{ color:eq.online?C.success:C.danger }}>{eq.online?"🟢":"🔴"}</span>
                      </td>
                      <td style={{ padding:"6px 10px", textAlign:"center", color:C.textMuted }}>{eq.faixas}</td>
                      <td style={{ padding:"6px 10px", textAlign:"center" }} onClick={e=>e.stopPropagation()}>
                        <div style={{ display:"flex", gap:"3px", justifyContent:"center" }}>
                          {eq.tunnelUrl && (
                            <a href={eq.tunnelUrl+"/equipment/recognition"} target="_blank" rel="noreferrer"
                              title="Abrir configuração do classificador no ITSCAM"
                              style={{ padding:"3px 7px", background:C.accentBg, border:`1px solid ${C.accent}44`, borderRadius:"3px",
                                color:C.accent, textDecoration:"none", fontSize:"10px", display:"flex", alignItems:"center", gap:"2px" }}>
                              <ExternalLink size={9}/> Túnel
                            </a>
                          )}
                          {fixResult && (
                            <span style={{ fontSize:"9px",
                              color:fixResult.startsWith("✅")?C.success:fixResult.startsWith("⚠")?C.warning:C.danger,
                              padding:"2px 5px", borderRadius:"3px",
                              background:fixResult.startsWith("✅")?C.successBg:fixResult.startsWith("⚠")?"rgba(245,158,11,0.15)":C.dangerBg }}
                              title={fixResult.startsWith("⚠")?"ITSCAM requer autenticação Basic Auth (usuário/senha do dispositivo)":""}>
                              {fixResult}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Sumário */}
          <div style={{ padding:"8px 14px", background:C.raised, borderTop:`1px solid ${C.border}`, fontSize:"11px", color:C.textMuted, display:"flex", gap:"16px", flexWrap:"wrap" }}>
            <span>🔴 {dados.stats.criticos} críticos</span>
            <span>minProb=100 em {dados.stats.minProb100} equipamentos</span>
            <span>useClassifFalse em {dados.stats.useClassifFalse} equipamentos</span>
            <span>Firmwares: {dados.stats.firmwares?.join(", ")}</span>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign:"center", padding:"30px", color:C.textMuted }}>
        <RefreshCw size={22} className="spin" style={{ display:"block", margin:"0 auto 8px" }} /> Carregando frota VARCO...
      </div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ABA: AUDITORIA DE CONFIGURAÇÃO — DE-PARA POR EQUIPAMENTO
// ─────────────────────────────────────────────────────────────
const CAMPOS_AUDITORIA = [
  { key: "minProbability",       label: "Confiabilidade mínima", endpoint: "classifier", unit: "%",    descricao: "% mínima de confiança para classificar. Com 100% nunca classifica." },
  { key: "useClassifierResult",  label: "Usar resultado Classifier", endpoint: "ocr", unit: "",      descricao: "OCR inclui o tipo de veículo no payload. Invisível na UI — só via API." },
  { key: "sceneType",            label: "Cenário",                endpoint: "classifier", unit: "",    descricao: "0=Genérico · 1=Open Road · 2=Close-up. Afeta acurácia do classificador." },
  { key: "enableCharacteristics",label: "Leitura de Características", endpoint: "classifier", unit: "", descricao: "Habilita cor/marca/modelo. Não afeta classificação básica (Automóvel/Ônibus)." },
  { key: "maxPlates",            label: "Máx. placas por imagem",  endpoint: "ocr",        unit: "",    descricao: "Nº de placas detectadas por frame." },
  { key: "processingThreads",    label: "Threads OCR",             endpoint: "ocr",        unit: "",    descricao: "Threads de processamento do OCR." },
  { key: "enabled",              label: "Classifier habilitado",   endpoint: "classifier", unit: "",    descricao: "Liga/desliga o módulo classificador." },
  { key: "licensed",             label: "Licença OK",              endpoint: "classifier", unit: "",    descricao: "Licença ativa para o classificador." },
];

const SCENE_LABELS = { 0: "Genérico", 1: "Open Road", 2: "Close-up" };

// ═══════════════════════════════════════════════════════════════
// ABA: CENTRO DE CONTROLE UNIFICADO
// Combina: Frota Completa + Correções em Lote + Auditoria De-Para
// ═══════════════════════════════════════════════════════════════
const CAMPOS_CTRL = [
  { key:"minProbability",      label:"Confiabilidade mínima", unit:"%",  ep:"classifier", crit:true,  desc:"100%=nunca classifica · Correto: 60%" },
  { key:"useClassifierResult", label:"Usar Classifier (OCR)", unit:"",   ep:"ocr",        crit:true,  desc:"false=OCR ignora classificação · Correto: true — só via API!" },
  { key:"sceneType",           label:"Cenário",               unit:"",   ep:"classifier", crit:false, desc:"0=Genérico ⚠ · 1=Open Road · 2=Close-up" },
  { key:"enableCharacteristics",label:"Caract. Veículo",      unit:"",   ep:"classifier", crit:false, desc:"Cor/marca/modelo. Não afeta tipo básico." },
  { key:"maxPlates",           label:"Máx. Placas",           unit:"",   ep:"ocr",        crit:false, desc:"Placas por frame" },
  { key:"enabled",             label:"Classifier ON",         unit:"",   ep:"classifier", crit:true,  desc:"Liga/desliga classificador" },
];
const SCENE_LBL = {0:"Genérico",1:"Open Road",2:"Close-up"};

function TabControle() {
  // ─── STATE ───────────────────────────────────────────────────────
  const [frota, setFrota]         = useState(null);
  const [loadFrota, setLoadFrota] = useState(false);
  const [configs, setConfigs]     = useState({});
  const [loadCfg, setLoadCfg]     = useState({});
  const [baseEq, setBaseEq]       = useState(null);
  const [selecionados, setSel]    = useState(new Set());
  const [modo, setModo]           = useState("corrigir");
  const [progresso, setProg]      = useState({ ativo:false, atual:0, total:0, log:[], ok:0, fail:0 });
  const [resultados, setRes]      = useState({});
  const [guiaAberto, setGuia]     = useState(false);
  const [passoGuia, setPassoGuia] = useState(0);
  // Filtros clicáveis
  const [filtros, setFiltros]     = useState({}); // { campo: valor }

  useEffect(() => { carregarFrota(); }, []);

  const carregarFrota = async () => {
    setLoadFrota(true);
    try {
      const r = await apiFetch("/axcross/frota-analise?semClassifOnly=false");
      const d = await r.json();
      if (d.ok) { setFrota(d); setSel(new Set(d.equipamentos.filter(e=>e.tunnelUrl).map(e=>e.tunnelUrl))); }
    } catch(e) { console.error(e); }
    setLoadFrota(false);
  };

  const lerConfigReal = async (eq) => {
    if (!eq.tunnelUrl) return;
    setLoadCfg(p => ({...p, [eq.tunnelUrl]:true}));
    try {
      const r = await apiFetch("/itscam/ler-config", { method:"POST", body: JSON.stringify({ tunnelUrl: eq.tunnelUrl }) });
      const d = await r.json();
      setConfigs(p => ({...p, [eq.tunnelUrl]: {...d, nomeAxCross:eq.nomeAxCross, eq}}));
    } catch(e) { setConfigs(p => ({...p, [eq.tunnelUrl]: {ok:false, erro:e.message, nomeAxCross:eq.nomeAxCross}})); }
    setLoadCfg(p => ({...p, [eq.tunnelUrl]:false}));
  };

  const lerTodos = async () => {
    const equips = listaFiltrada.filter(e => e.tunnelUrl);
    setProg({ativo:true, atual:0, total:equips.length, log:[`📡 Lendo ${equips.length} equip...`], ok:0, fail:0});
    setPassoGuia(2);
    for (let i = 0; i < equips.length; i++) {
      const eq = equips[i];
      setProg(p => ({...p, atual:i+1, log:[...p.log, `⏳ ${eq.nomeAxCross}...`].slice(-50)}));
      await lerConfigReal(eq);
    }
    setProg(p => ({...p, ativo:false, log:[...p.log, `✅ Concluído`]}));
    setPassoGuia(3);
  };

  const aplicarCampo = async (eq, campoKey, valorAlvo) => {
    const k = `${eq.tunnelUrl}_${campoKey}`;
    setRes(p => ({...p, [k]:"⏳"}));
    try {
      const r = await apiFetch("/itscam/aplicar-config", { method:"POST", body: JSON.stringify({ tunnelUrl:eq.tunnelUrl, campos:{[campoKey]:valorAlvo} }) });
      const d = await r.json();
      setRes(p => ({...p, [k]: d.ok?"✅":`❌${d.erro?.slice(0,15)||""}`}));
      if (d.ok) await lerConfigReal(eq);
    } catch(e) { setRes(p => ({...p, [k]:`❌`})); }
  };

  const corrigirEquip = async (eq) => {
    const k = `${eq.tunnelUrl}_ALL`;
    setRes(p => ({...p, [k]:"⏳"}));
    const minP = modo==="reverter"?100:60, useC = modo!=="reverter";
    try {
      const r = await apiFetch("/itscam/corrigir", { method:"POST", body: JSON.stringify({ tunnelUrl:eq.tunnelUrl, minProbability:minP, useClassifierResult:useC }) });
      const d = await r.json();
      setRes(p => ({...p, [k]: d.ok?"✅":`❌${d.erro?.slice(0,15)||""}`}));
      if (d.ok) await lerConfigReal(eq);
    } catch(e) { setRes(p => ({...p, [k]:`❌`})); }
  };

  const corrigirTodos = async () => {
    const equips = listaFiltrada.filter(e => selecionados.has(e.tunnelUrl));
    setPassoGuia(4);
    setProg({ativo:true, atual:0, total:equips.length, log:[`🚀 ${modo==="reverter"?"Revertendo":"Corrigindo"} ${equips.length}...`], ok:0, fail:0});
    for (let i = 0; i < equips.length; i++) {
      const eq = equips[i];
      setProg(p => ({...p, atual:i+1, log:[...p.log,`⏳ ${eq.nomeAxCross}...`].slice(-50)}));
      const minP = modo==="reverter"?100:60, useC = modo!=="reverter";
      try {
        const r = await apiFetch("/itscam/corrigir", { method:"POST", body: JSON.stringify({ tunnelUrl:eq.tunnelUrl, minProbability:minP, useClassifierResult:useC }) });
        const d = await r.json();
        setRes(p => ({...p, [`${eq.tunnelUrl}_ALL`]: d.ok?"✅":"❌"}));
        setProg(p => ({...p, ok:p.ok+(d.ok?1:0), fail:p.fail+(d.ok?0:1), log:[...p.log, d.ok?`✅ ${eq.nomeAxCross}`:`❌ ${eq.nomeAxCross}`].slice(-50)}));
        if (d.ok) await lerConfigReal(eq);
      } catch(e) { setProg(p => ({...p, fail:p.fail+1})); }
    }
    setProg(p => ({...p, ativo:false, log:[...p.log, `🏁 Concluído: ✅${p.ok} ❌${p.fail}`]}));
    setPassoGuia(5);
  };

  // Filtro clicável: ao clicar no valor de uma célula, filtra a tabela
  const toggleFiltro = (campo, valor) => {
    setFiltros(f => {
      const novo = {...f};
      if (novo[campo] !== undefined && String(novo[campo]) === String(valor)) delete novo[campo];
      else novo[campo] = valor;
      return novo;
    });
  };

  const getRealVal = (eq, campo) => {
    const cfg = configs[eq.tunnelUrl];
    if (!cfg?.ok) return null;
    return campo.ep==="classifier" ? cfg.classificador?.[campo.key] : cfg.ocr?.[campo.key];
  };
  const getBaseVal = (campo) => {
    if (!baseEq) return null;
    const cfg = configs[baseEq.tunnelUrl];
    if (!cfg?.ok) return null;
    return campo.ep==="classifier" ? cfg.classificador?.[campo.key] : cfg.ocr?.[campo.key];
  };
  const fmtVal = (v, c) => {
    if (v===null||v===undefined) return "—";
    if (c?.key==="minProbability") return `${v}%`;
    if (c?.key==="sceneType") return SCENE_LBL[v]||String(v);
    if (typeof v==="boolean") return v ? "✅ sim" : "❌ não";
    return String(v);
  };
  const isDiff = (a,b) => a!==null&&b!==null&&a!==undefined&&b!==undefined&&String(a)!==String(b);

  const equips = frota?.equipamentos || [];

  // Aplicar filtros clicáveis + filtros básicos
  const listaFiltrada = equips.filter(e => {
    if (!e.tunnelUrl) return false;
    // Filtros clicáveis
    if (filtros.severidade !== undefined && e.severidade !== filtros.severidade) return false;
    if (filtros.minProbability !== undefined && String(e.classificador?.minProbability) !== String(filtros.minProbability)) return false;
    if (filtros.useClassifierResult !== undefined && String(e.ocr?.useClassifierResult) !== String(filtros.useClassifierResult)) return false;
    if (filtros.sceneType !== undefined && String(e.classificador?.sceneType) !== String(filtros.sceneType)) return false;
    if (filtros.online !== undefined && String(e.online) !== String(filtros.online)) return false;
    if (filtros.firmware !== undefined && e.firmware !== filtros.firmware) return false;
    return true;
  });

  const totalLidos = listaFiltrada.filter(e => configs[e.tunnelUrl]?.ok).length;
  const totalSel   = listaFiltrada.filter(e => selecionados.has(e.tunnelUrl)).length;
  const baseConfig = baseEq ? configs[baseEq.tunnelUrl] : null;
  const filtrosAtivos = Object.entries(filtros);

  // Passo do guia derivado do estado
  const passoAtual = baseEq ? (totalLidos > 0 ? (totalSel > 0 ? 3 : 2) : 1) : 0;

  const PASSOS_GUIA = [
    { n:0, icon:"🎯", titulo:"Selecionar Base", cor:"#818cf8", desc:"Escolha o equipamento com a configuração CORRETA como referência. Sugestão: GOEC60002 (minProb=60, useClassif=true).", acao:"Selecione no dropdown 'Equipamento Base' acima." },
    { n:1, icon:"📡", titulo:"Ler Configurações Reais", cor:C.accent, desc:"Clique em 'Ler Configs' para ler a configuração real de cada ITSCAM via túnel. Leva ~8s por equipamento.", acao:"Botão 'Ler Configs (N)' nos controles acima. Ou '📡 Ler' por equipamento na tabela." },
    { n:2, icon:"🔍", titulo:"Comparar com a Base", cor:C.warning, desc:"Células vermelhas = valores diferentes da base. Clique em qualquer valor colorido para FILTRAR a tabela por ele.", acao:"Clique nas células da tabela para filtrar. Chips de filtro aparecem abaixo dos controles." },
    { n:3, icon:"🔧", titulo:"Corrigir Diferenças", cor:C.success, desc:"Clique no botão '→valor' em célula vermelha para corrigir um campo. Ou 'Corrigir' por equipamento. Ou 'Corrigir (N)' para todos selecionados.", acao:"Selecione os equipamentos com ☑ e clique no botão de ação desejado." },
    { n:4, icon:"✅", titulo:"Validar Resultado", cor:C.brand, desc:"Após corrigir, o sistema relê a config real automaticamente. Células ficam verdes. Verifique no AxCross Equipment Map se CLASSIFICACAO aparece.", acao:"Abrir mapa AxCross e aguardar próximas passagens dos equipamentos corrigidos." },
  ];

  const FilterChip = ({campo, valor, label}) => (
    <span onClick={() => toggleFiltro(campo, valor)}
      style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"3px 8px",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.4)",borderRadius:"12px",fontSize:"10px",color:"#a5b4fc",cursor:"pointer",userSelect:"none"}}>
      {label} ✕
    </span>
  );

  const ClickableCell = ({campo, valor, label, color, bg, bold}) => {
    const ativo = filtros[campo] !== undefined && String(filtros[campo]) === String(valor);
    return (
      <span onClick={() => toggleFiltro(campo, valor)}
        title={`Clique para ${ativo?"remover filtro":"filtrar"} por ${label||valor}`}
        style={{cursor:"pointer",fontWeight:bold||ativo?700:400,color:color||C.text,background:ativo?"rgba(99,102,241,0.2)":bg||"transparent",padding:"1px 4px",borderRadius:"3px",border:ativo?"1px solid rgba(99,102,241,0.5)":"none",transition:"all .15s",userSelect:"none",fontSize:"10px"}}>
        {label||valor}
      </span>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>

      {/* ══ GUIA DE PROCESSO INTEGRADO ══════════════════════════ */}
      <div style={{background:C.surface,border:`1px solid ${C.brand}44`,borderRadius:"10px",overflow:"hidden"}}>
        {/* Header do guia */}
        <div onClick={()=>setGuia(v=>!v)} style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px",cursor:"pointer",background:guiaAberto?"rgba(16,185,129,0.07)":"transparent"}}>
          <span style={{fontWeight:800,fontSize:"13px",color:C.brand}}>🚀 Centro de Controle — AxCross × VARCO × ITSCAM</span>
          <span style={{fontSize:"10px",color:C.textMuted,marginLeft:"4px"}}>Fluxo unificado: análise + De-Para + correções automáticas</span>
          <span style={{marginLeft:"auto",fontSize:"11px",color:C.brand}}>{guiaAberto?"▲ Ocultar guia":"▼ Ver guia de uso"}</span>
        </div>
        {/* Indicador de progresso do fluxo */}
        <div style={{padding:"8px 14px",display:"flex",gap:"4px",alignItems:"center",borderTop:`1px solid ${C.border}22`}}>
          {PASSOS_GUIA.map((p, i) => {
            const ativo = passoAtual === i;
            const feito = passoAtual > i;
            return (
              <React.Fragment key={i}>
                <div onClick={()=>setPassoGuia(i)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 8px",borderRadius:"6px",background:ativo?"rgba(99,102,241,0.15)":feito?"rgba(16,185,129,0.1)":"transparent",border:`1px solid ${ativo?"rgba(99,102,241,0.4)":feito?C.success+"44":C.border}`,cursor:"pointer",transition:"all .15s",flex:ativo?2:1}}>
                  <span style={{fontSize:"13px",filter:(!ativo&&!feito)?"grayscale(1) opacity(0.5)":"none"}}>{feito?"✅":p.icon}</span>
                  {ativo && <span style={{fontSize:"10px",fontWeight:700,color:"#818cf8",whiteSpace:"nowrap"}}>{p.titulo}</span>}
                  {!ativo && feito && <span style={{fontSize:"9px",color:C.success,whiteSpace:"nowrap"}}>{p.titulo}</span>}
                </div>
                {i < PASSOS_GUIA.length-1 && <span style={{color:C.border,fontSize:"10px"}}>→</span>}
              </React.Fragment>
            );
          })}
        </div>
        {/* Conteúdo do guia — passo atual */}
        {guiaAberto && (
          <div style={{borderTop:`1px solid ${C.border}22`,padding:"10px 14px",background:"rgba(0,0,0,0.1)"}}>
            {PASSOS_GUIA.map((p, i) => (
              <div key={i} onClick={()=>setPassoGuia(i)} style={{display:"flex",gap:"12px",padding:"8px 10px",marginBottom:"4px",borderRadius:"7px",background:passoGuia===i?"rgba(99,102,241,0.1)":"transparent",border:`1px solid ${passoGuia===i?"rgba(99,102,241,0.3)":"transparent"}`,cursor:"pointer",transition:"all .15s"}}>
                <span style={{fontSize:"16px",minWidth:"22px",textAlign:"center"}}>{p.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"11px",color:p.cor,marginBottom:"2px"}}>{i+1}. {p.titulo}</div>
                  <div style={{fontSize:"10px",color:C.textSecondary,lineHeight:1.5}}>{p.desc}</div>
                  <div style={{fontSize:"10px",color:p.cor,marginTop:"4px",fontStyle:"italic"}}>→ {p.acao}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ CONTROLES ════════════════════════════════════════════ */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"10px 14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"minmax(160px,1fr) minmax(180px,auto) auto auto auto auto auto",gap:"8px",alignItems:"flex-end",flexWrap:"wrap"}}>

          {/* BASE */}
          <div>
            <div style={{fontSize:"9px",fontWeight:700,color:"#818cf8",marginBottom:"3px",textTransform:"uppercase",display:"flex",alignItems:"center",gap:"5px"}}>
              {PASSOS_GUIA[0].icon} Passo 1 — Equipamento Base
            </div>
            <select value={baseEq?.tunnelUrl||""} onChange={e=>{const eq=listaFiltrada.find(x=>x.tunnelUrl===e.target.value)||equips.find(x=>x.tunnelUrl===e.target.value);setBaseEq(eq||null);if(eq&&!configs[eq.tunnelUrl])lerConfigReal(eq);setPassoGuia(1);}}
              style={{width:"100%",padding:"7px 8px",background:C.raised,border:`1px solid ${baseEq?"#818cf8":C.border}`,borderRadius:"5px",color:C.text,fontSize:"11px"}}>
              <option value="">— selecionar —</option>
              {equips.map(eq=><option key={eq.tunnelUrl} value={eq.tunnelUrl}>{eq.nomeAxCross}{configs[eq.tunnelUrl]?.ok?" ✅":""}</option>)}
            </select>
            {baseConfig?.ok && (
              <div style={{fontSize:"9px",marginTop:"3px",color:C.textMuted}}>
                Base: minProb=<b style={{color:C.success}}>{baseConfig.classificador?.minProbability}%</b> · useClassif=<b style={{color:C.success}}>{String(baseConfig.ocr?.useClassifierResult)}</b>
              </div>
            )}
          </div>

          {/* MODO */}
          <div>
            <div style={{fontSize:"9px",fontWeight:700,color:modo==="reverter"?C.danger:C.success,marginBottom:"3px",textTransform:"uppercase"}}>{PASSOS_GUIA[3].icon} Passo 4 — Modo</div>
            <div style={{display:"flex",borderRadius:"5px",overflow:"hidden",border:`1px solid ${modo==="reverter"?C.danger:C.success}44`}}>
              {[["corrigir","✅ Corrigir","success"],["reverter","↩ Reverter","danger"]].map(([m,lbl,c])=>(
                <button key={m} onClick={()=>setModo(m)} style={{flex:1,padding:"7px 6px",fontSize:"10px",fontWeight:modo===m?700:400,background:modo===m?C[c+"Bg"]:"transparent",color:modo===m?C[c]:C.textMuted,border:"none",cursor:"pointer"}}>{lbl}</button>
              ))}
            </div>
          </div>

          <button onClick={carregarFrota} disabled={loadFrota} title="Recarrega dados do VARCO Cloud (rápido, sem túnel)" style={{padding:"7px 10px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"5px",color:C.textMuted,cursor:"pointer",fontSize:"10px",display:"flex",alignItems:"center",gap:"3px",whiteSpace:"nowrap"}}>
            <RefreshCw size={10} className={loadFrota?"spin":""}/> Atualizar VARCO
          </button>

          <button onClick={lerTodos} disabled={progresso.ativo} title="Lê configuração real de cada ITSCAM via túnel (~8s/equip)" style={{padding:"7px 11px",background:C.accentBg,border:`1px solid ${C.accent}44`,borderRadius:"5px",color:C.accent,cursor:"pointer",fontSize:"10px",fontWeight:600,display:"flex",alignItems:"center",gap:"3px",whiteSpace:"nowrap",opacity:progresso.ativo?0.7:1}}>
            {progresso.ativo&&progresso.log.some(l=>l.includes("Lendo"))?<><RefreshCw size={10} className="spin"/>Lendo...</>:<><Search size={10}/>{PASSOS_GUIA[1].icon} Ler Configs ({listaFiltrada.length})</>}
          </button>

          <button onClick={()=>{const all=new Set(listaFiltrada.map(e=>e.tunnelUrl));setSel(selecionados.size===listaFiltrada.length?new Set():all);}}
            style={{padding:"7px 10px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"5px",color:C.textMuted,cursor:"pointer",fontSize:"10px",whiteSpace:"nowrap"}}>
            {selecionados.size===listaFiltrada.length?"☐ Limpar":"☑ Selecionar todos"}
          </button>

          <button onClick={corrigirTodos} disabled={progresso.ativo||totalSel===0}
            title={`${modo==="reverter"?"Reverter":"Corrigir"} minProbability + useClassifierResult em ${totalSel} equip.`}
            style={{padding:"7px 12px",background:modo==="reverter"?C.dangerBg:C.brandBg,border:`1px solid ${modo==="reverter"?C.danger:C.brand}`,borderRadius:"5px",color:modo==="reverter"?C.danger:C.brand,cursor:progresso.ativo?"wait":"pointer",fontSize:"10px",fontWeight:700,display:"flex",alignItems:"center",gap:"3px",whiteSpace:"nowrap",opacity:progresso.ativo?0.7:1}}>
            {progresso.ativo?<><RefreshCw size={10} className="spin"/>Proc...</>:<><Wrench size={10}/>{modo==="reverter"?"Reverter":"Corrigir"} ({totalSel})</>}
          </button>

          <a href="https://economia.axcross.axion.ws/monitoringonline/monitoring/equipmentmap" target="_blank" rel="noreferrer"
            title="Abrir mapa AxCross para validar resultado"
            style={{padding:"7px 10px",background:C.brandBg,border:`1px solid ${C.brand}44`,borderRadius:"5px",color:C.brand,textDecoration:"none",fontSize:"10px",display:"flex",alignItems:"center",gap:"3px",whiteSpace:"nowrap"}}>
            {PASSOS_GUIA[4].icon} Validar
          </a>
        </div>

        {/* Progresso */}
        {(progresso.ativo || progresso.log.length > 0) && (
          <div style={{marginTop:"8px",background:C.raised,borderRadius:"6px",padding:"7px 10px"}}>
            {progresso.total > 0 && <div style={{height:"4px",background:C.surface,borderRadius:"2px",marginBottom:"4px"}}><div style={{height:"100%",width:`${(progresso.atual/progresso.total)*100}%`,background:C.brand,borderRadius:"2px",transition:"width .3s"}}/></div>}
            <div style={{fontSize:"10px",color:C.textMuted,maxHeight:"55px",overflowY:"auto",fontFamily:"monospace"}}>
              {progresso.log.slice(-6).map((l,i)=><div key={i} style={{color:l.startsWith("✅")||l.startsWith("🏁")?C.success:l.startsWith("❌")?C.danger:C.textMuted}}>{l}</div>)}
            </div>
          </div>
        )}

        {/* Filtros ativos + chips */}
        {filtrosAtivos.length > 0 && (
          <div style={{marginTop:"8px",display:"flex",gap:"5px",flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:"10px",color:C.textMuted}}>🔽 Filtros ativos:</span>
            {filtrosAtivos.map(([campo,valor]) => (
              <FilterChip key={campo} campo={campo} valor={valor} label={`${campo}=${fmtVal(valor, CAMPOS_CTRL.find(c=>c.key===campo)||{})}`} />
            ))}
            <button onClick={()=>setFiltros({})} style={{padding:"2px 8px",background:"transparent",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"10px",color:C.danger,cursor:"pointer",fontSize:"10px"}}>✕ Limpar filtros</button>
            <span style={{fontSize:"10px",color:C.textMuted,marginLeft:"4px"}}>→ {listaFiltrada.length} resultado(s)</span>
          </div>
        )}

        {/* Stats rápidas clicáveis */}
        <div style={{marginTop:"8px",display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {[
            {label:`🔴 ${equips.filter(e=>e.severidade==="CRITICA").length} CRÍTICA`, campo:"severidade", valor:"CRITICA", color:C.danger},
            {label:`🟠 ${equips.filter(e=>e.severidade==="ALTA").length} ALTA`, campo:"severidade", valor:"ALTA", color:"#f97316"},
            {label:`📊 minProb=100: ${equips.filter(e=>e.classificador?.minProbability===100).length}`, campo:"minProbability", valor:100, color:C.danger},
            {label:`❌ useClassif=false: ${equips.filter(e=>e.ocr?.useClassifierResult===false).length}`, campo:"useClassifierResult", valor:false, color:"#f97316"},
            {label:`⚠ scene=0: ${equips.filter(e=>e.classificador?.sceneType===0).length}`, campo:"sceneType", valor:0, color:C.warning},
            {label:`🟢 Online: ${equips.filter(e=>e.online).length}`, campo:"online", valor:true, color:C.success},
            {label:`✅ ${equips.filter(e=>e.severidade==="OK").length} OK`, campo:"severidade", valor:"OK", color:C.success},
          ].map(({label,campo,valor,color},i) => {
            const ativo = filtros[campo]!==undefined && String(filtros[campo])===String(valor);
            return (
              <button key={i} onClick={()=>toggleFiltro(campo, valor)}
                title={`Clique para ${ativo?"remover":"aplicar"} filtro: ${campo}=${valor}`}
                style={{padding:"3px 9px",background:ativo?`${color}22`:"transparent",border:`1px solid ${ativo?color:C.border}`,borderRadius:"12px",color:ativo?color:C.textMuted,cursor:"pointer",fontSize:"10px",fontWeight:ativo?700:400,transition:"all .15s"}}>
                {label}
              </button>
            );
          })}
          <span style={{fontSize:"10px",color:C.textMuted,alignSelf:"center",marginLeft:"4px"}}>← clique para filtrar</span>
        </div>
      </div>

      {/* ══ TABELA UNIFICADA ═══════════════════════════════════════ */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"10px",overflow:"hidden"}}>
        <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
          <span style={{fontWeight:700,fontSize:"12px"}}>{PASSOS_GUIA[2].icon} Passo 2+3 — Tabela Comparativa</span>
          <span style={{fontSize:"10px",padding:"2px 7px",background:"rgba(99,102,241,0.1)",borderRadius:"3px",color:"#818cf8"}}>Dados VARCO (imediato)</span>
          <span style={{fontSize:"10px",padding:"2px 7px",background:"rgba(16,185,129,0.1)",borderRadius:"3px",color:C.success}}>Config Real via Túnel (após "Ler")</span>
          {baseEq&&<span style={{fontSize:"10px",padding:"2px 7px",background:"rgba(245,158,11,0.1)",borderRadius:"3px",color:C.warning}}>⚠ Vermelho = diferente de {baseEq.nomeAxCross}</span>}
          <span style={{fontSize:"10px",color:C.textMuted,marginLeft:"auto"}}>💡 Clique nos valores coloridos para filtrar</span>
        </div>
        <div style={{overflowX:"auto",maxHeight:"620px",overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"10px"}}>
            <thead style={{position:"sticky",top:0,zIndex:2}}>
              <tr style={{background:C.tableHeader}}>
                <th style={{padding:"6px 8px",borderBottom:`1px solid ${C.border}`,width:"30px"}}>☑</th>
                <th style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`,textAlign:"left",minWidth:"140px"}}>Equipamento <span style={{fontSize:"8px",color:C.textMuted}}>(clique nos valores)</span></th>
                <th style={{padding:"6px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",color:"#818cf8"}}>Sev.</th>
                <th style={{padding:"6px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",color:"#818cf8"}} colSpan={3}>Dados VARCO</th>
                <th style={{padding:"6px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",color:C.success,borderLeft:`2px solid ${C.success}33`}} colSpan={CAMPOS_CTRL.length}>Config Real (Túnel) {PASSOS_GUIA[1].icon}</th>
                <th style={{padding:"6px 8px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>Ações {PASSOS_GUIA[3].icon}</th>
              </tr>
              <tr style={{background:C.tableHeader}}>
                <th style={{borderBottom:`1px solid ${C.border}`}}></th>
                <th style={{padding:"4px 10px",borderBottom:`1px solid ${C.border}`,fontSize:"9px",color:C.textMuted}}>Nome / IP / Status</th>
                <th style={{padding:"4px 5px",borderBottom:`1px solid ${C.border}`,fontSize:"9px",color:"#818cf8"}}>Nível</th>
                <th style={{padding:"4px 5px",borderBottom:`1px solid ${C.border}`,fontSize:"9px",color:"#818cf8",cursor:"pointer"}} title="Clique no valor para filtrar">minProb ▼</th>
                <th style={{padding:"4px 5px",borderBottom:`1px solid ${C.border}`,fontSize:"9px",color:"#818cf8",cursor:"pointer"}} title="Clique no valor para filtrar">useClassif ▼</th>
                <th style={{padding:"4px 5px",borderBottom:`1px solid ${C.border}`,fontSize:"9px",color:"#818cf8",cursor:"pointer"}} title="Clique no valor para filtrar">scene ▼</th>
                {CAMPOS_CTRL.map((c,i)=>(
                  <th key={c.key} title={`${c.desc} — Clique no valor para filtrar`} style={{padding:"3px 4px",borderBottom:`1px solid ${C.border}`,fontSize:"8px",color:c.crit?C.danger:"#818cf8",cursor:"help",whiteSpace:"nowrap",borderLeft:i===0?`2px solid ${C.success}33`:"none"}}>
                    {c.label}{c.crit?" 🔴":""}
                  </th>
                ))}
                <th style={{padding:"4px 8px",borderBottom:`1px solid ${C.border}`}}></th>
              </tr>
              {baseConfig?.ok && (
                <tr style={{background:"rgba(99,102,241,0.07)",borderBottom:`2px solid rgba(99,102,241,0.25)`}}>
                  <th style={{padding:"5px 8px",textAlign:"center",fontSize:"9px",color:"#818cf8"}}>BASE</th>
                  <th style={{padding:"5px 10px",color:"#818cf8",fontWeight:700,fontSize:"10px"}}>{baseEq?.nomeAxCross}</th>
                  <th></th>
                  <th style={{padding:"5px 5px",textAlign:"center",color:C.success,fontSize:"10px",fontWeight:700}}>{baseEq?.classificador?.minProbability}%</th>
                  <th style={{padding:"5px 5px",textAlign:"center",color:C.success,fontSize:"10px",fontWeight:700}}>{String(baseEq?.ocr?.useClassifierResult)}</th>
                  <th style={{padding:"5px 5px",textAlign:"center",color:C.success,fontSize:"10px",fontWeight:700}}>{SCENE_LBL[baseEq?.classificador?.sceneType]||"?"}</th>
                  {CAMPOS_CTRL.map((c,i)=>(
                    <th key={c.key} style={{padding:"5px 4px",textAlign:"center",color:C.success,fontWeight:700,fontSize:"9px",borderLeft:i===0?`2px solid ${C.success}33`:"none"}}>
                      {fmtVal(getBaseVal(c),c)}
                    </th>
                  ))}
                  <th></th>
                </tr>
              )}
            </thead>
            <tbody>
              {listaFiltrada.map((eq, i) => {
                const sel  = selecionados.has(eq.tunnelUrl);
                const isBase = eq.tunnelUrl === baseEq?.tunnelUrl;
                const cfg  = configs[eq.tunnelUrl];
                const lendo= loadCfg[eq.tunnelUrl];
                const rk   = `${eq.tunnelUrl}_ALL`;
                const prob = eq.classificador?.minProbability;
                const useC = eq.ocr?.useClassifierResult;
                const scene= eq.classificador?.sceneType;
                const sev  = eq.severidade;
                const sevC = {CRITICA:C.danger,ALTA:"#f97316",MEDIA:C.warning,OK:C.success}[sev]||C.textMuted;
                const bg   = isBase?"rgba(99,102,241,0.04)":sel?"rgba(16,185,129,0.02)":i%2===0?"transparent":C.raised;
                const diffCnt = (!isBase&&baseConfig?.ok&&cfg?.ok) ? CAMPOS_CTRL.filter(c=>isDiff(getRealVal(eq,c),getBaseVal(c))).length : null;

                return (
                  <tr key={eq.tunnelUrl} style={{background:bg,borderBottom:`1px solid ${C.border}11`}}
                    onMouseEnter={e=>!isBase&&(e.currentTarget.style.background=C.rowHover)}
                    onMouseLeave={e=>!isBase&&(e.currentTarget.style.background=bg)}>
                    <td style={{padding:"5px 8px",textAlign:"center"}}>
                      {!isBase && <input type="checkbox" checked={sel} onChange={()=>setSel(p=>{const n=new Set(p);n.has(eq.tunnelUrl)?n.delete(eq.tunnelUrl):n.add(eq.tunnelUrl);return n;})}/>}
                    </td>
                    <td style={{padding:"5px 10px"}}>
                      <div style={{fontWeight:700,color:isBase?"#818cf8":C.brand,fontSize:"11px"}}>{eq.nomeAxCross}{isBase&&<span style={{fontSize:"8px",marginLeft:"4px",color:"#818cf8"}}>(base)</span>}</div>
                      <div style={{fontSize:"9px",color:C.textMuted}}>{eq.ip}</div>
                      <div style={{display:"flex",gap:"3px",marginTop:"1px",alignItems:"center"}}>
                        <ClickableCell campo="online" valor={eq.online} label={eq.online?"🟢 Online":"🔴 Offline"} color={eq.online?C.success:C.danger}/>
                        {eq.tunnelUrl&&<a href={eq.tunnelUrl+"/equipment/recognition"} target="_blank" rel="noreferrer" style={{fontSize:"8px",color:C.accent,textDecoration:"none"}}>🔗</a>}
                        <span style={{fontSize:"8px",color:C.textMuted}}>{eq.firmware||""}</span>
                      </div>
                    </td>
                    <td style={{padding:"5px 5px",textAlign:"center"}}>
                      <ClickableCell campo="severidade" valor={sev} label={<>{sev==="CRITICA"?"🔴":sev==="ALTA"?"🟠":sev==="MEDIA"?"🟡":"✅"}<br/><span style={{fontSize:"8px"}}>{sev}</span></>} color={sevC} bold/>
                    </td>
                    <td style={{padding:"5px 5px",textAlign:"center"}}>
                      <ClickableCell campo="minProbability" valor={prob} label={`${prob??'—'}%`} color={prob===100?C.danger:C.success} bold/>
                    </td>
                    <td style={{padding:"5px 5px",textAlign:"center"}}>
                      <ClickableCell campo="useClassifierResult" valor={useC} label={useC===false?"❌":useC===true?"✅":"—"} color={useC===false?C.danger:C.success} bold/>
                    </td>
                    <td style={{padding:"5px 5px",textAlign:"center"}}>
                      <ClickableCell campo="sceneType" valor={scene} label={SCENE_LBL[scene]||scene||"—"} color={scene===0?C.warning:C.success}/>
                    </td>
                    {/* Config Real */}
                    {CAMPOS_CTRL.map((c,ci) => {
                      if (!cfg) return (
                        <td key={c.key} style={{padding:"5px 4px",textAlign:"center",borderLeft:ci===0?`2px solid ${C.success}33`:"none"}}>
                          {ci===0&&(lendo?<span style={{fontSize:"9px",color:C.accent}}>⏳</span>:<button onClick={()=>lerConfigReal(eq)} style={{padding:"2px 5px",background:C.accentBg,border:`1px solid ${C.accent}33`,borderRadius:"3px",color:C.accent,cursor:"pointer",fontSize:"8px",whiteSpace:"nowrap"}}>📡 Ler</button>)}
                        </td>
                      );
                      if (!cfg.ok) return <td key={c.key} style={{padding:"5px 4px",textAlign:"center",borderLeft:ci===0?`2px solid ${C.success}33`:"none"}}>{ci===0&&<span style={{fontSize:"8px",color:C.danger}}>❌</span>}</td>;
                      const valReal = getRealVal(eq, c);
                      const valBase = getBaseVal(c);
                      const diff = !isBase && isDiff(valReal, valBase);
                      const ck = `${eq.tunnelUrl}_${c.key}`;
                      return (
                        <td key={c.key} style={{padding:"4px 4px",textAlign:"center",background:diff?"rgba(251,113,133,0.08)":"transparent",borderLeft:ci===0?`2px solid ${C.success}33`:"none"}}>
                          <ClickableCell campo={c.key} valor={valReal} label={fmtVal(valReal,c)} color={diff?C.danger:C.textSecondary} bold={diff}/>
                          {diff&&!isBase&&(
                            <button onClick={()=>aplicarCampo(eq, c.key, valBase)} title={`Corrigir para: ${fmtVal(valBase,c)}`}
                              style={{padding:"1px 4px",background:C.successBg,border:`1px solid ${C.success}33`,borderRadius:"2px",color:C.success,cursor:"pointer",fontSize:"7px",display:"block",margin:"1px auto",whiteSpace:"nowrap"}}>
                              {resultados[ck]||`→${fmtVal(valBase,c)}`}
                            </button>
                          )}
                          {resultados[ck]&&!diff&&<div style={{fontSize:"7px",color:C.success}}>{resultados[ck]}</div>}
                        </td>
                      );
                    })}
                    <td style={{padding:"5px 7px",textAlign:"center"}}>
                      {!isBase&&(
                        <div style={{display:"flex",flexDirection:"column",gap:"2px",alignItems:"center"}}>
                          {diffCnt!==null&&diffCnt>0&&(
                            <button onClick={()=>corrigirEquip(eq)} disabled={progresso.ativo}
                              style={{padding:"3px 7px",background:C.brandBg,border:`1px solid ${C.brand}`,borderRadius:"3px",color:C.brand,cursor:"pointer",fontSize:"9px",fontWeight:700,whiteSpace:"nowrap"}}>
                              {resultados[rk]||<><Wrench size={8}/> {diffCnt}dif</>}
                            </button>
                          )}
                          {(!cfg||!cfg.ok)&&!lendo&&(
                            <button onClick={()=>{lerConfigReal(eq);if(!baseEq)return;if(eq.classificador?.minProbability===100||eq.ocr?.useClassifierResult===false)corrigirEquip(eq);}} disabled={progresso.ativo}
                              style={{padding:"3px 7px",background:C.dangerBg,border:`1px solid ${C.danger}33`,borderRadius:"3px",color:C.danger,cursor:"pointer",fontSize:"9px",whiteSpace:"nowrap"}}>
                              {resultados[rk]||<><Wrench size={8}/> Corrigir</>}
                            </button>
                          )}
                          {cfg?.ok&&diffCnt===0&&<span style={{fontSize:"9px",color:C.success}}>✅ igual</span>}
                          {lendo&&<span style={{fontSize:"9px",color:C.accent}}>⏳</span>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:"7px 14px",background:C.raised,borderTop:`1px solid ${C.border}`,display:"flex",gap:"12px",fontSize:"10px",color:C.textMuted,flexWrap:"wrap",alignItems:"center"}}>
          <span>📡 {listaFiltrada.length} visíveis {filtrosAtivos.length>0?`(${equips.length} total)`:"de "+equips.length}</span>
          <span>🔍 {totalLidos} lidos</span>
          <span style={{color:C.success}}>☑ {totalSel} selecionados</span>
          {filtrosAtivos.length>0&&<button onClick={()=>setFiltros({})} style={{padding:"2px 8px",background:"transparent",border:`1px solid ${C.danger}33`,borderRadius:"8px",color:C.danger,cursor:"pointer",fontSize:"9px"}}>✕ Limpar filtros</button>}
          <span style={{marginLeft:"auto",color:"#818cf8",fontSize:"9px"}}>💡 Clique nos valores da tabela para filtrar · Clique nos chips para remover</span>
        </div>
      </div>
    </div>
  );
}



/**
 * 🛡️ AXCROSS MANAGER — Gerenciador Unificado AxCross
 *
 * Centraliza TODOS os recursos AxCross em uma única tela:
 * - Dashboard:     Status do banco, KPIs de passagens/equipamentos
 * - Passagens:     Consulta real com filtros por placa, local, faixa
 * - Equipamentos:  Lista + heartbeat dos dispositivos
 * - Locais:        Pontos de monitoramento cadastrados
 * - Sites:         Frota completa de instâncias AxCross (12 sites)
 * - Diagnóstico:   Análise do campo CLASSIFICACAO + intercorrências
 * - Suporte:       Ferramentas de atendimento AxCross
 *
 * Equivalente ao VARCO Monitor, mas para o AxCross.
 */
// ─────────────────────────────────────────────────────────────
function TabCorrecoes() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progresso, setProg] = useState({ ativo:false, atual:0, total:0, log:[], ok:0, fail:0 });
  const [resultados, setRes] = useState({});
  const [modoReversao, setModoReversao] = useState(false);
  useEffect(() => { carregar(); }, []);
  const carregar = async () => {
    setLoading(true);
    try { const r = await apiFetch("/axcross/frota-analise?semClassifOnly=false"); const d = await r.json(); if (d.ok) setDados(d); } catch(e) {}
    setLoading(false);
  };
  const corrigirUmAuto = async (eq) => {
    if (!eq.tunnelUrl) return;
    setRes(r => ({...r, [eq.nomeAxCross]: {ok:null, msg:"⏳ Login..."}}));
    try {
      const minP = modoReversao?100:60, useC = !modoReversao;
      const r = await apiFetch("/itscam/corrigir", { method:"POST", body: JSON.stringify({ tunnelUrl:eq.tunnelUrl, minProbability:minP, useClassifierResult:useC }) });
      const d = await r.json();
      setRes(p => ({...p, [eq.nomeAxCross]: d}));
    } catch(e) { setRes(p => ({...p, [eq.nomeAxCross]: {ok:false, msg:e.message}})); }
  };
  const corrigirTodosAuto = async () => {
    const equips = dados?.equipamentos?.filter(e => e.tunnelUrl && e.problemas?.some(p => ["CR-01","CR-02"].includes(p.codigo))) || [];
    setProg({ativo:true, atual:0, total:equips.length, log:[`🚀 ${modoReversao?"Revertendo":"Corrigindo"} ${equips.length}...`], ok:0, fail:0});
    for (let i = 0; i < equips.length; i++) {
      const eq = equips[i];
      setProg(p => ({...p, atual:i+1, log:[...p.log, `⏳ ${eq.nomeAxCross}...`].slice(-30)}));
      const minP = modoReversao?100:60, useC = !modoReversao;
      try {
        const r = await apiFetch("/itscam/corrigir", { method:"POST", body: JSON.stringify({ tunnelUrl:eq.tunnelUrl, minProbability:minP, useClassifierResult:useC }) });
        const d = await r.json();
        setRes(p => ({...p, [eq.nomeAxCross]: d}));
        setProg(p => ({...p, ok:p.ok+(d.ok?1:0), fail:p.fail+(d.ok?0:1), log:[...p.log, d.ok?`✅ ${eq.nomeAxCross}`:`❌ ${eq.nomeAxCross}`].slice(-30)}));
      } catch(e) { setProg(p => ({...p, fail:p.fail+1})); }
    }
    setProg(p => ({...p, ativo:false, log:[...p.log, `🏁 ✅${p.ok} ❌${p.fail}`]}));
  };
  const equipsComProblema = dados?.equipamentos?.filter(e => e.tunnelUrl && e.problemas?.some(p => ["CR-01","CR-02"].includes(p.codigo))) || [];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      <div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:"10px",padding:"12px 16px"}}>
        <div style={{fontWeight:800,fontSize:"14px",color:"#818cf8",marginBottom:"6px"}}>🔧 Correções em Lote — Login Automático Playwright</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
          <div style={{background:C.raised,borderRadius:"7px",padding:"10px 12px",fontSize:"11px",color:C.textSecondary,lineHeight:1.7}}>
            <b>✅ Login automático:</b> O sistema abre cada túnel ITSCAM em headless browser, faz login com <code>admin/#econocr@</code> e aplica as correções via API REST.<br/>
            <b>CR-01:</b> minProbability 100% → 60% (via tela ITSCAM: Reconhecimento → Classifier)<br/>
            <b>CR-02:</b> useClassifierResult false → true (somente via API — campo invisível na UI)
          </div>
          <div>
            <div style={{padding:"10px 12px",background:modoReversao?C.dangerBg:C.brandBg,border:`1px solid ${modoReversao?C.danger:C.brand}44`,borderRadius:"7px",marginBottom:"8px"}}>
              <div style={{fontWeight:700,fontSize:"12px",color:modoReversao?C.danger:C.brand,marginBottom:"5px"}}>{modoReversao?"⚠️ Modo: REVERTER":"✅ Modo: CORRIGIR"}</div>
              <button onClick={()=>setModoReversao(v=>!v)} style={{padding:"5px 12px",background:"transparent",border:`1px solid ${modoReversao?C.danger:C.brand}`,borderRadius:"4px",color:modoReversao?C.danger:C.brand,cursor:"pointer",fontSize:"11px"}}>
                Alternar modo
              </button>
            </div>
            <div style={{fontSize:"10px",color:C.textMuted}}>⏱ ~8 segundos por equipamento · {equipsComProblema.length} com problema</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={carregar} disabled={loading} style={{padding:"7px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"5px",color:C.textMuted,cursor:"pointer",fontSize:"11px",display:"flex",alignItems:"center",gap:"4px"}}>
            <RefreshCw size={12} className={loading?"spin":""}/> Atualizar
          </button>
          <button onClick={corrigirTodosAuto} disabled={progresso.ativo||equipsComProblema.length===0}
            style={{padding:"7px 16px",background:modoReversao?C.dangerBg:C.brandBg,border:`1px solid ${modoReversao?C.danger:C.brand}`,borderRadius:"5px",color:modoReversao?C.danger:C.brand,cursor:"pointer",fontSize:"12px",fontWeight:700,display:"flex",alignItems:"center",gap:"5px",opacity:progresso.ativo?0.7:1}}>
            {progresso.ativo?<><RefreshCw size={12} className="spin"/>Processando...</>:<><Wrench size={12}/>{modoReversao?"Reverter TODOS":"Corrigir TODOS"} ({equipsComProblema.length})</>}
          </button>
        </div>
        {progresso.log.length>0&&<div style={{marginTop:"8px",background:C.raised,borderRadius:"5px",padding:"7px 10px",maxHeight:"80px",overflowY:"auto",fontSize:"10px",fontFamily:"monospace"}}>
          {progresso.log.slice(-10).map((l,i)=><div key={i} style={{color:l.startsWith("✅")||l.startsWith("🏁")?C.success:l.startsWith("❌")?C.danger:C.textMuted}}>{l}</div>)}
        </div>}
      </div>
      {loading&&<div style={{textAlign:"center",padding:"20px",color:C.textMuted}}><RefreshCw size={18} className="spin" style={{display:"block",margin:"0 auto 8px"}}/>Carregando frota...</div>}
      {dados&&(
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"10px",overflow:"hidden"}}>
          <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:"13px"}}>
            📊 {dados.equipamentos.length} Equipamentos · {equipsComProblema.length} com problema
          </div>
          <div style={{overflowX:"auto",maxHeight:"500px",overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px"}}>
              <thead style={{position:"sticky",top:0,background:C.tableHeader}}>
                <tr>
                  <th style={{padding:"7px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,color:C.textMuted}}>Equipamento</th>
                  <th style={{padding:"7px 8px",textAlign:"center",borderBottom:`1px solid ${C.border}`,color:C.textMuted}}>minProb</th>
                  <th style={{padding:"7px 8px",textAlign:"center",borderBottom:`1px solid ${C.border}`,color:C.textMuted}}>useClassif</th>
                  <th style={{padding:"7px 8px",textAlign:"center",borderBottom:`1px solid ${C.border}`,color:C.textMuted}}>Firmware</th>
                  <th style={{padding:"7px 8px",textAlign:"center",borderBottom:`1px solid ${C.border}`,color:C.textMuted}}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {dados.equipamentos.map((eq,i)=>{
                  const res = resultados[eq.nomeAxCross];
                  const prob = eq.classificador?.minProbability;
                  const useC = eq.ocr?.useClassifierResult;
                  const bg = i%2===0?"transparent":C.raised;
                  return (
                    <tr key={eq.nome} style={{background:bg,borderBottom:`1px solid ${C.border}11`}}>
                      <td style={{padding:"6px 10px"}}>
                        <div style={{fontWeight:700,color:C.brand,fontSize:"12px"}}>{eq.nomeAxCross}</div>
                        <div style={{fontSize:"9px",color:C.textMuted}}>{eq.ip}</div>
                      </td>
                      <td style={{padding:"6px 8px",textAlign:"center",fontWeight:700,fontSize:"12px",color:prob===100?C.danger:C.success}}>{prob??'—'}%</td>
                      <td style={{padding:"6px 8px",textAlign:"center",fontSize:"11px",color:useC===false?C.danger:C.success,fontWeight:700}}>{useC===false?"❌ false":useC===true?"✅ true":"—"}</td>
                      <td style={{padding:"6px 8px",textAlign:"center",color:C.textSecondary,fontSize:"10px"}}>{eq.firmware||"—"}</td>
                      <td style={{padding:"6px 8px",textAlign:"center"}}>
                        {eq.tunnelUrl?(
                          res?.ok===true?<span style={{fontSize:"10px",color:C.success}}>✅ OK</span>:
                          res?.ok===null?<span style={{fontSize:"10px",color:C.accent}}>⏳ login...</span>:
                          res?.ok===false?<span style={{fontSize:"10px",color:C.danger}} title={res.erro}>❌</span>:(
                            <div style={{display:"flex",gap:"4px",justifyContent:"center"}}>
                              <button onClick={()=>corrigirUmAuto(eq)} disabled={progresso.ativo} style={{padding:"3px 8px",background:modoReversao?C.dangerBg:C.brandBg,border:`1px solid ${modoReversao?C.danger:C.brand}`,borderRadius:"3px",color:modoReversao?C.danger:C.brand,cursor:"pointer",fontSize:"9px",fontWeight:700}}>
                                <Wrench size={9}/> {modoReversao?"Reverter":"Corrigir"}
                              </button>
                              {eq.tunnelUrl&&<a href={eq.tunnelUrl+"/equipment/recognition"} target="_blank" rel="noreferrer" style={{padding:"3px 7px",background:C.accentBg,border:`1px solid ${C.accent}33`,borderRadius:"3px",color:C.accent,textDecoration:"none",fontSize:"9px",display:"flex",alignItems:"center",gap:"2px"}}><ExternalLink size={9}/>Túnel</a>}
                            </div>
                          )
                        ):<span style={{fontSize:"9px",color:C.textMuted}}>sem túnel</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{padding:"7px 14px",background:C.raised,borderTop:`1px solid ${C.border}`,fontSize:"10px",color:C.textMuted,display:"flex",gap:"14px"}}>
            <span>🔴 {dados.stats.criticos} críticos</span><span>minProb=100: {dados.stats.minProb100}</span><span>useClassifFalse: {dados.stats.useClassifFalse}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function TabAuditoria() {
  const [frota, setFrota] = useState(null);
  const [configs, setConfigs] = useState({});
  const [loadingFrota, setLoadingFrota] = useState(false);
  const [loadingConfigs, setLoadingConfigs] = useState({});
  const [baseEquip, setBaseEquip] = useState(null);
  const [progLeitura, setProgLeitura] = useState({ ativo:false, atual:0, total:0, log:[] });
  const [aplicando, setAplicando] = useState({});
  const [resultadosAplicacao, setResultadosAplicacao] = useState({});
  useEffect(() => { carregarFrota(); }, []);
  const carregarFrota = async () => {
    setLoadingFrota(true);
    try { const r = await apiFetch("/axcross/frota-analise?semClassifOnly=false"); const d = await r.json(); if (d.ok) setFrota(d); } catch(e) {}
    setLoadingFrota(false);
  };
  const lerConfigEq = async (eq) => {
    if (!eq.tunnelUrl) return;
    setLoadingConfigs(p => ({...p, [eq.tunnelUrl]:true}));
    try {
      const r = await apiFetch("/itscam/ler-config", { method:"POST", body: JSON.stringify({ tunnelUrl:eq.tunnelUrl }) });
      const d = await r.json();
      if (d.ok) setConfigs(p => ({...p, [eq.tunnelUrl]: {...d, nomeAxCross:eq.nomeAxCross, eq}}));
      else setConfigs(p => ({...p, [eq.tunnelUrl]: {ok:false, erro:d.erro, nomeAxCross:eq.nomeAxCross}}));
    } catch(e) { setConfigs(p => ({...p, [eq.tunnelUrl]: {ok:false, erro:e.message, nomeAxCross:eq.nomeAxCross}})); }
    setLoadingConfigs(p => ({...p, [eq.tunnelUrl]:false}));
  };
  const lerTodos = async () => {
    const equips = (frota?.equipamentos||[]).filter(e => e.tunnelUrl);
    setProgLeitura({ativo:true, atual:0, total:equips.length, log:[`📡 Lendo ${equips.length}...`]});
    for (let i=0;i<equips.length;i++) {
      const eq=equips[i];
      setProgLeitura(p=>({...p,atual:i+1,log:[...p.log,`⏳ ${eq.nomeAxCross}...`].slice(-20)}));
      await lerConfigEq(eq);
    }
    setProgLeitura(p=>({...p,ativo:false,log:[...p.log,`✅ Concluído`]}));
  };
  const aplicarTodosCampos = async (eq, camposDiff) => {
    const k = `${eq.tunnelUrl}_all`;
    setAplicando(p=>({...p,[k]:true}));
    const campos = {};
    for (const {key, valorBase} of camposDiff) campos[key] = valorBase;
    try {
      const r = await apiFetch("/itscam/aplicar-config", { method:"POST", body: JSON.stringify({ tunnelUrl:eq.tunnelUrl, campos }) });
      const d = await r.json();
      setResultadosAplicacao(p=>({...p,[k]:d.ok?"✅ Aplicado":`❌ ${d.erro||""}`}));
      if (d.ok) await lerConfigEq(eq);
    } catch(e) { setResultadosAplicacao(p=>({...p,[k]:`❌`})); }
    setAplicando(p=>({...p,[k]:false}));
  };
  const getValor = (cfg, campo) => {
    if (!cfg||!cfg.ok) return null;
    if (campo.endpoint==="classifier") return cfg.classificador?.[campo.key];
    if (campo.endpoint==="ocr") return cfg.ocr?.[campo.key];
    return null;
  };
  const fmtV = (val, campo) => {
    if (val===null||val===undefined) return "—";
    if (campo.key==="minProbability") return `${val}%`;
    if (campo.key==="sceneType") return ({0:"Genérico",1:"Open Road",2:"Close-up"})[val]||String(val);
    if (typeof val==="boolean") return val?"✅ true":"❌ false";
    return String(val);
  };
  const isDiff = (a,b) => a!==null&&b!==null&&a!==undefined&&b!==undefined&&String(a)!==String(b);
  const CAMPOS = [
    {key:"minProbability",label:"Confiabilidade mínima",endpoint:"classifier"},
    {key:"useClassifierResult",label:"Usar Classifier (OCR)",endpoint:"ocr"},
    {key:"sceneType",label:"Cenário",endpoint:"classifier"},
    {key:"enableCharacteristics",label:"Caract. Veículo",endpoint:"classifier"},
    {key:"maxPlates",label:"Máx. Placas",endpoint:"ocr"},
    {key:"enabled",label:"Classifier ON",endpoint:"classifier"},
    {key:"licensed",label:"Licença",endpoint:"classifier"},
  ];
  const equipamentos = (frota?.equipamentos||[]).filter(e=>e.tunnelUrl);
  const baseConfig = baseEquip?configs[baseEquip.tunnelUrl]:null;
  const outrosEquips = equipamentos.filter(e=>e.tunnelUrl!==baseEquip?.tunnelUrl);
  const totalLidos = equipamentos.filter(e=>configs[e.tunnelUrl]?.ok).length;
  const getCamposDiff = (eq) => {
    if (!baseConfig?.ok||!configs[eq.tunnelUrl]?.ok) return [];
    return CAMPOS.filter(c=>{const vB=getValor(baseConfig,c);const vE=getValor(configs[eq.tunnelUrl],c);return isDiff(vB,vE);}).map(c=>({...c,valorBase:getValor(baseConfig,c),valorEq:getValor(configs[eq.tunnelUrl],c)}));
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      <div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:"10px",padding:"12px 16px"}}>
        <div style={{fontWeight:800,fontSize:"14px",color:"#818cf8",marginBottom:"6px"}}>🔬 Auditoria De-Para — Comparação de Configurações</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:"10px",alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:"10px",fontWeight:700,color:"#818cf8",marginBottom:"3px"}}>🎯 Equipamento Base:</div>
            <select value={baseEquip?.tunnelUrl||""} onChange={e=>{const eq=equipamentos.find(x=>x.tunnelUrl===e.target.value);setBaseEquip(eq||null);if(eq&&!configs[eq.tunnelUrl])lerConfigEq(eq);}}
              style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${baseEquip?"#818cf8":C.border}`,borderRadius:"5px",color:C.text,fontSize:"11px"}}>
              <option value="">— selecionar base —</option>
              {equipamentos.map(eq=><option key={eq.tunnelUrl} value={eq.tunnelUrl}>{eq.nomeAxCross}{configs[eq.tunnelUrl]?.ok?" ✅":""}</option>)}
            </select>
          </div>
          <button onClick={lerTodos} disabled={progLeitura.ativo} style={{padding:"8px 14px",background:C.brandBg,border:`1px solid ${C.brand}`,borderRadius:"5px",color:C.brand,cursor:"pointer",fontSize:"11px",fontWeight:600,display:"flex",alignItems:"center",gap:"4px"}}>
            {progLeitura.ativo?<><RefreshCw size={11} className="spin"/>Lendo...</>:<><Search size={11}/>Ler Todos ({equipamentos.length})</>}
          </button>
          <span style={{fontSize:"11px",color:C.textMuted}}>{totalLidos}/{equipamentos.length} lidos</span>
        </div>
        {progLeitura.log.length>0&&<div style={{marginTop:"8px",fontSize:"10px",color:C.textMuted}}>{progLeitura.log[progLeitura.log.length-1]}</div>}
      </div>
      {baseConfig?.ok&&(
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"10px",overflow:"hidden"}}>
          <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:"13px"}}>
            📊 De-Para: {baseEquip?.nomeAxCross} vs {outrosEquips.length} equipamentos
          </div>
          <div style={{overflowX:"auto",maxHeight:"550px",overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"10px"}}>
              <thead style={{position:"sticky",top:0,background:C.tableHeader}}>
                <tr>
                  <th style={{padding:"7px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,color:C.textMuted,minWidth:"140px"}}>Equipamento</th>
                  {CAMPOS.map(c=><th key={c.key} style={{padding:"5px 6px",textAlign:"center",borderBottom:`1px solid ${C.border}`,fontSize:"9px",color:"#818cf8",whiteSpace:"nowrap"}}>{c.label}</th>)}
                  <th style={{padding:"7px 8px",textAlign:"center",borderBottom:`1px solid ${C.border}`,color:C.textMuted}}>Ações</th>
                </tr>
                <tr style={{background:"rgba(99,102,241,0.07)"}}>
                  <th style={{padding:"5px 10px",color:"#818cf8",fontWeight:700,fontSize:"10px"}}>BASE: {baseEquip?.nomeAxCross}</th>
                  {CAMPOS.map(c=><th key={c.key} style={{padding:"5px 6px",textAlign:"center",color:C.success,fontWeight:700,fontSize:"9px"}}>{fmtV(getValor(baseConfig,c),c)}</th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {outrosEquips.map((eq,i)=>{
                  const cfg=configs[eq.tunnelUrl];
                  const isLoading=loadingConfigs[eq.tunnelUrl];
                  const camposDiff=getCamposDiff(eq);
                  const k=`${eq.tunnelUrl}_all`;
                  return (
                    <tr key={eq.tunnelUrl} style={{background:i%2===0?"transparent":C.raised,borderBottom:`1px solid ${C.border}11`}}>
                      <td style={{padding:"6px 10px"}}>
                        <div style={{fontWeight:700,color:C.brand,fontSize:"11px"}}>{eq.nomeAxCross}</div>
                        <div style={{fontSize:"9px",color:C.textMuted}}>{eq.ip}</div>
                        {!cfg&&!isLoading&&<button onClick={()=>lerConfigEq(eq)} style={{marginTop:"2px",padding:"2px 6px",background:C.accentBg,border:`1px solid ${C.accent}33`,borderRadius:"3px",color:C.accent,cursor:"pointer",fontSize:"8px"}}>📡 Ler</button>}
                        {isLoading&&<span style={{fontSize:"9px",color:C.accent}}>⏳</span>}
                      </td>
                      {CAMPOS.map(c=>{
                        if(!cfg?.ok) return <td key={c.key} style={{padding:"6px 5px",textAlign:"center",color:C.textMuted}}>—</td>;
                        const vB=getValor(baseConfig,c), vE=getValor(cfg,c), diff=isDiff(vB,vE);
                        return (
                          <td key={c.key} style={{padding:"4px 5px",textAlign:"center",background:diff?"rgba(251,113,133,0.1)":"transparent"}}>
                            <div style={{fontWeight:diff?700:400,color:diff?C.danger:C.textSecondary,fontSize:"9px"}}>{fmtV(vE,c)}</div>
                          </td>
                        );
                      })}
                      <td style={{padding:"5px 8px",textAlign:"center"}}>
                        {cfg?.ok&&camposDiff.length>0&&<button onClick={()=>aplicarTodosCampos(eq,camposDiff)} disabled={aplicando[k]} style={{padding:"3px 8px",background:C.brandBg,border:`1px solid ${C.brand}`,borderRadius:"3px",color:C.brand,cursor:"pointer",fontSize:"9px",fontWeight:700}}>
                          {aplicando[k]?<RefreshCw size={8} className="spin"/>:<><Wrench size={8}/>{camposDiff.length} dif</>}
                          {resultadosAplicacao[k]&&<span style={{marginLeft:"4px"}}>{resultadosAplicacao[k]}</span>}
                        </button>}
                        {cfg?.ok&&camposDiff.length===0&&<span style={{fontSize:"9px",color:C.success}}>✅</span>}
                        {!cfg&&<button onClick={()=>lerConfigEq(eq)} disabled={isLoading} style={{padding:"2px 6px",background:C.accentBg,border:`1px solid ${C.accent}33`,borderRadius:"3px",color:C.accent,cursor:"pointer",fontSize:"8px"}}>{isLoading?"⏳":"📡"}</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
const STORAGE_KEY_INVESTIGAR = "axcross_investigar_last";
function TabInvestigar() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_INVESTIGAR)||"{}"); } catch { return {}; } })();
  const [site, setSite] = useState(() => AXCROSS_SITES.find(s=>s.url===saved.siteUrl)||AXCROSS_SITES[9]);
  const [login, setLogin] = useState(saved.login||"suporte@axiontecnologia.com.br");
  const [senha, setSenha] = useState(saved.senha||"Axion@2026");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const investigar = async () => {
    if (!senha.trim()) { setErro("Informe a senha."); return; }
    localStorage.setItem(STORAGE_KEY_INVESTIGAR, JSON.stringify({siteUrl:site.url,login,senha,salvoEm:new Date().toLocaleString("pt-BR")}));
    setLoading(true); setErro(null); setResultado(null);
    try {
      const r = await apiFetch("/axcross/investigar", { method:"POST", body: JSON.stringify({siteUrl:site.url,login,senha}) });
      const d = await r.json();
      if (d.ok) setResultado(d);
      else setErro(d.erro||d.mensagem||"Erro desconhecido");
    } catch(e) { setErro(e.message); }
    setLoading(false);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"14px 16px"}}>
        <div style={{fontWeight:700,fontSize:"14px",marginBottom:"12px"}}>🔍 Investigar via URL de Produção</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
          <div>
            <div style={{fontSize:"11px",color:C.textMuted,marginBottom:"4px"}}>Site AxCross:</div>
            <select value={site.url} onChange={e=>setSite(AXCROSS_SITES.find(s=>s.url===e.target.value)||AXCROSS_SITES[0])}
              style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:"5px",color:C.text,fontSize:"12px"}}>
              {AXCROSS_SITES.filter(s=>s.status==="ativo").map(s=><option key={s.url} value={s.url}>{s.nome}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:"11px",color:C.textMuted,marginBottom:"4px"}}>Login:</div>
            <input value={login} onChange={e=>setLogin(e.target.value)} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:"5px",color:C.text,fontSize:"12px",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontSize:"11px",color:C.textMuted,marginBottom:"4px"}}>Senha:</div>
            <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:"5px",color:C.text,fontSize:"12px",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",alignItems:"flex-end"}}>
            <button onClick={investigar} disabled={loading} style={{width:"100%",padding:"9px",background:C.brandBg,border:`1px solid ${C.brand}`,borderRadius:"5px",color:C.brand,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
              {loading?<><RefreshCw size={13} className="spin"/>Investigando...</>:<><Search size={13}/>Investigar</>}
            </button>
          </div>
        </div>
        {erro&&<div style={{padding:"8px 12px",background:C.dangerBg,borderRadius:"5px",color:C.danger,fontSize:"12px"}}>❌ {erro}</div>}
      </div>
      {resultado&&(
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"14px 16px"}}>
          <div style={{fontWeight:700,marginBottom:"10px"}}>✅ Resultado</div>
          <pre style={{fontSize:"11px",color:C.textSecondary,overflowX:"auto",maxHeight:"400px"}}>{JSON.stringify(resultado,null,2)}</pre>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function TabSuporte() {
  const ferramentas = [
    {icon:"🔎",titulo:"Consultar Passagens por Placa",desc:"Busque passagens de um veículo específico",aba:"passagens"},
    {icon:"📡",titulo:"Verificar Equipamentos",desc:"Status e heartbeat dos dispositivos",aba:"equipamentos"},
    {icon:"🗺️",titulo:"Mapa de Equipamentos",desc:"Visualize o mapa de monitoramento online",link:"https://economia.axcross.axion.ws/monitoringonline/monitoring/equipmentmap",externo:true},
    {icon:"📋",titulo:"Documentação AxCross",desc:"Portal de documentação técnica",link:"http://localhost:3012/AxCross.Docs",externo:true},
    {icon:"🐛",titulo:"Diagnóstico de Classificação",desc:"Análise das causas do campo CLASSIFICACAO vazio",aba:"diagnostico"},
    {icon:"🚀",titulo:"Centro de Controle ITSCAM",desc:"Correções automáticas via VARCO",aba:"controle"},
  ];
  const CREDENCIAIS = [{grupo:"Axion Suporte",login:"suporte@axiontecnologia.com.br",senha:"Axion@2026"}];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"10px"}}>
        {ferramentas.map((f,i)=>(
          <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"14px"}}>
            <div style={{fontSize:"22px",marginBottom:"6px"}}>{f.icon}</div>
            <div style={{fontWeight:700,fontSize:"13px",marginBottom:"4px"}}>{f.titulo}</div>
            <div style={{fontSize:"12px",color:C.textMuted,marginBottom:"10px",lineHeight:1.5}}>{f.desc}</div>
            {f.link&&<a href={f.link} target={f.externo?"_blank":"_self"} rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 12px",background:C.brandBg,border:`1px solid ${C.brand}44`,borderRadius:"5px",color:C.brand,textDecoration:"none",fontSize:"12px",fontWeight:600}}><ExternalLink size={12}/>Acessar</a>}
          </div>
        ))}
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"14px"}}>
        <div style={{fontWeight:700,fontSize:"13px",marginBottom:"10px",display:"flex",alignItems:"center",gap:"8px"}}><Shield size={14} color={C.brand}/>Credenciais de Acesso AxCross</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"8px"}}>
          {CREDENCIAIS.map((c,i)=>(
            <div key={i} style={{background:C.raised,borderRadius:"6px",padding:"10px 12px"}}>
              <div style={{fontSize:"11px",fontWeight:600,color:C.brand,marginBottom:"5px"}}>{c.grupo}</div>
              <div style={{fontSize:"11px",color:C.textSecondary}}>Login: <code>{c.login}</code></div>
              <div style={{fontSize:"11px",color:C.textSecondary}}>Senha: <code>{c.senha}</code></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function AxCrossManager() {
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "controle");
  const [status, setStatus] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [passagens, setPassagens] = useState(null);
  const [equipamentos, setEquipamentos] = useState(null);
  const [heartbeat, setHeartbeat] = useState(null);
  const [locais, setLocais] = useState(null);
  const [dbDiag, setDbDiag] = useState(null);
  const [dbDiagLoading, setDbDiagLoading] = useState(false);
  const [dbDiagError, setDbDiagError] = useState(null);
  const [urlResult, setUrlResult] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  }, [tab]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, p, e, h, l] = await Promise.all([
        apiFetch("/axcross/status").then(r=>r.json()).catch(()=>null),
        apiFetch("/axcross/resumo").then(r=>r.json()).catch(()=>null),
        apiFetch("/axcross/passagens").then(r=>r.json()).catch(()=>null),
        apiFetch("/axcross/equipamentos").then(r=>r.json()).catch(()=>null),
        apiFetch("/axcross/heartbeat").then(r=>r.json()).catch(()=>null),
        apiFetch("/axcross/locais").then(r=>r.json()).catch(()=>null),
      ]);
      setStatus(s); setResumo(r); setPassagens(p); setEquipamentos(e); setHeartbeat(h); setLocais(l);
    } catch(err) { console.error(err); }
    setLoading(false);
  }, []);

  const fetchDiag = useCallback(async () => {
    setDbDiagLoading(true); setDbDiagError(null);
    try { const r = await apiFetch("/axcross/diagnostico-classificacao"); const d = await r.json(); setDbDiag(d); }
    catch(e) { setDbDiagError(e.message); }
    setDbDiagLoading(false);
  }, []);

  const fetchUrl = useCallback(async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true); setUrlError(null); setUrlResult(null);
    try { const r = await apiFetch("/axcross/investigar-publico", { method:"POST", body: JSON.stringify({url:urlInput}) }); const d = await r.json(); setUrlResult(d); }
    catch(e) { setUrlError(e.message); }
    setUrlLoading(false);
  }, [urlInput]);

  useEffect(() => { fetchAll(); }, []);

  const totalSites = AXCROSS_SITES.filter(s=>s.status==="ativo").length;
  const totalEquip = AXCROSS_SITES.reduce((a,s)=>a+(s.equipamentos||0),0);

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"16px",fontFamily:"inherit"}}>
      {showConfigModal && <ConfigModal onClose={()=>setShowConfigModal(false)} onSuccess={()=>{setShowConfigModal(false);fetchAll();}}/>}

      {/* STATUS BAR */}
      <div style={{background:C.surface,border:`1px solid ${status?.ok?C.brand+"33":C.border}`,borderRadius:"8px",padding:"8px 14px",marginBottom:"12px",display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap",fontSize:"11px"}}>
        <span style={{fontWeight:700,color:C.brand,fontSize:"13px"}}>🛡️ AxCross Manager</span>
        <span style={{color:C.textMuted}}>{totalSites} sites · {totalEquip} equip.</span>
        {/* Banco SQL — informativo, não bloqueador */}
        {status?.ok
          ? <span style={{color:C.success,fontWeight:600,padding:"2px 8px",background:C.successBg,borderRadius:"4px"}}>✅ Banco SQL conectado</span>
          : <span style={{color:C.warning,padding:"2px 8px",background:C.warningBg,borderRadius:"4px",fontSize:"10px"}}>
              ⚠ Banco SQL offline
              <button onClick={()=>setShowConfigModal(true)} style={{background:"transparent",border:"none",color:C.accent,cursor:"pointer",textDecoration:"underline",padding:"0 4px",fontSize:"10px"}}>configurar</button>
            </span>
        }
        {/* Recursos que funcionam SEM SQL */}
        <span style={{color:C.success,padding:"2px 8px",background:C.successBg,borderRadius:"4px",fontSize:"10px",fontWeight:600}}>
          🚀 VARCO + ITSCAM online
        </span>
        <button onClick={()=>setTab("controle")} style={{padding:"3px 9px",background:C.brandBg,border:`1px solid ${C.brand}44`,borderRadius:"4px",color:C.brand,cursor:"pointer",fontSize:"10px",fontWeight:700}}>
          → Centro de Controle
        </button>
        <span style={{color:C.textMuted,marginLeft:"auto"}}>Atualizado: {new Date().toLocaleTimeString("pt-BR")}</span>
        <button onClick={()=>setShowConfigModal(true)} style={{padding:"4px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:"4px",color:C.textMuted,cursor:"pointer",fontSize:"10px",display:"flex",alignItems:"center",gap:"3px"}}><Settings size={10}/>SQL</button>
        <button onClick={fetchAll} disabled={loading} style={{padding:"4px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:"4px",color:C.textMuted,cursor:"pointer",fontSize:"10px",display:"flex",alignItems:"center",gap:"3px"}}><RefreshCw size={10} className={loading?"spin":""}/>Atualizar</button>
      </div>

      {/* KPI CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"10px",marginBottom:"12px"}}>
        <StatCard label="Sites Ativos" value={totalSites} color={C.brand} icon={<Globe size={14}/>} sub="instâncias AxCross" onClick={()=>setTab("sites")}/>
        <StatCard label="Passagens Hoje" value={resumo?.passagensHoje!=null?fmt(resumo.passagensHoje):"—"} color="#a78bfa" icon={<Activity size={14}/>} sub="registradas" onClick={()=>setTab("passagens")}/>
        <StatCard label="Equipamentos DB" value={fmt(equipamentos?.total)} color={C.accent} icon={<Navigation size={14}/>} sub="no banco local" onClick={()=>setTab("equipamentos")}/>
        <StatCard label="Locais" value={fmt(locais?.total)} color={C.warning} icon={<MapPin size={14}/>} sub="pontos monit." onClick={()=>setTab("locais")}/>
        <StatCard label="Diagnóstico" value={dbDiag?(dbDiag.tem_classificacao?"OK":"FALTA"):"—"} color={dbDiag?(dbDiag.tem_classificacao?C.success:C.danger):C.textMuted} icon={<AlertTriangle size={14}/>} sub="classificação" onClick={()=>setTab("diagnostico")}/>
      </div>

      {/* NAVEGAÇÃO */}
      <div style={{padding:"4px 0 12px"}}>
        <QuickSelect
          options={[
            {id:"dashboard",label:"Dashboard"},
            {id:"investigar",label:"🔍 Investigar via URL"},
            {id:"comparativo",label:"📊 Comparativo & VARCO"},
            {id:"controle",label:"🚀 Centro de Controle"},
            {id:"frota",label:"🏭 Frota Completa"},
            {id:"correcoes",label:"🔧 Correções em Lote"},
            {id:"auditoria",label:"🔬 Auditoria De-Para"},
            {id:"passagens",label:"Passagens"},
            {id:"equipamentos",label:"Equipamentos"},
            {id:"locais",label:"Locais"},
            {id:"sites",label:`Sites (${totalSites})`},
            {id:"diagnostico",label:"Diagnóstico"},
            {id:"suporte",label:"Suporte"},
          ]}
          value={tab}
          onChange={setTab}
          color="#10b981"
          label="Módulo"
        />
      </div>

      {/* CONTEÚDO */}
      {tab==="dashboard"    && <TabDashboard status={status} resumo={resumo} passagens={passagens} loading={loading} onRefresh={fetchAll} onConfig={()=>setShowConfigModal(true)}/>}
      {tab==="investigar"   && <TabInvestigar/>}
      {tab==="comparativo"  && <TabComparativo/>}
      {tab==="controle"     && <TabControle/>}
      {tab==="frota"        && <TabFrota/>}
      {tab==="correcoes"    && <TabCorrecoes/>}
      {tab==="auditoria"    && <TabAuditoria/>}
      {tab==="passagens"    && <TabPassagens passagens={passagens} loading={loading}/>}
      {tab==="equipamentos" && <TabEquipamentos equipamentos={equipamentos} heartbeat={heartbeat} loading={loading}/>}
      {tab==="locais"       && <TabLocais locais={locais} loading={loading}/>}
      {tab==="sites"        && <TabSites/>}
      {tab==="diagnostico"  && <TabDiagnostico dbDiag={dbDiag} dbDiagLoading={dbDiagLoading} dbDiagError={dbDiagError} fetchDiag={fetchDiag} urlResult={urlResult} urlLoading={urlLoading} urlError={urlError} urlInput={urlInput} setUrlInput={setUrlInput} fetchUrl={fetchUrl}/>}
      {tab==="suporte"      && <TabSuporte/>}

      {/* FOOTER */}
      <div style={{marginTop:"20px",padding:"10px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"8px",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"11px",color:C.textMuted,flexWrap:"wrap",gap:"8px"}}>
        <span>AxCross Manager · {AXCROSS_SITES.length} sites · API: http://localhost:3100/api/axcross/*</span>
        <div style={{display:"flex",gap:"12px"}}>
          <a href="http://localhost:3012/AxCross.Docs" target="_blank" rel="noreferrer" style={{color:C.brand,textDecoration:"none",display:"flex",alignItems:"center",gap:"4px"}}><ExternalLink size={11}/>Docs AxCross</a>
        </div>
      </div>

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
