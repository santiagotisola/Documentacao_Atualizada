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

export default function VarcoMonitor() {
  const [liveDevices, setLiveDevices] = useState([]);
  const [auditDevices, setAuditDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("auditoria");
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
        headers: {
          "X-Admin-Token": "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3"
        }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRecoletaMsg({ tipo: "ok", texto: `Coleta concluída — ${data.resumo?.conformes || 0} conformes, ${data.resumo?.alterados || 0} alterados, ${data.resumo?.offline || 0} offline` });
        await fetchAll(); // Refresh panel data
      } else {
        setRecoletaMsg({ tipo: "erro", texto: data.erro || "Falha na recoleta" });
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
        fetch(`${API_BASE}/api/varco/frota`).catch(() => null),
        fetch(`${API_BASE}/api/varco/auditoria`).catch(() => null),
      ]);
      if (frotaRes?.ok) { const d = await frotaRes.json(); setLiveDevices(d.devices || []); }
      if (auditRes?.ok) { const d = await auditRes.json(); setAuditDevices(d.devices || []); }
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
            { id: "auditoria",  label: "Auditoria & Correções" },
            { id: "correcoes",  label: "Plano de Correção" },
            { id: "padrao",    label: "vs Padrão" },
            { id: "grupos",    label: "Grupos" },
            { id: "inventario",label: "Inventário" },
            { id: "comandos",  label: "Comandos" },
          ]}
          value={tab}
          onChange={setTab}
          color="#60cdff"
          label="Visão"
        />
      </div>

      {error && <div style={{ padding: "10px", background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "8px", color: C.danger, marginBottom: "12px", fontSize: "13px" }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>Carregando...</div>}

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
      headers: { "X-Admin-Token": "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3" }
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
        headers: { "Content-Type": "application/json", "X-Admin-Token": "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3" },
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
        headers: { "Content-Type": "application/json", "X-Admin-Token": "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3" },
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
          "X-Admin-Token": "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3"
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
          "X-Admin-Token": "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3"
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

function GruposTab({ groups, expandedGroup, setExpandedGroup }) {
  const [copied, setCopied] = useState(null);
  const copy = (cmd, id) => { navigator.clipboard.writeText(cmd); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  
  return (
    <div>
      <p style={{ fontSize: "12px", color: C.textMuted, marginBottom: "12px" }}>Dispositivos com <strong style={{ color: C.text }}>mesmas divergências</strong> agrupados — cada grupo corrigível com um único comando.</p>
      
      {/* Botão de correção em lote */}
      <div style={{ marginBottom: "14px", background: C.accentBg, border: `1px solid rgba(74,158,255,0.25)`, borderRadius: "8px", padding: "12px" }}>
        <div style={{ fontSize: "12px", color: C.accent, marginBottom: "6px" }}>
          <strong>🚀 Correção em Lote:</strong> Executa correções dos Casos 04, 05, 06, 07 e 08 em todos os equipamentos
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
        const cmdGrupo = `node auditoria-itscam/corrigir.mjs --todos --sim`;
        
        return (
          <div key={i} style={{ marginBottom: "10px", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: isExp ? C.accentBg : C.surface }}>
              <div onClick={() => setExpandedGroup(isExp ? null : i)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flex: 1 }}>
                <span style={{ background: C.accentBg, color: C.accent, padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: 700, border: `1px solid rgba(74,158,255,0.25)` }}>G{i + 1}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: C.text }}>{group.devices.length} equip(s)</span>
                <span style={{ fontSize: "12px", color: C.textMuted }}>• {diffs.length} diverg.</span>
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
