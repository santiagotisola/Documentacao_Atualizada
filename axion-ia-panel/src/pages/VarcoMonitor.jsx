import React, { useState, useEffect, useMemo } from "react";
import { Radio, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Search, ChevronDown, ChevronUp, ExternalLink, Wrench, Eye, Copy, Terminal, Shield, Play } from "lucide-react";
import QuickSelect from "../components/QuickSelect.jsx";

const API_BASE = "http://localhost:3100";

// Helper: abre o túnel VARCO ao clicar no nome do equipamento
function TunnelLink({ nome, uuid, style = {} }) {
  if (!uuid) return <span style={style}>{nome}</span>;
  const url = `https://${uuid}-80.tunnel.varco.cloud`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Abrir túnel: ${url}\n\nCredenciais de acesso:\nLogin: Admin\nSenha: #econocr@`}
      onClick={e => e.stopPropagation()}
      style={{ color: "inherit", textDecoration: "none", borderBottom: "1px dashed rgba(96,205,255,0.4)", cursor: "pointer", ...style }}
    >
      {nome}
    </a>
  );
}

/* ═══ Referências para análise de conformidade (consenso por maioria) ═══
   Usa TODOS os equipamentos online como base de votação.
   O consenso é determinado pelo valor mais frequente na frota inteira.
   Equipamentos com valor igual ao consenso = CONFORMES (referência).
═══════════════════════════════════════════════════════════════════════════ */

/* ══════════ WINDOWS 2026 FLUENT LIGHT THEME ══════════ */
const C = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  raised: "var(--surface-raised)",
  border: "var(--border)",
  borderLight: "var(--border)",
  text: "var(--text)",
  textMuted: "var(--text-muted)",
  textSecondary: "var(--text-secondary)",
  accent: "var(--accent)",
  accentBg: "var(--accent-subtle)",
  success: "var(--success)",
  successBg: "var(--success-bg)",
  successBorder: "var(--success)",
  warning: "var(--warning)",
  warningBg: "var(--warning-bg)",
  warningBorder: "var(--warning)",
  danger: "var(--danger)",
  dangerBg: "var(--danger-bg)",
  dangerBorder: "var(--danger)",
  tableHeader: "var(--table-header)",
  rowHover: "var(--table-row-hover)",
  codeBg: "var(--surface-raised)",
  cardBg: "var(--card-bg)",
  accentBorder: "var(--accent)",
};

// ═══════════════════════════════════════════════════════════
// PARAM EXTRACTION
// ═══════════════════════════════════════════════════════════
function extractParams(raw) {
  const p = {};
  if (raw.varco) {
    p["VARCO.enabled"] = raw.varco.varco?.enabled ?? raw.varco.enabled ?? null;
    p["VARCO.edgeServer"] = raw.varco.varco?.edgeServer ?? raw.varco.edgeServer ?? null;
  } else { p["VARCO.enabled"] = null; p["VARCO.edgeServer"] = null; }

  if (Array.isArray(raw.profiles) && raw.profiles.length >= 2) {
    const diurno = raw.profiles[0]?.transitions;
    const noturno = raw.profiles[1]?.transitions;
    if (diurno) {
      p["Diurno.lower.startTime"] = diurno.lower?.startTime ?? null;
      p["Diurno.lower.endTime"] = diurno.lower?.endTime ?? null;
      p["Diurno.lower.level"] = diurno.lower?.level ?? null;
      p["Diurno.lower.holdTime"] = diurno.lower?.holdTime ?? null;
      p["Diurno.upper.startTime"] = diurno.upper?.startTime ?? null;
      p["Diurno.upper.endTime"] = diurno.upper?.endTime ?? null;
      p["Diurno.upper.level"] = diurno.upper?.level ?? null;
      p["Diurno.upper.holdTime"] = diurno.upper?.holdTime ?? null;
      p["Diurno.upper.profile"] = diurno.upper?.profile ?? null;
    }
    if (noturno) {
      p["Noturno.lower.startTime"] = noturno.lower?.startTime ?? null;
      p["Noturno.lower.endTime"] = noturno.lower?.endTime ?? null;
      p["Noturno.lower.level"] = noturno.lower?.level ?? null;
      p["Noturno.lower.holdTime"] = noturno.lower?.holdTime ?? null;
      p["Noturno.upper.startTime"] = noturno.upper?.startTime ?? null;
      p["Noturno.upper.endTime"] = noturno.upper?.endTime ?? null;
      p["Noturno.upper.level"] = noturno.upper?.level ?? null;
      p["Noturno.upper.holdTime"] = noturno.upper?.holdTime ?? null;
      p["Noturno.upper.profile"] = noturno.upper?.profile ?? null;
    }
  } else {
    ["Diurno.lower.startTime","Diurno.lower.endTime","Diurno.lower.level","Diurno.lower.holdTime",
     "Diurno.upper.startTime","Diurno.upper.endTime","Diurno.upper.level","Diurno.upper.holdTime","Diurno.upper.profile",
     "Noturno.lower.startTime","Noturno.lower.endTime","Noturno.lower.level","Noturno.lower.holdTime",
     "Noturno.upper.startTime","Noturno.upper.endTime","Noturno.upper.level","Noturno.upper.holdTime","Noturno.upper.profile"
    ].forEach(k => p[k] = null);
  }

  if (raw.ocr?.ocr) {
    const o = raw.ocr.ocr;
    p["OCR.enabled"] = o.enabled ?? null; p["OCR.countryCode"] = o.countryCode ?? null;
    p["OCR.maxPlates"] = o.maxPlates ?? null; p["OCR.lowProbChar"] = o.lowProbChar ?? null;
    p["OCR.maxLowProbChars"] = o.maxLowProbChars ?? null; p["OCR.processingQueue"] = o.processingQueue ?? null;
    p["OCR.processingThreads"] = o.processingThreads ?? null; p["OCR.processingMode"] = o.processingMode ?? null;
    p["OCR.vehicleType"] = o.vehicleType ?? null;
  } else {
    ["OCR.enabled","OCR.countryCode","OCR.maxPlates","OCR.lowProbChar","OCR.maxLowProbChars",
     "OCR.processingQueue","OCR.processingThreads","OCR.processingMode","OCR.vehicleType"].forEach(k => p[k] = null);
  }

  if (raw.classifier?.classifier) {
    const c = raw.classifier.classifier;
    p["Classificador.enabled"] = c.enabled ?? null; p["Classificador.processingQueue"] = c.processingQueue ?? null;
    p["Classificador.processingThreads"] = c.processingThreads ?? null; p["Classificador.sceneType"] = c.sceneType ?? null;
    p["Classificador.minProbability"] = c.minProbability ?? null;
  } else {
    ["Classificador.enabled","Classificador.processingQueue","Classificador.processingThreads",
     "Classificador.sceneType","Classificador.minProbability"].forEach(k => p[k] = null);
  }

  if (raw.misc?.snapshotCrop) {
    p["SnapshotCrop.enable"] = raw.misc.snapshotCrop.enable ?? null;
    p["SnapshotCrop.mode"] = raw.misc.snapshotCrop.mode ?? null;
  } else { p["SnapshotCrop.enable"] = null; p["SnapshotCrop.mode"] = null; }

  p["FTP.enable"] = raw.ftp?.enable ?? null;

  if (Array.isArray(raw.ioPorts) && raw.ioPorts.length >= 3) {
    p["IO.port1.earlyUs"] = raw.ioPorts[0]?.earlyUs; p["IO.port1.isReserved"] = raw.ioPorts[0]?.isReserved;
    p["IO.port3.earlyUs"] = raw.ioPorts[2]?.earlyUs; p["IO.port3.isReserved"] = raw.ioPorts[2]?.isReserved;
  } else { p["IO.port1.earlyUs"] = undefined; p["IO.port1.isReserved"] = undefined; p["IO.port3.earlyUs"] = undefined; p["IO.port3.isReserved"] = undefined; }

  p["SNMP.enabled"] = raw.snmp?.enabled ?? null;
  p["Reboot.scheduled.enabled"] = raw.reboot?.scheduled?.enabled ?? null;
  p["Reboot.periodic.enabled"] = raw.reboot?.periodic?.enabled ?? null;
  p["NTP.server"] = raw.dateTime?.ntp?.server ?? null;
  p["Timezone"] = raw.dateTime?.timezone ?? null;

  if (Array.isArray(raw.video) && raw.video.length > 0) {
    p["Video.framerate"] = raw.video[0]?.framerate ?? null; p["Video.quality"] = raw.video[0]?.quality ?? null;
    p["Video.useTriggerFrames"] = raw.video[0]?.useTriggerFrames ?? null;
  } else { p["Video.framerate"] = null; p["Video.quality"] = null; p["Video.useTriggerFrames"] = null; }

  p["Firmware.version"] = raw.firmware?.version ?? null;
  return p;
}

const PARAM_TO_ENDPOINT = {
  "VARCO": { endpoint: "/api/system/maintenance/remoteaccess", method: "PUT", menu: "Sistema › Manutenção › Acesso Remoto", campo: "VARCO" },
  "Diurno": { endpoint: "/api/image/profiles/0", method: "PUT", menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições", campo: "Transições de Imagem" },
  "Noturno": { endpoint: "/api/image/profiles/1", method: "PUT", menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições", campo: "Transições de Imagem" },
  "OCR": { endpoint: "/api/equipment/ocr", method: "PUT", menu: "Equipamento › Reconhecimento › aba Jidosha (OCR)", campo: "Configurações OCR" },
  "Classificador": { endpoint: "/api/equipment/classifier", method: "PUT", menu: "Equipamento › Reconhecimento › aba Classifier", campo: "Configurações do Classificador" },
  "SnapshotCrop": { endpoint: "/api/equipment/misc", method: "PUT", menu: "Equipamento › Imagens › Snapshot Crop", campo: "snapshotCrop" },
  "FTP": { endpoint: "/api/equipment/servers/ftp", method: "PUT", menu: "Equipamento › Servidores › FTP", campo: "Habilitar envio FTP" },
  "IO": { endpoint: "/api/equipment/ioPorts", method: "PUT", menu: "Equipamento › Entradas e Saídas", campo: "Configuração de Portas" },
  "SNMP": { endpoint: "/api/system/monitoring/snmp", method: "POST", buildPayload: (_, val) => ({ enabled: val }), menu: "Sistema › Monitoramento › SNMP", campo: "Habilitar SNMP" },
  "Reboot": { endpoint: "/api/system/maintenance/automaticreboot", method: "POST", buildPayload: (param, val) => { const sub = param.split(".")[1]; return { [sub]: { enabled: val } }; }, menu: "Sistema › Manutenção › Reboot Automático", campo: "Agendamento de Reboot" },
  "NTP": { endpoint: "/api/equipment/dateAndTime", method: "PUT", menu: "Equipamento › Data e Hora › NTP", campo: "Servidor NTP" },
  "Timezone": { endpoint: "/api/equipment/dateAndTime", method: "PUT", menu: "Equipamento › Data e Hora", campo: "Fuso Horário" },
  "Video": { endpoint: "/api/video/streams/0", method: "PUT", menu: "Vídeo › Streams › Stream 1", campo: "Configurações de Vídeo" },
  "Firmware": { endpoint: null, menu: "Sistema › Manutenção › Atualização de Firmware", campo: "Upload de firmware (.fw)" },
};

const API_TOKEN = "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3";
const API_HEADERS = {
  "x-api-token": API_TOKEN,
  "Content-Type": "application/json",
};

export default function VarcoMonitor() {
  const [liveDevices, setLiveDevices] = useState([]);
  const [auditDevices, setAuditDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("passagens");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [recoletando, setRecoletando] = useState(false);
  const [recoletaMsg, setRecoletaMsg] = useState(null);

  const recoletarVarco = async () => {
    setRecoletando(true);
    setRecoletaMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/varco/recoleta`, {
        method: "POST",
        headers: API_HEADERS,
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRecoletaMsg({ tipo: "ok", texto: `Coleta concluída — ${data.resumo?.conformes || 0} conformes, ${data.resumo?.alterados || 0} alterados, ${data.resumo?.offline || 0} offline` });
        await fetchAll();
      } else {
        setRecoletaMsg({ tipo: "erro", texto: data.erro || `Falha na recoleta (HTTP ${res.status})` });
      }
    } catch (e) {
      setRecoletaMsg({ tipo: "erro", texto: e.message });
    } finally {
      setRecoletando(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [frotaRes, auditRes] = await Promise.all([
        fetch(`${API_BASE}/api/varco/frota`,    { headers: API_HEADERS }).catch(() => null),
        fetch(`${API_BASE}/api/varco/auditoria`, { headers: API_HEADERS }).catch(() => null),
      ]);
      if (frotaRes?.ok)  { const d = await frotaRes.json();  setLiveDevices(d.devices || []); }
      if (auditRes?.ok)  { const d = await auditRes.json();  setAuditDevices(d.devices || []); }
      setLastUpdate(new Date());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const analysis = useMemo(() => {
    if (!auditDevices.length) return null;
    const allParams = auditDevices.filter(d => d.raw).map(d => ({ nome: d.nome, uuid: d.uuid, ip: d.ip, params: extractParams(d.raw) }));
    if (!allParams.length) return null;

    // Build consensus from ALL devices (majority vote across entire fleet)
    const paramKeys = Object.keys(allParams[0].params);
    const consensus = {};
    for (const key of paramKeys) {
      const votes = {};
      allParams.forEach(r => {
        const v = String(r.params[key]);
        votes[v] = (votes[v] || 0) + 1;
      });
      const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
      consensus[key] = { value: allParams[0].params[key], voteStr: winner[0], count: winner[1], total: allParams.length };
      const matchRef = allParams.find(r => String(r.params[key]) === winner[0]);
      if (matchRef) consensus[key].value = matchRef.params[key];
    }

    const results = allParams.map(d => {
      const diffs = {};
      let diffCount = 0;
      for (const [key, con] of Object.entries(consensus)) {
        const val = d.params[key];
        if (String(val) !== con.voteStr) { diffs[key] = { atual: val, correto: con.value }; diffCount++; }
      }
      return { ...d, diffs, diffCount, conforme: diffCount === 0 };
    });

    const conformes = results.filter(r => r.conforme);
    const divergentes = results.filter(r => !r.conforme);

    // Group divergentes by identical variation pattern
    const groupMap = new Map();
    divergentes.forEach(d => {
      const key = Object.entries(d.diffs).map(([k, v]) => `${k}=${v.atual}`).sort().join("|");
      if (!groupMap.has(key)) groupMap.set(key, { diffs: d.diffs, devices: [] });
      groupMap.get(key).devices.push(d);
    });
    const groups = [...groupMap.values()].sort((a, b) => b.devices.length - a.devices.length);

    // Offline devices (no raw data)
    const offline = auditDevices.filter(d => !d.raw).map(d => ({ nome: d.nome, uuid: d.uuid, ip: d.ip }));

    return { results, conformes, divergentes, groups, consensus, offline, totalAnalisados: allParams.length, totalInventario: auditDevices.length };
  }, [auditDevices]);

  const liveStats = useMemo(() => {
    const total = liveDevices.length;
    const online = liveDevices.filter(d => d.connected).length;
    return { total, online, offline: total - online };
  }, [liveDevices]);

  const filteredResults = useMemo(() => {
    if (!analysis) return [];
    return analysis.results.filter(d => {
      const matchName = !filter || d.nome.toLowerCase().includes(filter.toLowerCase());
      const matchStatus = statusFilter === "all" || (statusFilter === "conforme" && d.conforme) || (statusFilter === "divergente" && !d.conforme);
      return matchName && matchStatus;
    });
  }, [analysis, filter, statusFilter]);

  return (
    <div style={{ maxWidth: "100%", color: C.text }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "18px" }}>
        <StatCard label="Total VARCO" value={liveStats.total || auditDevices.length} color={C.accent} icon={<Radio size={16} />} />
        <StatCard label="Online" value={liveStats.online} color={C.success} icon={<CheckCircle2 size={16} />} />
        <StatCard label="Offline" value={liveStats.offline} color={liveStats.offline > 0 ? C.danger : C.textMuted} icon={<XCircle size={16} />} />
        <StatCard label="Conformes" value={analysis?.conformes.length || 0} color={C.success} icon={<CheckCircle2 size={16} />} />
        <StatCard label="Divergentes" value={analysis?.divergentes.length || 0} color={C.warning} icon={<AlertTriangle size={16} />} />
        <StatCard label="Grupos" value={analysis?.groups.length || 0} color="#a78bfa" icon={<Eye size={16} />} />
      </div>

      {/* Credenciais de Acesso ao Túnel */}
      <div style={{ marginBottom: "16px", background: "rgba(96,205,255,0.06)", border: `1px solid rgba(96,205,255,0.18)`, borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
        <Shield size={18} color={C.accent} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.accent, marginBottom: "4px" }}>
            🔐 Credenciais de Acesso ao Túnel VARCO
          </div>
          <div style={{ fontSize: "11px", color: C.textSecondary, display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <span style={{ color: C.textMuted }}>Login</span>{" "}
              <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "3px", color: C.text, fontWeight: 600 }}>Admin</code>
            </div>
            <div>
              <span style={{ color: C.textMuted }}>Senha:</span>{" "}
              <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "3px", color: C.text, fontWeight: 600 }}>#econocr@</code>
            </div>
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>
            Use essas credenciais para acessar a interface web dos equipamentos através dos links com UUID
          </div>
        </div>
      </div>

      {/* Recoleta VARCO button */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <button
          onClick={recoletarVarco}
          disabled={recoletando}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: `1px solid ${C.accentBorder}`, borderRadius: "6px", background: recoletando ? C.surface : C.accentBg, color: C.accent, cursor: recoletando ? "wait" : "pointer", fontSize: "12px", fontWeight: 600, opacity: recoletando ? 0.7 : 1 }}
        >
          <RefreshCw size={14} className={recoletando ? "spin" : ""} />
          {recoletando ? "Coletando dados ao vivo (~90s)..." : "Atualizar — Recoletar do VARCO"}
        </button>
        {recoletaMsg && (
          <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "4px", background: recoletaMsg.tipo === "ok" ? C.successBg : C.dangerBg, color: recoletaMsg.tipo === "ok" ? C.success : C.danger, border: `1px solid ${recoletaMsg.tipo === "ok" ? C.successBorder : C.dangerBorder}` }}>
            {recoletaMsg.tipo === "ok" ? "✅" : "❌"} {recoletaMsg.texto}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ padding: '8px 0 12px' }}>
        <QuickSelect
          options={[
            { id: "relatorio",  label: "📊 Relatório de Análise" },
            { id: "passagens",  label: "🔴 Passagens & Heartbeat" },
            { id: "diagnostico", label: "🔬 Diagnóstico — Por que não chegam passagens?" },
            { id: "politica",   label: "🛡️ Política de Correção — De-Para" },
            { id: "auditoria",  label: "📊 Auditoria — Conformidade da Frota" },
            { id: "grupos",     label: "📂 Grupos de Variação" },
            { id: "correcoes",  label: "🔧 Plano de Correção — Casos e Etapas" },
            { id: "padrao",     label: "📐 Análise vs Padrão de Referência" },
            { id: "inventario", label: "📋 Inventário — Todos os Equipamentos" },
            { id: "comandos",   label: "⚡ Scripts de Correção" },
          ]}
          value={tab}
          onChange={setTab}
          color="#60cdff"
          label="Visão"
        />
      </div>

      {error && <div style={{ padding: "10px", background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "8px", color: C.danger, marginBottom: "12px", fontSize: "13px" }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>Carregando...</div>}

      {!loading && tab === "relatorio" && <RelatorioAnaliseTab analysis={analysis} liveDevices={liveDevices} auditDevices={auditDevices} />}
      {!loading && tab === "passagens" && <PassagensHeartbeatTab liveDevices={liveDevices} analysis={analysis} />}
      {!loading && tab === "diagnostico" && analysis && <DiagnosticoIntegracaoTab analysis={analysis} liveDevices={liveDevices} />}
      {!loading && tab === "politica" && analysis && <PoliticaCorrecaoTab analysis={analysis} liveDevices={liveDevices} />}
      {!loading && tab === "auditoria" && analysis && <AuditoriaTab analysis={analysis} />}
      {!loading && tab === "correcoes" && <CorrecoesTab liveDevices={liveDevices} />}
      {!loading && tab === "padrao" && <PadraoTab />}
      {!loading && tab === "grupos" && analysis && <GruposTab groups={analysis.groups} expandedGroup={expandedGroup} setExpandedGroup={setExpandedGroup} />}
      {!loading && tab === "inventario" && analysis && <InventarioTab results={filteredResults} filter={filter} setFilter={setFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} expandedDevice={expandedDevice} setExpandedDevice={setExpandedDevice} liveDevices={liveDevices} />}
      {!loading && tab === "comandos" && analysis && <ComandosTab groups={analysis.groups} />}

      {/* Footer */}
      <div style={{ marginTop: "20px", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
        {/* Linha superior: info + refresh */}
        <div style={{ padding: "8px 14px", background: C.surface, fontSize: "11px", color: C.textMuted, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
          <span>Inventário: {auditDevices.length} equipamentos | Consenso: frota completa</span>
          <button onClick={fetchAll} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: "4px", background: C.raised, color: C.textSecondary, cursor: "pointer", fontSize: "11px" }}>
            <RefreshCw size={11} /> {lastUpdate && lastUpdate.toLocaleTimeString("pt-BR")}
          </button>
        </div>
        {/* Linha inferior: exportar relatório */}
        <RelatorioFooter />
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}code{background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;font-size:12px;font-family:'Fira Code',monospace;color:#e2e8f0}.wrong{color:#fb7185;font-weight:600}.correct{color:#6ee7b7;font-weight:600}`}</style>
    </div>
  );
}

function RelatorioFooter() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState(null);

  const DL_BASE = `${API_BASE}/api/varco/relatorio/download`;

  async function exportarPDF() {
    setLoading(true); setErro(null);
    try {
      // Abre o relatório HTML em nova aba — o usuário usa Ctrl+P → Salvar como PDF
      window.open(`${DL_BASE}?format=print`, "_blank");
    } catch (e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  async function exportarWord() {
    setLoading(true); setErro(null);
    try {
      // Download direto via link com Content-Disposition: attachment
      const a  = document.createElement("a");
      a.href   = `${DL_BASE}?format=doc`;
      a.target = "_blank";
      a.click();
    } catch (e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  async function fetchData() {
    const res = await fetch(`${API_BASE}/api/varco/relatorio`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  return (
    <div style={{ padding: "12px 14px", background: C.raised, display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "12px", fontWeight: 600, color: C.textSecondary, marginRight: "4px" }}>
        📋 Relatório de Erros:
      </span>

      <button
        onClick={exportarPDF}
        disabled={loading}
        title="Gera o relatório e abre a janela de impressão. Use 'Salvar como PDF'."
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", border: `1px solid ${C.dangerBorder}`, borderRadius: "6px", background: C.dangerBg, color: C.danger, cursor: loading ? "wait" : "pointer", fontSize: "12px", fontWeight: 600, opacity: loading ? 0.6 : 1 }}
      >
        📄 Exportar PDF
      </button>

      <button
        onClick={exportarWord}
        disabled={loading}
        title="Baixa o relatório como arquivo .doc compatível com Microsoft Word."
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", border: `1px solid ${C.accentBorder}`, borderRadius: "6px", background: C.accentBg, color: C.accent, cursor: loading ? "wait" : "pointer", fontSize: "12px", fontWeight: 600, opacity: loading ? 0.6 : 1 }}
      >
        📝 Exportar Word (.doc)
      </button>

      {loading && <span style={{ fontSize: "11px", color: C.textMuted }}>⏳ Gerando...</span>}
      {erro && <span style={{ fontSize: "11px", color: C.danger, background: C.dangerBg, padding: "3px 8px", borderRadius: "4px", border: `1px solid ${C.dangerBorder}` }}>❌ {erro}</span>}

      <span style={{ marginLeft: "auto", fontSize: "10px", color: C.textMuted }}>
        Dados de: validacao-config.json (validação contra script padrão)
      </span>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ color, opacity: 0.9 }}>{icon}</div>
      <div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: C.text }}>{value}</div>
        <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</div>
      </div>
    </div>
  );
}

function AuditoriaTab({ analysis }) {
  const { conformes, divergentes, groups, consensus, offline, totalAnalisados, totalInventario } = analysis;
  const totalDiv = divergentes.reduce((s, d) => s + d.diffCount, 0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showAllRefs, setShowAllRefs] = useState(false);

  // ─── Status real-time do VARCO Cloud ────────────────────────────────────────
  // Map uuid → { connected: bool, lastSeen: string }
  const [frotaStatus, setFrotaStatus] = useState({});
  useEffect(() => {
    fetch(`${API_BASE}/api/varco/frota`, {
      headers: API_HEADERS
    })
      .then(r => r.json())
      .then(data => {
        if (data.devices) {
          const map = {};
          data.devices.forEach(d => { map[d.uuid] = { connected: d.connected, lastSeen: d.lastSeen }; });
          setFrotaStatus(map);
        }
      })
      .catch(() => {}); // silencioso — botões ficam habilitados sem status
  }, []);

  // ─── ITScam API state ───────────────────────────────────────────────────────
  // status: { "uuid::param": "idle"|"loading"|"ok"|"error" }
  const [itscamStatus, setItscamStatus] = useState({});
  // resultados: { "uuid::param": { antes, depois, erro } }
  const [itscamResult, setItscamResult] = useState({});
  // lote status: { "param": "idle"|"loading"|"ok"|"error" }
  const [loteStatus, setLoteStatus] = useState({});
  const [loteResult, setLoteResult] = useState({});

  const setStatus = (uuid, param, s) =>
    setItscamStatus(prev => ({ ...prev, [`${uuid}::${param}`]: s }));
  const setResult = (uuid, param, r) =>
    setItscamResult(prev => ({ ...prev, [`${uuid}::${param}`]: r }));

  const aplicarDispositivo = async (uuid, endpoint, payload, param, method = "PUT") => {
    setStatus(uuid, param, "loading");
    try {
      const res = await fetch(`${API_BASE}/api/varco/itscam/aplicar`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({ uuid, endpoint, payload, method }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus(uuid, param, "ok");
        setResult(uuid, param, data);
      } else {
        setStatus(uuid, param, "error");
        setResult(uuid, param, { erro: data.erro || data.detalhe || "Falha desconhecida" });
      }
    } catch (e) {
      setStatus(uuid, param, "error");
      setResult(uuid, param, { erro: e.message });
    }
  };

  const aplicarLote = async (devices, endpoint, payload, param, method = "PUT") => {
    // Separa online e offline (se status disponível)
    const online = devices.filter(d => {
      const fs = frotaStatus[d.uuid];
      return !fs || fs.connected !== false; // se não sabe, assume online
    });
    const offlineDevs = devices.filter(d => {
      const fs = frotaStatus[d.uuid];
      return fs && fs.connected === false;
    });

    // Marca offline imediatamente
    offlineDevs.forEach(d => {
      setStatus(d.uuid, param, "offline");
    });

    if (online.length === 0) {
      setLoteStatus(prev => ({ ...prev, [param]: "error" }));
      setLoteResult(prev => ({ ...prev, [param]: { sucesso: 0, total: devices.length, offlineCount: offlineDevs.length } }));
      return;
    }

    setLoteStatus(prev => ({ ...prev, [param]: "loading" }));
    // Marca online como loading individualmente
    online.forEach(d => setStatus(d.uuid, param, "loading"));
    try {
      const res = await fetch(`${API_BASE}/api/varco/itscam/aplicar-lote`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({ devices: online, endpoint, payload, method }),
      });
      const data = await res.json();
      if (data.resultados) {
        data.resultados.forEach(r => {
          setStatus(r.uuid, param, r.ok ? "ok" : "error");
          setResult(r.uuid, param, r.ok ? { ok: true } : { erro: r.erro });
        });
      }
      const sucesso = data.resultados?.filter(r => r.ok).length ?? 0;
      setLoteStatus(prev => ({ ...prev, [param]: sucesso > 0 ? "ok" : "error" }));
      setLoteResult(prev => ({ ...prev, [param]: { ...data, sucesso, total: devices.length, offlineCount: offlineDevs.length } }));
    } catch (e) {
      setLoteStatus(prev => ({ ...prev, [param]: "error" }));
      online.forEach(d => setStatus(d.uuid, param, "error"));
    }
  };

  // Build detailed problem analysis
  const problemRank = {};
  divergentes.forEach(d => {
    for (const key of Object.keys(d.diffs)) {
      if (!problemRank[key]) problemRank[key] = { count: 0, values: new Map(), devices: [] };
      problemRank[key].count++;
      const val = String(d.diffs[key].atual);
      problemRank[key].values.set(val, (problemRank[key].values.get(val) || 0) + 1);
      problemRank[key].devices.push({ nome: d.nome, uuid: d.uuid });
    }
  });
  const sorted = Object.entries(problemRank).sort((a, b) => b[1].count - a[1].count);

  // Descriptions for each parameter category explaining what it does and why it matters
  const PARAM_DESCRIPTIONS = {
    // ═══ VARCO (Acesso Remoto) ═══
    "VARCO.enabled": { menu: "Sistema › Manutenção › Acesso Remoto › VARCO › Habilitado", desc: "Habilita comunicação remota via plataforma VARCO", impact: "Sem VARCO, equipamento fica isolado — só acesso local (físico).", causa: "Reset de fábrica ou configuração inicial incompleta.", campo: "Switch 'Habilitado'" },
    "VARCO.edgeServer": { menu: "Sistema › Manutenção › Acesso Remoto › VARCO › Edge Server", desc: "Servidor edge VARCO para túnel reverso", impact: "Sem edge server, túnel de gerência remota não conecta.", causa: "Campo não preenchido ou URL errada.", campo: "Campo de texto 'Edge Server'" },

    // ═══ PERFIS DE IMAGEM — DIURNO (Perfil 1) ═══
    "Diurno.lower.startTime": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Inferior › Início", desc: "Início da janela em que a transição inferior opera (padrão: 00:00:00 = 24h)", impact: "Com horário restrito, a câmera NÃO troca para Noturno fora dessa janela — fica presa no modo Diurno mesmo de noite.", causa: "Configuração copiada de equipamento antigo com restrição de horário.", campo: "Campo 'Início' na edição da linha 'Diurno (inferior)'" },
    "Diurno.lower.endTime": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Inferior › Fim", desc: "Fim da janela em que a transição inferior opera (padrão: 00:00:00 = 24h)", impact: "Com horário restrito, a câmera NÃO troca para Noturno fora dessa janela — imagens ficam escuras/ilegíveis.", causa: "Horário configurado diferente do template padrão.", campo: "Campo 'Fim' na edição da linha 'Diurno (inferior)'" },
    "Diurno.lower.level": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Inferior › Nível", desc: "Luminosidade que dispara troca para Noturno (padrão: 10 = só quando realmente escurece)", impact: "Com valor 30, uma nuvem ou sombra já faz a câmera ir para P&B em pleno dia.", causa: "Ajuste local por técnico sem atualizar template.", campo: "Slider/campo 'Nível' — valor exibido como 'Nível < 10' na barra azul" },
    "Diurno.lower.holdTime": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Inferior › Tempo de espera", desc: "Tempo (ms) que a luminosidade deve ficar abaixo do nível antes de trocar (padrão: 60000ms = 1min)", impact: "Transição muito rápida gera frames inconsistentes.", causa: "Default de firmware diferente.", campo: "Campo 'Tempo de espera (ms)' na edição da transição" },
    "Diurno.upper.startTime": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Superior › Início", desc: "Início da janela em que a transição superior opera (padrão: 00:00:00 = 24h)", impact: "Com horário restrito, a câmera NÃO volta para Diurno fora dessa janela — fica presa em P&B de manhã.", causa: "Perfil não padronizado após manutenção.", campo: "Campo 'Início' na edição da linha 'Diurno (superior)'" },
    "Diurno.upper.endTime": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Superior › Fim", desc: "Fim da janela em que a transição superior opera (padrão: 00:00:00 = 24h)", impact: "Janela restrita impede retorno ao modo colorido quando amanhece.", causa: "Diferença entre versões de firmware.", campo: "Campo 'Fim' na edição da linha 'Diurno (superior)'" },
    "Diurno.upper.level": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Superior › Nível", desc: "Nível de luminosidade threshold superior (padrão: 35)", impact: "Imagens saturadas ou subexpostas durante o dia.", causa: "Ajuste manual ou cópia de config incompleta.", campo: "Slider 'Nível' na linha 'Superior'" },
    "Diurno.upper.holdTime": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Superior › Tempo de espera", desc: "Tempo (ms) antes da transição superior (padrão: 60000ms)", impact: "Flickering na imagem durante mudanças de luz.", causa: "Valor divergente entre lotes de firmware.", campo: "Campo 'Tempo de espera (ms)' na linha 'Superior'" },
    "Diurno.upper.profile": { menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Superior › Perfil destino", desc: "ID do perfil de destino ao atingir threshold superior", impact: "Perfil errado = parâmetros de cor/ganho completamente diferentes.", causa: "Profile ID não atualizado após redefinição de templates.", campo: "Dropdown 'Perfil' na linha 'Superior'" },

    // ═══ PERFIS DE IMAGEM — NOTURNO (Perfil 2) ═══
    "Noturno.lower.startTime": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Inferior › Início", desc: "Início da janela da transição inferior noturna (padrão: 00:00:00 = 24h)", impact: "Câmera fica presa no modo Noturno sem poder transicionar — imagens P&B de dia.", causa: "Configuração de horários divergente.", campo: "Campo 'Início' na edição da linha 'Noturno (inferior)'" },
    "Noturno.lower.endTime": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Inferior › Fim", desc: "Fim da janela da transição inferior noturna (padrão: 00:00:00 = 24h)", impact: "Restrição de horário impede transição noturna adequada.", causa: "Configuração incompleta pós-manutenção.", campo: "Campo 'Fim' na edição da linha 'Noturno (inferior)'" },
    "Noturno.lower.level": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Inferior › Nível", desc: "Nível de luminosidade threshold inferior noturno (padrão: 10)", impact: "IR/Flash pode não ativar no momento correto.", causa: "Ajuste local ou firmware com defaults diferentes.", campo: "Slider/campo 'Nível' — aparece como 'Nível < 10' na barra azul" },
    "Noturno.lower.holdTime": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Inferior › Tempo de espera", desc: "Tempo antes de transicionar (padrão: 60000ms)", impact: "Fotos transitórias com qualidade degradada.", causa: "Valor padrão diferente entre lotes.", campo: "Campo 'Tempo de espera (ms)' na edição da transição" },
    "Noturno.upper.startTime": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Superior › Início", desc: "Início da janela da transição superior noturna (padrão: 00:00:00 = 24h)", impact: "Câmera não volta ao Diurno quando amanhece — fica em P&B.", causa: "Não sincronizado com template padrão.", campo: "Campo 'Início' na edição da linha 'Noturno (superior)'" },
    "Noturno.upper.endTime": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Superior › Fim", desc: "Fim da janela da transição superior noturna (padrão: 00:00:00 = 24h)", impact: "Restrição impede retorno ao modo diurno.", causa: "Configuração manual divergente.", campo: "Campo 'Fim' na edição da linha 'Noturno (superior)'" },
    "Noturno.upper.level": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Superior › Nível", desc: "Nível de luminosidade threshold superior noturno (padrão: 35)", impact: "Flash/IR ativa muito cedo ou muito tarde.", causa: "Threshold não calibrado para o local.", campo: "Slider 'Nível' na linha 'Superior'" },
    "Noturno.upper.holdTime": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Superior › Tempo de espera", desc: "Tempo na transição superior noturna (padrão: 60000ms)", impact: "Instabilidade de imagem durante a transição.", causa: "Diferença de firmware ou ajuste manual.", campo: "Campo 'Tempo de espera (ms)' na linha 'Superior'" },
    "Noturno.upper.profile": { menu: "Imagem › Perfis › Perfil 2 (Noturno) › Transições › Superior › Perfil destino", desc: "ID do perfil noturno de destino (padrão: 0)", impact: "Perfil noturno errado = fotos sem IR ou com ganho excessivo.", causa: "Profile ID não atualizado.", campo: "Dropdown 'Perfil' na linha 'Superior'" },

    // ═══ OCR (Reconhecimento de Placas) ═══
    "OCR.enabled": { menu: "Equipamento › Reconhecimento › aba Jidosha › Habilitar", desc: "Habilita o motor de reconhecimento de placas (OCR)", impact: "Sem OCR, nenhuma placa é lida — equipamento inútil para fiscalização.", causa: "OCR desabilitado por engano ou após reset.", campo: "Switch 'Habilitado' no topo" },
    "OCR.countryCode": { menu: "Equipamento › Reconhecimento › aba Jidosha › País", desc: "País do formato de placa (BR = Brasil)", impact: "Formato errado = OCR não reconhece placas brasileiras.", causa: "Default de fábrica com país errado.", campo: "Dropdown 'País'" },
    "OCR.maxPlates": { menu: "Equipamento › Reconhecimento › aba Jidosha › Máx. placas", desc: "Máximo de placas detectadas por frame (padrão: 2)", impact: "Limitar a 1 pode perder veículos em faixas movimentadas.", causa: "Performance tuning aplicado incorretamente.", campo: "Slider 'Máximo de placas'" },
    "OCR.lowProbChar": { menu: "Equipamento › Reconhecimento › aba Jidosha › Confiança mín. caractere", desc: "Threshold mínimo de confiança por caractere", impact: "Muito alto = rejeita placas válidas. Muito baixo = aceita lixo.", causa: "Ajuste de sensibilidade não padronizado.", campo: "Slider 'Probabilidade baixa por caractere'" },
    "OCR.maxLowProbChars": { menu: "Equipamento › Reconhecimento › aba Jidosha › Máx. caracteres baixa confiança", desc: "Máximo de caracteres de baixa confiança aceitos por placa", impact: "Impacta taxa de rejeição vs acurácia de leitura.", causa: "Tuning individual não replicado.", campo: "Slider 'Máximo de caracteres com baixa probabilidade'" },
    "OCR.processingQueue": { menu: "Equipamento › Reconhecimento › aba Jidosha › Fila de processamento", desc: "Tamanho da fila de processamento OCR (padrão: 1)", impact: "Fila grande = mais memória sem benefício em faixa única.", causa: "Template genérico não ajustado.", campo: "Slider 'Fila de processamento'" },
    "OCR.processingThreads": { menu: "Equipamento › Reconhecimento › aba Jidosha › Threads de processamento", desc: "Threads dedicadas ao processamento OCR (padrão: 1)", impact: "Mais threads = mais CPU sem ganho real em faixa única.", causa: "Config de performance divergente.", campo: "Slider 'Threads de processamento'" },
    "OCR.processingMode": { menu: "Equipamento › Reconhecimento › aba Jidosha › Modo de processamento", desc: "Modo: freeflow (contínuo) ou triggered (por trigger IO)", impact: "Modo errado = OCR não processa ou processa desnecessariamente.", causa: "Tipo de instalação configurado incorretamente.", campo: "Dropdown 'Modo de processamento'" },
    "OCR.vehicleType": { menu: "Equipamento › Reconhecimento › aba Jidosha › Tipo de veículo", desc: "Filtro de veículo alvo (all/car/truck)", impact: "Filtro errado descarta veículos válidos da leitura.", causa: "Template errado para o ponto.", campo: "Dropdown 'Tipo de veículo'" },

    // ═══ CLASSIFICADOR (IA Veicular) ═══
    "Classificador.enabled": { menu: "Equipamento › Reconhecimento › aba Classifier › Habilitar", desc: "Habilita classificação veicular por IA (moto/carro/caminhão)", impact: "Sem classificador, todas infrações ficam sem tipo veicular.", causa: "Feature não ativada após deploy.", campo: "Switch 'Habilitado'" },
    "Classificador.processingQueue": { menu: "Equipamento › Reconhecimento › aba Classifier › Fila de processamento", desc: "Fila de processamento do classificador (padrão: 1)", impact: "Fila grande desperdiça memória em câmera de faixa única.", causa: "Template de fábrica genérico (valor 4) não ajustado para faixa única.", campo: "Slider 'Fila de processamento'" },
    "Classificador.processingThreads": { menu: "Equipamento › Reconhecimento › aba Classifier › Threads de processamento", desc: "Threads do classificador veicular (padrão: 1)", impact: "Threads extras consomem CPU sem benefício em faixa única.", causa: "Otimização de CPU aplicada individualmente.", campo: "Slider 'Threads de processamento'" },
    "Classificador.sceneType": { menu: "Equipamento › Reconhecimento › aba Classifier › Cenário", desc: "Tipo de cena: 0=Close-up, 1=Far-field", impact: "Cena errada = modelo de IA menos preciso para o contexto.", causa: "Template aplicado sem considerar tipo de via.", campo: "Dropdown 'Cenário'" },
    "Classificador.minProbability": { menu: "Equipamento › Reconhecimento › aba Classifier › Confiabilidade mínima", desc: "Confiança mínima para aceitar classificação (padrão: 20%)", impact: "Muito alto = muitas rejeições. Muito baixo = erros.", causa: "Threshold não padronizado entre equipamentos.", campo: "Slider 'Confiabilidade mínima (%)'" },

    // ═══ SNAPSHOT CROP ═══
    "SnapshotCrop.enable": { menu: "Equipamento › Imagens › Snapshot Crop › Habilitar", desc: "Recorte automático da imagem de snapshot. Acesse Equipamento › Imagens e procure a seção 'Snapshot Crop' ou 'Recorte de Snapshot' na página.", impact: "Sem crop, imagem completa é enviada (mais pesada).", causa: "Feature não ativada em alguns equipamentos.", campo: "Switch 'Habilitar' (dentro de Snapshot Crop)" },
    "SnapshotCrop.mode": { menu: "Equipamento › Imagens › Snapshot Crop › Modo", desc: "Modo de recorte: static (posição fixa) | plate (recorta a placa) | vehicle (recorta o veículo). Acesse Equipamento › Imagens e procure 'Snapshot Crop'.", impact: "Modo errado gera recortes inúteis ou muito grandes.", causa: "Configuração manual inconsistente.", campo: "Dropdown 'Mode' ou 'Modo' (dentro de Snapshot Crop)" },

    // ═══ FTP (Envio de Imagens) ═══
    "FTP.enable": { menu: "Equipamento › Servidores › FTP › Habilitar", desc: "Upload de imagens via FTP para servidor central", impact: "Sem FTP, imagens não chegam ao servidor — PERDA TOTAL de evidências.", causa: "FTP desabilitado após teste ou manutenção.", campo: "Switch 'Habilitar FTP'" },

    // ═══ PORTAS IO (Trigger/Laço) ═══
    "IO.port1.earlyUs": { menu: "Equipamento › Entradas e Saídas › Porta 1 › Antecipação (μs)", desc: "Tempo de antecipação da porta IO 1 (trigger de laço)", impact: "Trigger antecipado/atrasado = veículo fora da posição ideal.", causa: "Calibração de laço não padronizada.", campo: "Campo numérico 'Antecipação (μs)' - Porta 1" },
    "IO.port1.isReserved": { menu: "Equipamento › Entradas e Saídas › Porta 1 › Reservada", desc: "Porta IO 1 reservada para trigger principal", impact: "Se não reservada, pode conflitar com outros sinais.", causa: "Configuração de hardware divergente.", campo: "Switch 'Reservada' - Porta 1" },
    "IO.port3.earlyUs": { menu: "Equipamento › Entradas e Saídas › Porta 3 › Antecipação (μs)", desc: "Tempo de antecipação da porta IO 3", impact: "Timing de captura incorreto = frame sem veículo.", causa: "Calibração local não replicada.", campo: "Campo numérico 'Antecipação (μs)' - Porta 3" },
    "IO.port3.isReserved": { menu: "Equipamento › Entradas e Saídas › Porta 3 › Reservada", desc: "Porta IO 3 reservada", impact: "Conflito de sinais se não reservada.", causa: "Setup de hardware inconsistente.", campo: "Switch 'Reservada' - Porta 3" },

    // ═══ SNMP (Monitoramento) ═══
    "SNMP.enabled": { menu: "Sistema › Monitoramento › SNMP › Habilitar", desc: "Agente SNMP ativo quando o padrão da frota é desabilitado", impact: "SNMP ativo com variável de template não resolvida ({$SNMP_COMMUNITY}) — agente ineficaz e exposição desnecessária de protocolo de rede.", causa: "Provisionamento automatizado deixou SNMP habilitado com template não resolvido. Correção via API: POST /api/system/monitoring/snmp com enabled=false.", campo: "Switch 'Habilitar SNMP'" },

    // ═══ REBOOT (Manutenção Automática) ═══
    "Reboot.scheduled.enabled": { menu: "Sistema › Manutenção › Reboot Automático › Agendado › Habilitar", desc: "Reboot agendado automático do equipamento", impact: "Padrão da frota é desabilitado — reboot manual apenas.", causa: "Reboot agendado ativo fora do padrão. Correção via API: POST /api/system/maintenance/automaticreboot com scheduled.enabled=false.", campo: "Switch 'Habilitar reboot agendado'" },
    "Reboot.periodic.enabled": { menu: "Sistema › Manutenção › Reboot Automático › Periódico › Habilitar", desc: "Reboot periódico baseado em uptime", impact: "Padrão da frota é desabilitado.", causa: "Reboot periódico ativo fora do padrão. Correção via API: POST /api/system/maintenance/automaticreboot com periodic.enabled=false.", campo: "Switch 'Habilitar reboot periódico'" },

    // ═══ DATA/HORA (NTP e Timezone) ═══
    "NTP.server": { menu: "Equipamento › Data e Hora › NTP › Servidor", desc: "Servidor NTP para sincronização de relógio", impact: "Horário errado = timestamps de infração inválidos legalmente.", causa: "NTP server diferente ou não configurado.", campo: "Campo de texto 'Servidor NTP'" },
    "Timezone": { menu: "Equipamento › Data e Hora › Fuso Horário", desc: "Fuso horário do equipamento", impact: "Fuso errado invalida toda autuação do equipamento.", causa: "Timezone não ajustado após deploy.", campo: "Dropdown 'Fuso horário'" },

    // ═══ VÍDEO (Stream) ═══
    "Video.framerate": { menu: "Vídeo › Streams › Stream 1 › Taxa de frames", desc: "Taxa de frames do stream de vídeo (fps)", impact: "FPS baixo = menor chance de captura.", causa: "Ajuste de performance individual.", campo: "Slider 'FPS'" },
    "Video.quality": { menu: "Vídeo › Streams › Stream 1 › Qualidade", desc: "Qualidade de compressão JPEG (1-100)", impact: "Qualidade baixa = imagens borradas para OCR.", causa: "Redução de banda aplicada manualmente.", campo: "Slider 'Qualidade'" },
    "Video.useTriggerFrames": { menu: "Vídeo › Streams › Stream 1 › Usar frames do trigger", desc: "Usar frames do trigger IO para processamento OCR", impact: "Se desativado, OCR usa frames aleatórios do stream.", causa: "Configuração de captura divergente.", campo: "Switch 'Usar frames do trigger'" },

    // ═══ FIRMWARE ═══
    "Firmware.version": { menu: "Sistema › Manutenção › Atualização de Firmware", desc: "Versão do firmware instalado", impact: "Firmwares diferentes = comportamentos diferentes em todas as features.", causa: "Atualização não aplicada uniformemente na frota.", campo: "Atualizar via upload de arquivo .fw" },
  };

  const getSeverity = (param, count, total) => {
    if (param.includes("VARCO.enabled") || param.includes("OCR.enabled") || param.includes("FTP.enable")) return "critical";
    if (param.includes("Firmware") || param.includes("NTP") || param.includes("Timezone")) return "high";
    if (count > total * 0.5) return "high";
    if (count > total * 0.2) return "medium";
    return "low";
  };

  const severityColors = {
    critical: { bg: "rgba(255,0,60,0.08)", border: "rgba(255,0,60,0.25)", text: "#ff4d6a", label: "CRÍTICO" },
    high: { bg: C.dangerBg, border: C.dangerBorder, text: C.danger, label: "ALTO" },
    medium: { bg: C.warningBg, border: C.warningBorder, text: C.warning, label: "MÉDIO" },
    low: { bg: "rgba(255,255,255,0.04)", border: C.border, text: C.textMuted, label: "BAIXO" },
  };

  const totalDevices = conformes.length + divergentes.length;

  return (
    <div>
      {/* Full fleet inventory panel */}
      <div style={{ marginBottom: "14px", padding: "12px 14px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <strong style={{ color: C.accent, fontSize: "13px" }}>Base de Referência — Consenso por Maioria (Frota Completa)</strong>
          <span style={{ fontSize: "11px", color: C.textMuted }}>{totalInventario} inventário | {totalAnalisados} analisados | {offline.length} offline</span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: "11px", color: C.textMuted, lineHeight: "1.5" }}>
          O valor correto de cada parâmetro é determinado pela <strong style={{ color: C.accent }}>maioria dos {totalAnalisados} equipamentos online</strong>. 
          Todos que possuem exatamente os mesmos valores da maioria são classificados como <strong style={{ color: C.success }}>CONFORMES</strong> (referências).
          Os demais são organizados em <strong style={{ color: C.warning }}>GRUPOS DE VARIAÇÃO</strong>.
        </p>

        {/* Conformes (references) */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: C.success }}>✅ CONFORMES — {conformes.length} equipamentos (referência)</span>
            <button onClick={() => setShowAllRefs(!showAllRefs)} style={{ border: `1px solid ${C.border}`, borderRadius: "3px", background: C.raised, color: C.textMuted, cursor: "pointer", fontSize: "10px", padding: "1px 6px" }}>
              {showAllRefs ? "ocultar" : "ver todos"}
            </button>
          </div>
          {showAllRefs && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "120px", overflowY: "auto", padding: "4px 0" }}>
              {conformes.map(r => (
                <TunnelLink key={r.nome} nome={r.nome} uuid={r.uuid} style={{ background: "rgba(108,203,95,0.06)", padding: "2px 6px", borderRadius: "3px", fontSize: "10px", color: C.success, border: "1px solid rgba(108,203,95,0.15)", display: "inline-block" }} />
              ))}
            </div>
          )}
        </div>

        {/* Divergentes organized by group */}
        <div style={{ marginBottom: "6px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: C.warning, marginBottom: "4px" }}>⚠️ DIVERGENTES — {divergentes.length} equipamentos em {groups.length} grupos de variação</div>
          <div style={{ maxHeight: "180px", overflowY: "auto" }}>
            {groups.map((g, i) => (
              <div key={i} style={{ marginBottom: "5px", padding: "4px 8px", background: C.codeBg, borderRadius: "4px", border: `1px solid ${C.borderLight}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: C.warning, background: C.warningBg, padding: "1px 5px", borderRadius: "3px" }}>Grupo {i + 1}</span>
                  <span style={{ fontSize: "10px", color: C.textMuted }}>{g.devices.length} equip — {Object.keys(g.diffs).length} divergência(s)</span>
                  <span style={{ fontSize: "9px", color: C.textMuted, fontFamily: "monospace" }}>[{Object.keys(g.diffs).join(", ")}]</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                  {g.devices.map(d => (
                    <TunnelLink key={d.nome} nome={d.nome} uuid={d.uuid} style={{ fontSize: "9px", color: C.textSecondary, padding: "1px 4px", background: C.raised, borderRadius: "2px", display: "inline-block" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offline */}
        {offline.length > 0 && (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: C.danger, marginBottom: "4px" }}>❌ OFFLINE — {offline.length} equipamentos (sem dados)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {offline.map(d => (
                <TunnelLink key={d.nome} nome={d.nome} uuid={d.uuid} style={{ fontSize: "9px", color: C.danger, padding: "1px 5px", background: C.dangerBg, borderRadius: "3px", border: `1px solid ${C.dangerBorder}`, display: "inline-block" }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: "8px", padding: "12px" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: C.success }}>{conformes.length}</div>
          <div style={{ fontSize: "11px", color: C.success, marginBottom: "4px" }}>Conformes</div>
          <div style={{ fontSize: "10px", color: C.textMuted }}>{Math.round(conformes.length / totalDevices * 100)}% da frota OK</div>
        </div>
        <div style={{ background: C.warningBg, border: `1px solid ${C.warningBorder}`, borderRadius: "8px", padding: "12px" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: C.warning }}>{divergentes.length}</div>
          <div style={{ fontSize: "11px", color: C.warning, marginBottom: "4px" }}>Divergentes</div>
          <div style={{ fontSize: "10px", color: C.textMuted }}>{totalDiv} erros em {groups.length} padrões</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: C.text }}>{sorted.length}</div>
          <div style={{ fontSize: "11px", color: C.textSecondary, marginBottom: "4px" }}>Tipos de Erro</div>
          <div style={{ fontSize: "10px", color: C.textMuted }}>{sorted.filter(([p, i]) => getSeverity(p, i.count, totalDevices) === "critical").length} críticos</div>
        </div>
      </div>

      {/* Field insights - common observed issues */}
      <div style={{ marginBottom: "16px", border: `1px solid rgba(255,165,0,0.2)`, borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", background: "rgba(255,165,0,0.06)", borderBottom: `1px solid rgba(255,165,0,0.12)` }}>
          <h4 style={{ margin: 0, fontSize: "13px", color: "#ffb347" }}>💡 Insights de Campo — Problemas Observados</h4>
        </div>
        <div style={{ padding: "12px 14px" }}>
          {/* Transition B&W issue */}
          <div style={{ marginBottom: "12px", padding: "10px 12px", background: C.codeBg, borderRadius: "6px", border: `1px solid ${C.borderLight}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: C.warning, background: C.warningBg, padding: "2px 6px", borderRadius: "3px" }}>TRANSIÇÃO</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>Câmera fica preto e branco (Noturno/IR) durante o dia</span>
            </div>
            <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.7" }}>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: C.danger }}>Sintoma:</strong> Imagem em preto e branco em plena luz do dia (ex: 14:59). Status da câmera mostra "Noturno" ativo.
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: C.warning }}>Causa raiz:</strong> O parâmetro <code style={{ color: C.accent }}>Diurno.lower.level</code> (threshold de transição inferior) está configurado em <strong style={{ color: "#ff7eb3" }}>35</strong> ao invés do padrão <strong style={{ color: "#7dffb3" }}>10</strong>.
                Com nível 35, qualquer oscilação de luminosidade — nuvem passando, sombra, chuva — faz o sensor cair abaixo do threshold e a câmera ativa o perfil Noturno (modo IR / P&B).
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: C.accent }}>Mecanismo:</strong> Menu <em>Imagem › Perfis › Transições</em> → Regra "Diurno (inferior)" define: se nível &lt; 35, mudar para perfil Noturno.
                O perfil Noturno usa ganho alto + IR, resultando em imagem monocromática.
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: C.success }}>Correção:</strong> Reduzir <code style={{ color: C.accent }}>Lower Level</code> de 35 para <strong style={{ color: "#7dffb3" }}>10</strong>. 
                Com threshold em 10, a câmera só muda para Noturno quando realmente escurece (anoitecer real), evitando transições espúrias durante o dia.
              </p>
              <p style={{ margin: 0, fontSize: "10px", color: C.textMuted }}>
                📊 Afeta {divergentes.filter(d => d.diffs["Diurno.lower.level"]).length} equipamento(s) nesta frota | Parâmetros relacionados: Diurno.lower.level, Diurno.lower.holdTime, Noturno.upper.level
              </p>
            </div>
          </div>

          {/* Transition timing issue */}
          <div style={{ padding: "10px 12px", background: C.codeBg, borderRadius: "6px", border: `1px solid ${C.borderLight}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ff99a4", background: C.dangerBg, padding: "2px 6px", borderRadius: "3px" }}>HORÁRIO</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>Janelas de transição com horários divergentes (startTime/endTime)</span>
            </div>
            <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.7" }}>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: C.danger }}>Sintoma:</strong> Transição diurno/noturno não ocorre no momento esperado. Câmera pode ignorar threshold ou aplicar perfil errado fora da janela.
              </p>
              <p style={{ margin: "0 0 6px" }}>
                <strong style={{ color: C.warning }}>Causa raiz:</strong> Os campos <code style={{ color: C.accent }}>startTime</code>/<code style={{ color: C.accent }}>endTime</code> das transições estão com valores customizados (ex: 06:00-17:58, 18:00-06:00) ao invés do padrão <strong style={{ color: "#7dffb3" }}>00:00:00</strong> (janela 24h).
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: C.success }}>Correção:</strong> Definir startTime e endTime como <strong style={{ color: "#7dffb3" }}>00:00:00</strong> para que a regra de transição por nível de luz funcione 24h sem restrição de horário.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed problems table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <h3 style={{ fontSize: "14px", margin: 0, color: C.text }}>Análise Detalhada de Divergências</h3>
        <span style={{ fontSize: "11px", color: C.textMuted }}>{sorted.length} parâmetros com desvio</span>
      </div>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 80px 200px 180px 90px", gap: 0, background: C.raised, padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: "11px", fontWeight: 600, color: C.textSecondary }}>
          <div style={{ padding: "0 10px", textAlign: "center" }}>Severidade</div>
          <div style={{ padding: "0 10px" }}>Parâmetro</div>
          <div style={{ padding: "0 10px", textAlign: "center" }}>Equipamentos</div>
          <div style={{ padding: "0 10px" }}>Valor Incorreto → Correto</div>
          <div style={{ padding: "0 10px" }}>Menu / Endpoint</div>
          <div style={{ padding: "0 10px", textAlign: "center" }}>Referências OK</div>
        </div>

        {/* Table body */}
        <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
          {sorted.map(([param, info], idx) => {
            const section = param.split(".")[0];
            const ep = PARAM_TO_ENDPOINT[section] || {};
            const correctVal = consensus[param]?.value;
            const consensusCount = consensus[param]?.count || 0;
            const consensusTotal = consensus[param]?.total || totalDevices;
            const wrongs = [...info.values.entries()].sort((a, b) => b[1] - a[1]);
            const severity = getSeverity(param, info.count, totalDevices);
            const sev = severityColors[severity];
            const paramInfo = PARAM_DESCRIPTIONS[param] || { desc: "Parâmetro de configuração do equipamento", impact: "Pode afetar operação.", causa: "Configuração divergente." };
            const isExpanded = expandedRow === idx;

            return (
              <div key={param}>
                {/* Main row */}
                <div
                  onClick={() => setExpandedRow(isExpanded ? null : idx)}
                  style={{ display: "grid", gridTemplateColumns: "70px 1fr 80px 200px 180px 90px", gap: 0, padding: "10px 0", borderTop: idx > 0 ? `1px solid ${C.borderLight}` : "none", cursor: "pointer", background: isExpanded ? "rgba(255,255,255,0.02)" : "transparent", transition: "background 0.1s" }}
                >
                  <div style={{ padding: "0 10px", textAlign: "center" }}>
                    <span style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.text, padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.3px" }}>{sev.label}</span>
                  </div>
                  <div style={{ padding: "0 10px" }}>
                    <code style={{ fontSize: "12px", color: C.text }}>{param}</code>
                  </div>
                  <div style={{ padding: "0 10px", textAlign: "center" }}>
                    <span style={{ background: info.count > 20 ? C.dangerBg : info.count > 10 ? C.warningBg : C.codeBg, color: info.count > 20 ? C.danger : info.count > 10 ? C.warning : C.textSecondary, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>{info.count}/{totalDevices}</span>
                  </div>
                  <div style={{ padding: "0 10px" }}>
                    {wrongs.slice(0, 1).map(([v, c]) => (
                      <div key={v} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                        <span style={{ color: "#ff7eb3", fontWeight: 600, fontFamily: "monospace" }}>{v === "null" || v === "undefined" ? "∅ vazio" : v}</span>
                        <span style={{ color: C.textMuted }}>→</span>
                        <span style={{ color: "#7dffb3", fontWeight: 600, fontFamily: "monospace" }}>{String(correctVal)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "0 10px" }}>
                    {ep.menu
                      ? <span style={{ fontSize: "10px", color: C.accent }}>{ep.menu.split(" › ").slice(0, 3).join(" › ")}</span>
                      : <span style={{ color: C.textMuted, fontSize: "10px" }}>Manual</span>}
                  </div>
                  <div style={{ padding: "0 10px", textAlign: "center" }}>
                    <span style={{ color: C.success, fontSize: "11px", fontWeight: 600 }}>{consensusCount}/{consensusTotal}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ padding: "0 14px 14px", background: "rgba(255,255,255,0.015)", borderTop: `1px solid ${C.borderLight}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                      {/* Left: Description & Impact */}
                      <div>
                        {/* Menu breadcrumb */}
                        {paramInfo.menu && (
                          <div style={{ marginBottom: "10px", padding: "6px 8px", background: "rgba(96,205,255,0.04)", borderRadius: "4px", border: `1px solid rgba(96,205,255,0.1)` }}>
                            <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "2px" }}>📍 Onde encontrar na interface</div>
                            <div style={{ fontSize: "11px", color: C.accent, fontWeight: 500 }}>{paramInfo.menu}</div>
                          </div>
                        )}
                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>O que é</div>
                          <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.5" }}>{paramInfo.desc}</div>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "10px", color: C.danger, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Impacto do Erro</div>
                          <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.5" }}>{paramInfo.impact}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "10px", color: C.warning, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Causa Provável</div>
                          <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.5" }}>{paramInfo.causa}</div>
                        </div>
                      </div>

                      {/* Right: Values comparison & devices */}
                      <div>
                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Valores encontrados na frota</div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                            <thead>
                              <tr style={{ background: C.tableHeader }}>
                                <th style={{ padding: "4px 6px", textAlign: "left", color: C.textSecondary }}>Valor</th>
                                <th style={{ padding: "4px 6px", textAlign: "center", color: C.textSecondary }}>Qtd</th>
                                <th style={{ padding: "4px 6px", textAlign: "center", color: C.textSecondary }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ background: "rgba(108,203,95,0.05)" }}>
                                <td style={{ padding: "4px 6px", fontFamily: "monospace", color: "#7dffb3", fontWeight: 600 }}>{String(correctVal)}</td>
                                <td style={{ padding: "4px 6px", textAlign: "center", color: C.textSecondary }}>{totalDevices - info.count}</td>
                                <td style={{ padding: "4px 6px", textAlign: "center" }}><span style={{ color: C.success, fontSize: "10px" }}>✅ CORRETO</span></td>
                              </tr>
                              {wrongs.map(([v, c]) => (
                                <tr key={v} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                                  <td style={{ padding: "4px 6px", fontFamily: "monospace", color: "#ff7eb3", fontWeight: 600 }}>{v === "null" || v === "undefined" ? "∅ (vazio)" : v}</td>
                                  <td style={{ padding: "4px 6px", textAlign: "center", color: C.textSecondary }}>{c}</td>
                                  <td style={{ padding: "4px 6px", textAlign: "center" }}><span style={{ color: C.danger, fontSize: "10px" }}>❌ ERRADO</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "10px", color: C.accent, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Equipamentos com valor correto ({consensusCount}/{consensusTotal})</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "60px", overflowY: "auto" }}>
                            {conformes.filter(r => String(r.params[param]) === String(correctVal)).slice(0, 10).map(r => (
                              <TunnelLink key={r.nome} nome={r.nome} uuid={r.uuid} style={{ background: "rgba(108,203,95,0.08)", border: "1px solid rgba(108,203,95,0.2)", padding: "2px 6px", borderRadius: "3px", fontSize: "10px", color: C.success, display: "inline-block" }} />
                            ))}
                            {conformes.filter(r => String(r.params[param]) === String(correctVal)).length > 10 && (
                              <span style={{ fontSize: "10px", color: C.textMuted, padding: "2px 4px" }}>+{conformes.filter(r => String(r.params[param]) === String(correctVal)).length - 10} mais</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "10px", color: C.danger, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Equipamentos afetados ({info.count})</div>
                          <div style={{ maxHeight: "80px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "3px" }}>
                            {info.devices.map(d => (
                              <TunnelLink key={d.nome} nome={d.nome} uuid={d.uuid} style={{ background: C.dangerBg, padding: "1px 5px", borderRadius: "3px", fontSize: "10px", color: C.danger, display: "inline-block" }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* How to fix */}
                    <div style={{ marginTop: "12px", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div style={{ fontSize: "10px", color: C.accent, textTransform: "uppercase", letterSpacing: "0.5px" }}>Como Corrigir</div>
                        {ep.endpoint && info.devices.some(d => d.uuid) && (() => {
                          const onlineDevs = info.devices.filter(d => {
                            const fs = frotaStatus[d.uuid];
                            return d.uuid && (!fs || fs.connected !== false);
                          });
                          const offlineCount = info.devices.filter(d => {
                            const fs = frotaStatus[d.uuid];
                            return d.uuid && fs && fs.connected === false;
                          }).length;
                          const loteLabel = loteStatus[param] === "loading"
                            ? "⏳ Aplicando..."
                            : loteStatus[param] === "ok"
                              ? `✅ Aplicado (${loteResult[param]?.sucesso}/${loteResult[param]?.total}${loteResult[param]?.offlineCount > 0 ? ` · ${loteResult[param].offlineCount} offline` : ""})`
                              : loteStatus[param] === "error"
                                ? `❌ Falha${loteResult[param]?.offlineCount > 0 ? ` (${loteResult[param].offlineCount} offline)` : ""}`
                                : onlineDevs.length === 0
                                  ? `📡 Todos offline (${offlineCount})`
                                  : `✅ Aplicar em todos (${onlineDevs.length}${offlineCount > 0 ? ` online · ${offlineCount} offline` : ""})`;
                          return (
                            <button
                              onClick={() => aplicarLote(info.devices.filter(d => d.uuid), ep.endpoint, ep.buildPayload ? ep.buildPayload(param, correctVal) : { [ep.campo || param.split(".")[0]]: { [param.split(".")[1]]: correctVal } }, param, ep.method || "PUT")}
                              disabled={loteStatus[param] === "loading" || onlineDevs.length === 0}
                              style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "4px", border: `1px solid ${onlineDevs.length === 0 ? C.border : loteStatus[param] === "error" ? C.danger : C.success}`, background: loteStatus[param] === "ok" ? "rgba(108,203,95,0.2)" : loteStatus[param] === "error" ? C.dangerBg : onlineDevs.length === 0 ? C.surface : "rgba(108,203,95,0.08)", color: onlineDevs.length === 0 ? C.textMuted : loteStatus[param] === "error" ? C.danger : C.success, cursor: loteStatus[param] === "loading" || onlineDevs.length === 0 ? "default" : "pointer", fontWeight: 600 }}
                            >
                              {loteLabel}
                            </button>
                          );
                        })()}
                      </div>

                      {/* Menu path */}
                      <div style={{ marginBottom: "8px", padding: "6px 10px", background: "rgba(96,205,255,0.06)", border: `1px solid rgba(96,205,255,0.15)`, borderRadius: "4px" }}>
                        <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "2px" }}>📍 Caminho no menu ITScam:</div>
                        <div style={{ fontSize: "12px", color: C.accent, fontWeight: 600 }}>{paramInfo.menu || "—"}</div>
                        {paramInfo.campo && <div style={{ fontSize: "11px", color: C.textSecondary, marginTop: "2px" }}>Campo: <strong style={{ color: C.text }}>{paramInfo.campo}</strong></div>}
                      </div>

                      {ep.endpoint ? (
                        <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.8" }}>
                          {/* Tabela de dispositivos afetados com ações diretas */}
                          {info.devices.some(d => d.uuid) && (
                            <div style={{ marginBottom: "10px" }}>
                              <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Dispositivos afetados — ações diretas</div>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                                <thead>
                                  <tr style={{ background: C.tableHeader }}>
                                    <th style={{ padding: "4px 8px", textAlign: "left", color: C.textSecondary }}>Equipamento</th>
                                    <th style={{ padding: "4px 8px", textAlign: "left", color: C.textSecondary }}>Interface Web</th>
                                    <th style={{ padding: "4px 8px", textAlign: "left", color: C.textSecondary }}>Caminho</th>
                                    <th style={{ padding: "4px 6px", textAlign: "center", color: C.textSecondary }}>Aplicar</th>
                                    <th style={{ padding: "4px 6px", textAlign: "center", color: C.textSecondary }}>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                {info.devices.map(d => {
                                    const sKey = `${d.uuid}::${param}`;
                                    const st = itscamStatus[sKey] || "idle";
                                    const res = itscamResult[sKey];
                                    const tunnelUrl = d.uuid ? `https://${d.uuid}-80.tunnel.varco.cloud` : null;
                                    const frotaInfo = d.uuid ? frotaStatus[d.uuid] : null;
                                    const isOffline = frotaInfo && frotaInfo.connected === false;
                                    const lastSeenStr = isOffline && frotaInfo.lastSeen
                                      ? (() => { try { return new Date(frotaInfo.lastSeen).toLocaleDateString("pt-BR"); } catch { return frotaInfo.lastSeen; } })()
                                      : null;
                                    return (
                                      <tr key={d.nome} style={{ borderTop: `1px solid ${C.borderLight}`, opacity: isOffline ? 0.7 : 1 }}>
                                        <td style={{ padding: "5px 8px", color: C.text, fontWeight: 600, fontSize: "11px" }}>
                                          {d.nome}
                                          {isOffline && (
                                            <span title={`Offline desde ${lastSeenStr || "desconhecido"}`} style={{ marginLeft: "5px", fontSize: "10px", color: C.danger, fontWeight: 400 }}>
                                              📡 offline
                                            </span>
                                          )}
                                        </td>
                                        <td style={{ padding: "5px 8px" }}>
                                          {tunnelUrl ? (
                                            <a href={tunnelUrl} target="_blank" rel="noopener noreferrer" style={{ color: isOffline ? C.textMuted : C.accent, fontSize: "11px", textDecoration: "none", fontFamily: "monospace" }} title={isOffline ? `Device offline — último acesso: ${lastSeenStr || "desconhecido"}` : "Abre a interface web do equipamento"}>
                                              🌐 Abrir
                                            </a>
                                          ) : (
                                            <span style={{ color: C.textMuted, fontSize: "11px" }}>sem tunnel</span>
                                          )}
                                        </td>
                                        <td style={{ padding: "5px 8px" }}>
                                          <span style={{ fontSize: "10px", color: C.textSecondary }} title={paramInfo.menu}>
                                            {ep.menu ? ep.menu.split(" › ").slice(0, 3).join(" › ") : "—"}
                                          </span>
                                        </td>
                                        <td style={{ padding: "5px 6px", textAlign: "center" }}>
                                          {d.uuid ? (
                                            isOffline ? (
                                              <span title={`Device offline — último acesso: ${lastSeenStr || "desconhecido"}`} style={{ fontSize: "10px", color: C.textMuted, cursor: "default" }}>
                                                📡 Offline
                                              </span>
                                            ) : (
                                              <button
                                                onClick={() => aplicarDispositivo(d.uuid, ep.endpoint, ep.buildPayload ? ep.buildPayload(param, correctVal) : { [ep.campo || param.split(".")[0]]: { [param.split(".")[1]]: correctVal } }, param, ep.method || "PUT")}
                                                disabled={st === "loading" || st === "ok"}
                                                title={`Aplicar ${param} = ${correctVal} via REST API`}
                                                style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "3px", border: `1px solid ${st === "ok" ? C.success : st === "error" ? C.danger : C.accent}`, background: st === "ok" ? "rgba(108,203,95,0.1)" : st === "error" ? C.dangerBg : "transparent", color: st === "ok" ? C.success : st === "error" ? C.danger : C.accent, cursor: st === "loading" || st === "ok" ? "default" : "pointer" }}
                                              >
                                                {st === "loading" ? "⏳" : st === "ok" ? "✅" : st === "error" ? "❌" : "▶ Aplicar"}
                                              </button>
                                            )
                                          ) : "—"}
                                        </td>
                                        <td style={{ padding: "5px 6px", textAlign: "center", fontSize: "10px" }}>
                                          {st === "ok" && <span style={{ color: C.success }}>Aplicado</span>}
                                          {st === "error" && <span style={{ color: C.danger }} title={res?.erro}>Falha</span>}
                                          {st === "offline" && <span style={{ color: C.textMuted }} title={`Último acesso: ${lastSeenStr || "desconhecido"}`}>Offline</span>}
                                          {st === "loading" && <span style={{ color: C.accent }}>...</span>}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div><strong style={{ color: C.text }}>Via Interface Web (manual):</strong></div>
                          <div style={{ paddingLeft: "12px" }}>
                            <div>1. Clique em <strong style={{ color: C.accent }}>🌐 Abrir</strong> na coluna da tabela acima</div>
                            <div>2. Login <code>Admin</code> / <code>#econocr@</code></div>
                            <div>3. Navegar: <span style={{ color: C.accent }}>{paramInfo.menu || ep.menu || "—"}</span></div>
                            <div>4. Alterar <strong style={{ color: C.text }}>{paramInfo.campo || param.split(".").slice(1).join(".")}</strong> para <code style={{ color: "#7dffb3", fontWeight: 700 }}>{String(correctVal)}</code></div>
                            <div>5. Clicar <strong style={{ color: C.success }}>Aplicar</strong></div>
                          </div>
                          <div style={{ marginTop: "8px" }}><strong style={{ color: C.text }}>Via API (automático):</strong></div>
                          <div style={{ paddingLeft: "12px" }}>
                            <div>• Endpoint: <code style={{ color: C.accent }}>{ep.method} {ep.endpoint}</code></div>
                            <div>• Script: <code>node auditoria-itscam/corrigir.mjs --caso=XX --todos</code></div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: "12px", color: C.textSecondary }}>
                          {info.devices.some(d => d.uuid) ? (
                            <>
                              <div style={{ marginBottom: "8px", padding: "6px 10px", background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "4px", fontSize: "11px", color: C.danger }}>
                                ⚠️ <strong>Endpoint somente leitura (HTTP 404)</strong> — correção automática via REST não disponível neste firmware. Use a interface web diretamente.
                              </div>
                              <div style={{ marginBottom: "6px" }}>
                                <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Dispositivos afetados — acesso direto</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                  {info.devices.map(d => (
                                    <TunnelLink key={d.nome} nome={d.nome} uuid={d.uuid} style={{ background: C.dangerBg, padding: "2px 8px", borderRadius: "3px", fontSize: "11px", color: C.danger, display: "inline-block" }} />
                                  ))}
                                </div>
                              </div>
                              <div style={{ paddingLeft: "0" }}>
                                <div>1. Clique no link acima para abrir a interface web do equipamento</div>
                                <div>2. Login <code>Admin</code> / <code>#econocr@</code></div>
                                <div>3. Navegar: <span style={{ color: C.accent }}>{paramInfo.menu || ep.menu || "—"}</span></div>
                                <div>4. Alterar <strong style={{ color: C.text }}>{paramInfo.campo || param.split(".").slice(1).join(".")}</strong> para <code style={{ color: "#7dffb3", fontWeight: 700 }}>{String(correctVal)}</code></div>
                                <div>5. Clicar <strong style={{ color: C.success }}>Salvar</strong> — aguardar confirmação visual na página</div>
                              </div>
                            </>
                          ) : (
                            <span>Requer acesso físico ou remoto (TeamViewer/RDP) ao equipamento para atualização de firmware.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Procedure */}
      <div style={{ marginTop: "16px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: "8px", padding: "14px" }}>
        <h4 style={{ margin: "0 0 8px", color: C.accent, fontSize: "13px" }}>Procedimento de Correção em Massa</h4>
        <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: C.textSecondary, lineHeight: "2" }}>
          <li><strong style={{ color: C.text }}>Validar:</strong> <code>node auditoria-itscam/validar.mjs</code> — confirma erros em tempo real contra a API VARCO</li>
          <li><strong style={{ color: C.text }}>Simular:</strong> <code>node auditoria-itscam/corrigir.mjs --caso=XX --todos --dry</code> — mostra o que seria alterado</li>
          <li><strong style={{ color: C.text }}>Aplicar:</strong> <code>node auditoria-itscam/corrigir.mjs --caso=XX --todos --sim</code> — aplica as correções via PUT</li>
          <li><strong style={{ color: C.text }}>Interativo:</strong> <code>node auditoria-itscam/corrigir-interativo.mjs</code> — corrige um a um com confirmação</li>
          <li><strong style={{ color: C.text }}>Verificar:</strong> <code>node auditoria-itscam/validar.mjs --pos-correcao</code> — confirma que as correções foram aplicadas</li>
        </ol>
        <div style={{ marginTop: "10px", padding: "8px", background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "4px", fontSize: "11px", color: C.danger }}>
          ⚠️ <strong>Atenção:</strong> Equipamentos com VARCO.enabled = false (GOEC6O019, 023, 049, 052-F1) não podem ser corrigidos remotamente. Necessário acesso físico via IP local.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// MAPA DE PASSAGENS — Heatmap do banco AxHub + De-Para entre equipamentos
// ═══════════════════════════════════════════════════════════════════════════════════
function MapaPassagensAnalise({ equipProb, equipRef }) {
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const [mes, setMes] = useState(mesAtual);
  const [mapaProb, setMapaProb] = useState(null);
  const [mapaRef,  setMapaRef]  = useState(null);
  const [depara,   setDepara]   = useState(null);
  const [loadingMapa, setLoadingMapa] = useState(false);
  const [error, setError] = useState(null);

  const TOKEN = "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3";
  const API_HEADERS = { "x-api-token": TOKEN, "Content-Type": "application/json" };

  const buscarDados = async () => {
    if (!equipProb) return;
    setLoadingMapa(true); setError(null);
    try {
      const [resProb, resRef, resDepara] = await Promise.all([
        fetch(`${API_BASE}/api/axhub/mapa-passagens?equipamento=${encodeURIComponent(equipProb)}&mes=${mes}`, { headers: API_HEADERS }).then(r => r.json()),
        equipRef ? fetch(`${API_BASE}/api/axhub/mapa-passagens?equipamento=${encodeURIComponent(equipRef)}&mes=${mes}`, { headers: API_HEADERS }).then(r => r.json()) : Promise.resolve(null),
        equipRef ? fetch(`${API_BASE}/api/axhub/depara-passagens?eq1=${encodeURIComponent(equipProb)}&eq2=${encodeURIComponent(equipRef)}&mes=${mes}`, { headers: API_HEADERS }).then(r => r.json()) : Promise.resolve(null),
      ]);
      if (resProb.ok) setMapaProb(resProb);
      else setError(resProb.erro || "Erro ao buscar passagens");
      if (resRef?.ok) setMapaRef(resRef);
      if (resDepara?.ok) setDepara(resDepara);
    } catch (e) {
      setError(e.message);
    }
    setLoadingMapa(false);
  };

  useEffect(() => { buscarDados(); }, [equipProb, equipRef, mes]);

  const renderHeatmap = (equipData, equipNome, cor) => {
    if (!equipData?.equipamentos?.length) return null;
    const equips = equipData.equipamentos.filter(e => e.equipamento?.toUpperCase().includes(equipNome?.slice(-5)));
    if (!equips.length) return null;
    const periodo = equipData.periodo;
    const dias = Array.from({ length: periodo.totalDias }, (_, i) => i + 1);
    const horas = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div style={{ marginBottom: "12px" }}>
        {equips.map(eq => (
          <div key={`${eq.equipamento}_${eq.faixa}`} style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: cor, marginBottom: "6px" }}>
              📍 {eq.equipamento} — {eq.faixa} · {eq.celulasCom}/{periodo.totalHoras} horas · cobertura: <span style={{ fontWeight: 800 }}>{eq.cobertura}%</span>
            </div>
            {/* Grade hora × dia */}
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: `36px repeat(${periodo.totalDias}, minmax(14px, 1fr))`, gap: "1px", fontSize: "9px" }}>
                {/* Header — dias */}
                <div style={{ color: C.textMuted, textAlign: "right", paddingRight: "4px" }}>Hora</div>
                {dias.map(d => (
                  <div key={d} style={{ textAlign: "center", color: C.textMuted, fontWeight: d === hoje.getDate() ? 700 : 400 }}>{d}</div>
                ))}
                {/* Linhas de hora */}
                {horas.map(h => (
                  <React.Fragment key={h}>
                    <div style={{ color: C.textMuted, textAlign: "right", paddingRight: "4px", paddingTop: "1px" }}>{String(h).padStart(2, "0")}h</div>
                    {dias.map(d => {
                      const cel = eq.grade[`${d}_${h}`];
                      const total = cel?.total || 0;
                      const hasData = total > 0;
                      const intensity = hasData ? Math.min(1, total / 10) : 0;
                      const bg = hasData
                        ? `rgba(${cor === "#22c55e" ? "34,197,94" : cor === "#ef4444" ? "239,68,68" : "34,197,94"},${0.3 + intensity * 0.7})`
                        : "rgba(239,68,68,0.15)";
                      return (
                        <div key={`${d}_${h}`} title={hasData ? `Dia ${d} ${h}h: ${total} passagens` : `Dia ${d} ${h}h: sem passagens`}
                          style={{ height: "10px", borderRadius: "1px", background: bg, cursor: "default" }} />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Legenda */}
            <div style={{ display: "flex", gap: "12px", marginTop: "5px", fontSize: "9px", color: C.textMuted }}>
              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><span style={{ width: "10px", height: "10px", background: "rgba(34,197,94,0.9)", borderRadius: "1px" }} />Com passagens</span>
              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><span style={{ width: "10px", height: "10px", background: "rgba(239,68,68,0.2)", borderRadius: "1px" }} />Sem passagens</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ marginTop: "16px", border: `1px solid rgba(59,130,246,0.3)`, borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "rgba(59,130,246,0.08)", borderBottom: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>📊 Análise de Passagens — Banco AxHub (Mapa de Teste)</span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginLeft: "auto" }}>
          <span style={{ fontSize: "11px", color: C.textMuted }}>Mês:</span>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            style={{ padding: "4px 8px", border: `1px solid ${C.border}`, borderRadius: "5px", background: C.surface, color: C.text, fontSize: "11px" }} />
          <button onClick={buscarDados} disabled={loadingMapa}
            style={{ padding: "5px 12px", border: `1px solid rgba(59,130,246,0.4)`, borderRadius: "5px", background: "rgba(59,130,246,0.08)", color: "#3b82f6", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>
            {loadingMapa ? "⏳" : "🔄 Buscar"}
          </button>
          <a href="https://economia.axhub.axion.ws/relatorio/relatoriomapadeteste" target="_blank" rel="noreferrer"
            style={{ fontSize: "11px", color: "#3b82f6", textDecoration: "none", border: "1px solid rgba(59,130,246,0.35)", padding: "5px 10px", borderRadius: "5px" }}>
            🔗 Abrir no AxHub
          </a>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {error && <div style={{ padding: "8px 12px", background: C.dangerBg, borderRadius: "5px", color: C.danger, fontSize: "11px", marginBottom: "10px" }}>❌ {error} — Banco AxHub pode estar inacessível</div>}

        {/* De-Para de resumo */}
        {depara && (
          <div style={{ marginBottom: "16px", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", background: C.raised, fontSize: "11px", fontWeight: 700, color: C.text, borderBottom: `1px solid ${C.border}` }}>
              ⚖️ De-Para de Passagens — {mes}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: C.tableHeader }}>
                    {["Equipamento", "Total Passagens", "Dias com Passagem", "Horas Distintas", "Vel. Média", "Última Passagem", "Heartbeat", "Status"].map(h => (
                      <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: C.textSecondary, fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {depara.resumo?.map((r, i) => {
                    const isProb = r.Equipamento?.toUpperCase().includes(equipProb?.slice(-5));
                    const corEq = isProb ? "#ef4444" : "#22c55e";
                    const hbColor = r.StatusHeartbeat === "online" ? "#22c55e" : r.StatusHeartbeat === "atencao" ? "#f59e0b" : "#ef4444";
                    return (
                      <tr key={r.Equipamento} style={{ borderTop: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "transparent" : C.codeBg }}>
                        <td style={{ padding: "7px 10px", fontWeight: 700, color: corEq }}>{r.Equipamento}</td>
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: "14px", color: r.TotalPassagens > 1000 ? "#22c55e" : r.TotalPassagens > 100 ? "#f59e0b" : "#ef4444" }}>
                            {r.TotalPassagens?.toLocaleString("pt-BR")}
                          </span>
                        </td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: C.text }}>{r.DiasComPassagem}</td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: C.text }}>{r.HorasDistintas}h</td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: C.textSecondary }}>{r.VelocidadeMedia ? `${Math.round(r.VelocidadeMedia)} km/h` : "—"}</td>
                        <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: "11px", color: C.textMuted }}>{r.UltimaPassagem ? new Date(r.UltimaPassagem).toLocaleString("pt-BR") : "—"}</td>
                        <td style={{ padding: "7px 10px", fontSize: "11px" }}>
                          <span style={{ color: hbColor, fontWeight: 600 }}>
                            {r.StatusHeartbeat === "online" ? "🟢" : r.StatusHeartbeat === "atencao" ? "🟡" : "🔴"} {r.MinutosSemHeartbeat != null ? `${r.MinutosSemHeartbeat} min` : "—"}
                          </span>
                        </td>
                        <td style={{ padding: "7px 10px" }}>
                          <span style={{ fontSize: "11px", color: hbColor, fontWeight: 600 }}>{r.StatusHeartbeat || "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* De-Para de passagens por hora */}
            {depara.porHora && Object.keys(depara.porHora).length > 0 && (
              <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, marginBottom: "8px" }}>📈 Distribuição por Hora do Dia</div>
                <div style={{ display: "grid", gridTemplateColumns: "80px repeat(24, 1fr)", gap: "2px", fontSize: "9px" }}>
                  <div style={{ color: C.textMuted }}>Equip.</div>
                  {Array.from({ length: 24 }, (_, h) => <div key={h} style={{ textAlign: "center", color: C.textMuted }}>{h}h</div>)}
                  {Object.entries(depara.porHora).map(([equip, horas]) => {
                    const isP = equip.toUpperCase().includes(equipProb?.slice(-5));
                    const maxH = Math.max(...horas, 1);
                    return (
                      <React.Fragment key={equip}>
                        <div style={{ fontSize: "9px", color: isP ? "#ef4444" : "#22c55e", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={equip}>{equip.slice(-6)}</div>
                        {horas.map((val, h) => (
                          <div key={h} title={`${equip} - ${h}h: ${val} passagens`}
                            style={{ height: "16px", borderRadius: "2px", background: val > 0 ? `rgba(${isP ? "239,68,68" : "34,197,94"},${0.2 + (val / maxH) * 0.8})` : "rgba(128,128,128,0.1)" }} />
                        ))}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Heatmaps individuais */}
        <div style={{ display: "grid", gridTemplateColumns: equipRef ? "1fr 1fr" : "1fr", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", marginBottom: "8px" }}>❌ {equipProb} — Mapa de Teste</div>
            {loadingMapa ? <div style={{ color: C.textMuted, fontSize: "12px" }}>⏳ Carregando...</div>
              : mapaProb ? renderHeatmap(mapaProb, equipProb, "#22c55e")
              : <div style={{ color: C.textMuted, fontSize: "11px" }}>Sem dados de passagens no banco AxHub para este equipamento/mês.</div>}
          </div>
          {equipRef && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#22c55e", marginBottom: "8px" }}>✅ {equipRef} — Mapa de Teste (referência)</div>
              {loadingMapa ? <div style={{ color: C.textMuted, fontSize: "12px" }}>⏳ Carregando...</div>
                : mapaRef ? renderHeatmap(mapaRef, equipRef, "#22c55e")
                : <div style={{ color: C.textMuted, fontSize: "11px" }}>Sem dados de passagens no banco AxHub para o equipamento de referência.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// REST API CLIENT CHECKER — Verifica configuração de envio ao AxHub via túnel VARCO
// ═══════════════════════════════════════════════════════════════════════════════════
function RestApiClientChecker({ uuidProb, uuidRef, equipProb, equipRef }) {
  const [config, setConfig] = useState({});    // { [uuid]: { servers, loading, erro } }
  const ADMIN_TOKEN = "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3";

  const fetchServers = async (uuid, key) => {
    if (!uuid) return;
    setConfig(c => ({ ...c, [key]: { loading: true } }));
    try {
      // Busca via proxy da API (evita CORS)
      const res = await fetch(`${API_BASE}/proxy/fetch-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-token": ADMIN_TOKEN },
        body: JSON.stringify({
          url: `https://${uuid}-80.tunnel.varco.cloud/api/equipment/servers`,
          method: "GET",
          headers: { Authorization: "Basic " + btoa("Admin:#econocr@") }
        })
      });
      const data = await res.json();
      if (data.ok || data.status === 200) {
        setConfig(c => ({ ...c, [key]: { loading: false, data: data.data || data.body, uuid } }));
      } else {
        setConfig(c => ({ ...c, [key]: { loading: false, erro: `HTTP ${data.status}`, uuid } }));
      }
    } catch (e) {
      setConfig(c => ({ ...c, [key]: { loading: false, erro: e.message, uuid } }));
    }
  };

  const renderConfig = (key, nome, cor) => {
    const s = config[key];
    if (!s) return null;
    if (s.loading) return <span style={{ fontSize: "10px", color: C.textMuted }}>⏳ Lendo...</span>;
    if (s.erro) return <span style={{ fontSize: "10px", color: "#f59e0b" }}>⚠️ {s.erro} — Verificar manualmente</span>;
    
    const servers = s.data;
    const hasRestApi = servers && (Array.isArray(servers) ? servers.length > 0 : Object.keys(servers || {}).length > 0);
    const restClients = Array.isArray(servers) ? servers : (servers?.clients || servers?.restApiClient ? [servers] : []);
    
    return (
      <div style={{ marginTop: "6px", padding: "8px 10px", background: hasRestApi ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${hasRestApi ? "#22c55e" : "#ef4444"}40`, borderRadius: "5px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: hasRestApi ? "#22c55e" : "#ef4444", marginBottom: "5px" }}>
          {hasRestApi ? "✅ REST API Client configurado" : "❌ REST API Client NÃO configurado — causa do mapa vermelho"}
        </div>
        {restClients.slice(0, 3).map((client, i) => (
          <div key={i} style={{ fontSize: "10px", color: C.textSecondary, fontFamily: "monospace", marginBottom: "2px" }}>
            URL: <span style={{ color: C.accent }}>{client?.url || client?.host || "—"}</span>
            {client?.enabled !== undefined && <span style={{ marginLeft: "8px", color: client.enabled ? "#22c55e" : "#ef4444" }}>enabled: {String(client.enabled)}</span>}
          </div>
        ))}
        {!hasRestApi && (
          <div style={{ fontSize: "10px", color: "#ef4444", marginTop: "4px" }}>
            → Configurar em: Equipamento › Servidores › REST API Client → URL: economia.axhub.axion.ws/api/passagens
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, marginBottom: "6px", textTransform: "uppercase" }}>🔍 Verificar REST API Client ao vivo via túnel:</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {[
          { uuid: uuidProb, key: "prob", nome: equipProb, cor: "#ef4444" },
          { uuid: uuidRef,  key: "ref",  nome: equipRef,  cor: "#22c55e" },
        ].map(item => item.uuid && (
          <div key={item.key}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
              <a href={`https://${item.uuid}-80.tunnel.varco.cloud/equipment/servers`} target="_blank" rel="noreferrer"
                style={{ fontSize: "10px", color: item.cor, textDecoration: "none", border: `1px solid ${item.cor}40`, padding: "2px 8px", borderRadius: "3px" }}>
                🔗 {item.nome} — Abrir Interface
              </a>
              <button onClick={() => fetchServers(item.uuid, item.key)}
                style={{ fontSize: "10px", padding: "2px 8px", border: `1px solid ${item.cor}40`, borderRadius: "3px", background: "transparent", color: item.cor, cursor: "pointer" }}>
                {config[item.key]?.loading ? "⏳" : "📡 Ler Config"}
              </button>
            </div>
            {renderConfig(item.key, item.nome, item.cor)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// DIAGNÓSTICO DE INTEGRAÇÃO — Por que as passagens não chegam ao AxHub?
// ═══════════════════════════════════════════════════════════════════════════════════
const GRUPOS_DIAGNOSTICO = [
  {
    id: "envio",
    titulo: "🔴 GRUPO 1 — Envio de Dados (REST API Client / FTP / VARCO)",
    prioridade: "CRÍTICO",
    cor: "#ef4444",
    descricao: "Estes parâmetros determinam SE as passagens chegam ao AxHub. Qualquer erro aqui = passagens não chegam.",
    params: ["VARCO.enabled", "VARCO.edgeServer", "FTP.enable"],
    checkExtra: [
      { campo: "REST API Client", desc: "Configuração do servidor de destino (URL AxHub). Visível em: Equipamento › Servidores › REST API. Se URL errada ou desabilitado → ZERO passagens no AxHub.", critico: true },
    ]
  },
  {
    id: "ocr",
    titulo: "🟠 GRUPO 2 — Captura e Reconhecimento (OCR / Trigger)",
    prioridade: "ALTO",
    cor: "#f97316",
    descricao: "Estes parâmetros determinam QUANTAS passagens são lidas. OCR desligado ou modo errado = passagens ignoradas.",
    params: ["OCR.enabled", "OCR.processingMode", "OCR.vehicleType", "OCR.maxPlates", "OCR.processingQueue", "OCR.processingThreads"],
  },
  {
    id: "classifier",
    titulo: "🟡 GRUPO 3 — Classificação Veicular",
    prioridade: "MÉDIO",
    cor: "#f59e0b",
    descricao: "Classificador afeta o campo ClassificacaoVeiculo no AxCross. minProbability = 100% = nunca classifica.",
    params: ["Classificador.enabled", "Classificador.minProbability", "Classificador.sceneType", "Classificador.processingQueue"],
  },
  {
    id: "imagem",
    titulo: "🟡 GRUPO 4 — Perfis de Imagem (Transições Diurno/Noturno)",
    prioridade: "MÉDIO",
    cor: "#eab308",
    descricao: "Thresholds incorretos fazem a câmera ficar em modo P&B durante o dia, comprometendo a leitura de placas.",
    params: ["Diurno.lower.level", "Diurno.lower.startTime", "Diurno.lower.endTime", "Diurno.upper.level", "Noturno.lower.level", "Noturno.upper.level"],
  },
  {
    id: "io",
    titulo: "🔵 GRUPO 5 — IO Ports (Trigger de Laço)",
    prioridade: "BAIXO",
    cor: "#3b82f6",
    descricao: "Configuração do trigger físico. Antecipação errada = veículo fora da posição ideal na captura.",
    params: ["IO.port1.earlyUs", "IO.port1.isReserved", "IO.port3.earlyUs"],
  },
  {
    id: "sistema",
    titulo: "🔵 GRUPO 6 — Sistema (NTP / Timezone / Firmware / SNMP)",
    prioridade: "BAIXO",
    cor: "#6366f1",
    descricao: "Timestamp errado invalida infrações legalmente. Firmware divergente causa comportamentos inesperados.",
    params: ["NTP.server", "Timezone", "Firmware.version", "SNMP.enabled", "Reboot.scheduled.enabled", "Reboot.periodic.enabled", "Video.framerate", "Video.quality"],
  },
];

function DiagnosticoIntegracaoTab({ analysis, liveDevices = [] }) {
  const { results, consensus } = analysis;
  const allNames = useMemo(() => results.map(r => r.nome).sort(), [results]);

  // Equipamento com problema (padrão GOEC60059 ou primeiro divergente)
  const primeiroDiv = analysis.divergentes[0]?.nome || "";
  const [equipProb, setEquipProb]     = useState(() => allNames.find(n => n.includes("60059")) || primeiroDiv);
  const [equipRef,  setEquipRef]      = useState(() => analysis.conformes[0]?.nome || "");
  const [searchProb, setSearchProb]   = useState("");
  const [searchRef,  setSearchRef]    = useState("");
  const [showDropProb, setShowDropProb] = useState(false);
  const [showDropRef,  setShowDropRef]  = useState(false);
  const [configVivo,   setConfigVivo]   = useState({});  // { [uuid]: rawConfig }
  const [loadingVivo,  setLoadingVivo]  = useState({});
  const [applyStatus,  setApplyStatus]  = useState({});
  const [expandedGrp,  setExpandedGrp]  = useState("envio");

  const devProb = useMemo(() => results.find(r => r.nome === equipProb), [results, equipProb]);
  const devRef  = useMemo(() => results.find(r => r.nome === equipRef),  [results, equipRef]);
  const liveProb = liveDevices.find(d => d.name === equipProb);
  const liveRef  = liveDevices.find(d => d.name === equipRef);

  const uuidProb = liveProb?.uuid || devProb?.uuid;
  const uuidRef  = liveRef?.uuid  || devRef?.uuid;

  // Filtro dropdown
  const filteredProb = allNames.filter(n => !searchProb || n.toLowerCase().includes(searchProb.toLowerCase()));
  const filteredRef  = allNames.filter(n => !searchRef  || n.toLowerCase().includes(searchRef.toLowerCase()));

  // Buscar config ao vivo do túnel
  const fetchConfig = async (uuid, key) => {
    if (!uuid) return;
    setLoadingVivo(p => ({ ...p, [key]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/varco/itscam/ler-config`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({ uuid })
      });
      const data = await res.json();
      if (data.ok) {
        setConfigVivo(p => ({ ...p, [key]: data }));
      }
    } catch {}
    setLoadingVivo(p => ({ ...p, [key]: false }));
  };

  // De-Para entre dois equipamentos (por grupo)
  const deParaGrupo = (grupo) => {
    if (!devProb || !devRef) return [];
    return grupo.params
      .map(param => {
        const valProb = devProb.params?.[param];
        const valRef  = devRef.params?.[param];
        const isDiff  = String(valProb) !== String(valRef);
        const consensoVal = consensus[param]?.value;
        const isConformeProb = String(valProb) === String(consensoVal);
        return { param, valProb, valRef, isDiff, isConformeProb };
      })
      .filter(r => r.valProb !== undefined || r.valRef !== undefined);
  };

  // Contar divergências por grupo
  const countDivGrupo = (grupo) => deParaGrupo(grupo).filter(r => r.isDiff).length;

  // Aplicar correção individual
  const aplicar = async (uuid, param, valorCorreto) => {
    const sec = param.split(".")[0];
    const ep  = PARAM_TO_ENDPOINT[sec] || {};
    if (!ep.endpoint || !uuid) return;
    const key = `${uuid}::${param}`;
    setApplyStatus(s => ({ ...s, [key]: "loading" }));
    try {
      const res = await fetch(`${API_BASE}/api/varco/itscam/aplicar`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({ uuid, endpoint: ep.endpoint, payload: ep.buildPayload ? ep.buildPayload(param, valorCorreto) : { [sec]: { [param.split(".").slice(1).join(".")]: valorCorreto } }, method: ep.method || "PUT" })
      });
      const data = await res.json();
      setApplyStatus(s => ({ ...s, [key]: data.ok ? "ok" : "error" }));
    } catch { setApplyStatus(s => ({ ...s, [key]: "error" })); }
  };

  // Diagnóstico automático (lista de problemas prováveis)
  const diagnostico = useMemo(() => {
    if (!devProb) return [];
    const problemas = [];
    const p = devProb.params || {};

    if (p["VARCO.enabled"] === false || p["VARCO.enabled"] === null) {
      problemas.push({ sev: "CRÍTICO", cor: "#ef4444", msg: "VARCO desabilitado — acesso remoto impossível", solucao: "Habilitar VARCO em Sistema › Manutenção › Acesso Remoto" });
    }
    if (p["OCR.enabled"] === false) {
      problemas.push({ sev: "CRÍTICO", cor: "#ef4444", msg: "OCR desabilitado — NENHUMA placa é lida → zero passagens no AxHub", solucao: "Habilitar OCR em Equipamento › Reconhecimento › aba Jidosha" });
    }
    if (p["FTP.enable"] === false) {
      problemas.push({ sev: "CRÍTICO", cor: "#ef4444", msg: "FTP desabilitado — imagens não chegam ao servidor", solucao: "Habilitar FTP em Equipamento › Servidores › FTP" });
    }
    if (p["Diurno.lower.level"] != null && p["Diurno.lower.level"] > 15) {
      problemas.push({ sev: "ALTO", cor: "#f97316", msg: `Transição Diurna: threshold ${p["Diurno.lower.level"]} (muito alto — câmera vai para P&B durante o dia)`, solucao: `Reduzir de ${p["Diurno.lower.level"]} para 10 em Imagem › Perfis › Perfil 1 › Transições › Inferior` });
    }
    if (p["Classificador.minProbability"] === 100) {
      problemas.push({ sev: "ALTO", cor: "#f97316", msg: "minProbability = 100% — classificador NUNCA dispara (campo ClassificacaoVeiculo sempre vazio no AxCross)", solucao: "Reduzir de 100% para 60% em Equipamento › Reconhecimento › aba Classifier" });
    }
    if (p["Diurno.lower.startTime"] && p["Diurno.lower.startTime"] !== "00:00:00") {
      problemas.push({ sev: "MÉDIO", cor: "#f59e0b", msg: `Janela de transição restrita (startTime=${p["Diurno.lower.startTime"]}) — câmera pode não transicionar fora do horário`, solucao: "Definir startTime e endTime como 00:00:00 para janela 24h" });
    }
    if (devProb.diffCount > 0) {
      const diffs = Object.keys(devProb.diffs);
      const criticos = diffs.filter(d => ["VARCO.enabled","OCR.enabled","FTP.enable","Classificador.enabled"].includes(d));
      if (criticos.length > 0) {
        criticos.forEach(d => {
          const val = devProb.diffs[d];
          problemas.push({ sev: "CRÍTICO", cor: "#ef4444", msg: `${d} = ${val?.atual} (deveria ser ${val?.correto})`, solucao: `Corrigir ${d} via API ou interface ITScam` });
        });
      }
    }
    if (problemas.length === 0 && devProb.diffCount === 0) {
      problemas.push({ sev: "INFO", cor: "#22c55e", msg: "Nenhuma divergência de configuração encontrada. Verificar REST API Client (Equipamento › Servidores) e conectividade de rede.", solucao: "Acessar túnel e verificar manualmente: Equipamento › Servidores › REST API" });
    }
    return problemas;
  }, [devProb]);

  const totalDivProb = devProb?.diffCount || 0;
  const probConected = liveProb?.connected;
  const refConected  = liveRef?.connected;

  return (
    <div>
      {/* ── Cabeçalho ── */}
      <div style={{ marginBottom: "14px", padding: "12px 16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
          🔬 Diagnóstico: Por que as passagens não chegam ao AxHub?
        </div>
        <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.7" }}>
          Selecione o equipamento com problema e um equipamento de referência (que funciona). O sistema faz o <strong>De-Para completo</strong> agrupado por categoria, 
          identifica os parâmetros divergentes com maior probabilidade de causar falha no registro de passagens e oferece correção direta via API.
        </div>
      </div>

      {/* ── Seleção de Equipamentos ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>

        {/* Equipamento com problema */}
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", marginBottom: "8px" }}>❌ Equipamento com Problema (Mapa Vermelho)</div>
          <div style={{ position: "relative" }}>
            <input
              value={searchProb || equipProb}
              onChange={e => { setSearchProb(e.target.value); setShowDropProb(true); }}
              onFocus={() => setShowDropProb(true)}
              placeholder="Buscar equipamento (ex: GOEC60059)"
              style={{ width: "100%", padding: "8px 10px", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "6px", background: C.surface, color: C.text, fontSize: "12px", boxSizing: "border-box" }}
            />
            {showDropProb && filteredProb.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                {filteredProb.slice(0, 50).map(n => (
                  <div key={n} onClick={() => { setEquipProb(n); setSearchProb(""); setShowDropProb(false); }}
                    style={{ padding: "7px 12px", cursor: "pointer", fontSize: "12px", color: n === equipProb ? "#ef4444" : C.text, fontWeight: n === equipProb ? 700 : 400, background: n === equipProb ? "rgba(239,68,68,0.08)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = n === equipProb ? "rgba(239,68,68,0.08)" : "transparent"}>
                    {n} {analysis.divergentes.find(d => d.nome === n) ? `— ⚠️ ${analysis.divergentes.find(d=>d.nome===n).diffCount} erros` : "— ✅ conforme"}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Status e info */}
          <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "11px" }}>
            <span style={{ color: probConected ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
              {probConected !== undefined ? (probConected ? "🟢 Online VARCO" : "🔴 Offline VARCO") : "⚪ Status desconhecido"}
            </span>
            {totalDivProb > 0 && <span style={{ color: "#f59e0b" }}>⚠️ {totalDivProb} divergência(s)</span>}
            {uuidProb && (
              <a href={`https://${uuidProb}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer"
                style={{ color: C.accent, textDecoration: "none", marginLeft: "auto" }}>🔗 Abrir Túnel</a>
            )}
          </div>
          {uuidProb && (
            <button onClick={() => fetchConfig(uuidProb, "prob")} disabled={loadingVivo["prob"]}
              style={{ marginTop: "8px", width: "100%", padding: "7px", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "5px", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>
              {loadingVivo["prob"] ? "⏳ Lendo config ao vivo..." : "📡 Ler Configuração ao Vivo via Túnel"}
            </button>
          )}
          {configVivo["prob"] && <div style={{ marginTop: "6px", fontSize: "10px", color: "#22c55e" }}>✅ Config ao vivo carregada — firmware: {configVivo["prob"]?.firmware?.version || "—"}</div>}
        </div>

        {/* Equipamento de referência */}
        <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e", marginBottom: "8px" }}>✅ Equipamento de Referência (Mapa Verde — funciona)</div>
          <div style={{ position: "relative" }}>
            <input
              value={searchRef || equipRef}
              onChange={e => { setSearchRef(e.target.value); setShowDropRef(true); }}
              onFocus={() => setShowDropRef(true)}
              placeholder="Buscar referência (ex: GOEC60054)"
              style={{ width: "100%", padding: "8px 10px", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "6px", background: C.surface, color: C.text, fontSize: "12px", boxSizing: "border-box" }}
            />
            {showDropRef && filteredRef.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                {filteredRef.slice(0, 50).map(n => (
                  <div key={n} onClick={() => { setEquipRef(n); setSearchRef(""); setShowDropRef(false); }}
                    style={{ padding: "7px 12px", cursor: "pointer", fontSize: "12px", color: n === equipRef ? "#22c55e" : C.text, fontWeight: n === equipRef ? 700 : 400, background: n === equipRef ? "rgba(34,197,94,0.08)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = n === equipRef ? "rgba(34,197,94,0.08)" : "transparent"}>
                    {n} {analysis.conformes.find(c => c.nome === n) ? "— ✅ conforme" : `— ⚠️ ${analysis.divergentes.find(d=>d.nome===n)?.diffCount || 0} erros`}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "11px" }}>
            <span style={{ color: refConected ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
              {refConected !== undefined ? (refConected ? "🟢 Online VARCO" : "🔴 Offline VARCO") : "⚪ Status desconhecido"}
            </span>
            {uuidRef && (
              <a href={`https://${uuidRef}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer"
                style={{ color: C.accent, textDecoration: "none", marginLeft: "auto" }}>🔗 Abrir Túnel</a>
            )}
          </div>
          {uuidRef && (
            <button onClick={() => fetchConfig(uuidRef, "ref")} disabled={loadingVivo["ref"]}
              style={{ marginTop: "8px", width: "100%", padding: "7px", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "5px", background: "transparent", color: "#22c55e", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>
              {loadingVivo["ref"] ? "⏳ Lendo config ao vivo..." : "📡 Ler Configuração ao Vivo via Túnel"}
            </button>
          )}
          {configVivo["ref"] && <div style={{ marginTop: "6px", fontSize: "10px", color: "#22c55e" }}>✅ Config ao vivo carregada — firmware: {configVivo["ref"]?.firmware?.version || "—"}</div>}
        </div>
      </div>

      {/* ── Diagnóstico Automático ── */}
      {diagnostico.length > 0 && (
        <div style={{ marginBottom: "16px", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.2)", fontSize: "12px", fontWeight: 700, color: C.text }}>
            🚨 Diagnóstico Automático — {equipProb || "—"} — Causas Prováveis da Falha
          </div>
          <div style={{ padding: "12px 14px" }}>
            {diagnostico.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 10px", marginBottom: "6px", background: `${p.cor}08`, borderRadius: "7px", borderLeft: `3px solid ${p.cor}` }}>
                <span style={{ background: `${p.cor}20`, color: p.cor, border: `1px solid ${p.cor}40`, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, flexShrink: 0, alignSelf: "flex-start" }}>{p.sev}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: p.cor, marginBottom: "3px" }}>{p.msg}</div>
                  <div style={{ fontSize: "11px", color: C.textSecondary }}>✅ Correção: {p.solucao}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── De-Para por Grupo ── */}
      {devProb && devRef ? (
        <>
          <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>
            ⚖️ De-Para por Grupo — <span style={{ color: "#22c55e" }}>{equipRef}</span> (referência) vs <span style={{ color: "#ef4444" }}>{equipProb}</span> (problema)
          </div>
          {GRUPOS_DIAGNOSTICO.map(grupo => {
            const depara = deParaGrupo(grupo);
            const numDivs = depara.filter(r => r.isDiff).length;
            const isExp = expandedGrp === grupo.id;
            return (
              <div key={grupo.id} style={{ marginBottom: "10px", border: `1px solid ${grupo.cor}35`, borderRadius: "10px", overflow: "hidden" }}>
                {/* Header do grupo */}
                <div onClick={() => setExpandedGrp(isExp ? null : grupo.id)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", cursor: "pointer", background: isExp ? `${grupo.cor}08` : C.surface, borderLeft: `4px solid ${grupo.cor}` }}>
                  <span style={{ background: `${grupo.cor}18`, color: grupo.cor, border: `1px solid ${grupo.cor}40`, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>{grupo.prioridade}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: C.text, flex: 1 }}>{grupo.titulo}</span>
                  {numDivs > 0
                    ? <span style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>⚠️ {numDivs} divergência(s)</span>
                    : <span style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>✅ Idêntico</span>}
                  {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
                </div>

                {isExp && (
                  <div style={{ padding: "10px 14px", background: C.surface, borderTop: `1px solid ${grupo.cor}20` }}>
                    <div style={{ fontSize: "11px", color: C.textSecondary, marginBottom: "10px", padding: "7px 10px", background: C.codeBg, borderRadius: "5px", borderLeft: `3px solid ${grupo.cor}` }}>
                      {grupo.descricao}
                    </div>

                    {/* Aviso extra para Grupo 1 (REST API Client) */}
                    {grupo.checkExtra?.map((ex, ei) => (
                      <div key={ei} style={{ marginBottom: "10px", padding: "10px 12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "7px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "5px" }}>
                          {ex.critico && <span style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", padding: "1px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>⚠️ VERIFICAÇÃO MANUAL</span>}
                          <strong style={{ fontSize: "12px", color: C.text }}>{ex.campo}</strong>
                        </div>
                        <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.6" }}>{ex.desc}</div>
                        {/* Verificador ao vivo do REST API Client via túnel */}
                        <RestApiClientChecker uuidProb={uuidProb} uuidRef={uuidRef} equipProb={equipProb} equipRef={equipRef} />
                      </div>
                    ))}

                    {/* Tabela De-Para */}
                    <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: "7px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                          <tr style={{ background: C.tableHeader }}>
                            <th style={{ padding: "7px 10px", textAlign: "left", color: C.textSecondary, fontWeight: 600 }}>Parâmetro</th>
                            <th style={{ padding: "7px 10px", textAlign: "center", color: "#22c55e", fontWeight: 600 }}>✅ Referência ({equipRef?.slice(-5)})</th>
                            <th style={{ padding: "7px 10px", textAlign: "center", color: "#ef4444", fontWeight: 600 }}>❌ Problema ({equipProb?.slice(-5)})</th>
                            <th style={{ padding: "7px 10px", textAlign: "center", color: C.textSecondary, fontWeight: 600 }}>Status</th>
                            <th style={{ padding: "7px 10px", textAlign: "center", color: C.textSecondary, fontWeight: 600 }}>Correção</th>
                          </tr>
                        </thead>
                        <tbody>
                          {depara.map((row, i) => {
                            const isDiff = row.isDiff;
                            const sec    = row.param.split(".")[0];
                            const ep     = PARAM_TO_ENDPOINT[sec] || {};
                            const descP  = PARAM_DESCRIPTIONS_SHORT[row.param] || {};
                            const applyKey = `${uuidProb}::${row.param}`;
                            const st = applyStatus[applyKey];
                            return (
                              <tr key={row.param} style={{ borderTop: `1px solid ${C.borderLight}`, background: isDiff ? "rgba(239,68,68,0.04)" : i % 2 === 0 ? "transparent" : C.codeBg }}>
                                <td style={{ padding: "7px 10px" }}>
                                  <code style={{ fontSize: "11px", color: isDiff ? "#ef4444" : C.accent, fontWeight: isDiff ? 700 : 400 }}>{row.param}</code>
                                  <div style={{ fontSize: "9px", color: C.textMuted, marginTop: "1px" }}>{descP.campo || ep.campo || ""}</div>
                                </td>
                                <td style={{ padding: "7px 10px", textAlign: "center" }}>
                                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: "3px", fontSize: "11px" }}>
                                    {row.valRef == null ? "null" : String(row.valRef)}
                                  </span>
                                </td>
                                <td style={{ padding: "7px 10px", textAlign: "center" }}>
                                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: isDiff ? "#ef4444" : "#22c55e", background: isDiff ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: "3px", fontSize: "11px" }}>
                                    {row.valProb == null ? "null" : String(row.valProb)}
                                  </span>
                                </td>
                                <td style={{ padding: "7px 10px", textAlign: "center" }}>
                                  {isDiff
                                    ? <span style={{ fontSize: "10px", fontWeight: 700, color: "#ef4444" }}>⚠️ DIVERGE</span>
                                    : <span style={{ fontSize: "10px", color: "#22c55e" }}>✅</span>}
                                </td>
                                <td style={{ padding: "7px 10px", textAlign: "center" }}>
                                  {isDiff && ep.endpoint && uuidProb ? (
                                    <button onClick={() => aplicar(uuidProb, row.param, row.valRef)}
                                      style={{ fontSize: "10px", padding: "3px 10px", border: `1px solid ${st === "ok" ? "#22c55e" : grupo.cor}`, borderRadius: "4px", background: st === "ok" ? "rgba(34,197,94,0.1)" : "transparent", color: st === "ok" ? "#22c55e" : grupo.cor, cursor: "pointer", fontWeight: 600 }}>
                                      {st === "loading" ? "⏳" : st === "ok" ? "✅ Aplicado" : st === "error" ? "❌ Erro" : `▶ ${String(row.valProb)} → ${String(row.valRef)}`}
                                    </button>
                                  ) : isDiff && !ep.endpoint ? (
                                    <span style={{ fontSize: "10px", color: C.textMuted }}>Manual</span>
                                  ) : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Links de acesso direto ao grupo */}
                    {(uuidProb || uuidRef) && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                        <div style={{ fontSize: "10px", color: C.textMuted, alignSelf: "center", fontWeight: 600 }}>Acesso direto na interface ITScam:</div>
                        {uuidProb && <a href={`https://${uuidProb}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer"
                          style={{ fontSize: "11px", color: "#ef4444", textDecoration: "none", border: "1px solid rgba(239,68,68,0.35)", padding: "3px 10px", borderRadius: "4px" }}>
                          🔗 {equipProb?.slice(-6)} (problema)</a>}
                        {uuidRef && <a href={`https://${uuidRef}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer"
                          style={{ fontSize: "11px", color: "#22c55e", textDecoration: "none", border: "1px solid rgba(34,197,94,0.35)", padding: "3px 10px", borderRadius: "4px" }}>
                          🔗 {equipRef?.slice(-6)} (referência)</a>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <div style={{ padding: "30px", textAlign: "center", color: C.textMuted, border: `1px dashed ${C.border}`, borderRadius: "8px" }}>
          Selecione o equipamento com problema e um equipamento de referência para ver o De-Para completo
        </div>
      )}

      {/* ── Análise de Passagens do AxHub (banco SQL) ── */}
      {(equipProb || equipRef) && (
        <MapaPassagensAnalise equipProb={equipProb} equipRef={equipRef} />
      )}

      {/* ── Rotina de Correção Completa ── */}
      {devProb && totalDivProb > 0 && (
        <div style={{ marginTop: "16px", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.08)", borderBottom: "1px solid rgba(34,197,94,0.2)", fontSize: "12px", fontWeight: 700, color: "#22c55e" }}>
            🔧 Rotina de Correção Completa — {equipProb}
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div style={{ padding: "10px 12px", background: C.codeBg, borderRadius: "7px", fontSize: "11px", color: C.textSecondary, lineHeight: "1.8" }}>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: "6px" }}>📋 Passos Manuais (interface ITScam):</div>
                <div>1. Acesse: <a href={uuidProb ? `https://${uuidProb}-80.tunnel.varco.cloud` : "#"} target="_blank" rel="noreferrer" style={{ color: C.accent, textDecoration: "none" }}>Túnel do equipamento ↗</a></div>
                <div>2. Login: <code style={{ color: C.accent }}>Admin</code> / <code style={{ color: C.accent }}>#econocr@</code></div>
                <div>3. Verificar <strong>Equipamento › Servidores › REST API</strong> → URL AxHub configurada?</div>
                <div>4. Verificar <strong>Equipamento › Reconhecimento › Jidosha</strong> → OCR habilitado?</div>
                <div>5. Verificar <strong>Imagem › Perfis</strong> → transições corretas?</div>
                <div>6. Clicar em Aplicar em cada tela alterada</div>
                <div>7. Aguardar ~5 min e verificar o Mapa de Teste no AxHub</div>
              </div>
              <div style={{ padding: "10px 12px", background: C.codeBg, borderRadius: "7px", fontSize: "11px", color: C.textSecondary, lineHeight: "1.8" }}>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: "6px" }}>⚡ Passos Automáticos (via botões acima):</div>
                <div>1. Expanda cada grupo acima</div>
                <div>2. Para cada linha vermelha (DIVERGE), clique <strong>▶ aplicar</strong></div>
                <div>3. Ou use o botão lote na aba <strong>Política de Correção</strong></div>
                <div>4. Verifique o resultado no Inventário (status muda para ✅)</div>
                <div>5. Execute recoleta: botão <strong>Atualizar — Recoletar do VARCO</strong></div>
                <div>6. Confirme no AxHub: <a href="https://economia.axhub.axion.ws/relatorio/relatoriomapadeteste" target="_blank" rel="noreferrer" style={{ color: C.accent, textDecoration: "none" }}>Mapa de Teste AxHub ↗</a></div>
              </div>
            </div>
            <div style={{ padding: "9px 12px", background: "rgba(239,68,68,0.06)", borderRadius: "6px", fontSize: "11px", color: "#ef4444", fontWeight: 500 }}>
              ⚠️ <strong>ATENÇÃO:</strong> A correção automática via API funciona apenas para equipamentos <strong>Online no VARCO Cloud</strong>. 
              Equipamentos offline precisam de acesso físico ou via TeamViewer. Sempre verificar no Mapa de Teste após a correção.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// POLÍTICA DE CORREÇÃO — De-Para completo por erro com guia de correção passo a passo
// ═══════════════════════════════════════════════════════════════════════════════════
function PoliticaCorrecaoTab({ analysis, liveDevices = [] }) {
  const { conformes, divergentes, consensus, results, groups } = analysis;
  const [refEquip, setRefEquip]         = useState(conformes[0]?.nome || "");
  const [equipSel, setEquipSel]         = useState(divergentes[0]?.nome || "");
  const [expandedErro, setExpandedErro] = useState(null);
  const [applyStatus, setApplyStatus]   = useState({});
  const [applyResult, setApplyResult]   = useState({});

  // Mapa uuid por nome (VARCO Cloud)
  const uuidMap = useMemo(() => {
    const m = {};
    liveDevices.forEach(d => { if (d.name && d.uuid) m[d.name] = d.uuid; });
    return m;
  }, [liveDevices]);

  // Equipamento de referência selecionado
  const refDevice = useMemo(() => results.find(r => r.nome === refEquip), [results, refEquip]);
  // Equipamento problemático selecionado
  const selDevice = useMemo(() => results.find(r => r.nome === equipSel), [results, equipSel]);

  // Ranking de erros (parâmetros mais divergentes)
  const erros = useMemo(() => {
    const map = {};
    divergentes.forEach(d => {
      Object.entries(d.diffs).forEach(([key, { atual, correto }]) => {
        if (!map[key]) map[key] = { param: key, correto, errados: new Map(), equipamentos: [] };
        const v = String(atual);
        map[key].errados.set(v, (map[key].errados.get(v) || 0) + 1);
        map[key].equipamentos.push({ nome: d.nome, uuid: d.uuid, atual });
      });
    });
    return Object.values(map)
      .map(e => ({ ...e, total: e.equipamentos.length }))
      .sort((a, b) => b.total - a.total);
  }, [divergentes]);

  // Severidade por parâmetro
  const getSev = (param, total, size) => {
    const critKeys = ["VARCO.enabled","OCR.enabled","FTP.enable","Classificador.enabled"];
    if (critKeys.includes(param)) return "CRÍTICO";
    if (param.includes("Firmware") || param.includes("NTP") || param.includes("Timezone")) return "ALTO";
    if (total > size * 0.4) return "ALTO";
    if (total > size * 0.15) return "MÉDIO";
    return "BAIXO";
  };
  const sevColor = { CRÍTICO: "#ef4444", ALTO: "#f97316", MÉDIO: "#f59e0b", BAIXO: "#a78bfa" };
  const sevBg    = { CRÍTICO: "rgba(239,68,68,0.08)", ALTO: "rgba(249,115,22,0.08)", MÉDIO: "rgba(245,158,11,0.08)", BAIXO: "rgba(167,139,250,0.08)" };

  // Aplicar correção via API em todos os afetados
  const aplicarCorrecao = async (erro) => {
    const sec = erro.param.split(".")[0];
    const ep  = PARAM_TO_ENDPOINT[sec] || {};
    if (!ep.endpoint) return;
    const key = `lote::${erro.param}`;
    setApplyStatus(s => ({ ...s, [key]: "loading" }));
    const onlineDevs = erro.equipamentos.filter(d => {
      const live = liveDevices.find(l => l.name === d.nome);
      return !live || live.connected !== false;
    });
    try {
      const res = await fetch(`${API_BASE}/api/varco/itscam/aplicar-lote`, {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({
          devices: onlineDevs.map(d => ({ nome: d.nome, uuid: d.uuid })),
          endpoint: ep.endpoint,
          payload: ep.buildPayload ? ep.buildPayload(erro.param, erro.correto) : { [sec]: { [erro.param.split(".").slice(1).join(".")]: erro.correto } },
          method: ep.method || "PUT"
        })
      });
      const data = await res.json();
      const ok = data.resultados?.filter(r => r.ok).length || 0;
      setApplyStatus(s => ({ ...s, [key]: ok > 0 ? "ok" : "error" }));
      setApplyResult(r => ({ ...r, [key]: { ok, total: onlineDevs.length } }));
    } catch (e) {
      setApplyStatus(s => ({ ...s, [key]: "error" }));
    }
  };

  // De-Para do equipamento selecionado vs referência
  const deParaEquip = useMemo(() => {
    if (!selDevice || !refDevice) return [];
    return Object.keys(consensus).map(param => {
      const valRef = refDevice.params?.[param];
      const valSel = selDevice.params?.[param];
      const isDiff = String(valRef) !== String(valSel);
      return { param, valRef, valSel, isDiff };
    }).filter(r => r.isDiff);
  }, [selDevice, refDevice, consensus]);

  const totalDevices = results.length;

  // Estatísticas gerais
  const stats = useMemo(() => {
    const criticos = erros.filter(e => getSev(e.param, e.total, totalDevices) === "CRÍTICO").length;
    const altos    = erros.filter(e => getSev(e.param, e.total, totalDevices) === "ALTO").length;
    const medios   = erros.filter(e => getSev(e.param, e.total, totalDevices) === "MÉDIO").length;
    const baixos   = erros.filter(e => getSev(e.param, e.total, totalDevices) === "BAIXO").length;
    const equipsAfetados = new Set(divergentes.map(d => d.nome)).size;
    return { criticos, altos, medios, baixos, equipsAfetados, totalErros: erros.length };
  }, [erros, divergentes, totalDevices]);

  return (
    <div>
      {/* ── Cabeçalho da política ── */}
      <div style={{ marginBottom: "16px", padding: "14px 16px", background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(245,158,11,0.04) 100%)", border: `1px solid rgba(239,68,68,0.2)`, borderRadius: "10px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>🛡️ Política de Correção — De-Para Completo por Intercorrência</div>
        <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.7" }}>
          Para cada parâmetro divergente encontrado na frota, esta política apresenta: o <strong style={{ color: "#22c55e" }}>valor correto (DE)</strong> obtido do equipamento de referência, 
          o <strong style={{ color: "#ef4444" }}>valor incorreto (PARA)</strong> encontrado nos equipamentos afetados, a causa raiz, o impacto operacional e o procedimento de correção passo a passo — com opção de aplicar automaticamente via API.
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Erros Únicos",      val: stats.totalErros,      cor: C.accent },
          { label: "🔴 Críticos",       val: stats.criticos,        cor: "#ef4444" },
          { label: "🟠 Altos",          val: stats.altos,           cor: "#f97316" },
          { label: "🟡 Médios",         val: stats.medios,          cor: "#f59e0b" },
          { label: "🔵 Baixos",         val: stats.baixos,          cor: "#a78bfa" },
          { label: "Equip. Afetados",  val: stats.equipsAfetados,  cor: C.warning },
          { label: "Equip. Conformes", val: conformes.length,       cor: "#22c55e" },
        ].map(k => (
          <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: k.cor }}>{k.val}</div>
            <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "2px" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Seleção de Equipamento de Referência (DE) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e", marginBottom: "8px" }}>
            ✅ DE — Equipamento de Referência (Correto)
          </div>
          <select value={refEquip} onChange={e => setRefEquip(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "5px", background: C.surface, color: C.text, fontSize: "12px" }}>
            <option value="">— selecione o equipamento de referência —</option>
            <optgroup label={`✅ CONFORMES (${conformes.length} — configuração padrão da frota)`}>
              {conformes.map(d => <option key={d.nome} value={d.nome}>{d.nome}</option>)}
            </optgroup>
          </select>
          <div style={{ fontSize: "10px", color: "#22c55e", marginTop: "6px" }}>
            Este equipamento está 100% conforme com o consenso da frota. Seus valores são usados como referência para o De-Para.
          </div>
        </div>
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", marginBottom: "8px" }}>
            ❌ PARA — Equipamento com Problema (a corrigir)
          </div>
          <select value={equipSel} onChange={e => setEquipSel(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "5px", background: C.surface, color: C.text, fontSize: "12px" }}>
            <option value="">— selecione o equipamento problemático —</option>
            <optgroup label={`⚠️ DIVERGENTES (${divergentes.length})`}>
              {divergentes.map(d => <option key={d.nome} value={d.nome}>{d.nome} ({d.diffCount} erros)</option>)}
            </optgroup>
          </select>
          <div style={{ fontSize: "10px", color: "#ef4444", marginTop: "6px" }}>
            Equipamento com {selDevice?.diffCount || 0} parâmetro(s) divergente(s) em relação ao padrão da frota.
          </div>
        </div>
      </div>

      {/* ── De-Para do Equipamento Selecionado ── */}
      {selDevice && refDevice && (
        <div style={{ marginBottom: "24px", border: `1px solid rgba(245,158,11,0.3)`, borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
              ⚖️ De-Para: <span style={{ color: "#22c55e" }}>{refEquip}</span> → <span style={{ color: "#ef4444" }}>{equipSel}</span>
            </span>
            <span style={{ marginLeft: "auto", fontSize: "11px", color: C.textMuted }}>{deParaEquip.length} divergência(s) encontrada(s)</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: C.tableHeader }}>
                  {["#", "Parâmetro", "DE (referência ✅)", "PARA (com problema ❌)", "Diferença", "Severidade", "Correção"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textSecondary, fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deParaEquip.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "#22c55e" }}>✅ Nenhuma divergência — este equipamento está conforme com a referência</td></tr>
                ) : deParaEquip.map((row, i) => {
                  const sec = row.param.split(".")[0];
                  const ep  = PARAM_TO_ENDPOINT[sec] || {};
                  const sev = getSev(row.param, 1, 1);
                  const uuid = uuidMap[equipSel] || selDevice?.uuid;
                  const tunnelUrl = uuid ? `https://${uuid}-80.tunnel.varco.cloud` : null;
                  const desc = PARAM_DESCRIPTIONS_SHORT[row.param] || { menu: ep.menu || "—", campo: ep.campo || "—" };
                  const statusKey = `individual::${equipSel}::${row.param}`;
                  return (
                    <tr key={row.param} style={{ borderTop: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "transparent" : C.codeBg }}>
                      <td style={{ padding: "7px 10px", color: C.textMuted }}>{i + 1}</td>
                      <td style={{ padding: "7px 10px" }}>
                        <code style={{ fontSize: "11px", color: C.accent }}>{row.param}</code>
                        <div style={{ fontSize: "9px", color: C.textMuted, marginTop: "2px" }}>{desc.campo || ""}</div>
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 7px", borderRadius: "3px" }}>
                          {row.valRef == null ? "null" : String(row.valRef)}
                        </span>
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "2px 7px", borderRadius: "3px" }}>
                          {row.valSel == null ? "null" : String(row.valSel)}
                        </span>
                      </td>
                      <td style={{ padding: "7px 10px", fontSize: "11px", color: C.textSecondary }}>
                        {String(row.valSel)} → <strong style={{ color: "#22c55e" }}>{String(row.valRef)}</strong>
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <span style={{ background: sevBg[sev], color: sevColor[sev], border: `1px solid ${sevColor[sev]}40`, padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>{sev}</span>
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                          {tunnelUrl && (
                            <a href={`${tunnelUrl}${ep.endpoint || ""}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "10px", color: C.accent, textDecoration: "none", border: `1px solid ${C.accent}40`, padding: "2px 7px", borderRadius: "3px" }}>
                              🔗 Túnel
                            </a>
                          )}
                          {ep.endpoint && (
                            <button
                              onClick={async () => {
                                setApplyStatus(s => ({ ...s, [statusKey]: "loading" }));
                                try {
                                  const res = await fetch(`${API_BASE}/api/varco/itscam/aplicar`, {
                                    method: "POST",
                                    headers: API_HEADERS,
                                    body: JSON.stringify({ uuid: uuid || selDevice?.uuid, endpoint: ep.endpoint, payload: ep.buildPayload ? ep.buildPayload(row.param, row.valRef) : { [sec]: { [row.param.split(".").slice(1).join(".")]: row.valRef } }, method: ep.method || "PUT" })
                                  });
                                  const data = await res.json();
                                  setApplyStatus(s => ({ ...s, [statusKey]: data.ok ? "ok" : "error" }));
                                } catch { setApplyStatus(s => ({ ...s, [statusKey]: "error" })); }
                              }}
                              style={{ fontSize: "10px", padding: "2px 8px", border: `1px solid ${applyStatus[statusKey] === "ok" ? "#22c55e" : "#f59e0b"}`, borderRadius: "3px", background: applyStatus[statusKey] === "ok" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.08)", color: applyStatus[statusKey] === "ok" ? "#22c55e" : "#f59e0b", cursor: "pointer", fontWeight: 600 }}>
                              {applyStatus[statusKey] === "loading" ? "⏳" : applyStatus[statusKey] === "ok" ? "✅ OK" : "▶ Aplicar"}
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: "9px", color: C.textMuted, marginTop: "3px" }}>{desc.menu?.split(" › ").slice(0, 2).join(" › ")}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Erros Detalhados com política de correção ── */}
      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>
        📋 Política de Correção por Intercorrência — {erros.length} tipo(s) de erro detectado(s)
      </div>
      <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "14px" }}>
        Cada card mostra: <strong>DE</strong> (valor correto do consenso) → <strong>PARA</strong> (valor errado encontrado) · lista de equipamentos afetados · passos de correção · botão de aplicação via API.
      </div>

      {erros.map((erro, idx) => {
        const sev = getSev(erro.param, erro.total, totalDevices);
        const cor = sevColor[sev];
        const bg  = sevBg[sev];
        const sec = erro.param.split(".")[0];
        const ep  = PARAM_TO_ENDPOINT[sec] || {};
        const isExp = expandedErro === idx;
        const loteKey = `lote::${erro.param}`;
        const loteOk  = applyStatus[loteKey];
        const loteRes = applyResult[loteKey];
        const PARAM_DESC = PARAM_DESCRIPTIONS_SHORT[erro.param] || {};

        // Agrupamento dos valores errados e sua frequência
        const valErrados = [...erro.errados.entries()].sort((a, b) => b[1] - a[1]);

        return (
          <div key={erro.param} style={{ marginBottom: "10px", border: `1px solid ${cor}35`, borderRadius: "10px", overflow: "hidden" }}>
            {/* Header clicável */}
            <div
              onClick={() => setExpandedErro(isExp ? null : idx)}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", cursor: "pointer", background: isExp ? bg : C.surface, borderLeft: `4px solid ${cor}` }}
            >
              {/* Número e severidade */}
              <span style={{ background: bg, color: cor, border: `1px solid ${cor}40`, padding: "3px 9px", borderRadius: "5px", fontSize: "10px", fontWeight: 700, minWidth: "32px", textAlign: "center" }}>{idx + 1}</span>
              <span style={{ background: bg, color: cor, border: `1px solid ${cor}50`, padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>{sev}</span>
              {/* Parâmetro e descrição */}
              <div style={{ flex: 1 }}>
                <code style={{ fontSize: "12px", color: C.text, fontWeight: 600 }}>{erro.param}</code>
                <span style={{ marginLeft: "10px", fontSize: "11px", color: C.textMuted }}>{PARAM_DESC.descCurta || ep.campo || ""}</span>
              </div>
              {/* Contadores De-Para */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", background: "rgba(34,197,94,0.12)", color: "#22c55e", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace", fontWeight: 700 }}>
                  DE: {String(erro.correto)}
                </span>
                <span style={{ fontSize: "11px", color: C.textMuted }}>→</span>
                <span style={{ fontSize: "11px", background: "rgba(239,68,68,0.12)", color: "#ef4444", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace", fontWeight: 700 }}>
                  PARA: {valErrados[0]?.[0] || "?"}
                  {valErrados.length > 1 && <span style={{ fontSize: "9px", marginLeft: "4px" }}>+{valErrados.length - 1}</span>}
                </span>
                <span style={{ fontSize: "11px", color: cor, fontWeight: 700 }}>{erro.total}/{totalDevices}</span>
              </div>
              {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
            </div>

            {/* Corpo expandido */}
            {isExp && (
              <div style={{ padding: "14px 16px", background: C.surface, borderTop: `1px solid ${cor}20` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>

                  {/* Coluna Esquerda — De-Para e impacto */}
                  <div>
                    {/* De-Para detalhado */}
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📊 De-Para — Valores</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div style={{ padding: "10px 12px", background: "rgba(34,197,94,0.08)", borderRadius: "7px", border: "1px solid rgba(34,197,94,0.25)" }}>
                          <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: 700, marginBottom: "4px" }}>✅ DE — Correto (consenso da frota)</div>
                          <div style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 800, color: "#22c55e" }}>{String(erro.correto)}</div>
                          <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>{conformes.length} equip. conformes</div>
                        </div>
                        <div>
                          {valErrados.map(([v, cnt]) => (
                            <div key={v} style={{ padding: "8px 10px", background: "rgba(239,68,68,0.08)", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "4px" }}>
                              <div style={{ fontSize: "10px", color: "#ef4444", fontWeight: 700, marginBottom: "3px" }}>❌ PARA — Incorreto ({cnt} equip.)</div>
                              <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 800, color: "#ef4444" }}>{v === "null" || v === "undefined" ? "∅ vazio" : v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Impacto e Causa */}
                    <div style={{ marginBottom: "10px", padding: "10px 12px", background: C.codeBg, borderRadius: "6px" }}>
                      <div style={{ fontSize: "10px", color: "#ef4444", fontWeight: 700, marginBottom: "4px", textTransform: "uppercase" }}>⚠️ Impacto Operacional</div>
                      <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.6" }}>{PARAM_DESC.impacto || "Parâmetro com valor fora do padrão — verificar impacto no ambiente."}</div>
                    </div>
                    <div style={{ padding: "10px 12px", background: C.codeBg, borderRadius: "6px" }}>
                      <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700, marginBottom: "4px", textTransform: "uppercase" }}>🔍 Causa Provável</div>
                      <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.6" }}>{PARAM_DESC.causa || "Configuração divergente entre equipamentos — aplicar valor padrão da frota."}</div>
                    </div>
                  </div>

                  {/* Coluna Direita — Passos de correção */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>🔧 Procedimento de Correção</div>
                    <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "7px", padding: "10px 12px", marginBottom: "10px" }}>
                      <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: 700, marginBottom: "7px" }}>Passo a passo na interface ITScam:</div>
                      {[
                        `1. Acesse o túnel do equipamento (link abaixo)`,
                        `2. Login: Admin / Senha: #econocr@`,
                        `3. Navegue até: ${PARAM_DESC.menu || ep.menu || "—"}`,
                        `4. Altere "${PARAM_DESC.campo || ep.campo || erro.param.split(".").slice(1).join(".")}" de "${valErrados[0]?.[0] || "?"}" para "${String(erro.correto)}"`,
                        `5. Clique em Aplicar / Salvar`,
                        `6. Confirme no VARCO Monitor (aguardar recoleta)`
                      ].map((p, pi) => (
                        <div key={pi} style={{ display: "flex", gap: "6px", marginBottom: "4px", fontSize: "11px", color: pi === 5 ? "#22c55e" : C.textSecondary }}>
                          <span style={{ flexShrink: 0 }}>{pi + 1}.</span>
                          <span>{p.replace(/^\d+\.\s/, "")}</span>
                        </div>
                      ))}
                    </div>
                    {/* API endpoint */}
                    {ep.endpoint && (
                      <div style={{ padding: "8px 10px", background: C.codeBg, borderRadius: "5px", fontSize: "10px", color: C.textMuted, marginBottom: "10px" }}>
                        <div style={{ fontWeight: 700, marginBottom: "3px" }}>🔌 API (correção automática):</div>
                        <code style={{ color: C.accent }}>{ep.method || "PUT"} {ep.endpoint}</code>
                        <div style={{ marginTop: "4px" }}>Payload: <code style={{ color: C.success }}>{"{ "}{sec}: {"{"}...{String(erro.correto)}{"}"} {"}"}</code></div>
                      </div>
                    )}
                    {/* Botão aplicar em lote */}
                    {ep.endpoint && (
                      <button
                        onClick={() => aplicarCorrecao(erro)}
                        disabled={loteOk === "loading"}
                        style={{ width: "100%", padding: "9px", border: `1px solid ${loteOk === "ok" ? "#22c55e" : cor}`, borderRadius: "6px", background: loteOk === "ok" ? "rgba(34,197,94,0.12)" : bg, color: loteOk === "ok" ? "#22c55e" : cor, cursor: loteOk === "loading" ? "wait" : "pointer", fontSize: "12px", fontWeight: 700 }}
                      >
                        {loteOk === "loading" ? "⏳ Aplicando..." : loteOk === "ok" ? `✅ Aplicado em ${loteRes?.ok}/${loteRes?.total} equip.` : loteOk === "error" ? "❌ Erro — tentar novamente" : `▶ Aplicar em TODOS os ${erro.total} equipamentos afetados`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de equipamentos afetados com De-Para individual */}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: C.textMuted, marginBottom: "8px", textTransform: "uppercase" }}>
                    📋 Equipamentos Afetados ({erro.equipamentos.length}) — De-Para Individual
                  </div>
                  <div style={{ maxHeight: "220px", overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                      <thead>
                        <tr style={{ background: C.tableHeader }}>
                          <th style={{ padding: "6px 10px", textAlign: "left", color: C.textSecondary }}>Equipamento</th>
                          <th style={{ padding: "6px 10px", textAlign: "center", color: "#ef4444" }}>PARA (valor atual)</th>
                          <th style={{ padding: "6px 8px", textAlign: "center", color: C.textMuted }}>→</th>
                          <th style={{ padding: "6px 10px", textAlign: "center", color: "#22c55e" }}>DE (valor correto)</th>
                          <th style={{ padding: "6px 10px", textAlign: "center", color: C.textSecondary }}>Status VARCO</th>
                          <th style={{ padding: "6px 10px", textAlign: "center", color: C.textSecondary }}>Acesso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {erro.equipamentos.map((eq, ei) => {
                          const live  = liveDevices.find(l => l.name === eq.nome);
                          const uuid  = eq.uuid || uuidMap[eq.nome];
                          const indKey = `individual::${eq.nome}::${erro.param}`;
                          const indOk  = applyStatus[indKey];
                          return (
                            <tr key={eq.nome} style={{ borderTop: `1px solid ${C.borderLight}`, background: ei % 2 === 0 ? "transparent" : C.codeBg }}>
                              <td style={{ padding: "6px 10px", fontWeight: 600, color: C.text }}>
                                {uuid
                                  ? <a href={`https://${uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer" style={{ color: C.accent, textDecoration: "none" }}>{eq.nome}</a>
                                  : eq.nome}
                              </td>
                              <td style={{ padding: "6px 10px", textAlign: "center", fontFamily: "monospace", fontWeight: 700, color: "#ef4444" }}>
                                {eq.atual == null ? "∅ null" : String(eq.atual)}
                              </td>
                              <td style={{ padding: "6px 8px", textAlign: "center", color: C.textMuted, fontSize: "14px" }}>→</td>
                              <td style={{ padding: "6px 10px", textAlign: "center", fontFamily: "monospace", fontWeight: 700, color: "#22c55e" }}>
                                {String(erro.correto)}
                              </td>
                              <td style={{ padding: "6px 10px", textAlign: "center" }}>
                                {live
                                  ? <span style={{ color: live.connected ? "#22c55e" : "#ef4444", fontSize: "11px" }}>{live.connected ? "🟢 Online" : "🔴 Offline"}</span>
                                  : <span style={{ color: C.textMuted, fontSize: "10px" }}>—</span>}
                              </td>
                              <td style={{ padding: "6px 10px", textAlign: "center" }}>
                                {uuid && ep.endpoint ? (
                                  <button
                                    onClick={async () => {
                                      setApplyStatus(s => ({ ...s, [indKey]: "loading" }));
                                      try {
                                        const res = await fetch(`${API_BASE}/api/varco/itscam/aplicar`, {
                                          method: "POST",
                                          headers: API_HEADERS,
                                          body: JSON.stringify({ uuid, endpoint: ep.endpoint, payload: ep.buildPayload ? ep.buildPayload(erro.param, erro.correto) : { [sec]: { [erro.param.split(".").slice(1).join(".")]: erro.correto } }, method: ep.method || "PUT" })
                                        });
                                        const data = await res.json();
                                        setApplyStatus(s => ({ ...s, [indKey]: data.ok ? "ok" : "error" }));
                                      } catch { setApplyStatus(s => ({ ...s, [indKey]: "error" })); }
                                    }}
                                    style={{ fontSize: "10px", padding: "2px 8px", border: `1px solid ${indOk === "ok" ? "#22c55e" : cor}`, borderRadius: "3px", background: "transparent", color: indOk === "ok" ? "#22c55e" : cor, cursor: "pointer", fontWeight: 600 }}>
                                    {indOk === "loading" ? "⏳" : indOk === "ok" ? "✅" : indOk === "error" ? "❌" : "▶"}
                                  </button>
                                ) : uuid ? (
                                  <a href={`https://${uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer" style={{ fontSize: "10px", color: C.accent, textDecoration: "none" }}>🔗 Túnel</a>
                                ) : <span style={{ color: C.textMuted, fontSize: "10px" }}>sem UUID</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Descrições curtas para De-Para (impacto + causa resumidos)
const PARAM_DESCRIPTIONS_SHORT = {
  "VARCO.enabled":              { descCurta: "Túnel VARCO habilitado", menu: "Sistema › Manutenção › Acesso Remoto › VARCO", campo: "Switch Habilitado", impacto: "Sem VARCO habilitado, o equipamento fica isolado — sem acesso remoto, sem heartbeat no VARCO Cloud, impossível corrigir configurações remotamente.", causa: "Reset de fábrica, atualização de firmware ou configuração inicial incompleta. Parâmetros VARCO não foram reaplicados após o reset." },
  "VARCO.edgeServer":           { descCurta: "Servidor edge VARCO", menu: "Sistema › Manutenção › Acesso Remoto › VARCO", campo: "Edge Server URL", impacto: "Sem edge server correto, o túnel reverso não consegue conectar ao VARCO Cloud — equipamento aparece offline em varco.io mesmo ligado.", causa: "URL do edge server em branco ou apontando para servidor incorreto. Padrão correto: edge.varco.io" },
  "OCR.enabled":                { descCurta: "Motor OCR habilitado", menu: "Equipamento › Reconhecimento › aba Jidosha", campo: "Switch Habilitado", impacto: "OCR desabilitado = NENHUMA placa é lida. Zero passagens no AxHub. Mapa de teste completamente vermelho.", causa: "OCR desabilitado por engano ou após reset de firmware. Configuração não reaplicada." },
  "OCR.processingMode":         { descCurta: "Modo de processamento OCR", menu: "Equipamento › Reconhecimento › aba Jidosha", campo: "Modo de processamento", impacto: "Modo incorreto: freeflow processa frames aleatórios sem trigger de laço, triggered depende do IO. Configuração errada reduz drasticamente as leituras.", causa: "Template aplicado sem considerar tipo de instalação (laço/freeflow)." },
  "OCR.vehicleType":            { descCurta: "Tipo de veículo OCR", menu: "Equipamento › Reconhecimento › aba Jidosha", campo: "Tipo de veículo", impacto: "Filtro errado descarta veículos que não sejam do tipo configurado. Ex: vehicleType=truck ignora carros.", causa: "Template genérico não ajustado para o ponto de fiscalização." },
  "Classificador.enabled":      { descCurta: "Classificador IA habilitado", menu: "Equipamento › Reconhecimento › aba Classifier", campo: "Switch Habilitado", impacto: "Sem classificador, todas as infrações ficam sem tipo veicular — prejudica triagem e estatísticas.", causa: "Feature não ativada após deploy ou reset." },
  "Classificador.minProbability":{ descCurta: "Confiança mínima do classificador", menu: "Equipamento › Reconhecimento › aba Classifier", campo: "Confiabilidade mínima (%)", impacto: "Com 100%: NUNCA classifica (nenhum veículo atinge 100% de confiança). Com valor muito baixo: classificações erradas. Padrão: 20-60%.", causa: "Slider de confiabilidade configurado em valor extremo. 100% é o principal causador de campo CLASSIFICACAO vazio no AxCross." },
  "Classificador.sceneType":    { descCurta: "Tipo de cena do classificador", menu: "Equipamento › Reconhecimento › aba Classifier", campo: "Cenário (0=Genérico, 1=Open Road, 2=Close-up)", impacto: "Cena errada reduz precisão do modelo de IA para o contexto. Ex: Open Road para instalação close-up.", causa: "Template aplicado sem considerar tipo de instalação." },
  "FTP.enable":                 { descCurta: "Envio FTP habilitado", menu: "Equipamento › Servidores › FTP", campo: "Switch Habilitar FTP", impacto: "FTP desabilitado = imagens NÃO chegam ao servidor. Infrações sem evidência fotográfica. PERDA TOTAL de imagens.", causa: "FTP desabilitado após teste ou manutenção. Não foi reativado." },
  "Diurno.lower.level":         { descCurta: "Threshold luminosidade diurna (inferior)", menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Inferior", campo: "Nível (threshold)", impacto: "Valor alto (ex: 35): qualquer nuvem ou sombra faz a câmera ativar modo Noturno (P&B) durante o dia. Imagens escuras em plena luz solar.", causa: "Ajuste local por técnico sem atualizar template padrão. Padrão correto: 10." },
  "Diurno.lower.startTime":     { descCurta: "Início da janela de transição diurna", menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Inferior", campo: "Início (startTime)", impacto: "Janela restrita impede transição fora do horário configurado — câmera fica presa em modo diurno ou noturno.", causa: "Configuração copiada de outro equipamento com horário customizado. Padrão: 00:00:00 (24h)." },
  "Diurno.upper.level":         { descCurta: "Threshold luminosidade diurna (superior)", menu: "Imagem › Perfis › Perfil 1 (Diurno) › Transições › Superior", campo: "Nível (threshold)", impacto: "Threshold incorreto causa retorno para modo diurno em momento errado.", causa: "Ajuste manual divergente. Padrão: 35." },
  "NTP.server":                 { descCurta: "Servidor NTP", menu: "Equipamento › Data e Hora › NTP", campo: "Servidor NTP", impacto: "Horário errado = timestamps de infração inválidos legalmente. DataHoraPassagem incorreta no AxHub.", causa: "NTP server não configurado ou URL errada. Padrão: a.ntp.br" },
  "Timezone":                   { descCurta: "Fuso horário", menu: "Equipamento › Data e Hora", campo: "Fuso Horário", impacto: "Fuso incorreto invalida toda a autuação — timestamp das infrações fora do horário real.", causa: "Timezone não ajustado durante deploy. Verificar estado do equipamento." },
  "SNMP.enabled":               { descCurta: "Agente SNMP habilitado", menu: "Sistema › Monitoramento › SNMP", campo: "Switch Habilitar SNMP", impacto: "SNMP ativo com template não resolvido ({$SNMP_COMMUNITY}) — ineficaz e expõe protocolo de rede desnecessariamente.", causa: "Provisionamento automatizado deixou SNMP habilitado com variável não resolvida." },
  "Reboot.scheduled.enabled":   { descCurta: "Reboot agendado", menu: "Sistema › Manutenção › Reboot Automático › Agendado", campo: "Switch Habilitar reboot agendado", impacto: "Reboot agendado fora do padrão pode causar indisponibilidade inesperada.", causa: "Configurado individualmente fora do padrão da frota." },
  "Video.framerate":            { descCurta: "Taxa de frames (FPS)", menu: "Vídeo › Streams › Stream 1", campo: "Taxa de frames", impacto: "FPS muito baixo reduz chance de captura do veículo. FPS alto consome mais recursos.", causa: "Ajuste de performance individual não padronizado." },
  "Video.quality":              { descCurta: "Qualidade JPEG do vídeo", menu: "Vídeo › Streams › Stream 1", campo: "Qualidade (1-100)", impacto: "Qualidade baixa = imagens borradas, OCR perde eficiência. Qualidade muito alta = arquivo grande.", causa: "Redução de banda aplicada manualmente sem padronização." },
  "Firmware.version":           { descCurta: "Versão do firmware", menu: "Sistema › Manutenção › Atualização de Firmware", campo: "Upload .fw", impacto: "Firmwares diferentes = comportamentos diferentes em todas as features. Causa raiz de divergências silenciosas.", causa: "Atualização não aplicada uniformemente na frota após release." },
  "SnapshotCrop.enable":        { descCurta: "Recorte de snapshot habilitado", menu: "Equipamento › Imagens › Snapshot Crop", campo: "Switch Habilitar", impacto: "Sem crop: imagem completa enviada (mais pesada, mais banda consumida).", causa: "Feature não ativada em alguns equipamentos do lote." },
  "IO.port1.earlyUs":           { descCurta: "Antecipação porta IO 1 (µs)", menu: "Equipamento › Entradas e Saídas › Porta 1", campo: "Antecipação (µs)", impacto: "Trigger antecipado/atrasado = veículo fora da posição ideal na captura.", causa: "Calibração de laço individual não replicada na frota." },
};

// ═══════════════════════════════════════════════════════════
// CORREÇÕES TAB — Plano de Correção com análise e execução
// ═══════════════════════════════════════════════════════════
function CorrecoesTab({ liveDevices = [] }) {
  const uuidMap = useMemo(() => {
    const m = {};
    liveDevices.forEach(d => { if (d.name && d.uuid) m[d.name] = d.uuid; });
    return m;
  }, [liveDevices]);
  const [plano, setPlano] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [aplicando, setAplicando] = useState(null);
  const [msg, setMsg] = useState(null);
  const [expandedCaso, setExpandedCaso] = useState(null);

  const carregarPlano = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/varco/plano-correcao`);
      if (res.ok) setPlano(await res.json());
      else setPlano(null);
    } catch { setPlano(null); }
    finally { setLoading(false); }
  };

  const gerarNovoPlano = async () => {
    setGerando(true); setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/varco/plano-correcao/gerar`, { 
        method: "POST",
        headers: {
          "X-Admin-Token": API_TOKEN, "x-api-token": API_TOKEN
        }
      });
      const data = await res.json();
      if (res.ok && data.ok) { setPlano(data.plano); setMsg({ tipo: "ok", texto: "Plano gerado com sucesso!" }); }
      else setMsg({ tipo: "erro", texto: data.erro || "Falha ao gerar plano" });
    } catch (e) { setMsg({ tipo: "erro", texto: e.message }); }
    finally { setGerando(false); }
  };

  const aplicarCaso = async (casoId) => {
    setAplicando(casoId); setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/varco/plano-correcao/aplicar`, {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Token": API_TOKEN, "x-api-token": API_TOKEN
        },
        body: JSON.stringify({ caso: casoId }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMsg({ tipo: "ok", texto: `Caso ${casoId} aplicado! ${data.resultado?.casos?.[0]?.afetados?.filter(a => a.corrigido)?.length || 0} corrigidos.` });
        setPlano(data.resultado);
      } else setMsg({ tipo: "erro", texto: data.erro || "Falha" });
    } catch (e) { setMsg({ tipo: "erro", texto: e.message }); }
    finally { setAplicando(null); }
  };

  useEffect(() => { carregarPlano(); }, []);

  const sevColors = {
    critico: { bg: "rgba(255,0,60,0.08)", border: "rgba(255,0,60,0.25)", text: "#ff4d6a", label: "CRÍTICO" },
    alto: { bg: C.dangerBg, border: C.dangerBorder, text: C.danger, label: "ALTO" },
    medio: { bg: C.warningBg, border: C.warningBorder, text: C.warning, label: "MÉDIO" },
    baixo: { bg: "rgba(255,255,255,0.04)", border: C.border, text: C.textMuted, label: "BAIXO" },
  };

  return (
    <div>
      {/* Header actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <button onClick={gerarNovoPlano} disabled={gerando}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: `1px solid ${C.accentBorder}`, borderRadius: "6px", background: gerando ? C.surface : C.accentBg, color: C.accent, cursor: gerando ? "wait" : "pointer", fontSize: "12px", fontWeight: 600 }}>
          <RefreshCw size={14} className={gerando ? "spin" : ""} />
          {gerando ? "Analisando frota (~3min)..." : "Gerar Novo Plano de Correção"}
        </button>
        {msg && (
          <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "4px", background: msg.tipo === "ok" ? C.successBg : C.dangerBg, color: msg.tipo === "ok" ? C.success : C.danger, border: `1px solid ${msg.tipo === "ok" ? C.successBorder : C.dangerBorder}` }}>
            {msg.tipo === "ok" ? "✅" : "❌"} {msg.texto}
          </span>
        )}
      </div>

      {loading && <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>Carregando plano...</div>}

      {!loading && !plano && (
        <div style={{ padding: "40px", textAlign: "center", background: C.surface, borderRadius: "8px", border: `1px solid ${C.border}` }}>
          <p style={{ color: C.textMuted, fontSize: "13px", margin: "0 0 12px" }}>Nenhum plano de correção encontrado.</p>
          <p style={{ color: C.textSecondary, fontSize: "12px", margin: 0 }}>Clique em <strong style={{ color: C.accent }}>"Gerar Novo Plano"</strong> para analisar todos os Equipamentos e identificar correções necessárias.</p>
        </div>
      )}

      {!loading && plano && (
        <div>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: C.text }}>{plano.resumo?.casosComAfetados || 0}</div>
              <div style={{ fontSize: "10px", color: C.textMuted }}>Tipos de Erro</div>
            </div>
            <div style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: C.danger }}>{plano.resumo?.criticos || 0}</div>
              <div style={{ fontSize: "10px", color: C.danger }}>Críticos</div>
            </div>
            <div style={{ background: C.warningBg, border: `1px solid ${C.warningBorder}`, borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: C.warning }}>{plano.resumo?.equipamentosUnicos || 0}</div>
              <div style={{ fontSize: "10px", color: C.warning }}>Equipamentos Afetados</div>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: C.textSecondary }}>{plano.resumo?.totalErrosEncontrados || 0}</div>
              <div style={{ fontSize: "10px", color: C.textMuted }}>Total de Ocorrências</div>
            </div>
          </div>

          <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "12px" }}>
            Plano gerado em: {plano.geradoEm ? new Date(plano.geradoEm).toLocaleString("pt-BR") : "—"} | Modo: {plano.modo}
          </div>

          {/* Cases list */}
          {plano.casos?.map((caso) => {
            const sev = sevColors[caso.severidade] || sevColors.baixo;
            const isExp = expandedCaso === caso.id;
            const hasAfetados = caso.totalAfetados > 0;

            return (
              <div key={caso.id} style={{ marginBottom: "8px", border: `1px solid ${hasAfetados ? sev.border : C.borderLight}`, borderRadius: "8px", overflow: "hidden", opacity: hasAfetados ? 1 : 0.6 }}>
                {/* Case header */}
                <div
                  onClick={() => setExpandedCaso(isExp ? null : caso.id)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", cursor: "pointer", background: isExp ? "rgba(255,255,255,0.02)" : "transparent" }}
                >
                  <span style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.text, padding: "2px 8px", borderRadius: "4px", fontSize: "9px", fontWeight: 700, minWidth: "60px", textAlign: "center" }}>{sev.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: C.text, flex: 1 }}>{caso.titulo}</span>
                  <span style={{ fontSize: "12px", color: hasAfetados ? sev.text : C.textMuted, fontWeight: 600 }}>
                    {hasAfetados ? `${caso.totalAfetados} equip` : "✅ OK"}
                  </span>
                  {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
                </div>

                {/* Expanded details */}
                {isExp && (
                  <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: "14px", background: C.surface }}>
                    {/* Seção 1: O QUE É e POR QUE CORRIGIR */}
                    <div style={{ marginBottom: "14px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: `1px solid ${C.borderLight}` }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>💡 Entenda o problema</div>
                      <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.6", marginBottom: "10px" }}>{caso.descricao}</div>
                      <div style={{ fontSize: "12px", color: "#ff7eb3", lineHeight: "1.6", padding: "8px 10px", background: "rgba(255,0,60,0.04)", borderRadius: "4px", borderLeft: "3px solid #ff4d6a" }}>
                        <strong>Impacto:</strong> {caso.problema}
                      </div>
                    </div>

                    {/* Seção 2: ONDE CORRIGIR (passo a passo) */}
                    <div style={{ marginBottom: "14px", padding: "12px", background: C.accentBg, borderRadius: "6px", border: `1px solid ${C.accentBorder}` }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: C.accent, marginBottom: "6px" }}>🔧 Como corrigir</div>
                      <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.6" }}>{caso.correcao}</div>
                      <div style={{ marginTop: "8px", fontSize: "10px", color: C.textMuted }}>
                        <strong>Caminho na interface:</strong> <code style={{ color: C.accent, background: C.codeBg, padding: "2px 6px", borderRadius: "3px" }}>{caso.menu}</code>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                      {/* Left: Affected devices */}
                      <div>
                        <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                          ❌ Equipamentos com ERRO ({caso.totalAfetados})
                        </div>
                        {caso.totalAfetados === 0 ? (
                          <div style={{ padding: "20px", textAlign: "center", background: C.successBg, borderRadius: "6px", border: `1px solid ${C.successBorder}` }}>
                            <div style={{ fontSize: "12px", color: C.success }}>✅ Nenhum Equipamento afetado</div>
                            <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>Toda a frota está com o valor correto</div>
                          </div>
                        ) : (
                          <div style={{ maxHeight: "200px", overflowY: "auto", border: `1px solid ${C.borderLight}`, borderRadius: "6px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                              <thead>
                                <tr style={{ background: C.tableHeader }}>
                                  <th style={{ padding: "6px 8px", textAlign: "left", color: C.textSecondary }}>Equipamento</th>
                                  <th style={{ padding: "6px 8px", textAlign: "center", color: C.textSecondary }}>Valor Atual</th>
                                  <th style={{ padding: "6px 8px", textAlign: "center", color: C.textSecondary }}>Deveria Ser</th>
                                  <th style={{ padding: "6px 8px", textAlign: "center", color: C.textSecondary }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {caso.afetados.map((a, i) => (
                                  <tr key={i} style={{ borderTop: i > 0 ? `1px solid ${C.borderLight}` : "none" }}>
                                    <td style={{ padding: "5px 8px", color: C.text, fontWeight: 500 }}><TunnelLink nome={a.nome} uuid={a.uuid} /></td>
                                    <td style={{ padding: "5px 8px", textAlign: "center", fontFamily: "monospace", color: "#ff7eb3", fontWeight: 600 }}>{String(a.atual).slice(0, 30)}</td>
                                    <td style={{ padding: "5px 8px", textAlign: "center", fontFamily: "monospace", color: "#7dffb3", fontWeight: 600 }}>{String(a.correto)}</td>
                                    <td style={{ padding: "5px 8px", textAlign: "center" }}>
                                      {a.corrigido === true && <span style={{ color: C.success, fontSize: "10px" }}>✅ corrigido</span>}
                                      {a.corrigido === false && <span style={{ color: C.danger, fontSize: "10px" }}>❌ falhou</span>}
                                      {a.corrigido === undefined && <span style={{ color: C.warning, fontSize: "10px" }}>⏳ pendente</span>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Right: Reference examples (equipamentos corretos) */}
                      <div>
                        <div style={{ fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                          ✅ Exemplos de equipamentos CORRETOS (referência)
                        </div>
                        {caso.conformes?.length > 0 ? (
                          <div style={{ padding: "10px", background: C.successBg, borderRadius: "6px", border: `1px solid ${C.successBorder}` }}>
                            {caso.conformes.map((c, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderTop: i > 0 ? `1px solid rgba(125,255,179,0.15)` : "none" }}>
                                <span style={{ color: C.success, fontSize: "12px" }}>✅</span>
                                <TunnelLink nome={c.nome} uuid={c.uuid || uuidMap[c.nome]} style={{ fontSize: "12px", color: C.text, fontWeight: 500 }} />
                                <span style={{ fontSize: "10px", color: C.textMuted }}>({c.faixa})</span>
                              </div>
                            ))}
                            <div style={{ marginTop: "8px", fontSize: "10px", color: C.textMuted, fontStyle: "italic" }}>
                              Estes equipamentos já possuem o valor correto. Use como referência para comparação.
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: "12px", textAlign: "center", background: C.warningBg, borderRadius: "6px", border: `1px solid ${C.warningBorder}` }}>
                            <div style={{ fontSize: "11px", color: C.warning }}>⚠️ Nenhum Equipamento conforme encontrado</div>
                            <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>Todos os Equipamentos acessíveis têm este erro</div>
                          </div>
                        )}

                        {/* API info compact */}
                        <div style={{ marginTop: "10px", padding: "8px", background: C.codeBg, borderRadius: "4px", fontSize: "10px", color: C.textMuted }}>
                          <div><strong>API Endpoint:</strong> <code style={{ color: C.accent }}>{caso.endpoint}</code></div>
                          <div><strong>Parâmetro:</strong> <code style={{ color: C.text }}>{caso.parametro}</code></div>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    {caso.totalAfetados > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: `1px solid ${C.borderLight}` }}>
                        <button
                          onClick={() => aplicarCaso(caso.id)}
                          disabled={aplicando === caso.id}
                          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: `1px solid ${C.successBorder}`, borderRadius: "6px", background: C.successBg, color: C.success, cursor: aplicando === caso.id ? "wait" : "pointer", fontSize: "12px", fontWeight: 600 }}
                        >
                          <Play size={12} />
                          {aplicando === caso.id ? "Aplicando..." : `Aplicar Caso ${caso.id} — Corrigir ${caso.totalAfetados} equip(s)`}
                        </button>
                        <span style={{ fontSize: "10px", color: C.textMuted }}>
                          Executa correção remota via API em todos os equipamentos listados
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPER — Nome descritivo do grupo baseado nas divergências
// ═══════════════════════════════════════════════════════════
const SECTION_LABELS = {
  VARCO:        { nome: "Acesso Remoto VARCO",            operacao: "Configuração do túnel VARCO Cloud — habilitar/desabilitar acesso remoto" },
  Diurno:       { nome: "Perfil de Imagem Diurno",         operacao: "Ajuste de transições diurno/noturno — thresholds de luminosidade e janelas de horário" },
  Noturno:      { nome: "Perfil de Imagem Noturno",         operacao: "Ajuste de transições noturno/diurno — thresholds de IR/Flash e janelas de horário" },
  OCR:          { nome: "Reconhecimento de Placas (OCR)",   operacao: "Configuração do motor OCR — modo, threads, thresholds de confiança e tipo de veículo" },
  Classificador:{ nome: "Classificador Veicular",           operacao: "IA de classificação — habilitar e ajustar cena, confiabilidade e threads" },
  SnapshotCrop: { nome: "Recorte de Imagem (Snapshot)",     operacao: "Configuração de crop automático — modo de recorte da imagem da placa" },
  FTP:          { nome: "Envio de Imagens via FTP",          operacao: "Habilitar/desabilitar upload de imagens para o servidor central" },
  IO:           { nome: "Portas IO (Trigger de Laço)",       operacao: "Calibração do trigger físico — antecipação em microssegundos e reserva de porta" },
  SNMP:         { nome: "Monitoramento SNMP",                operacao: "Agente SNMP — habilitar/desabilitar protocolo de monitoramento de rede" },
  Reboot:       { nome: "Reboot Automático",                 operacao: "Agendamento de reinicialização automática — periódico ou agendado" },
  NTP:          { nome: "Sincronização de Data/Hora (NTP)",  operacao: "Servidor NTP — garantir timestamp correto para validade jurídica das infrações" },
  Timezone:     { nome: "Fuso Horário (Timezone)",           operacao: "Ajuste de fuso horário — offset UTC correto para o estado do equipamento" },
  Video:        { nome: "Configuração de Vídeo",             operacao: "Stream de vídeo — framerate, qualidade JPEG e uso de frames do trigger" },
  Firmware:     { nome: "Versão de Firmware",                operacao: "Atualização de firmware — homogeneizar versão na frota para comportamento uniforme" },
};

function getGroupName(diffs) {
  const keys = Object.keys(diffs);
  const sections = [...new Set(keys.map(k => k.split(".")[0]))];
  const labels = sections.map(s => SECTION_LABELS[s]?.nome || s);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels.join(" + ");
  return `${labels.slice(0, 2).join(" + ")} +${labels.length - 2} outros`;
}

function getGroupOperacao(diffs) {
  const keys = Object.keys(diffs);
  const sections = [...new Set(keys.map(k => k.split(".")[0]))];
  const ops = sections.map(s => SECTION_LABELS[s]?.operacao).filter(Boolean);
  return ops.length === 1 ? ops[0] : ops[0] || "Múltiplos parâmetros divergentes";
}

function getGroupColor(diffs) {
  const keys = Object.keys(diffs);
  if (keys.some(k => k.startsWith("VARCO") || k.startsWith("OCR") || k === "FTP.enable")) return "#ef4444";
  if (keys.some(k => k.startsWith("Firmware") || k.startsWith("NTP") || k.startsWith("Timezone"))) return "#f97316";
  if (keys.some(k => k.startsWith("Diurno") || k.startsWith("Noturno"))) return "#f59e0b";
  return "#a78bfa";
}

function GruposTab({ groups, expandedGroup, setExpandedGroup }) {
  const [copied, setCopied] = useState(null);
  const copy = (cmd, id) => { navigator.clipboard.writeText(cmd); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  
  return (
    <div>
      <p style={{ fontSize: "12px", color: C.textMuted, marginBottom: "4px" }}>
        Equipamentos com <strong style={{ color: C.text }}>idêntico conjunto de divergências</strong> são agrupados automaticamente.
        Cada grupo possui um <strong style={{ color: C.accent }}>nome descritivo</strong> baseado no que está sendo configurado e a <strong style={{ color: C.accent }}>operação em execução</strong>.
      </p>
      <p style={{ fontSize: "11px", color: C.textMuted, marginBottom: "14px" }}>
        Clicar em um grupo expande os detalhes dos parâmetros divergentes e o comando de correção específico.
      </p>
      
      {/* Botão de correção em lote */}
      <div style={{ marginBottom: "14px", background: C.accentBg, border: `1px solid rgba(74,158,255,0.25)`, borderRadius: "8px", padding: "12px" }}>
        <div style={{ fontSize: "12px", color: C.accent, marginBottom: "6px" }}>
          <strong>🚀 Correção em Lote — Todos os Grupos:</strong> Aplica correções dos Casos 04–08 em toda a frota simultaneamente
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <code style={{ flex: 1, background: "#0d1117", color: "#c9d1d9", padding: "7px 10px", borderRadius: "5px", fontSize: "11px", border: `1px solid ${C.borderLight}` }}>
            node auditoria-itscam/corrigir-grupo.mjs --sim
          </code>
          <button onClick={() => copy('node auditoria-itscam/corrigir-grupo.mjs --sim', 'batch-all')} 
            style={{ padding: "5px", border: `1px solid ${C.border}`, borderRadius: "4px", background: copied === 'batch-all' ? C.successBg : C.raised, cursor: "pointer" }}>
            <Copy size={12} color={copied === 'batch-all' ? C.success : C.textMuted} />
          </button>
        </div>
      </div>
      
      {groups.map((group, i) => {
        const isExp = expandedGroup === i;
        const diffs = Object.entries(group.diffs);
        const groupName = getGroupName(group.diffs);
        const groupOperacao = getGroupOperacao(group.diffs);
        const groupColor = getGroupColor(group.diffs);
        const cmdGrupo = `node auditoria-itscam/corrigir.mjs --todos --sim`;
        
        return (
          <div key={i} style={{ marginBottom: "10px", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: isExp ? `${groupColor}10` : C.surface, borderLeft: `3px solid ${groupColor}` }}>
              <div onClick={() => setExpandedGroup(isExp ? null : i)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flex: 1 }}>
                {/* Badge com número */}
                <span style={{ background: `${groupColor}20`, color: groupColor, padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: 700, border: `1px solid ${groupColor}40`, minWidth: "36px", textAlign: "center" }}>G{i + 1}</span>
                {/* Nome e operação */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{groupName}</div>
                  <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>
                    <span style={{ color: groupColor, fontWeight: 500 }}>Operação:</span> {groupOperacao}
                  </div>
                </div>
                {/* Contadores */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>{group.devices.length} equip</div>
                  <div style={{ fontSize: "10px", color: C.textMuted }}>{diffs.length} param. divergentes</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button onClick={(e) => { e.stopPropagation(); copy(cmdGrupo, `grupo-${i}`); }}
                  title="Copiar comando de correção deste grupo"
                  style={{ padding: "4px 8px", border: `1px solid ${C.border}`, borderRadius: "4px", background: copied === `grupo-${i}` ? C.successBg : C.raised, cursor: "pointer", fontSize: "10px", color: C.textSecondary }}>
                  {copied === `grupo-${i}` ? '✓' : <Terminal size={11} />}
                </button>
                <button onClick={() => setExpandedGroup(isExp ? null : i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0", display: "flex" }}>
                  {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
                </button>
              </div>
            </div>
            {isExp && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px", background: C.surface }}>
                <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {group.devices.map(d => <TunnelLink key={d.nome} nome={d.nome} uuid={d.uuid} style={{ background: C.codeBg, color: C.textSecondary, padding: "2px 7px", borderRadius: "3px", fontSize: "11px", display: "inline-block" }} />)}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead><tr style={{ background: C.tableHeader }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: C.textSecondary }}>Parâmetro</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: C.textSecondary }}>Atual ❌</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: C.textSecondary }}>Correto ✅</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: C.textSecondary }}>Endpoint</th>
                  </tr></thead>
                  <tbody>
                    {diffs.map(([key, { atual, correto }]) => {
                      const ep = PARAM_TO_ENDPOINT[key.split(".")[0]] || {};
                      return (
                        <tr key={key} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                          <td style={{ padding: "5px 8px" }}><code>{key}</code></td>
                          <td style={{ padding: "5px 8px" }} className="wrong">{atual == null ? "null" : String(atual)}</td>
                          <td style={{ padding: "5px 8px" }} className="correct">{String(correto)}</td>
                          <td style={{ padding: "5px 8px" }}><code style={{ fontSize: "10px" }}>{ep.endpoint || "manual"}</code></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SISTEMA BLOCO — Componente de cards agrupados por sistema
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════════
// RELATÓRIO DE ANÁLISE — Visão executiva completa dos dados VARCO × AxHub
// ═══════════════════════════════════════════════════════════════════════════════════
function RelatorioAnaliseTab({ analysis, liveDevices = [], auditDevices = [] }) {
  const geradoEm = useMemo(() => new Date().toLocaleString("pt-BR"), []);

  const online  = liveDevices.filter(d => d.connected).length;
  const offline = liveDevices.filter(d => !d.connected).length;
  const comRaw  = auditDevices.filter(d => d.raw).length;
  const semDados = auditDevices.filter(d => !d.raw);

  const conformes  = analysis?.conformes?.length || 0;
  const divergentes = analysis?.divergentes?.length || 0;
  const grupos     = analysis?.groups?.length || 0;

  // Top parâmetros com mais divergência
  const topParams = useMemo(() => {
    if (!analysis?.divergentes) return [];
    const map = {};
    analysis.divergentes.forEach(d => {
      Object.keys(d.diffs || {}).forEach(k => { map[k] = (map[k] || 0) + 1; });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [analysis]);

  // Encontrar 59 e 58 na análise
  const dev59 = analysis?.results?.find(r => r.nome?.match(/6O?059/));
  const dev58 = analysis?.results?.find(r => r.nome?.match(/6O?058/));
  const live59 = liveDevices.find(d => d.name?.match(/6O?059/));
  const live58 = liveDevices.find(d => d.name?.match(/6O?058/));
  const diff59vs58 = useMemo(() => {
    if (!dev59 || !dev58 || !analysis?.consensus) return { igual: 0, diff: 0, params: [] };
    const params = Object.keys(analysis.consensus);
    const diffs = params.filter(k => String(dev59.params?.[k]) !== String(dev58.params?.[k]));
    return { igual: params.length - diffs.length, diff: diffs.length, params: diffs };
  }, [dev59, dev58, analysis]);

  const KPI = ({ label, value, sub, cor, big }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px 16px", textAlign: "center" }}>
      <div style={{ fontSize: big ? "32px" : "26px", fontWeight: 900, color: cor || C.accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "11px", fontWeight: 700, color: C.text, marginTop: "4px" }}>{label}</div>
      {sub && <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "2px" }}>{sub}</div>}
    </div>
  );

  const Section = ({ titulo, children }) => (
    <div style={{ marginBottom: "20px", border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", background: C.raised, borderBottom: `1px solid ${C.border}`, fontSize: "12px", fontWeight: 700, color: C.text }}>{titulo}</div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </div>
  );

  const Badge = ({ label, cor }) => (
    <span style={{ background: `${cor}18`, color: cor, border: `1px solid ${cor}40`, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>{label}</span>
  );

  return (
    <div>
      {/* Cabeçalho do relatório */}
      <div style={{ marginBottom: "16px", padding: "14px 18px", background: "linear-gradient(135deg, rgba(96,205,255,0.08) 0%, rgba(34,197,94,0.06) 100%)", border: `1px solid rgba(96,205,255,0.25)`, borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: C.text }}>📊 Relatório de Análise — VARCO × AxHub</div>
          <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "3px" }}>Frota ITScam 450 — ECONOMIA (SETRANS-GO) · Gerado em {geradoEm}</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <a href="https://economia.axhub.axion.ws/relatorio/relatoriomapadeteste" target="_blank" rel="noreferrer"
            style={{ padding: "7px 14px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6px", color: "#3b82f6", textDecoration: "none", fontSize: "11px", fontWeight: 600 }}>
            🗺️ Mapa de Teste AxHub
          </a>
          <a href="https://varco.io" target="_blank" rel="noreferrer"
            style={{ padding: "7px 14px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "6px", color: "#8b5cf6", textDecoration: "none", fontSize: "11px", fontWeight: 600 }}>
            🌐 VARCO Cloud
          </a>
        </div>
      </div>

      {/* ─── KPIs GERAIS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        <KPI label="Total VARCO" value={liveDevices.length} sub="dispositivos na frota" cor={C.accent} big />
        <KPI label="Online VARCO" value={online} sub={`${Math.round(online/(liveDevices.length||1)*100)}% disponíveis`} cor="#22c55e" />
        <KPI label="Offline VARCO" value={offline} sub="sem sinal no túnel" cor={offline > 0 ? "#ef4444" : C.textMuted} />
        <KPI label="Com Config" value={comRaw} sub={`de ${auditDevices.length} no inventário`} cor="#22c55e" />
        <KPI label="Sem Acesso" value={semDados.length} sub="offline / inacessíveis" cor={semDados.length > 0 ? "#f59e0b" : C.textMuted} />
        <KPI label="Conformes" value={conformes} sub="config igual ao consenso" cor="#22c55e" />
        <KPI label="Divergentes" value={divergentes} sub={`em ${grupos} grupos`} cor={divergentes > 0 ? "#f59e0b" : C.textMuted} />
      </div>

      {/* ─── STATUS CONEXÃO HB-01 vs HB-03 (diagnóstico crítico) ─── */}
      <Section titulo="🚨 Diagnóstico Principal — VARCO Cloud vs AxHub SQL (TBPassagens)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ padding: "12px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e", marginBottom: "8px" }}>✅ VARCO Cloud (Canal de Gestão)</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#22c55e" }}>{online}</div>
            <div style={{ fontSize: "11px", color: C.textSecondary, marginTop: "4px" }}>equipamentos com túnel ativo (heartbeat VARCO)</div>
            <div style={{ marginTop: "8px", fontSize: "10px", color: C.textMuted, lineHeight: 1.6 }}>
              Os equipamentos estão conectados ao VARCO Cloud para gestão remota. O heartbeat VARCO confirma que a câmera está ligada e com rede.
            </div>
          </div>
          <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.08)", border: "2px solid rgba(239,68,68,0.4)", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", marginBottom: "8px" }}>❌ AxHub SQL (Canal de Passagens) — REST API Client</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#ef4444" }}>0</div>
            <div style={{ fontSize: "11px", color: C.textSecondary, marginTop: "4px" }}>equipamentos enviando passagens ao AxHub (TBPassagens)</div>
            <div style={{ marginTop: "8px", fontSize: "10px", color: C.textMuted, lineHeight: 1.6 }}>
              O REST API Client (Equipamento › Servidores) NÃO está configurado em nenhum equipamento. Este é o único canal que alimenta TBPassagens e o Mapa de Teste.
            </div>
          </div>
        </div>
        <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "7px", fontSize: "11px", color: C.textSecondary, lineHeight: "1.8" }}>
          <strong style={{ color: "#f59e0b" }}>⚠️ Conclusão:</strong> Os 71 equipamentos online no VARCO NÃO estão enviando passagens ao AxHub.
          O <strong>Mapa de Teste de Equipamentos</strong> (<code style={{ color: C.accent }}>Relatório › Mapa de Teste</code>) aparece completamente vermelho porque
          a tabela <code style={{ color: C.accent }}>TBPassagens</code> não está recebendo dados. O REST API Client define a URL do AxHub e o payload de passagens —
          ele precisa ser configurado individualmente em cada câmera via interface ITScam (túnel VARCO).
        </div>
      </Section>

      {/* ─── DE-PARA 59 vs 58 ─── */}
      <Section titulo="⚖️ De-Para: GOEC6O059 (Mapa Vermelho) vs GOEC6O058 (Mapa Verde)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "start", marginBottom: "14px" }}>
          <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "7px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", marginBottom: "4px" }}>GOEC6O059 — Mapa Vermelho</div>
            <div style={{ fontSize: "10px", color: C.textMuted }}>Rotas: BR359, GO516</div>
            <div style={{ fontSize: "10px", color: live59?.connected ? "#22c55e" : "#ef4444", marginTop: "3px" }}>{live59?.connected ? "🟢 Online VARCO" : "🔴 Offline VARCO"}</div>
            {dev59?.uuid && <div style={{ marginTop: "5px" }}><a href={`https://${dev59.uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer" style={{ fontSize: "10px", color: C.accent, textDecoration: "none", border: `1px solid ${C.accent}40`, padding: "2px 7px", borderRadius: "3px" }}>🔗 Abrir Túnel</a></div>}
          </div>
          <div style={{ textAlign: "center", paddingTop: "20px" }}>
            <div style={{ fontSize: "20px" }}>⚖️</div>
            <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>
              <div style={{ color: "#22c55e", fontWeight: 700 }}>{diff59vs58.igual} iguais</div>
              <div style={{ color: diff59vs58.diff > 0 ? "#ef4444" : "#22c55e", fontWeight: 700 }}>{diff59vs58.diff} diferentes</div>
            </div>
          </div>
          <div style={{ padding: "10px 12px", background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "7px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#22c55e", marginBottom: "4px" }}>GOEC6O058 — Mapa Verde</div>
            <div style={{ fontSize: "10px", color: C.textMuted }}>Rotas: ÁS, GO64</div>
            <div style={{ fontSize: "10px", color: live58?.connected ? "#22c55e" : "#ef4444", marginTop: "3px" }}>{live58?.connected ? "🟢 Online VARCO" : "🔴 Offline VARCO"}</div>
            {dev58?.uuid && <div style={{ marginTop: "5px" }}><a href={`https://${dev58.uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer" style={{ fontSize: "10px", color: C.accent, textDecoration: "none", border: `1px solid ${C.accent}40`, padding: "2px 7px", borderRadius: "3px" }}>🔗 Abrir Túnel</a></div>}
          </div>
        </div>
        <div style={{ padding: "10px 14px", background: diff59vs58.diff === 0 ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${diff59vs58.diff === 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "7px", fontSize: "11px", color: C.textSecondary, lineHeight: "1.8" }}>
          {diff59vs58.diff === 0 ? (
            <>
              <strong style={{ color: "#22c55e" }}>✅ Resultado: CONFIGURAÇÕES IDÊNTICAS em todos os {diff59vs58.igual} parâmetros auditados.</strong><br/>
              A diferença no Mapa de Teste <strong>NÃO está no firmware</strong> (OCR, Classifier, Perfis, NTP, Firmware são iguais).
              A causa está no <strong>REST API Client</strong> — a configuração que determina para onde a câmera envia as passagens.
              Este parâmetro <strong>não é capturado pela auditoria VARCO</strong> atual e precisa ser verificado manualmente no túnel de cada câmera em
              <strong> Equipamento › Servidores › REST API Client</strong>.
            </>
          ) : (
            <>
              <strong style={{ color: "#ef4444" }}>⚠️ {diff59vs58.diff} parâmetro(s) divergente(s) encontrado(s):</strong>
              {diff59vs58.params.map(p => <div key={p}>• {p}: [{dev59?.params?.[p]}] vs [{dev58?.params?.[p]}]</div>)}
            </>
          )}
        </div>
      </Section>

      {/* ─── TOP DIVERGÊNCIAS ─── */}
      {topParams.length > 0 && (
        <Section titulo="📋 Top Parâmetros com Mais Divergências na Frota">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: C.tableHeader }}>
                  <th style={{ padding: "7px 10px", textAlign: "left", color: C.textSecondary }}>Parâmetro</th>
                  <th style={{ padding: "7px 10px", textAlign: "center", color: C.textSecondary }}>Equip. Afetados</th>
                  <th style={{ padding: "7px 10px", textAlign: "left", color: C.textSecondary }}>Valor Consenso (Correto)</th>
                  <th style={{ padding: "7px 10px", textAlign: "center", color: C.textSecondary }}>Criticidade</th>
                </tr>
              </thead>
              <tbody>
                {topParams.map(([param, cnt], i) => {
                  const con = analysis?.consensus?.[param];
                  const crit = ["VARCO.enabled","OCR.enabled","FTP.enable"].includes(param) ? "CRÍTICO" :
                    ["Firmware.version","NTP.server","Timezone"].includes(param) ? "ALTO" :
                    cnt > (analysis?.results?.length || 60) * 0.3 ? "ALTO" : cnt > 3 ? "MÉDIO" : "BAIXO";
                  const cor = crit === "CRÍTICO" ? "#ef4444" : crit === "ALTO" ? "#f97316" : crit === "MÉDIO" ? "#f59e0b" : "#a78bfa";
                  return (
                    <tr key={param} style={{ borderTop: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "transparent" : C.codeBg }}>
                      <td style={{ padding: "7px 10px" }}><code style={{ fontSize: "11px", color: C.accent }}>{param}</code></td>
                      <td style={{ padding: "7px 10px", textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: cor }}>{cnt}</span>
                        <span style={{ color: C.textMuted, fontSize: "10px" }}>/{analysis?.results?.length || "—"}</span>
                      </td>
                      <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: "11px", color: "#22c55e" }}>{String(con?.value ?? "—")}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center" }}><Badge label={crit} cor={cor} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ─── EQUIPAMENTOS SEM ACESSO ─── */}
      {semDados.length > 0 && (
        <Section titulo={`⚠️ Equipamentos Sem Acesso à Configuração (${semDados.length}) — Offline ou Inacessíveis`}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {semDados.map(d => (
              <div key={d.nome} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "5px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#ef4444" }}>{d.nome}</span>
                {d.uuid && <a href={`https://${d.uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer" style={{ fontSize: "9px", color: C.accent, textDecoration: "none", border: `1px solid ${C.accent}40`, padding: "1px 5px", borderRadius: "3px" }}>🔗</a>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ─── PRÓXIMOS PASSOS ─── */}
      <Section titulo="✅ Próximos Passos — Plano de Ação">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { passo: "1", titulo: "Verificar REST API Client em GOEC6O059", descricao: "Acessar túnel, navegar em Equipamento › Servidores › REST API Client. Verificar se URL do AxHub está configurada.", urgencia: "CRÍTICO", link: dev59?.uuid ? `https://${dev59.uuid}-80.tunnel.varco.cloud/equipment/servers` : null, linkLabel: "🔗 Abrir Servidores" },
            { passo: "2", titulo: "Comparar com GOEC6O058 (verde)", descricao: "Verificar a configuração de REST API Client que funciona em GOEC6O058 e replicar em GOEC6O059.", urgencia: "CRÍTICO", link: dev58?.uuid ? `https://${dev58.uuid}-80.tunnel.varco.cloud/equipment/servers` : null, linkLabel: "🔗 Abrir Servidores" },
            { passo: "3", titulo: "Replicar para todos os 71 equipamentos online", descricao: "Após validar a configuração correta, aplicar o mesmo REST API Client em todos os equipamentos online da frota.", urgencia: "ALTO", link: null },
            { passo: "4", titulo: "Validar no Mapa de Teste AxHub", descricao: "Após aplicar as correções, verificar se os quadrados ficam verdes no Mapa de Teste. Aguardar ~30 minutos para o sistema registrar passagens.", urgencia: "MÉDIO", link: "https://economia.axhub.axion.ws/relatorio/relatoriomapadeteste", linkLabel: "🗺️ Abrir Mapa" },
          ].map(p => {
            const cor = p.urgencia === "CRÍTICO" ? "#ef4444" : p.urgencia === "ALTO" ? "#f97316" : "#f59e0b";
            return (
              <div key={p.passo} style={{ padding: "12px 14px", background: `${cor}06`, border: `1px solid ${cor}30`, borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: cor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>{p.passo}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: C.text }}>{p.titulo}</span>
                  <Badge label={p.urgencia} cor={cor} />
                </div>
                <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.6", marginBottom: p.link ? "8px" : 0 }}>{p.descricao}</div>
                {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: cor, textDecoration: "none", border: `1px solid ${cor}40`, padding: "4px 10px", borderRadius: "5px", display: "inline-block" }}>{p.linkLabel}</a>}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ─── De-Para Direto entre 2 Equipamentos (seletor pesquisável) ──────────────────
function DeParaEquipamentosSection({ liveDevices, analysis, eq1Default = "", eq2Default = "" }) {
  const [eq1, setEq1]       = useState(eq1Default);
  const [eq2, setEq2]       = useState(eq2Default);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [open1, setOpen1]   = useState(false);
  const [open2, setOpen2]   = useState(false);  const [onlyDiff, setOnlyDiff] = useState(true);
  const [filterP, setFilterP]   = useState("");

  // Lista completa de equipamentos (audit + live, deduplicada e ordenada)
  const allNames = useMemo(() => {
    const fromLive  = (liveDevices || []).map(d => d.name).filter(Boolean);
    const fromAudit = (analysis?.results || []).map(r => r.nome).filter(Boolean);
    return [...new Set([...fromAudit, ...fromLive])].sort();
  }, [liveDevices, analysis]);

  // Filtra e ordena colocando correspondências exatas/início primeiro
  const sortFiltered = (names, search) => {
    if (!search) return names;
    const q = search.toLowerCase().replace(/o/g, '[o0]').replace(/0/g, '[o0]');
    const re = new RegExp(q, 'i');
    const exact = names.filter(n => n.toLowerCase().startsWith(search.toLowerCase()));
    const includes = names.filter(n => re.test(n) && !exact.includes(n));
    return [...exact, ...includes];
  };
  const filtered1 = sortFiltered(allNames, search1);
  const filtered2 = sortFiltered(allNames, search2);

  // Lookup fuzzy: aceita nome base (ex: "GOEC6O059") e encontra a Faixa 1
  const findDev = (name) => {
    if (!name || !analysis?.results) return null;
    // 1. Exato
    let d = analysis.results.find(r => r.nome === name);
    if (d) return d;
    // 2. Troca O↔0
    const alt = name.replace(/O/g,'0').replace(/0(?=[^\d])/g,'O');
    d = analysis.results.find(r => r.nome === alt || r.nome?.replace(/O/g,'0') === name?.replace(/O/g,'0'));
    if (d) return d;
    // 3. Nome base sem faixa (ex: "GOEC6O059" → busca "GOEC6O059 - Faixa 1")
    d = analysis.results.find(r => r.nome?.toLowerCase().startsWith(name.toLowerCase()));
    if (d) return d;
    // 4. O nome está dentro do nome do device
    d = analysis.results.find(r => r.nome?.toLowerCase().includes(name.toLowerCase()));
    return d || null;
  };
  const findLive = (name) => {
    if (!name || !liveDevices) return null;
    const norm = n => n?.replace(/O/g,'0').toLowerCase();
    return liveDevices.find(d => d.name === name || norm(d.name) === norm(name) || d.name?.toLowerCase().startsWith(name.toLowerCase()));
  };

  // Devices
  const dev1  = useMemo(() => findDev(eq1), [eq1, analysis]);
  const dev2  = useMemo(() => findDev(eq2), [eq2, analysis]);
  const live1 = useMemo(() => findLive(eq1), [eq1, liveDevices]);
  const live2 = useMemo(() => findLive(eq2), [eq2, liveDevices]);
  const uuid1 = live1?.uuid || dev1?.uuid;
  const uuid2 = live2?.uuid || dev2?.uuid;

  // Cálculo De-Para
  const deParaParams = useMemo(() => {
    if (!dev1 || !dev2 || !analysis?.consensus) return [];
    return Object.keys(analysis.consensus)
      .map(param => {
        const v1  = dev1.params?.[param] ?? null;
        const v2  = dev2.params?.[param] ?? null;
        const isDiff = String(v1) !== String(v2);
        const consenso = analysis.consensus[param]?.value;
        const sec = param.split(".")[0];
        const ep  = PARAM_TO_ENDPOINT[sec] || {};
        const descP = PARAM_DESCRIPTIONS_SHORT?.[param] || {};
        return { param, v1, v2, isDiff, consenso, ep, descP };
      })
      .filter(r => {
        if (onlyDiff && !r.isDiff) return false;
        if (filterP) return r.param.toLowerCase().includes(filterP.toLowerCase());
        return true;
      });
  }, [dev1, dev2, analysis, onlyDiff, filterP]);

  const numDiff = useMemo(() =>
    (dev1 && dev2 && analysis?.consensus)
      ? Object.keys(analysis.consensus).filter(p => String(dev1.params?.[p]) !== String(dev2.params?.[p])).length
      : 0,
    [dev1, dev2, analysis]);

  const sevCor = (p) => {
    if (["VARCO.enabled","OCR.enabled","FTP.enable"].includes(p)) return "#ef4444";
    if (p.includes("Firmware") || p.includes("NTP") || p.includes("Timezone")) return "#f97316";
    if (p.startsWith("Diurno") || p.startsWith("Noturno")) return "#f59e0b";
    return "#a78bfa";
  };

  const Selector = ({ label, value, search, setSearch, open, setOpen, filtered, onSelect, live, dev, cor, uuid }) => {
    const displayVal = value || "";
    const nomeBase = displayVal.split(" - ")[0]; // ex: "GOEC6O059"
    const faixa = displayVal.includes(" - ") ? displayVal.split(" - ").slice(1).join(" - ") : "";
    return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: cor, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      {/* Input de pesquisa */}
      <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${value ? cor : C.border}`, borderRadius: "7px", background: C.surface, overflow: "hidden" }}>
        <span style={{ padding: "0 8px", color: C.textMuted, fontSize: "13px" }}>🔍</span>
        <input
          value={open ? search : displayVal}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => { setSearch(""); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={`Pesquisar equipamento... (${allNames.length} disponíveis — ex: "059" ou "GOEC6O059")`}
          style={{ flex: 1, padding: "8px 6px", border: "none", outline: "none", background: "transparent", color: C.text, fontSize: "12px" }}
        />
        {value && <button onClick={() => { onSelect(""); setSearch(""); }} style={{ padding: "0 10px", background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: "14px" }}>×</button>}
      </div>
      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: C.surface, border: `1px solid ${C.border}`, borderRadius: "7px", maxHeight: "220px", overflowY: "auto", boxShadow: "0 6px 20px rgba(0,0,0,0.3)", marginTop: "2px" }}>
          {filtered.length === 0 && <div style={{ padding: "10px 12px", color: C.textMuted, fontSize: "11px" }}>Nenhum equipamento encontrado</div>}
          {filtered.slice(0, 200).map(n => {
            const dDev = analysis?.results?.find(r => r.nome === n);
            const dLive = liveDevices?.find(d => d.name === n);
            const isOnline = dLive?.connected;
            const isSelected = n === value;
            return (
              <div key={n} onMouseDown={() => { onSelect(n); setSearch(""); setOpen(false); }}
                style={{ padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: isSelected ? `${cor}20` : "transparent", borderBottom: `1px solid ${C.borderLight}`, borderLeft: isSelected ? `3px solid ${cor}` : "3px solid transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = `${cor}10`}
                onMouseLeave={e => e.currentTarget.style.background = isSelected ? `${cor}20` : "transparent"}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: isOnline !== undefined ? (isOnline ? "#22c55e" : "#ef4444") : C.textMuted, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: isSelected ? 700 : 400, color: isSelected ? cor : C.text, flex: 1 }}>{n}</span>
                {dDev?.diffCount > 0 && (
                  <span title={`${dDev.diffCount} parâmetro(s) com configuração divergente do consenso da frota`}
                    style={{ fontSize: "9px", color: "#f59e0b" }}>⚠️ {dDev.diffCount}</span>
                )}
                {dDev?.diffCount === 0 && <span style={{ fontSize: "9px", color: "#22c55e" }}>✅</span>}
                {isOnline !== undefined && <span style={{ fontSize: "9px", color: isOnline ? "#22c55e" : "#ef4444" }}>{isOnline ? "🟢" : "🔴"}</span>}
              </div>
            );
          })}
          {filtered.length > 200 && <div style={{ padding: "6px 12px", fontSize: "10px", color: C.textMuted }}>... {filtered.length - 200} mais — refine a busca</div>}
        </div>
      )}
      {/* Card do equipamento selecionado */}
      {value && !open && (
        <div style={{ marginTop: "6px", padding: "8px 10px", background: `${cor}08`, border: `1px solid ${cor}30`, borderRadius: "6px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: faixa ? "4px" : 0 }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: cor }}>{nomeBase}</span>
            {faixa && <span style={{ fontSize: "10px", color: C.textMuted, background: C.codeBg, padding: "1px 6px", borderRadius: "3px" }}>{faixa}</span>}
            {live && <span style={{ fontSize: "10px", color: live.connected ? "#22c55e" : "#ef4444", marginLeft: "auto" }}>{live.connected ? "🟢 Online" : "🔴 Offline"}</span>}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {dev?.diffCount > 0 && (
              <span title={`${dev.diffCount} parâmetro(s) com configuração diferente do consenso da frota`}
                style={{ fontSize: "10px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "1px 7px", borderRadius: "3px" }}>
                ⚠️ {dev.diffCount} divergências
              </span>
            )}
            {dev?.diffCount === 0 && <span style={{ fontSize: "10px", color: "#22c55e" }}>✅ Conforme ao padrão</span>}
            {uuid && (
              <a href={`https://${uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer"
                style={{ fontSize: "10px", color: C.accent, textDecoration: "none", border: `1px solid ${C.accent}40`, padding: "1px 7px", borderRadius: "3px", marginLeft: "auto" }}>🔗 Túnel</a>
            )}
            {uuid && (
              <a href={`https://${uuid}-80.tunnel.varco.cloud/equipment/servers`} target="_blank" rel="noreferrer"
                style={{ fontSize: "10px", color: "#f97316", textDecoration: "none", border: "1px solid rgba(249,115,22,0.4)", padding: "1px 7px", borderRadius: "3px" }}>🔌 REST API</a>
            )}
          </div>
        </div>
      )}
    </div>
    );
  };

  return (
    <div style={{ marginTop: "16px", border: `1px solid ${C.accent}40`, borderRadius: "10px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "10px 14px", background: `${C.accent}08`, borderBottom: `1px solid ${C.accent}20`, display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>⚖️ De-Para entre Equipamentos — Seleção por Pesquisa</span>
        <span style={{ fontSize: "10px", color: C.textMuted }}>{allNames.length} equipamentos disponíveis</span>
        {numDiff > 0 && eq1 && eq2 && (
          <span style={{ marginLeft: "auto", fontSize: "11px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "2px 9px", borderRadius: "4px", fontWeight: 700 }}>
            ⚠️ {numDiff} parâmetro(s) divergente(s)
          </span>
        )}
        {numDiff === 0 && eq1 && eq2 && dev1 && dev2 && (
          <span style={{ marginLeft: "auto", fontSize: "11px", background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", padding: "2px 9px", borderRadius: "4px", fontWeight: 700 }}>
            ✅ Configurações idênticas
          </span>
        )}
      </div>

      <div style={{ padding: "12px 14px" }}>
        {/* Legenda do triângulo ⚠️ */}
        <div style={{ marginBottom: "10px", padding: "7px 12px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "6px", fontSize: "10px", color: C.textSecondary, display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#f59e0b" }}>ℹ️ Legenda:</span>
          <span>🟢 = Online no VARCO Cloud</span>
          <span>🔴 = Offline no VARCO Cloud</span>
          <span style={{ color: "#f59e0b" }}>⚠️<strong>N</strong> = N parâmetros com configuração DIVERGENTE do padrão da frota</span>
          <span style={{ color: "#22c55e" }}>✅ = Totalmente conforme ao consenso</span>
          <span style={{ fontStyle: "italic", color: C.textMuted }}>Nota: nomes com letra "O" (GOEC6<strong>O</strong>059) vs dígito "0" (GOEC6<strong>0</strong>059) — mesma câmera, nomenclatura diferente entre VARCO e AxHub</span>
        </div>

        {/* Atalhos rápidos */}
        <div style={{ marginBottom: "12px", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: C.textMuted, fontWeight: 600 }}>⚡ Atalhos rápidos:</span>
          {[
            { label: "GOEC6O059 - Faixa 1 (problema)", nome: "GOEC6O059 - Faixa 1", cor: "#ef4444", slot: 1 },
            { label: "GOEC6O059 - Faixa 2", nome: "GOEC6O059 - Faixa 2", cor: "#ef4444", slot: 1 },
            { label: "GOEC6O058 - Faixa 1", nome: "GOEC6O058 - Faixa 1", cor: "#22c55e", slot: 2 },
            { label: "GOEC6O054 - Faixa 1", nome: "GOEC6O054 - Faixa 1", cor: "#22c55e", slot: 2 },
          ].map(s => (
            <button key={s.nome}
              onClick={() => s.slot === 1 ? setEq1(s.nome) : setEq2(s.nome)}
              style={{ padding: "3px 10px", border: `1px solid ${s.cor}50`, borderRadius: "20px", background: `${s.cor}12`, color: s.cor, cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
              {s.slot === 1 ? "→ Equip 1: " : "→ Equip 2: "}{s.label}
            </button>
          ))}
        </div>

        {/* Seletores lado a lado */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: "10px", alignItems: "start", marginBottom: "14px" }}>
          <Selector label="Equipamento 1 (DE — referência ou problema)" value={eq1} search={search1} setSearch={setSearch1} open={open1} setOpen={setOpen1} filtered={filtered1} onSelect={setEq1} live={live1} dev={dev1} cor="#ef4444" uuid={uuid1} />
          <div style={{ paddingTop: "28px", textAlign: "center", color: C.textMuted, fontSize: "18px", fontWeight: 700 }}>⚖️</div>
          <Selector label="Equipamento 2 (PARA — comparação)" value={eq2} search={search2} setSearch={setSearch2} open={open2} setOpen={setOpen2} filtered={filtered2} onSelect={setEq2} live={live2} dev={dev2} cor="#22c55e" uuid={uuid2} />
        </div>

        {/* Tabela De-Para */}
        {dev1 && dev2 ? (
          <>
            {/* Controles */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: C.textSecondary, cursor: "pointer" }}>
                <input type="checkbox" checked={onlyDiff} onChange={e => setOnlyDiff(e.target.checked)} style={{ accentColor: C.accent }} />
                Mostrar apenas divergentes
              </label>
              <input value={filterP} onChange={e => setFilterP(e.target.value)} placeholder="🔍 Filtrar parâmetro..."
                style={{ padding: "4px 9px", border: `1px solid ${C.border}`, borderRadius: "5px", background: C.surface, color: C.text, fontSize: "11px", width: "180px" }} />
              <span style={{ marginLeft: "auto", fontSize: "10px", color: C.textMuted }}>{deParaParams.length} parâmetro(s)</span>
            </div>

            <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: "8px", maxHeight: "480px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                  <tr style={{ background: C.tableHeader }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", color: C.textSecondary, fontWeight: 600, borderBottom: `1px solid ${C.border}`, minWidth: "200px" }}>Parâmetro</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: "#ef4444", fontWeight: 700, borderBottom: `1px solid ${C.border}`, minWidth: "130px" }}>
                      <div>{eq1}</div>
                      <div style={{ fontSize: "9px", color: live1?.connected ? "#22c55e" : "#ef4444" }}>{live1?.connected !== undefined ? (live1.connected ? "🟢 Online" : "🔴 Offline") : ""}</div>
                    </th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: "#22c55e", fontWeight: 700, borderBottom: `1px solid ${C.border}`, minWidth: "130px" }}>
                      <div>{eq2}</div>
                      <div style={{ fontSize: "9px", color: live2?.connected ? "#22c55e" : "#ef4444" }}>{live2?.connected !== undefined ? (live2.connected ? "🟢 Online" : "🔴 Offline") : ""}</div>
                    </th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: "#22c55e", fontWeight: 600, borderBottom: `1px solid ${C.border}`, minWidth: "100px", fontSize: "10px" }}>Consenso frota</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: C.textSecondary, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontSize: "10px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deParaParams.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#22c55e", fontSize: "12px" }}>
                        ✅ Nenhuma divergência — configurações idênticas entre os dois equipamentos
                      </td>
                    </tr>
                  ) : deParaParams.map((row, ri) => {
                    const cor = sevCor(row.param);
                    const v1Str = row.v1 == null ? "null" : String(row.v1);
                    const v2Str = row.v2 == null ? "null" : String(row.v2);
                    const conStr = row.consenso == null ? "—" : String(row.consenso);
                    const v1Bad = v1Str !== conStr;
                    const v2Bad = v2Str !== conStr;
                    return (
                      <tr key={row.param} style={{ borderTop: `1px solid ${C.borderLight}`, background: row.isDiff ? `${cor}05` : ri % 2 === 0 ? "transparent" : C.codeBg }}>
                        {/* Parâmetro */}
                        <td style={{ padding: "7px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            {row.isDiff && <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: cor, flexShrink: 0 }} />}
                            <code style={{ fontSize: "10px", color: row.isDiff ? cor : C.textSecondary, fontWeight: row.isDiff ? 700 : 400 }}>{row.param}</code>
                          </div>
                          {row.descP?.campo && <div style={{ fontSize: "9px", color: C.textMuted, marginTop: "1px", paddingLeft: "9px" }}>{row.descP.campo}</div>}
                        </td>
                        {/* Valor 1 */}
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: v1Bad ? 700 : 400, color: v1Bad ? "#ef4444" : "#22c55e", background: v1Bad ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.08)", padding: "2px 8px", borderRadius: "3px", display: "inline-block" }}>
                            {v1Str === "null" ? "∅ null" : v1Str}
                          </span>
                        </td>
                        {/* Valor 2 */}
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: v2Bad ? 700 : 400, color: v2Bad ? "#ef4444" : "#22c55e", background: v2Bad ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.08)", padding: "2px 8px", borderRadius: "3px", display: "inline-block" }}>
                            {v2Str === "null" ? "∅ null" : v2Str}
                          </span>
                        </td>
                        {/* Consenso */}
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: "3px" }}>
                            {conStr === "undefined" || conStr === "null" ? "∅" : conStr}
                          </span>
                        </td>
                        {/* Status */}
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>
                          {row.isDiff
                            ? <span style={{ fontSize: "11px", color: cor, fontWeight: 700 }}>⚠️ Diverge</span>
                            : <span style={{ fontSize: "11px", color: "#22c55e" }}>✅</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapé com links diretos */}
            {(uuid1 || uuid2) && (
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {uuid1 && <a href={`https://${uuid1}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#ef4444", textDecoration: "none", border: "1px solid rgba(239,68,68,0.35)", padding: "4px 10px", borderRadius: "5px" }}>🔗 Túnel {eq1}</a>}
                {uuid2 && <a href={`https://${uuid2}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#22c55e", textDecoration: "none", border: "1px solid rgba(34,197,94,0.35)", padding: "4px 10px", borderRadius: "5px" }}>🔗 Túnel {eq2}</a>}
                <a href="https://economia.axhub.axion.ws/relatorio/relatoriomapadeteste" target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#3b82f6", textDecoration: "none", border: "1px solid rgba(59,130,246,0.35)", padding: "4px 10px", borderRadius: "5px" }}>🗺️ Mapa de Teste AxHub</a>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "24px", textAlign: "center", color: C.textMuted, fontSize: "12px", border: `1px dashed ${C.border}`, borderRadius: "7px" }}>
            Selecione dois equipamentos acima para ver o De-Para de configuração
          </div>
        )}
      </div>
    </div>
  );
}

function SistemaBloco({ sistema, cor, icone, baseUrl, itens }) {
  const [expandedItem, setExpandedItem] = React.useState(null);
  return (
    <div style={{ marginBottom: "16px", border: `1px solid ${cor}30`, borderRadius: "10px", overflow: "hidden" }}>
      {/* Header do sistema */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: `${cor}12`, borderBottom: `1px solid ${cor}25` }}>
        <span style={{ fontSize: "16px" }}>{icone}</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: cor }}>{sistema}</span>
        <a href={baseUrl} target="_blank" rel="noopener noreferrer"
          style={{ marginLeft: "auto", fontSize: "10px", color: cor, textDecoration: "none", border: `1px solid ${cor}40`, padding: "2px 8px", borderRadius: "4px", opacity: 0.85 }}>
          {baseUrl.replace("https://","").replace("http://","")} ↗
        </a>
      </div>
      {/* Itens */}
      {itens.map((item, idx) => {
        const isExp = expandedItem === idx;
        return (
          <div key={item.badge} style={{ borderTop: idx > 0 ? `1px solid ${cor}15` : "none" }}>
            <div
              onClick={() => setExpandedItem(isExp ? null : idx)}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", cursor: "pointer", background: isExp ? `${cor}08` : "transparent" }}
            >
              {/* Badge */}
              <span style={{ background: `${cor}18`, color: cor, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, border: `1px solid ${cor}30`, minWidth: "52px", textAlign: "center", flexShrink: 0 }}>{item.badge}</span>
              {/* Tela */}
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>📍 {item.tela}</span>
                {item.destaque && (
                  <span style={{ marginLeft: "8px", fontSize: "9px", fontWeight: 700, background: `${cor}25`, color: cor, padding: "1px 6px", borderRadius: "3px", border: `1px solid ${cor}40` }}>{item.destaqueLabel}</span>
                )}
              </div>
              {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
            </div>
            {isExp && (
              <div style={{ padding: "0 14px 12px 14px", borderTop: `1px solid ${cor}10` }}>
                {/* Descrição */}
                <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.6", marginBottom: "10px", padding: "8px 10px", background: C.codeBg, borderRadius: "5px", borderLeft: `3px solid ${cor}` }}>
                  {item.descricao}
                </div>
                {/* Credenciais */}
                {item.credenciais && (
                  <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                    <span style={{ fontSize: "10px", color: C.textMuted, fontWeight: 600, textTransform: "uppercase" }}>🔑 Acesso:</span>
                    <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "3px", color: C.accent, fontSize: "11px" }}>{item.credenciais}</code>
                  </div>
                )}
                {/* Campos */}
                <div style={{ fontSize: "10px", color: C.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: "5px" }}>Campos / Informações visíveis:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {item.campos.map(c => (
                    <span key={c} style={{ background: C.raised, border: `1px solid ${C.border}`, color: C.textSecondary, padding: "2px 7px", borderRadius: "3px", fontSize: "10px", fontFamily: "monospace" }}>{c}</span>
                  ))}
                </div>
                {/* Link direto */}
                {item.path && !item.path.includes("{uuid}") && (
                  <a href={`${baseUrl}${item.path}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "10px", fontSize: "11px", color: cor, textDecoration: "none", border: `1px solid ${cor}40`, padding: "4px 10px", borderRadius: "5px", background: `${cor}08` }}>
                    <ExternalLink size={11} /> Abrir {sistema} — {item.tela.split("→")[0].trim()}
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PASSAGENS & HEARTBEAT TAB — Fluxo completo de dados câmera → AxHub/AxCross
// ═══════════════════════════════════════════════════════════════════════════
function PassagensHeartbeatTab({ liveDevices = [], analysis }) {
  const [heartbeatAxHub, setHeartbeatAxHub] = useState(null);
  const [loadingHB, setLoadingHB] = useState(true);
  const [passagensAxHub, setPassagensAxHub] = useState(null);
  const [loadingPass, setLoadingPass] = useState(true);
  const [expandedGrp, setExpandedGrp] = useState("HB-01");

  // ─── Multi-select De-Para ────────────────────────────────────────────────────
  const [selectedEquips, setSelectedEquips] = useState(new Set());
  const [showDepara, setShowDepara] = useState(false);
  const [deParaOnlyDiff, setDeParaOnlyDiff] = useState(true);
  const [deParaFilter, setDeParaFilter] = useState("");

  const toggleSelect = (nome) => {
    setSelectedEquips(prev => {
      const next = new Set(prev);
      if (next.has(nome)) next.delete(nome);
      else next.add(nome);
      return next;
    });
  };
  const clearSelection = () => { setSelectedEquips(new Set()); setShowDepara(false); };

  // Dados De-Para dos equipamentos selecionados
  const deParaEquips = useMemo(() => {
    if (!analysis) return [];
    return [...selectedEquips].map(nome => {
      const dev  = analysis.results?.find(r => r.nome === nome || r.nome?.replace(/O/g, "0") === nome || nome?.replace(/O/g, "0") === r.nome);
      const live = liveDevices.find(d => d.name === nome || d.name?.replace(/O/g, "0") === nome);
      return { nome, dev, live, uuid: live?.uuid || dev?.uuid, connected: live?.connected };
    });
  }, [selectedEquips, analysis, liveDevices]);

  // Parâmetros com divergência entre selecionados
  const deParaParams = useMemo(() => {
    if (deParaEquips.length < 1 || !analysis?.consensus) return [];
    const allParams = Object.keys(analysis.consensus);
    return allParams.map(param => {
      const vals = deParaEquips.map(d => ({ nome: d.nome, val: d.dev?.params?.[param] ?? null }));
      const strs = vals.map(v => String(v.val));
      const allSame = strs.every(s => s === strs[0]);
      const consensoStr = String(analysis.consensus[param]?.value);
      return { param, vals, allSame, consensoStr };
    }).filter(r => {
      if (deParaOnlyDiff && r.allSame) return false;
      if (deParaFilter) return r.param.toLowerCase().includes(deParaFilter.toLowerCase());
      return true;
    });
  }, [deParaEquips, analysis, deParaOnlyDiff, deParaFilter]);

  const sevColor = (param) => {
    if (["VARCO.enabled","OCR.enabled","FTP.enable"].includes(param)) return "#ef4444";
    if (["Firmware.version","NTP.server","Timezone"].includes(param)) return "#f97316";
    if (param.startsWith("Diurno") || param.startsWith("Noturno")) return "#f59e0b";
    return C.accent;
  };

  useEffect(() => {
    // Busca heartbeat do AxHub (banco SQL)
    fetch(`${API_BASE}/api/varco/heartbeat`, {
      headers: API_HEADERS
    }).then(r => r.json()).then(setHeartbeatAxHub).catch(() => {}).finally(() => setLoadingHB(false));

    // Busca passagens do AxHub
    fetch(`${API_BASE}/api/axhub/passagens`, {
      headers: API_HEADERS
    }).then(r => r.json()).then(setPassagensAxHub).catch(() => {}).finally(() => setLoadingPass(false));
  }, []);

  // Grupos de heartbeat por status (VARCO Cloud)
  const online = liveDevices.filter(d => d.connected);
  const offline = liveDevices.filter(d => !d.connected);

  // Categorias de heartbeat no AxHub DB
  const hbOnline = heartbeatAxHub?.devices?.filter(d => d.status === "online") || [];
  const hbAtencao = heartbeatAxHub?.devices?.filter(d => d.status === "atencao") || [];
  const hbOffline = heartbeatAxHub?.devices?.filter(d => d.status === "offline") || [];

  const grupos = [
    {
      id: "HB-01",
      badge: "HB-01",
      cor: "#22c55e",
      titulo: "Heartbeat Online — Conexão Ativa no VARCO Cloud",
      operacao: "Equipamento enviando heartbeat periódico via túnel VARCO — sinal de vida recebido há menos de 5 minutos",
      descricao: "Estes equipamentos estão com túnel VARCO ativo. O heartbeat é enviado automaticamente pelo equipamento ITScam a cada intervalo configurado. Quando ativo, o painel VARCO.io exibe o dispositivo como 'Connected'.",
      quantidade: online.length,
      devices: online,
      fonte: "VARCO Cloud (varco.io)",
      status: "online",
    },
    {
      id: "HB-02",
      badge: "HB-02",
      cor: "#ef4444",
      titulo: "Heartbeat Offline — Sem Sinal no VARCO Cloud",
      operacao: "Equipamento sem resposta no VARCO Cloud — túnel inativo, verificar conectividade de rede e configuração VARCO.edgeServer",
      descricao: "Equipamentos sem sinal no VARCO Cloud. Causas possíveis: câmera desligada, perda de conexão 4G/Wi-Fi, VARCO.enabled = false no firmware, ou edgeServer incorreto.",
      quantidade: offline.length,
      devices: offline,
      fonte: "VARCO Cloud (varco.io)",
      status: "offline",
    },
    {
      id: "HB-03",
      badge: "HB-03",
      cor: "#22c55e",
      titulo: "Heartbeat Online — AxHub (Banco SQL)",
      operacao: "TBHeartbeatEquipamentos com sinal < 5 min — equipamento comunicando passagens ao AxHub",
      descricao: "Heartbeat registrado no banco AxHub (TBHeartbeatEquipamentos). Cada passagem enviada pelo equipamento atualiza o timestamp. O AxHub usa essa tabela para mostrar o status no Monitoramento Online.",
      quantidade: hbOnline.length,
      devices: hbOnline,
      fonte: "AxHub SQL Server (TBHeartbeatEquipamentos)",
      status: "online",
      isAxHub: true,
    },
    {
      id: "HB-04",
      badge: "HB-04",
      cor: "#f59e0b",
      titulo: "Heartbeat Atenção — AxHub (5–15 min sem sinal)",
      operacao: "TBHeartbeatEquipamentos com sinal entre 5 e 15 min — equipamento com comunicação intermitente",
      descricao: "Equipamentos que enviaram a última passagem entre 5 e 15 minutos atrás. Pode indicar instabilidade na conexão ou baixo volume de passagens no local.",
      quantidade: hbAtencao.length,
      devices: hbAtencao,
      fonte: "AxHub SQL Server (TBHeartbeatEquipamentos)",
      status: "atencao",
      isAxHub: true,
    },
    {
      id: "HB-05",
      badge: "HB-05",
      cor: "#ef4444",
      titulo: "Heartbeat Offline — AxHub (> 15 min sem sinal)",
      operacao: "TBHeartbeatEquipamentos com sinal > 15 min — equipamento sem envio de passagens",
      descricao: "Equipamentos sem passagem no AxHub há mais de 15 minutos. Verificar conectividade da câmera, configuração do REST API Client e integração com o servidor.",
      quantidade: hbOffline.length,
      devices: hbOffline,
      fonte: "AxHub SQL Server (TBHeartbeatEquipamentos)",
      status: "offline",
      isAxHub: true,
    },
  ];

  return (
    <div>
      {/* ══════════════════════════════════════════════════════════════
          BARRA DE SELEÇÃO MÚLTIPLA + DE-PARA
          ══════════════════════════════════════════════════════════════ */}
      {selectedEquips.size > 0 && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, marginBottom: "12px", background: C.surface, border: `2px solid ${C.accent}`, borderRadius: "10px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: C.accent }}>⚖️ {selectedEquips.size} equipamento(s) selecionado(s)</span>
            {/* Pills dos selecionados */}
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", flex: 1 }}>
              {[...selectedEquips].map(nome => {
                const live = liveDevices.find(d => d.name === nome);
                return (
                  <span key={nome} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: "20px", padding: "2px 10px", fontSize: "11px", color: C.accent }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: live?.connected ? "#22c55e" : "#ef4444" }} />
                    {nome}
                    <button onClick={() => toggleSelect(nome)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, padding: "0 0 0 3px", fontSize: "12px", lineHeight: 1 }}>×</button>
                  </span>
                );
              })}
            </div>
            {/* Botões de ação */}
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              {selectedEquips.size >= 2 && (
                <button onClick={() => setShowDepara(p => !p)}
                  style={{ padding: "6px 14px", border: `1px solid ${C.accentBorder}`, borderRadius: "6px", background: showDepara ? C.accent : C.accentBg, color: showDepara ? "#000" : C.accent, cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                  {showDepara ? "▲ Fechar De-Para" : "⚖️ Ver De-Para"}
                </button>
              )}
              <button onClick={clearSelection}
                style={{ padding: "6px 12px", border: `1px solid ${C.border}`, borderRadius: "6px", background: "transparent", color: C.textMuted, cursor: "pointer", fontSize: "11px" }}>
                ✕ Limpar
              </button>
            </div>
          </div>

          {/* ── Painel De-Para ── */}
          {showDepara && selectedEquips.size >= 2 && (
            <div style={{ marginTop: "12px", borderTop: `1px solid ${C.border}`, paddingTop: "12px" }}>
              {/* Controles */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: C.text }}>De-Para de Configuração — {deParaEquips.length} equipamentos</span>
                <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: C.textSecondary, cursor: "pointer" }}>
                  <input type="checkbox" checked={deParaOnlyDiff} onChange={e => setDeParaOnlyDiff(e.target.checked)} />
                  Apenas divergentes
                </label>
                <input value={deParaFilter} onChange={e => setDeParaFilter(e.target.value)} placeholder="Filtrar parâmetro..."
                  style={{ padding: "4px 8px", border: `1px solid ${C.border}`, borderRadius: "4px", background: C.surface, color: C.text, fontSize: "11px", width: "160px" }} />
                <span style={{ fontSize: "10px", color: C.textMuted, marginLeft: "auto" }}>{deParaParams.length} parâmetro(s) {deParaOnlyDiff ? "divergentes" : "no total"}</span>
              </div>

              {/* Header com nomes dos equipamentos */}
              <div style={{ overflowX: "auto", maxHeight: "450px", overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: "7px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", minWidth: `${200 + deParaEquips.length * 130}px` }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <tr style={{ background: C.tableHeader }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: C.textSecondary, fontWeight: 600, minWidth: "190px", borderBottom: `1px solid ${C.border}` }}>Parâmetro</th>
                      {deParaEquips.map(eq => (
                        <th key={eq.nome} style={{ padding: "8px 10px", textAlign: "center", borderBottom: `1px solid ${C.border}`, minWidth: "120px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: eq.connected ? "#22c55e" : "#ef4444" }} />
                              <span style={{ fontWeight: 700, color: C.text, fontSize: "10px" }}>{eq.nome}</span>
                            </span>
                            {eq.uuid && (
                              <a href={`https://${eq.uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer"
                                style={{ fontSize: "9px", color: C.accent, textDecoration: "none" }}>🔗 Túnel</a>
                            )}
                            {eq.dev?.diffCount > 0 && (
                              <span style={{ fontSize: "9px", color: "#f59e0b" }}>⚠️ {eq.dev.diffCount} erros</span>
                            )}
                          </div>
                        </th>
                      ))}
                      <th style={{ padding: "8px 10px", textAlign: "center", color: "#22c55e", fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontSize: "10px", minWidth: "90px" }}>Consenso Frota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deParaParams.length === 0 ? (
                      <tr>
                        <td colSpan={deParaEquips.length + 2} style={{ padding: "20px", textAlign: "center", color: "#22c55e", fontSize: "12px" }}>
                          ✅ Todos os parâmetros são idênticos entre os equipamentos selecionados
                        </td>
                      </tr>
                    ) : deParaParams.map((row, ri) => {
                      const cor = sevColor(row.param);
                      return (
                        <tr key={row.param} style={{ borderTop: `1px solid ${C.borderLight}`, background: !row.allSame ? `${cor}06` : ri % 2 === 0 ? "transparent" : C.codeBg }}>
                          {/* Parâmetro */}
                          <td style={{ padding: "6px 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              {!row.allSame && <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: cor, flexShrink: 0 }} />}
                              <code style={{ fontSize: "10px", color: !row.allSame ? cor : C.textSecondary, fontWeight: !row.allSame ? 700 : 400 }}>{row.param}</code>
                            </div>
                          </td>
                          {/* Valores por equipamento */}
                          {row.vals.map((v, vi) => {
                            const isDiff = String(v.val) !== row.consensoStr;
                            return (
                              <td key={v.nome} style={{ padding: "6px 10px", textAlign: "center" }}>
                                <span style={{ fontFamily: "monospace", fontWeight: isDiff ? 700 : 400, fontSize: "10px",
                                  color: isDiff ? cor : "#22c55e",
                                  background: isDiff ? `${cor}15` : "rgba(34,197,94,0.08)",
                                  padding: "2px 7px", borderRadius: "3px", display: "inline-block" }}>
                                  {v.val == null ? "null" : String(v.val)}
                                </span>
                              </td>
                            );
                          })}
                          {/* Consenso */}
                          <td style={{ padding: "6px 10px", textAlign: "center" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 7px", borderRadius: "3px" }}>
                              {row.consensoStr === "undefined" || row.consensoStr === "null" ? "∅" : row.consensoStr}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sumário de divergências */}
              {deParaEquips.length >= 2 && (
                <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {deParaEquips.map(eq => (
                    <div key={eq.nome} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: eq.dev?.diffCount > 0 ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: eq.dev?.diffCount > 0 ? "#ef4444" : "#22c55e", border: `1px solid ${eq.dev?.diffCount > 0 ? "#ef444440" : "#22c55e40"}` }}>
                      {eq.nome}: {eq.dev?.diffCount > 0 ? `⚠️ ${eq.dev.diffCount} param. divergentes` : "✅ Conforme"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instrução de uso quando nenhum selecionado */}
      {selectedEquips.size === 0 && (
        <div style={{ marginBottom: "10px", padding: "7px 12px", background: "rgba(96,205,255,0.05)", border: `1px dashed rgba(96,205,255,0.3)`, borderRadius: "7px", fontSize: "11px", color: C.textMuted, display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>👆</span>
          <span>
            Clique em qualquer equipamento abaixo para selecioná-lo. Selecione 2 ou mais para ver o <strong style={{ color: C.accent }}>De-Para de configuração</strong> entre eles.
            {" "}Legenda: 🟢 Online VARCO · 🔴 Offline VARCO · <span style={{ color: "#f59e0b" }}>⚠️N</span> = N parâmetros divergentes do padrão da frota
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DIAGNÓSTICO CRÍTICO — Quando HB-03=0 com HB-01 >> 0
          ══════════════════════════════════════════════════════════════ */}
      {online.length > 0 && hbOnline.length === 0 && (hbAtencao.length + hbOffline.length) === 0 && (
        <div style={{ marginBottom: "16px", border: "2px solid #ef4444", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.12)", borderBottom: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>🚨</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#ef4444" }}>
                DIAGNÓSTICO CRÍTICO — {online.length} equipamentos Online no VARCO · 0 passagens chegando ao AxHub
              </div>
              <div style={{ fontSize: "11px", color: "#fca5a5", marginTop: "2px" }}>
                Os equipamentos ITScam estão conectados ao VARCO Cloud (gestão remota), mas NENHUM está enviando passagens ao AxHub (dados de fiscalização).
                São dois canais independentes — o VARCO Cloud NÃO envia passagens ao AxHub automaticamente.
              </div>
            </div>
          </div>
          <div style={{ padding: "14px 16px", background: C.surface }}>
            {/* Arquitetura dos dois canais */}
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>📐 Os Dois Canais da Câmera ITScam 450 — São Independentes:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
              {/* Canal 1: VARCO */}
              <div style={{ padding: "10px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e", marginBottom: "5px" }}>✅ CANAL 1 — Gestão Remota (VARCO Cloud)</div>
                <div style={{ fontSize: "10px", color: C.textSecondary, lineHeight: "1.6" }}>
                  <div>📡 ITScam → VARCO Cloud (varco.io)</div>
                  <div>🔧 Configurado em: Sistema › Manutenção › Acesso Remoto</div>
                  <div>🎯 Função: Acesso remoto, auditoria, configuração</div>
                  <div>📊 Status: <strong style={{ color: "#22c55e" }}>{online.length} equipamentos conectados</strong></div>
                  <div style={{ marginTop: "4px", color: "#22c55e", fontWeight: 600 }}>⚠️ NÃO envia passagens ao AxHub!</div>
                </div>
              </div>
              {/* Seta */}
              <div style={{ textAlign: "center", fontSize: "20px", color: C.textMuted }}>⟂</div>
              {/* Canal 2: REST API Client */}
              <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.08)", border: "2px solid rgba(239,68,68,0.5)", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", marginBottom: "5px" }}>❌ CANAL 2 — Envio de Passagens (REST API Client) — NÃO CONFIGURADO</div>
                <div style={{ fontSize: "10px", color: C.textSecondary, lineHeight: "1.6" }}>
                  <div>📡 ITScam → AxHub (via HTTP POST)</div>
                  <div>🔧 Configurado em: Equipamento › Servidores › REST API</div>
                  <div>🎯 Função: Enviar passagens (placa, velocidade, imagens)</div>
                  <div>📊 Status: <strong style={{ color: "#ef4444" }}>0 equipamentos configurados</strong></div>
                  <div style={{ marginTop: "4px", color: "#ef4444", fontWeight: 600 }}>🔴 Causa: Mapa de Teste todo vermelho!</div>
                </div>
              </div>
            </div>

            {/* Como o Mapa de Teste é gerado */}
            <div style={{ padding: "10px 12px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "7px", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", marginBottom: "6px" }}>📊 Como o Mapa de Teste de Equipamentos é Gerado:</div>
              <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.8" }}>
                <span style={{ fontFamily: "monospace", background: C.codeBg, padding: "1px 6px", borderRadius: "3px", color: C.accent }}>Mapa de Teste</span> = grade dia×hora que mostra verde quando há pelo menos <strong>1 registro em TBPassagens</strong> naquela hora.<br/>
                A tabela <span style={{ fontFamily: "monospace", background: C.codeBg, padding: "1px 6px", borderRadius: "3px", color: C.accent }}>TBPassagens</span> é alimentada EXCLUSIVAMENTE pelo <strong>REST API Client</strong> do ITScam.<br/>
                O <strong>VARCO Cloud NÃO alimenta TBPassagens</strong> — é apenas um canal de gestão remota.<br/>
                Resultado: sem REST API Client configurado = <span style={{ color: "#ef4444", fontWeight: 700 }}>Mapa completamente vermelho</span> para todos os equipamentos.
              </div>
            </div>

            {/* O que verificar */}
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>🔧 O que verificar e corrigir em cada equipamento:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ padding: "8px 10px", background: C.codeBg, borderRadius: "6px", fontSize: "10px", color: C.textSecondary, lineHeight: "1.7" }}>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: "4px" }}>📍 No ITScam (via túnel VARCO):</div>
                <div>1. Abrir: <code style={{ color: C.accent }}>UUID-80.tunnel.varco.cloud</code></div>
                <div>2. Login: Admin / #econocr@</div>
                <div>3. Ir em: <strong>Equipamento › Servidores › REST API</strong></div>
                <div>4. Verificar se URL do AxHub está configurada</div>
                <div>5. Ex: <code style={{ color: C.accent }}>https://economia.axhub.axion.ws/api/v1/passagens</code></div>
                <div>6. Verificar campos do payload (placa, faixa, velocidade, imagens)</div>
              </div>
              <div style={{ padding: "8px 10px", background: C.codeBg, borderRadius: "6px", fontSize: "10px", color: C.textSecondary, lineHeight: "1.7" }}>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: "4px" }}>📍 No AxHub (conferência):</div>
                <div>1. Operações › Monitoramento Online → verificar pontos</div>
                <div>2. Relatório › Mapa de Teste → deve ter verde</div>
                <div>3. <a href="https://economia.axhub.axion.ws/relatorio/relatoriomapadeteste" target="_blank" rel="noreferrer" style={{ color: C.accent, textDecoration: "none" }}>Abrir Mapa de Teste ↗</a></div>
                <div>4. SELECT COUNT(*) FROM TBPassagens WHERE DataHoraPassagem &gt;= CAST(GETDATE() AS DATE)</div>
                <div>5. Se retornar 0 → confirmado: REST API Client não configurado</div>
              </div>
            </div>

            {/* Seletor pesquisável De-Para */}
            <DeParaEquipamentosSection liveDevices={liveDevices} analysis={analysis} eq1Default="GOEC6O059 - Faixa 1" eq2Default="GOEC6O058 - Faixa 1" />
          </div>
        </div>
      )}

      {/* Cabeçalho explicativo */}
      <div style={{ marginBottom: "16px", padding: "12px 14px", background: "rgba(96,205,255,0.06)", border: `1px solid rgba(96,205,255,0.18)`, borderRadius: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.accent, marginBottom: "6px" }}>📡 Fluxo Completo: Câmera → VARCO Cloud → REST API Client → AxHub/AxCross</div>
        <div style={{ fontSize: "11px", color: C.textSecondary, lineHeight: "1.7" }}>
          Esta análise agrupa os equipamentos por status de heartbeat (HB-01 a HB-05) e apresenta em detalhe todos os campos de envio e recepção de dados entre o ITScam 450, o VARCO Cloud e os sistemas AxHub/AxCross.
          Use os grupos abaixo para identificar equipamentos com problemas de comunicação e entender o mapeamento completo dos campos de integração.
        </div>
      </div>

      {/* ─── GRUPOS DE HEARTBEAT ─── */}
      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>
        🫀 Grupos de Heartbeat — Status por Fonte de Dados
      </div>

      {grupos.map(grp => {
        const isExp = expandedGrp === grp.id;
        return (
          <div key={grp.id} style={{ marginBottom: "10px", border: `1px solid ${grp.cor}40`, borderRadius: "8px", overflow: "hidden" }}>
            {/* Header clicável */}
            <div
              onClick={() => setExpandedGrp(isExp ? null : grp.id)}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", cursor: "pointer", background: isExp ? `${grp.cor}10` : C.surface, borderLeft: `3px solid ${grp.cor}` }}
            >
              <span style={{ background: `${grp.cor}20`, color: grp.cor, padding: "3px 9px", borderRadius: "5px", fontSize: "11px", fontWeight: 700, border: `1px solid ${grp.cor}40`, minWidth: "52px", textAlign: "center" }}>{grp.badge}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{grp.titulo}</div>
                <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>
                  <span style={{ color: grp.cor, fontWeight: 500 }}>Operação:</span> {grp.operacao}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginRight: "8px" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: grp.cor }}>{grp.quantidade}</div>
                <div style={{ fontSize: "10px", color: C.textMuted }}>equipamentos</div>
              </div>
              {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
            </div>

            {isExp && (
              <div style={{ padding: "12px 14px", background: C.surface, borderTop: `1px solid ${grp.cor}30` }}>
                {/* Descrição */}
                <div style={{ fontSize: "12px", color: C.textSecondary, marginBottom: "10px", padding: "8px 10px", background: C.codeBg, borderRadius: "5px", borderLeft: `3px solid ${grp.cor}` }}>
                  {grp.descricao}
                </div>
                {/* Fonte de dados */}
                <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "8px" }}>
                  📊 <strong>Fonte:</strong> {grp.fonte}
                </div>
                {/* Lista de equipamentos */}
                {grp.devices.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", maxHeight: "200px", overflowY: "auto" }}>
                    {grp.devices.map((d, idx) => {
                      const nome = d.nome || d.Descricao || d.name || `Equip ${idx}`;
                      const uuid = d.uuid;
                      const lastSeen = d.lastSeen || d.UltimoHeartbeat || d.UltimaPassagem;
                      const minutos = d.MinutosSemComunicacao;
                      const isSel = selectedEquips.has(nome);
                      const devData = analysis?.results?.find(r => r.nome === nome || r.nome?.replace(/O/g,"0") === nome);
                      return (
                        <div key={nome + idx}
                          onClick={() => toggleSelect(nome)}
                          title={`${isSel ? "Clique para remover da seleção" : "Clique para selecionar"}\n${lastSeen ? `Último sinal: ${new Date(lastSeen).toLocaleString("pt-BR")}` : ""}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            background: isSel ? `${C.accent}20` : `${grp.cor}10`,
                            border: isSel ? `2px solid ${C.accent}` : `1px solid ${grp.cor}30`,
                            padding: "3px 9px", borderRadius: "5px", fontSize: "11px",
                            color: isSel ? C.accent : C.text, cursor: "pointer",
                            boxShadow: isSel ? `0 0 0 1px ${C.accent}40` : "none",
                            transition: "all 0.12s",
                          }}
                          onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = `${grp.cor}80`; }}
                          onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = `${grp.cor}30`; }}
                        >
                          {/* Indicador de seleção */}
                          {isSel
                            ? <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: C.accent, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 900, flexShrink: 0 }}>✓</span>
                            : <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: grp.cor, flexShrink: 0 }} />
                          }
                          {/* Nome com link para túnel (stopPropagation para não desselecionar) */}
                          {uuid
                            ? <a href={`https://${uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{ color: isSel ? C.accent : C.accent, textDecoration: "none", fontWeight: isSel ? 700 : 400 }}>{nome}</a>
                            : <span style={{ fontWeight: isSel ? 700 : 400 }}>{nome}</span>}
                          {/* Info adicional */}
                          {minutos !== undefined && <span style={{ fontSize: "9px", color: C.textMuted }}>({minutos}min)</span>}
                          {devData?.diffCount > 0 && <span style={{ fontSize: "9px", color: "#f59e0b" }}>⚠️{devData.diffCount}</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: C.textMuted, fontStyle: "italic" }}>
                    {loadingHB ? "Carregando dados..." : "Nenhum equipamento nesta categoria"}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ─── CAMPOS DE ENVIO (REST API Client — Câmera → AxHub) ─── */}
      <div style={{ marginTop: "20px", fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>
        📤 Campos de Envio — REST API Client (Câmera ITScam 450 → AxHub/AxCross)
      </div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ padding: "10px 14px", background: C.raised, fontSize: "11px", color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>
          O ITScam 450 envia passagens via <strong style={{ color: C.accent }}>HTTP POST</strong> para o AxHub usando o REST API Client configurado no firmware.
          O payload JSON inclui os campos abaixo. Cada faixa (lane) gera um envio separado com o <code>numeroFaixa</code> correspondente.
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: C.tableHeader }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: C.textSecondary, fontWeight: 600 }}>Campo Enviado</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: C.textSecondary, fontWeight: 600 }}>Tipo</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: C.textSecondary, fontWeight: 600 }}>Exemplo</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: C.textSecondary, fontWeight: 600 }}>Descrição</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: C.textSecondary, fontWeight: 600 }}>Obrig.</th>
            </tr>
          </thead>
          <tbody>
            {[
              { campo: "cameraId", tipo: "string", exemplo: "GOEC60001", desc: "Identificador único da câmera — mesmo código usado no AxHub (campo Descricao/NumeroSerie)", obrig: true },
              { campo: "numeroFaixa", tipo: "integer", exemplo: "1", desc: "Número da faixa monitorada (1, 2, 3...). Uma câmera com 2 faixas envia 2 payloads distintos.", obrig: true },
              { campo: "plate", tipo: "string", exemplo: "ABC1D23", desc: "Placa lida pelo OCR do ITScam (formato Mercosul ou padrão antigo)", obrig: true },
              { campo: "vehicleType", tipo: "string", exemplo: "car", desc: "Tipo de veículo classificado pela IA: car, truck, bus, motorcycle, all", obrig: false },
              { campo: "speed", tipo: "number", exemplo: "72.5", desc: "Velocidade medida em km/h pelo radar/laço indutivo do equipamento", obrig: false },
              { campo: "timestamp", tipo: "ISO 8601", exemplo: "2026-07-26T14:30:22Z", desc: "Data e hora da passagem em UTC, com precisão de segundos", obrig: true },
              { campo: "imagens", tipo: "array[string]", exemplo: '["GOEC60001-1-ABC1D23-1753538400.jpg"]', desc: "Lista de nomes das imagens vinculadas. Padrão: cameraId-faixa-placa-timestamp.jpg. As imagens são enviadas via FTP separadamente.", obrig: false },
              { campo: "confidence", tipo: "number", exemplo: "0.94", desc: "Confiança do OCR na leitura da placa (0.0 a 1.0). Abaixo de 0.6 vai para triagem manual no AxHub.", obrig: false },
              { campo: "triggerType", tipo: "string", exemplo: "loop", desc: "Tipo de trigger que disparou a captura: loop (laço indutivo) ou freeflow (contínuo)", obrig: false },
            ].map((row, i) => (
              <tr key={row.campo} style={{ borderTop: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "transparent" : C.codeBg }}>
                <td style={{ padding: "7px 12px", fontFamily: "monospace", fontWeight: 600, color: C.accent }}>{row.campo}</td>
                <td style={{ padding: "7px 12px", fontSize: "11px", color: C.textMuted }}>{row.tipo}</td>
                <td style={{ padding: "7px 12px", fontFamily: "monospace", fontSize: "11px", color: C.success }}>{row.exemplo}</td>
                <td style={{ padding: "7px 12px", fontSize: "11px", color: C.textSecondary }}>{row.desc}</td>
                <td style={{ padding: "7px 12px", textAlign: "center" }}>{row.obrig ? "✅" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Exemplo de payload completo */}
        <div style={{ padding: "10px 14px", background: "#0d1117", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "10px", color: C.textMuted, marginBottom: "5px" }}>📋 Exemplo de payload completo enviado pelo ITScam (Faixa 1):</div>
          <code style={{ display: "block", fontSize: "11px", color: "#c9d1d9", lineHeight: "1.6" }}>
            {`{
  "cameraId": "GOEC60001",
  "numeroFaixa": 1,
  "plate": "ABC1D23",
  "vehicleType": "car",
  "speed": 72.5,
  "timestamp": "2026-07-26T14:30:22Z",
  "confidence": 0.94,
  "triggerType": "loop",
  "imagens": ["GOEC60001-1-ABC1D23-1753538400.jpg"]
}`}
          </code>
        </div>
      </div>

      {/* ─── CAMPOS DE RECEPÇÃO NO AXHUB ─── */}
      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>
        📥 Campos de Recepção — AxHub (TBPassagens — SQL Server)
      </div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ padding: "10px 14px", background: C.raised, fontSize: "11px", color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>
          Quando o AxHub recebe o payload da câmera via API, ele insere os dados na tabela <code style={{ color: C.accent }}>TBPassagens</code>.
          O heartbeat é atualizado em <code style={{ color: C.accent }}>TBHeartbeatEquipamentos</code> a cada recebimento.
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: C.tableHeader }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: C.textSecondary }}>Campo (TBPassagens)</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: C.textSecondary }}>Origem (payload)</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: C.textSecondary }}>Tipo SQL</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: C.textSecondary }}>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {[
              { campo: "IdPassagem", origem: "(auto-incremento)", tipo: "INT PK", desc: "Chave primária gerada pelo AxHub no INSERT" },
              { campo: "DataHoraPassagem", origem: "timestamp", tipo: "DATETIME", desc: "Data/hora da passagem enviada pelo equipamento (horário do evento)" },
              { campo: "Placa", origem: "plate", tipo: "VARCHAR(10)", desc: "Placa reconhecida pelo OCR do ITScam" },
              { campo: "Velocidade", origem: "speed", tipo: "DECIMAL(5,2)", desc: "Velocidade medida em km/h" },
              { campo: "IdEquipamento", origem: "cameraId → lookup", tipo: "INT FK", desc: "FK para TBEquipamentos — AxHub faz lookup pelo cameraId para encontrar o IdEquipamento" },
              { campo: "IdLocal", origem: "via TBEquipamentos", tipo: "INT FK", desc: "Local da passagem, herdado da operação do equipamento" },
              { campo: "IdFaixa", origem: "numeroFaixa → lookup", tipo: "INT FK", desc: "FK para TBFaixas — a faixa é identificada pelo numeroFaixa do payload" },
              { campo: "Confianca", origem: "confidence", tipo: "DECIMAL(3,2)", desc: "Confiança do OCR (0.0 a 1.0) — abaixo de 0.6 vai para triagem" },
              { campo: "TipoVeiculo", origem: "vehicleType", tipo: "VARCHAR(20)", desc: "Classificação do veículo pelo IA do ITScam" },
              { campo: "NomeImagem", origem: "imagens[0]", tipo: "VARCHAR(200)", desc: "Nome do arquivo de imagem da placa (enviado via FTP separadamente)" },
              { campo: "DataHoraImportacao", origem: "(gerado AxHub)", tipo: "DATETIME", desc: "Timestamp gerado pelo AxHub no momento do INSERT — GETDATE()" },
            ].map((row, i) => (
              <tr key={row.campo} style={{ borderTop: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "transparent" : C.codeBg }}>
                <td style={{ padding: "7px 12px", fontFamily: "monospace", fontWeight: 600, color: C.warning }}>{row.campo}</td>
                <td style={{ padding: "7px 12px", fontFamily: "monospace", fontSize: "11px", color: C.accent }}>{row.origem}</td>
                <td style={{ padding: "7px 12px", fontSize: "11px", color: C.textMuted }}>{row.tipo}</td>
                <td style={{ padding: "7px 12px", fontSize: "11px", color: C.textSecondary }}>{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* TBHeartbeatEquipamentos */}
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, background: "rgba(245,158,11,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: C.warning, marginBottom: "6px" }}>🫀 TBHeartbeatEquipamentos — Tabela de Heartbeat</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: "11px" }}>
            {[
              { campo: "IdEquipamento", tipo: "INT FK", desc: "Equipamento que enviou o sinal" },
              { campo: "DataHora", tipo: "DATETIME", desc: "Timestamp do último sinal recebido (= última passagem)" },
              { campo: "Status", tipo: "VARCHAR", desc: "online (<5min) / atencao (5-15min) / offline (>15min)" },
            ].map(r => (
              <div key={r.campo} style={{ background: C.codeBg, borderRadius: "5px", padding: "7px 10px" }}>
                <div style={{ fontFamily: "monospace", fontWeight: 600, color: C.warning, fontSize: "11px" }}>{r.campo}</div>
                <div style={{ fontSize: "9px", color: C.textMuted, marginTop: "2px" }}>{r.tipo}</div>
                <div style={{ fontSize: "10px", color: C.textSecondary, marginTop: "3px" }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── ONDE VERIFICAR NOS SISTEMAS ─── */}
      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>
        🔍 Onde Verificar nos Sistemas — AxHub · AxCross · VARCO · Painel AxionIA
      </div>
      <div style={{ fontSize: "11px", color: C.textMuted, marginBottom: "12px" }}>
        Guia completo de telas e campos em cada sistema para validar passagens, heartbeat e status de integração da câmera.
      </div>

      {/* Bloco AxHub */}
      <SistemaBloco sistema="AxHub" cor="#3b82f6" icone="🚦" baseUrl="https://economia.axhub.axion.ws" itens={[
        {
          badge: "AXH-01",
          tela: "Operações → Monitoramento Online",
          path: "/operacoesonline/monitoring",
          descricao: "Mapa ao vivo com heartbeat e últimas passagens por equipamento. Ponto verde = recebendo passagens. Ponto vermelho = sem comunicação. Clique no equipamento para ver detalhes.",
          campos: ["Status Online/Offline (cor do ponto)", "Última Passagem (DataHoraPassagem)", "Placa da última passagem", "Velocidade (última medida)", "Faixa monitorada"],
        },
        {
          badge: "AXH-02",
          tela: "Relatório → Mapa de Teste de Equipamentos",
          path: "/relatorio/relatoriomapadeteste",
          descricao: "Heatmap por hora × dia do mês. Verde = passagem registrada naquela hora. Vermelho = sem passagem. Permite identificar EXATAMENTE quando o equipamento parou de enviar dados e avaliar a consistência ao longo do mês.",
          campos: ["Grade hora × dia do mês", "Cor verde = passagem recebida", "Cor vermelha = sem passagem", "Filtros: Grupo, Equipamento, Mês/Ano", "Identificação de falhas por período"],
          destaque: true,
          destaqueLabel: "✨ Imagens da análise",
        },
        {
          badge: "AXH-03",
          tela: "Dashboard Principal",
          path: "/dashboard",
          descricao: "KPIs de passagens e infrações do dia. Permite ver total de passagens registradas e identificar equipamentos com volume zerado ou abaixo do esperado.",
          campos: ["Total Passagens Hoje", "Total Infrações", "Equipamentos Ativos", "Gráfico de volume por hora"],
        },
        {
          badge: "AXH-04",
          tela: "Equipamentos → Lista de Equipamentos → Detalhe",
          path: "/equipment/list",
          descricao: "Ficha do equipamento com último heartbeat registrado via TBHeartbeatEquipamentos, serial, tipo, fabricante e histórico de operações.",
          campos: ["UltimoHeartbeat (timestamp)", "MinutosSemComunicacao", "Status (online/atencao/offline)", "Serial do equipamento", "Tipo (TipoEquipamento)", "Fabricante"],
        },
        {
          badge: "AXH-05",
          tela: "Infrações → Triagem",
          path: "/infracoes/triagem",
          descricao: "Infrações aguardando validação do operador. Se o equipamento não está enviando passagens, a fila de triagem fica vazia — sinal claro de falha na integração.",
          campos: ["Fila de infrações pendentes", "Placa", "DataHoraInfracao", "Velocidade Medida vs Regulamentada", "Imagens da câmera"],
        },
      ]} />

      {/* Bloco AxCross */}
      <SistemaBloco sistema="AxCross" cor="#10b981" icone="📡" baseUrl="https://economia.axcross.axion.ws" itens={[
        {
          badge: "AXC-01",
          tela: "Monitoramento Online → Mapa de Equipamentos",
          path: "/monitoringonline/monitoring/equipmentmap",
          descricao: "Mapa em tempo real dos equipamentos AxCross. Atualizado via SignalR (PassageHub). Cada passagem recebida atualiza o heartbeat do equipamento no mapa.",
          campos: ["Status Online/Offline", "Última Passagem (DataHora)", "Placa (última)", "ClassificacaoVeiculo", "Local", "Faixa"],
        },
        {
          badge: "AXC-02",
          tela: "Relatórios → Passagens",
          path: "/reports/reports/passages",
          descricao: "Relatório completo com filtros por equipamento, placa, data/hora e classificação. Permite confirmar recebimento de cada passagem e exportar para análise.",
          campos: ["Placa", "DataHora", "Equipamento", "Local", "Velocidade", "ClassificacaoVeiculo", "Faixa", "Sentido"],
        },
        {
          badge: "AXC-03",
          tela: "Equipamentos → Lista",
          path: "/equipment",
          descricao: "Cadastro dos equipamentos AxCross. Confirmar se o equipamento está cadastrado e associado ao local correto. Equipamentos não cadastrados não recebem passagens.",
          campos: ["Equipamento (cameraId → lookup)", "Local (Área)", "Faixas configuradas", "Status ativo/inativo", "Grupos"],
        },
      ]} />

      {/* Bloco VARCO Cloud */}
      <SistemaBloco sistema="VARCO Cloud" cor="#8b5cf6" icone="🌐" baseUrl="https://varco.io" itens={[
        {
          badge: "VRC-01",
          tela: "Dashboard → Dispositivos (varco.io)",
          path: "/dashboard",
          descricao: "Painel principal do VARCO Cloud. Lista todos os dispositivos cadastrados com status de conexão em tempo real. 'Connected' = túnel ativo, heartbeat chegando. 'Disconnected' = câmera offline.",
          campos: ["Nome do dispositivo (GOEC6O001...)", "Status Connected/Disconnected", "Último heartbeat (lastSeen)", "UUID do dispositivo", "IP externo do equipamento"],
        },
        {
          badge: "VRC-02",
          tela: "Dispositivo → Acesso Remoto (UUID Tunnel)",
          path: "/{uuid}-80.tunnel.varco.cloud",
          descricao: "Acesso direto à interface web do equipamento ITScam via túnel VARCO. Permite verificar configurações em tempo real: OCR, Classificador, FTP, Perfis de imagem, REST API Client.",
          campos: ["OCR (Equipamento → Reconhecimento)", "Classificador (aba Classifier)", "VARCO (Sistema → Manutenção → Acesso Remoto)", "FTP (Equipamento → Servidores)", "REST API Client (Equipamento → Servidores → REST API)", "Perfis Imagem (Imagem → Perfis)"],
          credenciais: "Login: Admin | Senha: #econocr@",
        },
        {
          badge: "VRC-03",
          tela: "Dispositivo → REST API Client (config de envio)",
          path: "/{uuid}-80.tunnel.varco.cloud/equipment/servers",
          descricao: "Configuração do servidor de destino das passagens. O REST API Client define para onde a câmera envia os dados: URL do AxHub, método HTTP, campos do payload. Se incorreto, as passagens não chegam ao AxHub.",
          campos: ["URL destino (AxHub endpoint)", "Método HTTP (POST)", "Headers (Content-Type)", "Campos mapeados no payload", "Status habilitado/desabilitado", "Teste de envio manual"],
          credenciais: "Login: Admin | Senha: #econocr@",
        },
        {
          badge: "VRC-04",
          tela: "Dispositivo → Logs de Envio",
          path: "/{uuid}-80.tunnel.varco.cloud/system/logs",
          descricao: "Logs do firmware ITScam. Registra tentativas de envio ao AxHub, erros de conexão, respostas HTTP (201 OK / 4xx / 5xx). Essencial para diagnosticar falhas de integração.",
          campos: ["Timestamp do envio", "URL de destino chamada", "HTTP Status Code retornado", "Mensagem de erro (se houver)", "Dados enviados no payload"],
          credenciais: "Login: Admin | Senha: #econocr@",
        },
      ]} />

      {/* Bloco AxionIA Painel */}
      <SistemaBloco sistema="Painel AxionIA" cor="#f59e0b" icone="🧠" baseUrl="http://localhost:3017" itens={[
        {
          badge: "PAI-01",
          tela: "VARCO Monitor → Passagens & Heartbeat (esta tela)",
          path: "/varco-monitor",
          descricao: "Esta aba agrupa os equipamentos por status de heartbeat (HB-01 a HB-05) e exibe as últimas passagens recebidas do AxHub. Permite identificar em um único lugar quais câmeras estão com problema.",
          campos: ["Grupos HB-01 a HB-05 (heartbeat por status)", "Campos de Envio REST API Client", "Campos de Recepção (TBPassagens)", "Últimas passagens ao vivo (AxHub)"],
        },
        {
          badge: "PAI-02",
          tela: "VARCO Monitor → Auditoria — Conformidade da Frota",
          path: "/varco-monitor",
          descricao: "Análise de conformidade de todos os 72 equipamentos via consenso por maioria. Identifica parâmetros divergentes (OCR, Classifier, FTP, Perfis) que podem causar falha no registro de passagens.",
          campos: ["Parâmetros conformes vs divergentes", "Grupos de variação nomeados", "Severidade por parâmetro (Crítico/Alto/Médio)", "Botão 'Aplicar Correção' via API REST"],
        },
        {
          badge: "PAI-03",
          tela: "VARCO Monitor → Grupos de Variação",
          path: "/varco-monitor",
          descricao: "Equipamentos com o mesmo conjunto de divergências aparecem no mesmo grupo. Cada grupo tem nome descritivo e operação em execução. Permite correção em lote de todos do grupo.",
          campos: ["Nome do grupo (ex: Perfil de Imagem Diurno)", "Operação em execução", "Equipamentos do grupo", "Parâmetros divergentes com valor atual vs correto", "Script de correção do grupo"],
        },
        {
          badge: "PAI-04",
          tela: "VARCO Monitor → Inventário — Todos os Equipamentos",
          path: "/varco-monitor",
          descricao: "Tabela completa com todos os 72+ equipamentos, status online/offline VARCO Cloud, conformidade de configuração e link direto para o túnel de cada câmera.",
          campos: ["Status VARCO Cloud (● verde/vermelho)", "Conformidade (✅ / ⚠️ N erros)", "Número de divergências por equipamento", "Link para túnel VARCO", "Detalhamento dos parâmetros divergentes"],
        },
        {
          badge: "PAI-05",
          tela: "Central de Sites → Guia do Site ECONOMIA",
          path: "/central-sites",
          descricao: "Visão consolidada do site ECONOMIA (GO): equipamentos cadastrados, OCR médio, versão do AxHub, chamados em aberto e health score. Referência rápida para contexto do cliente.",
          campos: ["Health Score do site", "Total equipamentos", "OCR médio da frota", "Versão AxHub", "Chamados abertos", "Observações operacionais"],
        },
      ]} />

      {/* Legenda de acesso rápido */}
      <div style={{ marginTop: "4px", marginBottom: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
        {[
          { label: "AxHub (ECONOMIA)", url: "https://economia.axhub.axion.ws", cor: "#3b82f6" },
          { label: "AxCross (ECONOMIA)", url: "https://economia.axcross.axion.ws", cor: "#10b981" },
          { label: "VARCO Cloud", url: "https://varco.io", cor: "#8b5cf6" },
          { label: "VARCO Monitor (Painel)", url: "http://localhost:3017/varco-monitor", cor: "#f59e0b" },
        ].map(s => (
          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: `${s.cor}10`, border: `1px solid ${s.cor}40`, borderRadius: "6px", textDecoration: "none", color: s.cor, fontSize: "11px", fontWeight: 600 }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.cor, flexShrink: 0 }} />
            {s.label} ↗
          </a>
        ))}
      </div>

      {/* Últimas passagens do AxHub */}
      {passagensAxHub?.passagens?.length > 0 && (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", background: C.raised, fontSize: "12px", fontWeight: 600, color: C.text, borderBottom: `1px solid ${C.border}` }}>
            🔴 Últimas {passagensAxHub.passagens.length} Passagens Recebidas — AxHub (Ao Vivo)
          </div>
          <div style={{ overflowX: "auto", maxHeight: "300px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead style={{ position: "sticky", top: 0 }}>
                <tr style={{ background: C.tableHeader }}>
                  {["#", "Data/Hora", "Placa", "Velocidade", "Equipamento", "Faixa", "Local"].map(h => (
                    <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: C.textSecondary, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {passagensAxHub.passagens.map((p, i) => (
                  <tr key={p.IdPassagem} style={{ borderTop: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "transparent" : C.codeBg }}>
                    <td style={{ padding: "5px 10px", color: C.textMuted }}>{i + 1}</td>
                    <td style={{ padding: "5px 10px", fontFamily: "monospace", color: C.text }}>{p.DataHoraPassagem ? new Date(p.DataHoraPassagem).toLocaleString("pt-BR") : "—"}</td>
                    <td style={{ padding: "5px 10px", fontWeight: 600, color: C.accent }}>{p.Placa || "—"}</td>
                    <td style={{ padding: "5px 10px", color: C.textSecondary }}>{p.Velocidade != null ? `${p.Velocidade} km/h` : "—"}</td>
                    <td style={{ padding: "5px 10px", color: C.text }}>{p.Equipamento || "—"}</td>
                    <td style={{ padding: "5px 10px", color: C.textMuted }}>{p.Faixa || "—"}</td>
                    <td style={{ padding: "5px 10px", color: C.textMuted, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.Local || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(loadingHB || loadingPass) && (
        <div style={{ padding: "16px", textAlign: "center", color: C.textMuted, fontSize: "12px" }}>
          <RefreshCw size={14} className="spin" style={{ marginRight: "6px" }} />
          Carregando dados de heartbeat e passagens...
        </div>
      )}
    </div>
  );
}

function InventarioTab({ results, filter, setFilter, statusFilter, setStatusFilter, expandedDevice, setExpandedDevice, liveDevices }) {
  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
          <Search size={13} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar..."
            style={{ width: "100%", padding: "7px 7px 7px 28px", border: `1px solid ${C.border}`, borderRadius: "5px", fontSize: "12px", background: C.surface, color: C.text }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: "5px", fontSize: "12px", background: C.surface, color: C.text }}>
          <option value="all">Todos</option><option value="conforme">Conformes</option><option value="divergente">Divergentes</option>
        </select>
      </div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", maxHeight: "60vh", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
            <tr style={{ background: C.raised }}>
              <th style={{ padding: "7px 8px", textAlign: "left", color: C.textSecondary }}>#</th>
              <th style={{ padding: "7px 8px", textAlign: "left", color: C.textSecondary }}>Equipamento</th>
              <th style={{ padding: "7px 8px", textAlign: "center", color: C.textSecondary }}>🟢</th>
              <th style={{ padding: "7px 8px", textAlign: "center", color: C.textSecondary }}>Use Configuração</th>
              <th style={{ padding: "7px 8px", textAlign: "center", color: C.textSecondary }}>Erros</th>
              <th style={{ padding: "7px 8px", textAlign: "left", color: C.textSecondary }}>Túnel</th>
            </tr>
          </thead>
          <tbody>
            {results.map((d, i) => {
              const live = liveDevices.find(l => l.name === d.nome);
              const isExp = expandedDevice === d.nome;
              return (
                <React.Fragment key={d.nome}>
                  <tr onClick={() => setExpandedDevice(isExp ? null : d.nome)} style={{ borderTop: `1px solid ${C.borderLight}`, cursor: d.conforme ? "default" : "pointer", background: isExp ? C.raised : "" }}>
                    <td style={{ padding: "5px 8px", color: C.textMuted }}>{i + 1}</td>
                    <td style={{ padding: "5px 8px", fontWeight: 500, color: C.text }}><TunnelLink nome={d.nome} uuid={d.uuid} /></td>
                    <td style={{ padding: "5px 8px", textAlign: "center" }}>
                      {live && <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: live.connected ? C.success : C.danger }} />}
                    </td>
                    <td style={{ padding: "5px 8px", textAlign: "center" }}>
                      {d.conforme
                        ? <span style={{ color: C.success, fontSize: "11px" }}>✅</span>
                        : <span style={{ background: C.warningBg, color: C.warning, padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 600 }}>⚠️ {d.diffCount}</span>}
                    </td>
                    <td style={{ padding: "5px 8px", textAlign: "center", color: C.textMuted }}>{d.diffCount || "—"}</td>
                    <td style={{ padding: "5px 8px" }}>
                      {d.uuid && <a href={`https://${d.uuid}-80.tunnel.varco.cloud`} target="_blank" rel="noreferrer" style={{ color: C.accent, fontSize: "10px" }}><ExternalLink size={10} /></a>}
                    </td>
                  </tr>
                  {isExp && !d.conforme && (
                    <tr><td colSpan={6} style={{ padding: "4px 8px 8px", background: C.surface }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                        <thead><tr style={{ background: C.tableHeader }}><th style={{ padding: "4px 6px", textAlign: "left", color: C.textSecondary }}>Parâmetro</th><th style={{ padding: "4px 6px", color: C.textSecondary }}>Atual</th><th style={{ padding: "4px 6px", color: C.textSecondary }}>Correto</th></tr></thead>
                        <tbody>
                          {Object.entries(d.diffs).map(([key, { atual, correto }]) => (
                            <tr key={key} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                              <td style={{ padding: "3px 6px" }}><code>{key}</code></td>
                              <td style={{ padding: "3px 6px" }} className="wrong">{atual == null ? "null" : String(atual)}</td>
                              <td style={{ padding: "3px 6px" }} className="correct">{String(correto)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PADRÃO TAB — Análise vs Config Padrão (26 regras, severidade, REST API Client)
// ═══════════════════════════════════════════════════════════════════════
function PadraoTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSev, setFilterSev] = useState("all");
  const [expandedDev, setExpandedDev] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/varco/auditoria-aprimorada`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: "30px", textAlign: "center", color: C.textMuted }}>Carregando Análise aprimorada...</div>;
  if (error) return <div style={{ padding: "14px", background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "8px", color: C.danger }}>Erro: {error}. Execute: <code>node auditoria-itscam/analise-aprimorada.mjs</code></div>;
  if (!data) return null;

  const { resumo, topDivergencias, dispositivos, totalRegras, geradoEm } = data;
  const sevColors = {
    critico: { bg: "rgba(255,0,60,0.08)", border: "rgba(255,0,60,0.25)", text: "#ff4d6a", badge: "🔴" },
    alto: { bg: C.dangerBg, border: C.dangerBorder, text: C.danger, badge: "🟠" },
    medio: { bg: C.warningBg, border: C.warningBorder, text: C.warning, badge: "🟡" },
    baixo: { bg: "rgba(255,255,255,0.04)", border: C.border, text: C.textMuted, badge: "🔵" },
  };

  const divergentes = dispositivos.filter(d => d.status === 'online' && d.divergencias?.length > 0);
  const filtrados = filterSev === "all" ? divergentes : divergentes.filter(d => d.divergencias.some(div => div.severidade === filterSev));

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "14px" }}>
        <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: C.success }}>{resumo.conformes}</div>
          <div style={{ fontSize: "10px", color: C.textMuted }}>CONFORMES</div>
        </div>
        <div style={{ background: C.warningBg, border: `1px solid ${C.warningBorder}`, borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: C.warning }}>{resumo.divergentes}</div>
          <div style={{ fontSize: "10px", color: C.textMuted }}>DIVERGENTES</div>
        </div>
        <div style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: C.danger }}>{resumo.offline}</div>
          <div style={{ fontSize: "10px", color: C.textMuted }}>OFFLINE</div>
        </div>
        <div style={{ background: "rgba(255,0,60,0.06)", border: "1px solid rgba(255,0,60,0.2)", borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#ff4d6a" }}>{resumo.porSeveridade?.critico || 0}</div>
          <div style={{ fontSize: "10px", color: C.textMuted }}>CRÍTICOS</div>
        </div>
      </div>

      {/* Info bar */}
      <div style={{ padding: "8px 12px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: "6px", marginBottom: "12px", fontSize: "12px", color: C.textSecondary, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>📏 {totalRegras} regras de validação vs config padrão | Gerado: {new Date(geradoEm).toLocaleString("pt-BR")}</span>
        <span style={{ fontSize: "11px", color: C.textMuted }}>Use Configuração <code>config-padrao/padrao-faixa-*.json</code></span>
      </div>

      {/* Top divergences */}
      {topDivergencias?.length > 0 && (
        <div style={{ marginBottom: "14px", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.textSecondary, marginBottom: "6px" }}>Top Divergências</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {topDivergencias.map(t => (
              <span key={t.id} style={{ padding: "3px 8px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "11px", color: C.textSecondary }}>
                <strong style={{ color: C.warning }}>{t.count}x</strong> {t.titulo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Severity filter */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
        {[{ id: "all", label: "Todos" }, { id: "critico", label: "🔴 Crítico" }, { id: "alto", label: "🟠 Alto" }, { id: "medio", label: "🟡 Médio" }, { id: "baixo", label: "🔵 Baixo" }].map(s => (
          <button key={s.id} onClick={() => setFilterSev(s.id)} style={{ padding: "4px 10px", border: `1px solid ${filterSev === s.id ? C.accent : C.border}`, borderRadius: "4px", background: filterSev === s.id ? C.accentBg : "transparent", color: filterSev === s.id ? C.accent : C.textMuted, cursor: "pointer", fontSize: "11px" }}>
            {s.label} {s.id !== "all" && `(${resumo.porSeveridade?.[s.id] || 0})`}
          </button>
        ))}
      </div>

      {/* Device list */}
      <div style={{ maxHeight: "500px", overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: "8px" }}>
        {filtrados.map(dev => (
          <div key={dev.uuid || dev.nome} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
            <div onClick={() => setExpandedDev(expandedDev === dev.nome ? null : dev.nome)} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 30px", alignItems: "center", padding: "8px 12px", cursor: "pointer", background: expandedDev === dev.nome ? C.raised : "transparent" }}>
              <div>
                <TunnelLink nome={dev.nome} uuid={dev.uuid} style={{ fontWeight: 500, fontSize: "13px" }} />
                <span style={{ marginLeft: "8px", fontSize: "11px", color: C.textMuted }}>{dev.firmware}</span>
                {dev.usuarios && <span style={{ marginLeft: "6px", fontSize: "10px", color: C.accent }}>👤 {dev.usuarios.total}</span>}
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: C.success }}>{dev.conformes}</span>
                <span style={{ fontSize: "11px", color: C.textMuted }}>/</span>
                <span style={{ fontSize: "11px", color: C.textMuted }}>{dev.totalRegras}</span>
              </div>
              <div style={{ textAlign: "center" }}>
                {dev.divergencias.map(d => sevColors[d.severidade]?.badge || "⚪").slice(0, 5).join("")}
              </div>
              <div style={{ textAlign: "right", color: C.textMuted }}>{expandedDev === dev.nome ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</div>
            </div>

            {expandedDev === dev.nome && (
              <div style={{ padding: "8px 16px 12px", background: C.surface }}>
                {/* Usuarios */}
                {dev.usuarios?.usuarios && (
                  <div style={{ marginBottom: "8px", padding: "6px 10px", background: C.raised, borderRadius: "6px", fontSize: "11px" }}>
                    <strong style={{ color: C.accent }}>👤 Usuários configurados:</strong>{" "}
                    {dev.usuarios.usuarios.map(u => (
                      <span key={u.username} style={{ marginLeft: "6px", padding: "1px 5px", background: C.codeBg, borderRadius: "3px", color: u.role === "admin" ? C.warning : C.textSecondary }}>
                        {u.username} ({u.role})
                      </span>
                    ))}
                  </div>
                )}
                {/* REST API Client */}
                {dev.restApiClient?.status === "coletado" && (
                  <div style={{ marginBottom: "8px", padding: "6px 10px", background: C.raised, borderRadius: "6px", fontSize: "11px" }}>
                    <strong style={{ color: C.success }}>📡 REST API Client:</strong> Configurado
                  </div>
                )}
                {/* Logs alteração */}
                {dev.logsAlteracao?.alteracoesRecentes?.length > 0 && (
                  <div style={{ marginBottom: "8px", padding: "6px 10px", background: C.raised, borderRadius: "6px", fontSize: "11px" }}>
                    <strong style={{ color: C.warning }}>📝 Últimas alterações:</strong>
                    {dev.logsAlteracao.alteracoesRecentes.slice(0, 3).map((a, i) => (
                      <div key={i} style={{ marginTop: "3px", paddingLeft: "12px", color: C.textMuted }}>
                        {a.timestamp} — <span style={{ color: C.accent }}>{a.usuario}</span>: {a.mensagem?.slice(0, 80)}
                      </div>
                    ))}
                  </div>
                )}
                {/* Divergences table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                  <thead>
                    <tr style={{ background: C.tableHeader }}>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Sev</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Regra</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Menu</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Atual</th>
                      <th style={{ textAlign: "left", padding: "4px 8px" }}>Esperado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dev.divergencias.filter(d => filterSev === "all" || d.severidade === filterSev).map((div, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                        <td style={{ padding: "3px 8px" }}>{sevColors[div.severidade]?.badge}</td>
                        <td style={{ padding: "3px 8px", color: C.textSecondary }}>{div.titulo}</td>
                        <td style={{ padding: "3px 8px", color: C.textMuted, fontSize: "10px" }}>{div.menu}</td>
                        <td style={{ padding: "3px 8px" }} className="wrong">{div.erros?.length ? div.erros.map(e => `P${e.perfil}:${e.atual}`).join(", ") : String(div.atual ?? "null")}</td>
                        <td style={{ padding: "3px 8px" }} className="correct">{String(div.esperado ?? "—")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* REST API Client Template Reference */}
      <div style={{ marginTop: "14px", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: C.textSecondary, marginBottom: "6px" }}>📡 REST API Client — Template Padrão</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div style={{ padding: "6px 10px", background: C.codeBg, borderRadius: "4px", fontSize: "10px", fontFamily: "monospace", color: C.textSecondary }}>
            <div style={{ color: C.accent, marginBottom: "3px" }}>Faixa 1:</div>
            {`{ cameraId, numeroFaixa: 1, vehicleType, plate, imagens: [cameraId-1-plate-timestamp.jpg] }`}
          </div>
          <div style={{ padding: "6px 10px", background: C.codeBg, borderRadius: "4px", fontSize: "10px", fontFamily: "monospace", color: C.textSecondary }}>
            <div style={{ color: C.accent, marginBottom: "3px" }}>Faixa 2:</div>
            {`{ cameraId, numeroFaixa: 2, vehicleType, plate, imagens: [cameraId-2-plate-timestamp.jpg] }`}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComandosTab({ groups }) {
  const [copied, setCopied] = useState(null);
  const copy = (cmd, id) => { navigator.clipboard.writeText(cmd); setCopied(id); setTimeout(() => setCopied(null), 2000); };

  const cmds = groups.map((group, i) => {
    const diffs = Object.entries(group.diffs);
    const isVarcoOff = diffs.some(([k, v]) => k === "VARCO.enabled" && v.atual === null);
    const cases = new Set();
    diffs.forEach(([key]) => {
      const s = key.split(".")[0];
      if (s === "VARCO") cases.add("01");
      else if (s === "Diurno" || s === "Noturno") cases.add("03");
      else if (s === "OCR") {
        // Verificar se é VehicleType
        if (key.includes("vehicleType")) cases.add("VehicleType");
        else cases.add("04");
      }
      else if (s === "Classificador") cases.add("05");
      else if (s === "SnapshotCrop") cases.add("06");
      else if (s === "Video") cases.add("07");
      else if (["SNMP","Reboot","NTP","Timezone"].includes(s)) cases.add("08");
      else if (s === "IO") cases.add("02");
    });
    return { i: i + 1, devices: group.devices.map(d => d.nome), cases: [...cases].sort(), isVarcoOff, diffCount: diffs.length };
  });

  return (
    <div>
      <div style={{ background: C.accentBg, border: `1px solid rgba(74,158,255,0.25)`, borderRadius: "8px", padding: "12px", marginBottom: "14px", fontSize: "12px", color: C.accent }}>
        <strong>Scripts:</strong> <code>corrigir.mjs</code> aplica correções via API REST (túnel VARCO). Cada caso corrige um tipo de parâmetro.
        <br/><strong>Novo:</strong> <code>corrigir-grupo.mjs</code> aplica múltiplos casos em um grupo de uma vez.
      </div>

      {cmds.map(cmd => (
        <div key={cmd.i} style={{ marginBottom: "12px", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: C.raised, borderBottom: `1px solid ${C.border}`, fontSize: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ color: C.text }}><strong>Grupo {cmd.i}</strong></span>
                <span style={{ marginLeft: "8px", color: C.textMuted }}>{cmd.devices.length} equips • {cmd.diffCount} correções • Casos: {cmd.cases.join(", ")}</span>
                {cmd.isVarcoOff && <span style={{ marginLeft: "8px", background: C.dangerBg, color: C.danger, padding: "1px 6px", borderRadius: "4px", fontSize: "10px", border: `1px solid ${C.dangerBorder}` }}>⚠️ Acesso local</span>}
              </div>
              <button onClick={() => copy(`node auditoria-itscam/corrigir-grupo.mjs --grupo=${cmd.i} --sim`, `grupo-cmd-${cmd.i}`)}
                title="Copiar comando para corrigir grupo inteiro"
                style={{ padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: "4px", background: copied === `grupo-cmd-${cmd.i}` ? C.successBg : C.raised, cursor: "pointer", fontSize: "10px", fontWeight: 600, color: copied === `grupo-cmd-${cmd.i}` ? C.success : C.accent }}>
                {copied === `grupo-cmd-${cmd.i}` ? '✓ Copiado' : '📋 Copiar Grupo'}
              </button>
            </div>
            <div style={{ marginTop: "4px", color: C.textMuted, fontSize: "11px" }}>{cmd.devices.join(" • ")}</div>
          </div>
          <div style={{ padding: "10px 14px", background: C.surface }}>
            {cmd.isVarcoOff ? (
              <div style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, padding: "8px", borderRadius: "5px", fontSize: "11px", color: C.danger, lineHeight: "1.7" }}>
                <strong>Requer acesso local:</strong><br/>
                1. Acessar via IP direto<br/>
                2. PUT /api/system/maintenance/remoteaccess → {`{"varco":{"enabled":true,"edgeServer":"edge.varco.io"}}`}<br/>
                3. Após VARCO reconectar, aplicar demais correções via túnel
              </div>
            ) : (
              cmd.cases.map(caso => {
                const isVehicleType = caso === "VehicleType";
                const cmdStr = isVehicleType
                  ? (cmd.devices.length === 1
                      ? `node auditoria-itscam/corrigir-vehicletype.mjs --equip="${cmd.devices[0]}" --sim`
                      : `node auditoria-itscam/corrigir-vehicletype.mjs --todos --sim`)
                  : (cmd.devices.length === 1
                      ? `node auditoria-itscam/corrigir.mjs --caso=${caso} --equip="${cmd.devices[0]}" --sim`
                      : `node auditoria-itscam/corrigir.mjs --caso=${caso} --todos --sim`);
                
                return (
                  <div key={caso} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                      {isVehicleType && <span style={{ background: C.dangerBg, color: C.danger, padding: "2px 6px", borderRadius: "3px", fontSize: "9px", fontWeight: 700, border: `1px solid ${C.dangerBorder}` }}>CRÍTICO</span>}
                      <code style={{ flex: 1, background: "#0d1117", color: "#c9d1d9", padding: "7px 10px", borderRadius: "5px", fontSize: "11px", overflow: "auto", border: `1px solid ${C.borderLight}` }}>{cmdStr}</code>
                    </div>
                    <button onClick={() => copy(cmdStr, `${cmd.i}-${caso}`)} style={{ padding: "5px", border: `1px solid ${C.border}`, borderRadius: "4px", background: copied === `${cmd.i}-${caso}` ? C.successBg : C.raised, cursor: "pointer" }}>
                      <Copy size={12} color={copied === `${cmd.i}-${caso}` ? C.success : C.textMuted} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}

      {/* Batch */}
      <div style={{ marginTop: "16px", border: `2px solid ${C.accent}`, borderRadius: "8px", padding: "14px", background: C.accentBg }}>
        <h4 style={{ margin: "0 0 8px", color: C.accent, fontSize: "13px" }}>🚀 Correção em Lote</h4>
        <div style={{ background: "#0d1117", padding: "10px", borderRadius: "6px", fontFamily: "monospace", fontSize: "11px", color: "#c9d1d9", lineHeight: "1.9", border: `1px solid ${C.borderLight}` }}>
          <div style={{ color: C.success }}># Validar (somente leitura)</div>
          <div>node auditoria-itscam/validar.mjs</div>
          <br/>
          <div style={{ color: C.success }}># Corrigir TODOS os grupos de uma vez</div>
          <div>node auditoria-itscam/corrigir-grupo.mjs --todos --sim</div>
          <br/>
          <div style={{ color: C.success }}># Corrigir por caso (todos Equipamentos</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=03 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=04 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=05 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=06 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=07 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=08 --todos --sim</div>
          <br/>
          <div style={{ color: C.danger }}># CRÍTICO: VehicleType (ignora motos/caminhões)</div>
          <div>node auditoria-itscam/corrigir-vehicletype.mjs --todos --sim</div>
          <br/>
          <div style={{ color: C.warning }}># Caso 01 — VARCO off (acesso local obrigatório)</div>
          <div style={{ color: C.textMuted }}># GOEC6O019-F1/F2, 023-F1, 049-F1/F2, 052-F1</div>
          <br/>
          <div style={{ color: C.success }}># Revalidar após correções</div>
          <div>node auditoria-itscam/validar.mjs</div>
          <div>node auditoria-itscam/recoletar-dados.mjs</div>
        </div>
      </div>

      {/* Scripts Disponíveis */}
      <div style={{ marginTop: "16px", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px", background: C.surface }}>
        <h4 style={{ margin: "0 0 8px", color: C.text, fontSize: "13px" }}>📜 Scripts Disponíveis</h4>
        <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
          <thead style={{ background: C.tableHeader }}>
            <tr>
              <th style={{ padding: "6px", textAlign: "left", color: C.textSecondary }}>Script</th>
              <th style={{ padding: "6px", textAlign: "left", color: C.textSecondary }}>Descrição</th>
              <th style={{ padding: "6px", textAlign: "center", color: C.textSecondary }}>Uso</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderTop: `1px solid ${C.borderLight}` }}>
              <td style={{ padding: "6px" }}><code>corrigir.mjs</code></td>
              <td style={{ padding: "6px", color: C.textMuted }}>Aplica casos específicos (01-08)</td>
              <td style={{ padding: "6px", textAlign: "center" }}><span style={{ background: C.successBg, color: C.success, padding: "2px 6px", borderRadius: "3px", fontSize: "10px" }}>✓ Implementado</span></td>
            </tr>
            <tr style={{ borderTop: `1px solid ${C.borderLight}` }}>
              <td style={{ padding: "6px" }}><code>corrigir-grupo.mjs</code></td>
              <td style={{ padding: "6px", color: C.textMuted }}>Corrige múltiplos casos por grupo</td>
              <td style={{ padding: "6px", textAlign: "center" }}><span style={{ background: C.successBg, color: C.success, padding: "2px 6px", borderRadius: "3px", fontSize: "10px" }}>✓ Novo</span></td>
            </tr>
            <tr style={{ borderTop: `1px solid ${C.borderLight}` }}>
              <td style={{ padding: "6px" }}><code>corrigir-vehicletype.mjs</code></td>
              <td style={{ padding: "6px", color: C.textMuted }}>Corrige VehicleType=1 → 3 (CRÍTICO)</td>
              <td style={{ padding: "6px", textAlign: "center" }}><span style={{ background: C.dangerBg, color: C.danger, padding: "2px 6px", borderRadius: "3px", fontSize: "10px" }}>✓ Novo</span></td>
            </tr>
            <tr style={{ borderTop: `1px solid ${C.borderLight}` }}>
              <td style={{ padding: "6px" }}><code>validar.mjs</code></td>
              <td style={{ padding: "6px", color: C.textMuted }}>válida Configurações (read-only)</td>
              <td style={{ padding: "6px", textAlign: "center" }}><span style={{ background: C.successBg, color: C.success, padding: "2px 6px", borderRadius: "3px", fontSize: "10px" }}>✓ Implementado</span></td>
            </tr>
            <tr style={{ borderTop: `1px solid ${C.borderLight}` }}>
              <td style={{ padding: "6px" }}><code>recoletar-dados.mjs</code></td>
              <td style={{ padding: "6px", color: C.textMuted }}>Atualiza Análise da frota</td>
              <td style={{ padding: "6px", textAlign: "center" }}><span style={{ background: C.successBg, color: C.success, padding: "2px 6px", borderRadius: "3px", fontSize: "10px" }}>✓ Implementado</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
