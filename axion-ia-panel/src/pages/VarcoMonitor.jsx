import React, { useState, useEffect, useMemo } from "react";
import { Radio, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Search, ChevronDown, ChevronUp, ExternalLink, Wrench, Eye, Copy, Terminal } from "lucide-react";

const API_BASE = "http://localhost:3100";

/* ═══ Referências para análise de conformidade (consenso por maioria) ═══ */
const REFERENCES = [
  "GOEC6O045 - Faixa 1",
  "GOEC6O045 - Faixa 2",
  "GOEC6O048 - Faixa 1",
  "GOEC6O048 - Faixa 2",
  "GOEC6O040 - Faixa 1",
];

/* ══════════ WIN11 FLUENT DARK THEME ══════════ */
const C = {
  bg: "#202020",
  surface: "#2d2d2d",
  raised: "#383838",
  border: "rgba(255,255,255,0.0578)",
  borderLight: "rgba(255,255,255,0.04)",
  text: "#ffffff",
  textMuted: "#9d9d9d",
  textSecondary: "#c5c5c5",
  accent: "#60cdff",
  accentBg: "rgba(96,205,255,0.08)",
  success: "#6ccb5f",
  successBg: "rgba(108,203,95,0.08)",
  successBorder: "rgba(108,203,95,0.2)",
  warning: "#fce100",
  warningBg: "rgba(252,225,0,0.08)",
  warningBorder: "rgba(252,225,0,0.2)",
  danger: "#ff99a4",
  dangerBg: "rgba(255,153,164,0.08)",
  dangerBorder: "rgba(255,153,164,0.2)",
  tableHeader: "rgba(255,255,255,0.04)",
  rowHover: "rgba(255,255,255,0.03)",
  codeBg: "rgba(255,255,255,0.04)",
  cardBg: "#383838",
  accentBorder: "rgba(96,205,255,0.2)",
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
  "VARCO": { endpoint: "/api/system/maintenance/remoteaccess", method: "PUT" },
  "Diurno": { endpoint: "/api/image/profiles", method: "PUT", note: "Array[0].transitions" },
  "Noturno": { endpoint: "/api/image/profiles", method: "PUT", note: "Array[1].transitions" },
  "OCR": { endpoint: "/api/equipment/ocr", method: "PUT" },
  "Classificador": { endpoint: "/api/equipment/classifier", method: "PUT" },
  "SnapshotCrop": { endpoint: "/api/equipment/misc", method: "PUT", note: "campo snapshotCrop" },
  "FTP": { endpoint: "/api/equipment/servers/ftp", method: "PUT" },
  "IO": { endpoint: "/api/equipment/ioPorts", method: "PUT" },
  "SNMP": { endpoint: "/api/system/monitoring/snmp", method: "PUT" },
  "Reboot": { endpoint: "/api/system/maintenance/automaticreboot", method: "PUT" },
  "NTP": { endpoint: "/api/equipment/dateAndTime", method: "PUT" },
  "Timezone": { endpoint: "/api/equipment/dateAndTime", method: "PUT" },
  "Video": { endpoint: "/api/video/streams", method: "PUT", note: "Array[0]" },
  "Firmware": { endpoint: null, note: "Atualizar firmware manualmente" },
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
    const allParams = auditDevices.map(d => ({ nome: d.nome, uuid: d.uuid, ip: d.ip, params: extractParams(d.raw || {}) }));

    // Find all reference devices
    const refs = allParams.filter(d => REFERENCES.includes(d.nome));
    if (refs.length === 0) return null;

    // Build consensus: for each param, take the value that appears most across references
    const paramKeys = Object.keys(refs[0].params);
    const consensus = {};
    for (const key of paramKeys) {
      const votes = {};
      refs.forEach(r => {
        const v = String(r.params[key]);
        votes[v] = (votes[v] || 0) + 1;
      });
      const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
      consensus[key] = { value: refs[0].params[key], voteStr: winner[0], count: winner[1], total: refs.length };
      // Use actual typed value from a ref that has the winning value
      const matchRef = refs.find(r => String(r.params[key]) === winner[0]);
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

    const groupMap = new Map();
    divergentes.forEach(d => {
      const key = Object.entries(d.diffs).map(([k, v]) => `${k}=${v.atual}`).sort().join("|");
      if (!groupMap.has(key)) groupMap.set(key, { diffs: d.diffs, devices: [] });
      groupMap.get(key).devices.push(d);
    });
    const groups = [...groupMap.values()].sort((a, b) => b.devices.length - a.devices.length);

    return { results, conformes, divergentes, groups, refs, consensus };
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", marginBottom: "16px", borderBottom: `2px solid ${C.border}` }}>
        {[
          { id: "auditoria", label: "Auditoria & Correções", icon: <Wrench size={13} /> },
          { id: "grupos", label: "Grupos", icon: <Eye size={13} /> },
          { id: "inventario", label: "Inventário", icon: <Radio size={13} /> },
          { id: "comandos", label: "Comandos", icon: <Terminal size={13} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "9px 14px", border: "none", borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? C.accent : C.textMuted, marginBottom: "-2px" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error && <div style={{ padding: "10px", background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "8px", color: C.danger, marginBottom: "12px", fontSize: "13px" }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>Carregando...</div>}

      {!loading && tab === "auditoria" && analysis && <AuditoriaTab analysis={analysis} />}
      {!loading && tab === "grupos" && analysis && <GruposTab groups={analysis.groups} expandedGroup={expandedGroup} setExpandedGroup={setExpandedGroup} />}
      {!loading && tab === "inventario" && analysis && <InventarioTab results={filteredResults} filter={filter} setFilter={setFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} expandedDevice={expandedDevice} setExpandedDevice={setExpandedDevice} liveDevices={liveDevices} />}
      {!loading && tab === "comandos" && analysis && <ComandosTab groups={analysis.groups} />}

      {/* Footer */}
      <div style={{ marginTop: "16px", padding: "10px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "11px", color: C.textMuted, display: "flex", justifyContent: "space-between" }}>
        <span>Referências: {REFERENCES.length} dispositivos | Coleta: 05/06/2026</span>
        <button onClick={fetchAll} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: "4px", background: C.raised, color: C.textSecondary, cursor: "pointer", fontSize: "11px" }}>
          <RefreshCw size={11} /> {lastUpdate && lastUpdate.toLocaleTimeString("pt-BR")}
        </button>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}code{background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;font-size:12px;font-family:'Fira Code',monospace;color:#e2e8f0}.wrong{color:#fb7185;font-weight:600}.correct{color:#6ee7b7;font-weight:600}`}</style>
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
  const { conformes, divergentes, groups, refs, consensus } = analysis;
  const totalDiv = divergentes.reduce((s, d) => s + d.diffCount, 0);
  const [expandedRow, setExpandedRow] = useState(null);

  // Build detailed problem analysis
  const problemRank = {};
  divergentes.forEach(d => {
    for (const key of Object.keys(d.diffs)) {
      if (!problemRank[key]) problemRank[key] = { count: 0, values: new Map(), devices: [] };
      problemRank[key].count++;
      const val = String(d.diffs[key].atual);
      problemRank[key].values.set(val, (problemRank[key].values.get(val) || 0) + 1);
      problemRank[key].devices.push(d.nome);
    }
  });
  const sorted = Object.entries(problemRank).sort((a, b) => b[1].count - a[1].count);

  // Descriptions for each parameter category explaining what it does and why it matters
  const PARAM_DESCRIPTIONS = {
    "VARCO.enabled": { desc: "Habilita comunicação remota via plataforma VARCO", impact: "Sem VARCO, não é possível corrigir parâmetros remotamente. Equipamento isolado.", causa: "Configuração de fábrica não aplicada, ou reset manual do dispositivo." },
    "VARCO.edgeServer": { desc: "Endereço do servidor edge VARCO para túnel reverso", impact: "Sem edge server, o dispositivo não estabelece túnel de gerenciamento remoto.", causa: "Campo não preenchido na configuração VARCO do dispositivo." },
    "Diurno.lower.startTime": { desc: "Início da transição para perfil diurno (horário inferior)", impact: "Imagem pode ficar com ganho errado, gerando OCR de baixa qualidade.", causa: "Perfil de imagem diferente aplicado manualmente ou não sincronizado." },
    "Diurno.lower.endTime": { desc: "Fim da transição inferior do perfil diurno", impact: "Mesma causa: ajuste de brilho/ganho fora do padrão.", causa: "Cópia parcial de configuração entre equipamentos." },
    "Diurno.lower.level": { desc: "Nível de luminosidade do threshold inferior diurno", impact: "Threshold errado pode causar fotos muito claras ou escuras.", causa: "Ajuste local feito por técnico sem atualizar template padrão." },
    "Diurno.lower.holdTime": { desc: "Tempo de espera (ms) antes de mudar perfil diurno", impact: "Transição muito rápida entre perfis gera frames inconsistentes.", causa: "Valor default de firmware diferente da versão padrão." },
    "Diurno.upper.startTime": { desc: "Início da transição superior do perfil diurno", impact: "Impacta qualidade da imagem na mudança de iluminação.", causa: "Perfil não padronizado após manutenção." },
    "Diurno.upper.endTime": { desc: "Fim da transição superior do perfil diurno", impact: "Mesma causa: janela de transição de brilho.", causa: "Diferença entre versões de firmware." },
    "Diurno.upper.level": { desc: "Nível de luminosidade do threshold superior diurno", impact: "Imagens saturadas ou subexpostas durante o dia.", causa: "Ajuste manual ou cópia de config incompleta." },
    "Diurno.upper.holdTime": { desc: "Tempo de espera (ms) antes da transição superior diurna", impact: "Flickering na imagem durante mudanças de luz.", causa: "Valor divergente entre lotes de firmware." },
    "Diurno.upper.profile": { desc: "ID do perfil de imagem diurno superior", impact: "Perfil errado = parâmetros de cor/ganho/shutter completamente diferentes.", causa: "Profile ID não atualizado após redefinição de templates." },
    "Noturno.lower.startTime": { desc: "Início da transição para perfil noturno (threshold inferior)", impact: "Ativação tardia/antecipada do modo noturno gera imagens escuras.", causa: "Timezone ou configuração de horários divergente." },
    "Noturno.lower.endTime": { desc: "Fim da transição inferior do perfil noturno", impact: "Mesma causa: timing de ativação do perfil noturno.", causa: "Configuração incompleta pós-manutenção." },
    "Noturno.lower.level": { desc: "Nível de luminosidade do threshold inferior noturno", impact: "IR/Flash pode não ativar no momento correto.", causa: "Ajuste local ou firmware com defaults diferentes." },
    "Noturno.lower.holdTime": { desc: "Tempo de espera antes de transicionar para noturno", impact: "Fotos transitórias com qualidade degradada.", causa: "Valor padrão diferente entre lotes." },
    "Noturno.upper.startTime": { desc: "Início da transição superior noturna", impact: "Qualidade de imagem noturna comprometida.", causa: "Não sincronizado com template padrão." },
    "Noturno.upper.endTime": { desc: "Fim da transição superior noturna", impact: "Impacta janela de operação do IR.", causa: "Configuração manual divergente." },
    "Noturno.upper.level": { desc: "Nível de luminosidade do threshold superior noturno", impact: "Flash/IR ativa muito cedo ou muito tarde.", causa: "Threshold não calibrado para o local." },
    "Noturno.upper.holdTime": { desc: "Tempo de espera na transição superior noturna", impact: "Instabilidade de imagem durante a transição.", causa: "Diferença de firmware ou ajuste manual." },
    "Noturno.upper.profile": { desc: "ID do perfil de imagem noturno", impact: "Perfil noturno errado = fotos sem IR ou com ganho excessivo.", causa: "Profile ID não atualizado." },
    "OCR.enabled": { desc: "Habilita o motor de reconhecimento de placas (OCR)", impact: "Sem OCR, nenhuma placa é lida. Equipamento inútil para fiscalização.", causa: "OCR desabilitado por engano ou após reset." },
    "OCR.countryCode": { desc: "País do formato de placa (BR = Brasil)", impact: "Formato errado = OCR não reconhece placas brasileiras.", causa: "Default de fábrica com país errado." },
    "OCR.maxPlates": { desc: "Número máximo de placas por frame", impact: "Limitar pode perder veículos em faixas movimentadas.", causa: "Performance tuning aplicado incorretamente." },
    "OCR.lowProbChar": { desc: "Threshold mínimo de confiança por caractere", impact: "Muito alto = rejeita placas válidas. Muito baixo = aceita lixo.", causa: "Ajuste de sensibilidade não padronizado." },
    "OCR.maxLowProbChars": { desc: "Máximo de caracteres de baixa confiança aceitos", impact: "Impacta taxa de rejeição vs acurácia de leitura.", causa: "Tuning individual não replicado." },
    "OCR.processingQueue": { desc: "Tamanho da fila de processamento OCR", impact: "Fila pequena = descarte de frames sob carga.", causa: "Limitação de memória ou config manual." },
    "OCR.processingThreads": { desc: "Threads dedicadas ao processamento OCR", impact: "Menos threads = mais latência e possível perda de leituras.", causa: "Config de performance divergente." },
    "OCR.processingMode": { desc: "Modo de processamento (freeflow/triggered)", impact: "Modo errado = OCR não processa ou processa desnecessariamente.", causa: "Tipo de instalação configurado incorretamente." },
    "OCR.vehicleType": { desc: "Tipo de veículo alvo (all/car/truck)", impact: "Filtro errado descarta veículos válidos da leitura.", causa: "Aplicação de template errado para o ponto." },
    "Classificador.enabled": { desc: "Habilita classificação veicular por IA", impact: "Sem classificador, não há diferenciação moto/carro/caminhão.", causa: "Feature não ativada após deploy." },
    "Classificador.processingQueue": { desc: "Fila de processamento do classificador", impact: "Fila insuficiente causa timeout na classificação.", causa: "Default de firmware diferente." },
    "Classificador.processingThreads": { desc: "Threads do classificador veicular", impact: "Menos threads = classificação mais lenta.", causa: "Otimização de CPU aplicada individualmente." },
    "Classificador.sceneType": { desc: "Tipo de cena para o classificador (road/highway)", impact: "Cena errada = modelo de IA menos preciso para o contexto.", causa: "Template aplicado sem considerar tipo de via." },
    "Classificador.minProbability": { desc: "Confiança mínima para aceitar classificação", impact: "Muito alto = muitas rejeições. Muito baixo = classificações erradas.", causa: "Threshold não padronizado entre equipamentos." },
    "SnapshotCrop.enable": { desc: "Recorte automático da imagem de snapshot", impact: "Sem crop, imagem completa é enviada (mais pesada, com área irrelevante).", causa: "Feature não ativada em alguns equipamentos." },
    "SnapshotCrop.mode": { desc: "Modo de recorte (plate/vehicle/custom)", impact: "Modo errado gera recortes inúteis ou muito grandes.", causa: "Configuração manual inconsistente." },
    "FTP.enable": { desc: "Upload de imagens via FTP para servidor central", impact: "Sem FTP, imagens não chegam ao servidor de armazenamento.", causa: "FTP desabilitado após teste ou manutenção." },
    "IO.port1.earlyUs": { desc: "Tempo de antecipação (μs) da porta IO 1 (trigger)", impact: "Trigger antecipado/atrasado = veículo não capturado na posição ideal.", causa: "Calibração de laço não padronizada." },
    "IO.port1.isReserved": { desc: "Porta IO 1 reservada para trigger principal", impact: "Se não reservada, pode conflitar com outros sinais.", causa: "Configuração de hardware divergente." },
    "IO.port3.earlyUs": { desc: "Tempo de antecipação (μs) da porta IO 3", impact: "Mesmo impacto: timing de captura incorreto.", causa: "Calibração local não replicada." },
    "IO.port3.isReserved": { desc: "Porta IO 3 reservada", impact: "Conflito de sinais se não reservada corretamente.", causa: "Setup de hardware inconsistente." },
    "SNMP.enabled": { desc: "Monitoramento SNMP do equipamento", impact: "Sem SNMP, o NMS não monitora saúde do dispositivo.", causa: "Protocolo não ativado na instalação." },
    "Reboot.scheduled.enabled": { desc: "Reboot programado (ex: diário às 4h)", impact: "Sem reboot automático, memory leaks acumulam e causam travamento.", causa: "Feature de manutenção não ativada." },
    "Reboot.periodic.enabled": { desc: "Reboot periódico baseado em uptime", impact: "Complementa o scheduled para evitar degradação.", causa: "Não configurado como padrão." },
    "NTP.server": { desc: "Servidor NTP para sincronização de relógio", impact: "Horário errado = timestamps de infração inválidos legalmente.", causa: "NTP server diferente ou não configurado." },
    "Timezone": { desc: "Fuso horário do equipamento", impact: "Fuso errado invalida toda autuação do equipamento.", causa: "Timezone não ajustado após deploy." },
    "Video.framerate": { desc: "Taxa de frames do stream de vídeo (fps)", impact: "FPS baixo = menor chance de captura. FPS alto = mais processamento.", causa: "Ajuste de performance individual." },
    "Video.quality": { desc: "Qualidade de compressão do vídeo", impact: "Qualidade baixa = imagens borradas para OCR.", causa: "Redução de banda aplicada manualmente." },
    "Video.useTriggerFrames": { desc: "Usar frames do trigger para processamento", impact: "Se desativado, OCR usa frames aleatórios do stream.", causa: "Configuração de captura divergente." },
    "Firmware.version": { desc: "Versão do firmware instalado no equipamento", impact: "Firmwares diferentes = comportamentos diferentes em todas as features.", causa: "Atualização não aplicada uniformemente na frota." },
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
      {/* Reference info */}
      <div style={{ marginBottom: "14px", padding: "12px 14px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <strong style={{ color: C.accent, fontSize: "13px" }}>Base de Referência — Consenso por Maioria</strong>
          <span style={{ fontSize: "11px", color: C.textMuted }}>{refs.length} dispositivos validados</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {refs.map(r => (
            <span key={r.nome} style={{ background: C.codeBg, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", color: C.textSecondary, border: `1px solid ${C.border}` }}>{r.nome}</span>
          ))}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "11px", color: C.textMuted, lineHeight: "1.5" }}>
          Para cada parâmetro, o valor correto é determinado pelo que aparece na maioria das referências acima. Isso elimina falsos positivos causados por uma única referência com problema.
        </p>
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

      {/* Detailed problems table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <h3 style={{ fontSize: "14px", margin: 0, color: C.text }}>Análise Detalhada de Divergências</h3>
        <span style={{ fontSize: "11px", color: C.textMuted }}>{sorted.length} parâmetros com desvio</span>
      </div>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 80px 200px 130px 90px", gap: 0, background: C.raised, padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: "11px", fontWeight: 600, color: C.textSecondary }}>
          <div style={{ padding: "0 10px", textAlign: "center" }}>Severidade</div>
          <div style={{ padding: "0 10px" }}>Parâmetro</div>
          <div style={{ padding: "0 10px", textAlign: "center" }}>Equipamentos</div>
          <div style={{ padding: "0 10px" }}>Valor Incorreto → Correto</div>
          <div style={{ padding: "0 10px" }}>Endpoint API</div>
          <div style={{ padding: "0 10px", textAlign: "center" }}>Referências OK</div>
        </div>

        {/* Table body */}
        <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
          {sorted.map(([param, info], idx) => {
            const section = param.split(".")[0];
            const ep = PARAM_TO_ENDPOINT[section] || {};
            const correctVal = consensus[param]?.value;
            const consensusCount = consensus[param]?.count || 0;
            const consensusTotal = consensus[param]?.total || refs.length;
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
                  style={{ display: "grid", gridTemplateColumns: "70px 1fr 80px 200px 130px 90px", gap: 0, padding: "10px 0", borderTop: idx > 0 ? `1px solid ${C.borderLight}` : "none", cursor: "pointer", background: isExpanded ? "rgba(255,255,255,0.02)" : "transparent", transition: "background 0.1s" }}
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
                    {ep.endpoint
                      ? <code style={{ fontSize: "10px", color: C.accent }}>{ep.method} {ep.endpoint.replace("/api/", "")}</code>
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
                          <div style={{ fontSize: "10px", color: C.accent, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Referências com valor correto ({consensusCount}/{consensusTotal})</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {refs.filter(r => String(r.params[param]) === String(correctVal)).map(r => (
                              <span key={r.nome} style={{ background: "rgba(108,203,95,0.08)", border: "1px solid rgba(108,203,95,0.2)", padding: "2px 6px", borderRadius: "3px", fontSize: "10px", color: C.success }}>{r.nome}</span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "10px", color: C.danger, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Equipamentos afetados ({info.count})</div>
                          <div style={{ maxHeight: "80px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "3px" }}>
                            {info.devices.map(name => (
                              <span key={name} style={{ background: C.dangerBg, padding: "1px 5px", borderRadius: "3px", fontSize: "10px", color: C.danger }}>{name}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* How to fix */}
                    <div style={{ marginTop: "12px", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px" }}>
                      <div style={{ fontSize: "10px", color: C.accent, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Como Corrigir</div>
                      {ep.endpoint ? (
                        <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: "1.8" }}>
                          <div>1. Acessar equipamento via túnel VARCO: <code>https://[UUID]-80.tunnel.varco.cloud</code></div>
                          <div>2. Enviar requisição: <code style={{ color: C.accent }}>{ep.method} {ep.endpoint}</code>{ep.note && <span style={{ color: C.textMuted }}> ({ep.note})</span>}</div>
                          <div>3. Payload: definir <code>{param.split(".").slice(1).join(".")}</code> = <code style={{ color: "#7dffb3" }}>{String(correctVal)}</code></div>
                          <div>4. Script automático: <code>node auditoria-itscam/corrigir.mjs --param="{param}" --valor="{String(correctVal)}" --todos</code></div>
                        </div>
                      ) : (
                        <div style={{ fontSize: "12px", color: C.textSecondary }}>
                          {ep.note || "Requer intervenção manual no equipamento. Acesso via IP local necessário."}
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

function GruposTab({ groups, expandedGroup, setExpandedGroup }) {
  return (
    <div>
      <p style={{ fontSize: "12px", color: C.textMuted, marginBottom: "12px" }}>Dispositivos com <strong style={{ color: C.text }}>mesmas divergências</strong> agrupados — cada grupo corrigível com um único comando.</p>
      {groups.map((group, i) => {
        const isExp = expandedGroup === i;
        const diffs = Object.entries(group.diffs);
        return (
          <div key={i} style={{ marginBottom: "10px", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <div onClick={() => setExpandedGroup(isExp ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer", background: isExp ? C.accentBg : C.surface }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ background: C.accentBg, color: C.accent, padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: 700, border: `1px solid rgba(74,158,255,0.25)` }}>G{i + 1}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: C.text }}>{group.devices.length} equip(s)</span>
                <span style={{ fontSize: "12px", color: C.textMuted }}>• {diffs.length} diverg.</span>
              </div>
              {isExp ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
            </div>
            {isExp && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px", background: C.surface }}>
                <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {group.devices.map(d => <span key={d.nome} style={{ background: C.codeBg, color: C.textSecondary, padding: "2px 7px", borderRadius: "3px", fontSize: "11px" }}>{d.nome}</span>)}
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
              <th style={{ padding: "7px 8px", textAlign: "center", color: C.textSecondary }}>Config</th>
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
                    <td style={{ padding: "5px 8px", fontWeight: 500, color: C.text }}>{d.nome}</td>
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
      else if (s === "OCR") cases.add("04");
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
      </div>

      {cmds.map(cmd => (
        <div key={cmd.i} style={{ marginBottom: "12px", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: C.raised, borderBottom: `1px solid ${C.border}`, fontSize: "12px" }}>
            <span style={{ color: C.text }}><strong>Grupo {cmd.i}</strong></span>
            <span style={{ marginLeft: "8px", color: C.textMuted }}>{cmd.devices.length} equips • {cmd.diffCount} correções • Casos: {cmd.cases.join(", ")}</span>
            {cmd.isVarcoOff && <span style={{ marginLeft: "8px", background: C.dangerBg, color: C.danger, padding: "1px 6px", borderRadius: "4px", fontSize: "10px", border: `1px solid ${C.dangerBorder}` }}>⚠️ Acesso local</span>}
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
                const cmdStr = cmd.devices.length === 1
                  ? `node auditoria-itscam/corrigir.mjs --caso=${caso} --equip="${cmd.devices[0]}" --sim`
                  : `node auditoria-itscam/corrigir.mjs --caso=${caso} --todos --sim`;
                return (
                  <div key={caso} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                    <code style={{ flex: 1, background: "#0d1117", color: "#c9d1d9", padding: "7px 10px", borderRadius: "5px", fontSize: "11px", overflow: "auto", border: `1px solid ${C.borderLight}` }}>{cmdStr}</code>
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
          <div style={{ color: C.success }}># Corrigir por caso</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=03 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=04 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=05 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=06 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=07 --todos --sim</div>
          <div>node auditoria-itscam/corrigir.mjs --caso=08 --todos --sim</div>
          <br/>
          <div style={{ color: C.warning }}># Caso 01 — VARCO off (acesso local obrigatório)</div>
          <div style={{ color: C.textMuted }}># GOEC6O019-F1/F2, 023-F1, 049-F1/F2, 052-F1</div>
          <br/>
          <div style={{ color: C.success }}># Revalidar</div>
          <div>node auditoria-itscam/validar.mjs</div>
        </div>
      </div>
    </div>
  );
}
