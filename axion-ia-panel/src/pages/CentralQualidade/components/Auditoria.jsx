import React, { useState, useMemo, useEffect } from "react";
import { AlertTriangle, CheckCircle2, XCircle, ExternalLink, ChevronDown, ChevronUp, Shield, Eye, Clock, ArrowRight, Zap, Camera, Layers, ArrowLeftRight, FileWarning, Database, Server, Activity } from "lucide-react";
import { AXHUB_SITES, AXCROSS_SITES } from "../../../data/sitesData";
import { calcHealthScore, scoreColor } from "../../../utils/siteUtils";

// ═══════════════════════════════════════════════════════════════════════════════
// TODOS OS SITES — AxHub + AxCross
// ═══════════════════════════════════════════════════════════════════════════════
const TODOS_SITES = [
  ...AXHUB_SITES.map(s => ({ ...s, sistema: 'AxHub' })),
  ...AXCROSS_SITES.map(s => ({ ...s, sistema: 'AxCross' })),
];

// ═══════════════════════════════════════════════════════════════════════════════
// REQUISITOS DE CONFORMIDADE — checklist aplicado por site
// ═══════════════════════════════════════════════════════════════════════════════
const REQUISITOS = [
  { id: 'ativo',        label: 'Site Ativo',                  icon: '🟢', check: (s)     => s.status === 'ativo' },
  { id: 'versao',       label: 'Versão Mínima ≥ v.1.2.0',    icon: '🏷️', check: (s)     => s.versao && s.versao >= 'v.1.2.0' },
  { id: 'ocr',          label: 'OCR ≥ 80%',                  icon: '📷', check: (s)     => s.ocr != null && s.ocr >= 80 },
  { id: 'equipamentos', label: 'Equipamentos Registrados',    icon: '📡', check: (s)     => (typeof s.equipamentos === 'object' ? s.equipamentos?.total : s.equipamentos) > 0 },
  { id: 'sem-criticos', label: 'Sem Chamados Críticos',       icon: '🔴', check: (s, sc) => (sc?.chamados?.criticos || 0) === 0 },
  { id: 'chamados',     label: 'Chamados Abertos ≤ 2',       icon: '🎫', check: (s, sc) => (sc?.chamados?.abertos || 0) <= 2 },
  { id: 'health',       label: 'Health Score ≥ 70%',         icon: '💚', check: (s, sc) => (sc?.healthScore ?? calcHealthScore(s, null)) >= 70 },
  { id: 'afericao',     label: 'Aferição Registrada',        icon: '📋', check: (s)     => !!s.data_afericao },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARADOR DE SITES — componente de comparação dinâmica
// ═══════════════════════════════════════════════════════════════════════════════
function ComparadorSites() {
  const [siteAId, setSiteAId] = useState('');
  const [siteBId, setSiteBId] = useState('');
  const [chamadosData, setChamadosData] = useState(null);
  const [loadingChamados, setLoadingChamados] = useState(false);
  const [carregado, setCarregado] = useState(false);

  const siteA = TODOS_SITES.find(s => s.id === siteAId) || null;
  const siteB = TODOS_SITES.find(s => s.id === siteBId) || null;

  const scoreA = useMemo(() => siteA ? {
    healthScore: calcHealthScore(siteA, chamadosData),
    chamados: chamadosData?.ranking?.find(r => r.siteId === siteA.id) || { abertos: 0, criticos: 0 },
  } : null, [siteA, chamadosData]);

  const scoreB = useMemo(() => siteB ? {
    healthScore: calcHealthScore(siteB, chamadosData),
    chamados: chamadosData?.ranking?.find(r => r.siteId === siteB.id) || { abertos: 0, criticos: 0 },
  } : null, [siteB, chamadosData]);

  async function carregarDados() {
    if (carregado) return;
    setLoadingChamados(true);
    try {
      const { api } = await import('../../../services/api');
      const r = await api.get('/helpdesk/sites-overview');
      setChamadosData(r.data);
    } catch { /* sem dados dinâmicos */ }
    setLoadingChamados(false);
    setCarregado(true);
  }

  function handleSiteA(id) { setSiteAId(id); if (id) carregarDados(); }
  function handleSiteB(id) { setSiteBId(id); if (id) carregarDados(); }

  // Avalia requisitos de um site
  function avaliarRequisitos(site, score) {
    return REQUISITOS.map(req => ({
      ...req,
      ok: site ? req.check(site, score) : null,
    }));
  }

  const reqA = avaliarRequisitos(siteA, scoreA);
  const reqB = avaliarRequisitos(siteB, scoreB);

  const scoreANum = reqA.filter(r => r.ok).length;
  const scoreBNum = reqB.filter(r => r.ok).length;

  // Divergências entre A e B
  const divergencias = siteA && siteB ? REQUISITOS.map(req => {
    const okA = req.check(siteA, scoreA);
    const okB = req.check(siteB, scoreB);
    if (okA !== okB) return { ...req, okA, okB };
    return null;
  }).filter(Boolean) : [];

  // Campos de comparação direta
  const camposComparacao = siteA && siteB ? [
    { label: 'Sistema',        valA: siteA.sistema,                     valB: siteB.sistema },
    { label: 'Estado',         valA: siteA.estado || '—',               valB: siteB.estado || '—' },
    { label: 'Versão',         valA: siteA.versao || '—',               valB: siteB.versao || '—' },
    { label: 'Status',         valA: siteA.status,                      valB: siteB.status },
    { label: 'OCR %',          valA: siteA.ocr ? `${siteA.ocr}%` : '—', valB: siteB.ocr ? `${siteB.ocr}%` : '—' },
    { label: 'Equipamentos',   valA: typeof siteA.equipamentos === 'object' ? siteA.equipamentos?.total ?? '—' : siteA.equipamentos ?? '—',
                               valB: typeof siteB.equipamentos === 'object' ? siteB.equipamentos?.total ?? '—' : siteB.equipamentos ?? '—' },
    { label: 'Chamados Abertos', valA: scoreA?.chamados?.abertos ?? '—',   valB: scoreB?.chamados?.abertos ?? '—' },
    { label: 'Chamados Críticos', valA: scoreA?.chamados?.criticos ?? '—', valB: scoreB?.chamados?.criticos ?? '—' },
    { label: 'Health Score',   valA: scoreA ? `${scoreA.healthScore}%` : '—', valB: scoreB ? `${scoreB.healthScore}%` : '—' },
    { label: 'URL',            valA: siteA.url || '—',                  valB: siteB.url || '—' },
    { label: 'Tipo',           valA: siteA.tipo || '—',                 valB: siteB.tipo || '—' },
  ] : [];

  const selectStyle = {
    padding: '9px 14px', fontSize: 13, borderRadius: 7, border: `1px solid ${C.border}`,
    background: C.surface, color: C.text, width: '100%', cursor: 'pointer',
  };

  return (
    <div>
      {/* Seletores de sites */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { id: 'A', value: siteAId, onChange: handleSiteA, site: siteA, score: scoreA, reqs: reqA, scoreNum: scoreANum, cor: C.accent },
          { id: 'B', value: siteBId, onChange: handleSiteB, site: siteB, score: scoreB, reqs: reqB, scoreNum: scoreBNum, cor: C.warning },
        ].map(({ id, value, onChange, site, score, reqs, scoreNum, cor }) => (
          <div key={id} style={{ ...cardStyle, marginBottom: 0, borderTop: `3px solid ${cor}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 8 }}>SITE {id}</div>
            <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
              <option value="">— Selecione um site —</option>
              <optgroup label="AxHub">
                {AXHUB_SITES.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.estado} ({s.versao || 'sem versão'})</option>)}
              </optgroup>
              <optgroup label="AxCross">
                {AXCROSS_SITES.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.estado}</option>)}
              </optgroup>
            </select>

            {site && (
              <div style={{ marginTop: 12 }}>
                {/* URL clicável */}
                <a href={site.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', fontSize: 11, color: cor, marginBottom: 10, textDecoration: 'none', wordBreak: 'break-all' }}>
                  🔗 {site.url}
                </a>

                {/* KPIs rápidos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                  {[
                    { l: 'Health', v: score ? `${score.healthScore}%` : '…', c: score ? scoreColor(score.healthScore) : C.textMuted },
                    { l: 'Chamados', v: score ? score.chamados.abertos : '…', c: (score?.chamados?.abertos || 0) > 2 ? C.danger : C.success },
                    { l: 'Críticos', v: score ? score.chamados.criticos : '…', c: (score?.chamados?.criticos || 0) > 0 ? C.danger : C.success },
                  ].map(k => (
                    <div key={k.l} style={{ background: C.codeBg, borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: k.c }}>{k.v}</div>
                      <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{k.l}</div>
                    </div>
                  ))}
                </div>

                {/* Checklist de requisitos */}
                <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, marginBottom: 6 }}>
                  CONFORMIDADE — {scoreNum}/{REQUISITOS.length} requisitos
                  <div style={{ display: 'inline-block', marginLeft: 8, width: 80, height: 5, background: C.border, borderRadius: 3, verticalAlign: 'middle' }}>
                    <div style={{ width: `${(scoreNum / REQUISITOS.length) * 100}%`, height: '100%', background: scoreNum >= 6 ? C.success : scoreNum >= 4 ? C.warning : C.danger, borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {reqs.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                      {r.ok ? <CheckCircle2 size={12} color={C.success} /> : <XCircle size={12} color={C.danger} />}
                      <span style={{ color: r.ok ? C.text : C.danger }}>{r.icon} {r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {loadingChamados && site && (
              <p style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>⏳ Carregando dados dinâmicos…</p>
            )}
          </div>
        ))}
      </div>

      {/* Tabela comparativa */}
      {siteA && siteB && (
        <>
          <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600 }}>
              ⚖️ Tabela Comparativa — {siteA.nome} vs {siteB.nome}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.codeBg }}>
                  <th style={{ padding: '9px 14px', textAlign: 'left', color: C.textMuted, borderBottom: `1px solid ${C.border}`, width: '25%' }}>Atributo</th>
                  <th style={{ padding: '9px 14px', textAlign: 'center', color: C.accent, borderBottom: `1px solid ${C.border}` }}>🅰 {siteA.nome}</th>
                  <th style={{ padding: '9px 14px', textAlign: 'center', color: C.warning, borderBottom: `1px solid ${C.border}` }}>🅱 {siteB.nome}</th>
                  <th style={{ padding: '9px 8px', textAlign: 'center', color: C.textMuted, borderBottom: `1px solid ${C.border}`, width: '8%' }}>≡</th>
                </tr>
              </thead>
              <tbody>
                {camposComparacao.map((row, i) => {
                  const igual = String(row.valA) === String(row.valB);
                  return (
                    <tr key={row.label} style={{ background: !igual ? C.warningBg : i % 2 === 0 ? 'transparent' : C.codeBg, borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '8px 14px', fontWeight: 600, color: C.textMuted, fontSize: 11 }}>{row.label}</td>
                      <td style={{ padding: '8px 14px', textAlign: 'center', fontFamily: 'monospace', fontSize: 11, color: C.accent }}>{row.valA}</td>
                      <td style={{ padding: '8px 14px', textAlign: 'center', fontFamily: 'monospace', fontSize: 11, color: C.warning }}>{row.valB}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        {igual ? <CheckCircle2 size={12} color={C.success} /> : <ArrowLeftRight size={12} color={C.warning} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Divergências de requisitos */}
          {divergencias.length > 0 && (
            <div style={{ ...cardStyle, borderColor: C.warning }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                ⚠️ Divergências de Conformidade ({divergencias.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {divergencias.map(d => (
                  <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '8px 12px', background: C.warningBg, borderRadius: 6, fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{d.icon} {d.label}</span>
                    <span style={{ color: d.okA ? C.success : C.danger, textAlign: 'center' }}>
                      {d.okA ? '✅' : '❌'} {siteA.nome}
                    </span>
                    <span style={{ color: d.okB ? C.success : C.danger, textAlign: 'center' }}>
                      {d.okB ? '✅' : '❌'} {siteB.nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {divergencias.length === 0 && (
            <div style={{ ...cardStyle, borderColor: C.success, background: C.successBg, textAlign: 'center', padding: 16 }}>
              <CheckCircle2 size={18} color={C.success} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: C.success }}>Conformidade Idêntica — ambos os sites atendem os mesmos requisitos</div>
            </div>
          )}
        </>
      )}

      {!siteA && !siteB && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textMuted }}>
          <ArrowLeftRight size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>Selecione dois sites acima para iniciar a comparação</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DADOS DAS 3 FONTES: IMAGEM HELPDESK | INTEGRADOR API | AXHUB SISTEMA
// ═══════════════════════════════════════════════════════════════════════════════

const CASO = {
  ticket: "100423690",
  solicitante: "Karla Ramira",
  sistema: "SMTT",
  data_abertura: "2026-06-12",
  placa: "UJN9C59",
  veiculo: "BYD/DOLPHIN MINI GS5EV",
  cor: "BRANCA",
  tipo: "AUTOMOVEL",
  categoria: "PARTICULAR",
  especie: "PASSAGEIRO",
  municipio: "SAO JOSE DE RIBAMAR",
  ano_fabricacao: 2026,
  equipamento_codigo: "SL316R-2",
  equipamento_modelo: "DTV202",
  equipamento_serie: "FLSSD2206A00599",
  equipamento_fabricante: "ITSCAM Pumatronix",
  local: "Avenida Edson Brandão, 283 - Anil",
  faixa: 2,
  velocidade_regulamentada: 60,
  data_afericao: "11/12/2025",
  lote_importacao: "07/06/2026",
  quantidade_processadas_lote: 782
};

// Infração 1 — dados nas 3 fontes
const INFRACAO_1 = {
  id: "Registro 1",
  restante_lote: 2,
  imagem_helpdesk: {
    data_infracao: "07/06/2026",
    hora_infracao: "16h30min22s",
    velocidade_medida: 88,
    velocidade_considerada: 81,
    velocidade_regulamentada: 60,
    codigo_enquadramento: "74630",
    descricao_enquadramento: "Transitar >20% até 50% acima da máxima",
    no_seq_reg: 44,
    faixa: 2,
    serial_equipamento: "FLSSD2206A00599",
    codigo_equipamento: "SL316R",
    modelo_equipamento: "DTV202",
    data_afericao: "11/12/2025",
    placa_lida: "UJN9C59"
  },
  integrador_api: {
    data_hora_passagem: "2026-06-07 16:30:22",
    velocidade_medida: 88,
    velocidade_considerada: 81,
    velocidade_regulamentada: 60,
    codigo_enquadramento: "74630",
    placa: "UJN9C59",
    equipamento_id: "SL316R-2",
    faixa: 2,
    no_seq_reg: 44,
    serial_equipamento: "FLSSD2206A00599",
    protocolo: "Lote 07/06/2026 (Restante: 2)",
    imagem_hash: "HASH_IMG_A",
    status_envio: "201 Created"
  },
  axhub_sistema: {
    data_hora_infracao: "2026-06-07 16:30:22",
    velocidade_medida: 88,
    velocidade_considerada: 81,
    velocidade_regulamentada: 60,
    codigo_enquadramento: "74630",
    descricao_enquadramento: "Transitar em velocidade superior à máxima em mais de 20% até 50%",
    placa: "UJN9C59",
    equipamento: "SL316R-2 (DTV202)",
    faixa: "Faixa 2",
    status: "Processada",
    data_importacao: "2026-06-07 18:45:12",
    lote: "07/06/2026",
    restante_lote: 2
  }
};

// Infração 2 — dados nas 3 fontes
const INFRACAO_2 = {
  id: "Registro 2",
  restante_lote: 1,
  imagem_helpdesk: {
    data_infracao: "07/06/2026",
    hora_infracao: "16h30min22s",
    velocidade_medida: 88,
    velocidade_considerada: 81,
    velocidade_regulamentada: 60,
    codigo_enquadramento: "74630",
    descricao_enquadramento: "Transitar >20% até 50% acima da máxima",
    no_seq_reg: 44,
    faixa: 2,
    serial_equipamento: "FLSSD2206A00599",
    codigo_equipamento: "SL316R",
    modelo_equipamento: "DTV202",
    data_afericao: "11/12/2025",
    placa_lida: "UJN9C59"
  },
  integrador_api: {
    data_hora_passagem: "2026-06-07 16:30:22",
    velocidade_medida: 70,
    velocidade_considerada: 63,
    velocidade_regulamentada: 60,
    codigo_enquadramento: "74550",
    placa: "UJN9C59",
    equipamento_id: "SL316R-2",
    faixa: 2,
    no_seq_reg: 44,
    serial_equipamento: "FLSSD2206A00599",
    protocolo: "Lote 07/06/2026 (Restante: 1)",
    imagem_hash: "HASH_IMG_A",
    status_envio: "201 Created"
  },
  axhub_sistema: {
    data_hora_infracao: "2026-06-07 16:30:22",
    velocidade_medida: 70,
    velocidade_considerada: 63,
    velocidade_regulamentada: 60,
    codigo_enquadramento: "74550",
    descricao_enquadramento: "Transitar em velocidade superior à máxima em até 20%",
    placa: "UJN9C59",
    equipamento: "SL316R-2 (DTV202)",
    faixa: "Faixa 2",
    status: "Processada",
    data_importacao: "2026-06-07 18:45:13",
    lote: "07/06/2026",
    restante_lote: 1
  }
};

// ═══ INDICADORES DA AUTO-ANÁLISE ═══
const INDICADORES = [
  { id: "IMG_IDENTICA", nome: "Imagens Fisicamente Idênticas", descricao: "As duas imagens possuem tarja IDÊNTICA (mesmos dados queimados na foto)", resultado: "CONFIRMADO", tipo: "critico", evidencia: "Ambas: VEL MED 088, VEL CONS 081, CÓD ENQ 74630, NO.SEQ.REG 44, SERIAL FLSSD2206A00599", fonte: "Imagem Helpdesk" },
  { id: "SEQ_REG_IGUAL", nome: "Mesmo NO.SEQ.REG (Sequencial)", descricao: "Nº sequencial de registro = 44 em ambas — MESMA captura", resultado: "CONFIRMADO", tipo: "critico", evidencia: "NO.SEQ.REG = 44 em ambas imagens e registros", fonte: "Imagem + AxHub" },
  { id: "HORARIO_IGUAL", nome: "Mesmo Horário de Passagem", descricao: "DataHoraPassagem idêntica em ambos: 16:30:22", resultado: "CONFIRMADO", tipo: "alerta", evidencia: "07/06/2026 16:30:22 nos dois registros", fonte: "AxHub Sistema" },
  { id: "VEL_DIVERGE", nome: "Velocidade Divergente no 2º Registro", descricao: "Tarja mostra 088/081 mas AxHub gravou 70/63 no 2º", resultado: "ANOMALIA", tipo: "critico", evidencia: "Imagem: 088/081 | AxHub Reg.2: 70/63", fonte: "Imagem vs AxHub" },
  { id: "ENQUADRAMENTO_DIVERGE", nome: "Enquadramento Divergente", descricao: "Tarja mostra 74630 mas AxHub gravou 74550 no 2º", resultado: "ANOMALIA", tipo: "critico", evidencia: "Imagem: 74630 | AxHub Reg.2: 74550", fonte: "Imagem vs AxHub" },
  { id: "PAYLOAD_CORROMPIDO", nome: "Payload do Integrador Corrompido", descricao: "Integrador enviou dados DIFERENTES da tarja na 2ª integração", resultado: "ANOMALIA", tipo: "critico", evidencia: "API enviou vel=70 (deveria ser 88), vel_cons=63 (deveria ser 81)", fonte: "Integrador API" },
  { id: "AXHUB_REG1_OK", nome: "AxHub Gravou Corretamente Reg.1", descricao: "Dados do Reg.1 coincidem 100% com a tarja da imagem", resultado: "OK", tipo: "ok", evidencia: "AxHub: 88/81/74630 = Tarja: 088/081/74630", fonte: "AxHub vs Imagem" },
  { id: "AXHUB_SEM_VALIDACAO", nome: "AxHub Não Valida Payload vs Tarja", descricao: "Sistema não verifica se payload coincide com tarja da imagem", resultado: "FALHA", tipo: "falha", evidencia: "2º registro aceito com vel=70/63 mesmo imagem mostrando 088/081", fonte: "Lógica AxHub" },
  { id: "ALARME_NAO_DISPAROU", nome: "Alarme de Duplicidade Não Disparou", descricao: "Alarme compara DADOS (que divergem), não IMAGENS", resultado: "ESPERADO", tipo: "alerta", evidencia: "Vel.medida 88≠70 impede ativação do alarme", fonte: "Lógica AxHub" },
  { id: "IMPORT_1SEG", nome: "Importações com 1s de Diferença", descricao: "Registros gravados em 18:45:12 e 18:45:13 — 2 INSERTs sequenciais", resultado: "CONFIRMADO", tipo: "alerta", evidencia: "DataImportacao: Reg.1=18:45:12, Reg.2=18:45:13", fonte: "AxHub Sistema" },
  { id: "MESMA_COMBINACAO", nome: "Mesma Placa+Equip+Faixa+Hora", descricao: "Combinação idêntica deveria ter impedido 2º INSERT", resultado: "CONFIRMADO", tipo: "alerta", evidencia: "UJN9C59 + SL316R-2 + Faixa 2 + 16:30:22 em ambos", fonte: "AxHub Sistema" },
  { id: "IMG_HASH_IGUAL", nome: "Hash da Imagem Idêntico", descricao: "As imagens integradas são fisicamente a MESMA foto", resultado: "CONFIRMADO", tipo: "critico", evidencia: "Tarjas idênticas = mesma captura óptica do DTV202", fonte: "Imagem Helpdesk" }
];

// ═══ AUTO-ANÁLISE ═══
const AUTO_ANALISE = {
  veredicto: "INFRAÇÃO DUPLICADA — Mesma captura gravada 2x com dados corrompidos na 2ª importação",
  confianca: "99.5%",
  registro_valido: "Registro 1 (88/81/74630)",
  registro_invalido: "Registro 2 (70/63/74550)",
  motivo_invalidez: "Dados do Registro 2 NÃO correspondem à tarja da imagem vinculada. A imagem comprova captura real: 088/081/74630.",
  falhas_detectadas: [
    "Integrador enviou MESMA imagem com payload DIFERENTE na 2ª integração",
    "AxHub não valida payload vs tarja da imagem",
    "AxHub não possui UNIQUE constraint em (Placa+Equip+Faixa+DataHora)",
    "AxHub não verificou NO.SEQ.REG duplicado",
    "Alarme opera apenas por dados numéricos, não por análise de imagem"
  ],
  recomendacoes: [
    "CANCELAR o Registro 2 (dados inconsistentes com evidência fotográfica)",
    "Implementar validação de NO.SEQ.REG duplicado por equipamento",
    "Implementar OCR/validação cruzada payload vs tarja",
    "Expandir alarme para considerar DataHora+Placa+Equip como duplicidade"
  ]
};

// ═══ CAMPOS PARA TABELA UNIFICADA ═══
const CAMPOS_COMPARACAO = [
  { campo: "Data/Hora Passagem", img1: "07/06/2026 16h30min22s", api1: "2026-06-07 16:30:22", axhub1: "2026-06-07 16:30:22", img2: "07/06/2026 16h30min22s", api2: "2026-06-07 16:30:22", axhub2: "2026-06-07 16:30:22", status2: "ok" },
  { campo: "Velocidade Medida", img1: "088 km/h", api1: "88 km/h", axhub1: "88 km/h", img2: "088 km/h", api2: "70 km/h", axhub2: "70 km/h", status2: "critico" },
  { campo: "Velocidade Considerada", img1: "081 km/h", api1: "81 km/h", axhub1: "81 km/h", img2: "081 km/h", api2: "63 km/h", axhub2: "63 km/h", status2: "critico" },
  { campo: "Vel. Regulamentada", img1: "060 km/h", api1: "60 km/h", axhub1: "60 km/h", img2: "060 km/h", api2: "60 km/h", axhub2: "60 km/h", status2: "ok" },
  { campo: "Código Enquadramento", img1: "74630", api1: "74630", axhub1: "74630", img2: "74630", api2: "74550", axhub2: "74550", status2: "critico" },
  { campo: "NO. SEQ. REG", img1: "44", api1: "44", axhub1: "44", img2: "44", api2: "44", axhub2: "44", status2: "ok" },
  { campo: "Placa", img1: "UJN9C59", api1: "UJN9C59", axhub1: "UJN9C59", img2: "UJN9C59", api2: "UJN9C59", axhub2: "UJN9C59", status2: "ok" },
  { campo: "Serial Equipamento", img1: "FLSSD2206A00599", api1: "FLSSD2206A00599", axhub1: "FLSSD2206A00599", img2: "FLSSD2206A00599", api2: "FLSSD2206A00599", axhub2: "FLSSD2206A00599", status2: "ok" },
  { campo: "Faixa", img1: "2", api1: "2", axhub1: "Faixa 2", img2: "2", api2: "2", axhub2: "Faixa 2", status2: "ok" },
  { campo: "Data Aferição", img1: "11/12/2025", api1: "—", axhub1: "—", img2: "11/12/2025", api2: "—", axhub2: "—", status2: "ok" },
  { campo: "Restante Lote", img1: "—", api1: "2", axhub1: "2", img2: "—", api2: "1", axhub2: "1", status2: "ok" },
  { campo: "Status", img1: "—", api1: "201 Created", axhub1: "Processada", img2: "—", api2: "201 Created", axhub2: "Processada", status2: "ok" },
  { campo: "Data Importação", img1: "—", api1: "—", axhub1: "18:45:12", img2: "—", api2: "—", axhub2: "18:45:13", status2: "ok" }
];

/* ══════════ WINDOWS 2026 FLUENT LIGHT THEME ══════════ */
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
  dangerBorder: "var(--danger)",
  codeBg: "var(--surface-raised)",
  accentBorder: "var(--accent)",
  purple: "var(--accent)",
  purpleBg: "var(--accent-subtle)",
};

const cardStyle = { background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16 };

function Badge({ type, children, large }) {
  const colors = {
    danger: { bg: C.dangerBg, color: C.danger, border: C.danger },
    warning: { bg: C.warningBg, color: C.warning, border: C.warning },
    success: { bg: C.successBg, color: C.success, border: C.success },
    info: { bg: C.accentBg, color: C.accent, border: C.accent },
    purple: { bg: C.purpleBg, color: C.purple, border: C.purple }
  };
  const c = colors[type] || colors.info;
  return <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 4, padding: large ? "4px 12px" : "2px 8px", fontSize: large ? 13 : 11, fontWeight: 600 }}>{children}</span>;
}

function StatusDot({ status }) {
  const colors = { ok: C.success, critico: C.danger, alerta: C.warning, falha: C.danger };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[status] || C.textMuted, marginRight: 6 }} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAINEL GERAL — Visão de conformidade de todos os sites
// ═══════════════════════════════════════════════════════════════════════════════
function PainelGeral({ sitesComScore, onAuditarSite }) {
  const [filtroSistema, setFiltroSistema] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('health');
  const [sortDir, setSortDir] = useState('desc');

  const todos = useMemo(() => {
    return (sitesComScore || TODOS_SITES.map(s => ({
      ...s, healthScore: calcHealthScore(s, null), chamados: { abertos: 0, criticos: 0 },
    }))).map(s => {
      const score = { healthScore: s.healthScore, chamados: s.chamados };
      return { ...s, conformidade: REQUISITOS.filter(r => r.check(s, score)).length };
    });
  }, [sitesComScore]);

  const filtrados = useMemo(() => {
    return todos.filter(s => {
      if (filtroSistema !== 'todos' && s.sistema !== filtroSistema) return false;
      if (filtroStatus !== 'todos' && s.status !== filtroStatus) return false;
      return true;
    }).sort((a, b) => {
      let va, vb;
      if (sortBy === 'health') { va = a.healthScore ?? 0; vb = b.healthScore ?? 0; }
      else if (sortBy === 'conformidade') { va = a.conformidade ?? 0; vb = b.conformidade ?? 0; }
      else if (sortBy === 'chamados') { va = a.chamados?.abertos ?? 0; vb = b.chamados?.abertos ?? 0; }
      else { return sortDir === 'asc' ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome); }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [todos, filtroSistema, filtroStatus, sortBy, sortDir]);

  const summary = useMemo(() => ({
    total: todos.length,
    conformes: todos.filter(s => s.conformidade >= 7).length,
    alertas: todos.filter(s => s.conformidade >= 5 && s.conformidade < 7).length,
    criticos: todos.filter(s => s.conformidade < 5).length,
  }), [todos]);

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  }

  const thC = (col) => ({
    padding: '9px 12px', textAlign: 'left', background: C.codeBg, fontSize: 11,
    fontWeight: 700, color: sortBy === col ? C.accent : C.textMuted,
    borderBottom: `2px solid ${C.border}`, cursor: 'pointer', whiteSpace: 'nowrap',
  });

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total de Sites', val: summary.total, color: C.text, bg: C.surface, icon: '🌐' },
          { label: 'Conformes (≥7/8)', val: summary.conformes, color: C.success, bg: C.successBg, icon: '✅' },
          { label: 'Alertas (5–6/8)', val: summary.alertas, color: C.warning, bg: C.warningBg, icon: '⚠️' },
          { label: 'Críticos (<5/8)', val: summary.criticos, color: C.danger, bg: C.dangerBg, icon: '🔴' },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 700 }}>FILTRAR:</span>
        {['todos', 'AxHub', 'AxCross'].map(f => (
          <button key={f} onClick={() => setFiltroSistema(f)}
            style={{ padding: '4px 12px', fontSize: 12, borderRadius: 5, border: `1px solid ${filtroSistema === f ? C.accent : C.border}`, background: filtroSistema === f ? C.accentBg : 'transparent', color: filtroSistema === f ? C.accent : C.textSecondary, cursor: 'pointer' }}>
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          style={{ padding: '4px 10px', fontSize: 12, borderRadius: 5, border: `1px solid ${C.border}`, background: C.surface, color: C.text, cursor: 'pointer' }}>
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted }}>{filtrados.length} site(s)</span>
      </div>

      {/* Tabela */}
      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto', marginBottom: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thC('nome')} onClick={() => handleSort('nome')}>Site {sortBy === 'nome' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={thC(null)}>Sistema / UF</th>
              <th style={thC(null)}>URL</th>
              <th style={thC('health')} onClick={() => handleSort('health')}>Health {sortBy === 'health' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={thC('conformidade')} onClick={() => handleSort('conformidade')}>Conformidade {sortBy === 'conformidade' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={thC('chamados')} onClick={() => handleSort('chamados')}>Chamados {sortBy === 'chamados' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th style={thC(null)}>Status</th>
              <th style={{ ...thC(null), textAlign: 'center' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((s, i) => {
              const conf = s.conformidade;
              const cc = conf >= 7 ? C.success : conf >= 5 ? C.warning : C.danger;
              const hc = scoreColor(s.healthScore ?? 0);
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.codeBg }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.nome}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: s.sistema === 'AxHub' ? C.accentBg : C.warningBg, color: s.sistema === 'AxHub' ? C.accent : C.warning, padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700 }}>{s.sistema}</span>
                    <span style={{ marginLeft: 6, fontSize: 11, color: C.textMuted }}>{s.estado || '—'}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: C.accent, textDecoration: 'none', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ExternalLink size={10} /> {s.url.replace('https://', '')}
                      </a>
                    ) : <span style={{ color: C.textMuted, fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: hc }}>{s.healthScore ?? '—'}%</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: cc, minWidth: 28 }}>{conf}/8</span>
                      <div style={{ flex: 1, height: 5, background: C.border, borderRadius: 3, minWidth: 50 }}>
                        <div style={{ width: `${(conf / 8) * 100}%`, height: '100%', background: cc, borderRadius: 3 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ color: (s.chamados?.abertos || 0) > 2 ? C.danger : C.text }}>{s.chamados?.abertos ?? 0}</span>
                    {(s.chamados?.criticos || 0) > 0 && <span style={{ marginLeft: 4, color: C.danger, fontSize: 10 }}>⚠️{s.chamados.criticos}</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: s.status === 'ativo' ? C.successBg : C.dangerBg, color: s.status === 'ativo' ? C.success : C.danger }}>{s.status}</span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <button onClick={() => onAuditarSite(s.id)}
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 5, border: `1px solid ${C.accent}`, background: C.accentBg, color: C.accent, cursor: 'pointer', fontWeight: 600 }}>
                      Auditar →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper: detalhe descritivo de cada requisito
function getRequisitoDetalhe(id, site, score) {
  switch (id) {
    case 'ativo':        return `Status atual: ${site.status}`;
    case 'versao':       return `Versão atual: ${site.versao || 'não informada'} — mínima exigida: v.1.2.0`;
    case 'ocr':          return `OCR atual: ${site.ocr != null ? site.ocr + '%' : 'não informado'} — mínimo: 80%`;
    case 'equipamentos': return `Equipamentos: ${typeof site.equipamentos === 'object' ? site.equipamentos?.total : (site.equipamentos ?? 0)} cadastrado(s)`;
    case 'sem-criticos': return `Chamados críticos abertos: ${score?.chamados?.criticos ?? 0}`;
    case 'chamados':     return `Chamados abertos: ${score?.chamados?.abertos ?? 0} — máximo permitido: 2`;
    case 'health':       return `Health Score: ${score?.healthScore ?? 'N/A'}% — mínimo exigido: 70%`;
    case 'afericao':     return site.data_afericao ? `Última aferição: ${site.data_afericao}` : 'Nenhuma aferição registrada';
    default: return '';
  }
}

function getRecomendacao(id, site, score) {
  switch (id) {
    case 'ativo':        return 'Verificar integração e comunicação com o site para reativação.';
    case 'versao':       return `Atualizar de ${site.versao || 'versão atual'} para v.1.2.0 ou superior.`;
    case 'ocr':          return `OCR em ${site.ocr}% — abaixo do mínimo de 80%. Verificar calibração das câmeras.`;
    case 'equipamentos': return 'Cadastrar equipamentos no sistema antes de iniciar operação.';
    case 'sem-criticos': return `${score?.chamados?.criticos} chamado(s) crítico(s) em aberto — resolver via helpdesk com urgência.`;
    case 'chamados':     return `${score?.chamados?.abertos} chamados abertos — meta máxima é 2. Verificar fila de atendimento.`;
    case 'health':       return `Health Score ${score?.healthScore}% abaixo do mínimo. Verificar OCR, versão e chamados.`;
    case 'afericao':     return 'Registrar data e certificado de aferição do equipamento.';
    default: return 'Verificar e corrigir conforme padrão Axion.';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDITORIA DE SITE — Análise completa de um único site selecionável
// ═══════════════════════════════════════════════════════════════════════════════
function AuditoriaSite({ chamadosData, sitesComScore, siteInicial, onMudarSite }) {
  const [siteId, setSiteId] = useState(siteInicial || '');

  useEffect(() => {
    if (siteInicial && siteInicial !== siteId) setSiteId(siteInicial);
  }, [siteInicial]);

  const site = TODOS_SITES.find(s => s.id === siteId) || null;

  const siteScore = useMemo(() => {
    if (!site) return null;
    const fromList = sitesComScore?.find(s => s.id === siteId);
    if (fromList) return { healthScore: fromList.healthScore, chamados: fromList.chamados };
    return {
      healthScore: calcHealthScore(site, chamadosData),
      chamados: chamadosData?.ranking?.find(r => r.siteId === siteId) || { abertos: 0, criticos: 0 },
    };
  }, [site, siteId, sitesComScore, chamadosData]);

  const reqs = useMemo(() => site ? REQUISITOS.map(r => ({
    ...r,
    ok: r.check(site, siteScore),
    detalhe: getRequisitoDetalhe(r.id, site, siteScore),
    recomendacao: getRecomendacao(r.id, site, siteScore),
  })) : [], [site, siteScore]);

  const aprovados = reqs.filter(r => r.ok).length;
  const reprovados = reqs.filter(r => !r.ok);

  return (
    <div>
      {/* Seletor de site / URL */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Selecionar Site / URL para Auditoria
          </label>
          <select value={siteId} onChange={e => { setSiteId(e.target.value); onMudarSite?.(e.target.value); }}
            style={{ padding: '10px 14px', fontSize: 13, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, width: '100%', cursor: 'pointer' }}>
            <option value="">— Selecione um site para auditar —</option>
            <optgroup label="AxHub">
              {AXHUB_SITES.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.estado} · {s.url?.replace('https://', '') || 'sem URL'}</option>)}
            </optgroup>
            <optgroup label="AxCross">
              {AXCROSS_SITES.map(s => <option key={s.id} value={s.id}>{s.nome} — {s.estado} · {s.url?.replace('https://', '') || 'sem URL'}</option>)}
            </optgroup>
          </select>
        </div>
        {site?.url && (
          <a href={site.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: 8, color: C.accent, textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            <ExternalLink size={14} /> Abrir Site
          </a>
        )}
      </div>

      {!site && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
          <Shield size={40} style={{ marginBottom: 12, opacity: 0.25 }} />
          <p style={{ fontSize: 14 }}>Selecione um site acima para iniciar a auditoria completa</p>
        </div>
      )}

      {site && (
        <>
          {/* Header do site */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(96,205,255,0.04) 0%, rgba(108,203,95,0.04) 100%)', borderColor: C.accentBorder }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{site.nome}</h2>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{site.orgao || '—'} · {site.estado} · {site.tipo || '—'}</div>
                {site.url && (
                  <a href={site.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <ExternalLink size={11} /> {site.url}
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: site.sistema === 'AxHub' ? C.accentBg : C.warningBg, color: site.sistema === 'AxHub' ? C.accent : C.warning }}>{site.sistema}</span>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: site.status === 'ativo' ? C.successBg : C.dangerBg, color: site.status === 'ativo' ? C.success : C.danger }}>{site.status}</span>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { l: 'Health Score', v: siteScore ? `${siteScore.healthScore}%` : '—', c: siteScore ? scoreColor(siteScore.healthScore) : C.textMuted, icon: '💚' },
              { l: 'Conformidade', v: `${aprovados}/8`, c: aprovados >= 7 ? C.success : aprovados >= 5 ? C.warning : C.danger, icon: '🛡️' },
              { l: 'Chamados Abertos', v: siteScore?.chamados?.abertos ?? '—', c: (siteScore?.chamados?.abertos || 0) > 2 ? C.danger : C.success, icon: '🎫' },
              { l: 'Chamados Críticos', v: siteScore?.chamados?.criticos ?? '—', c: (siteScore?.chamados?.criticos || 0) > 0 ? C.danger : C.success, icon: '🔴' },
              { l: 'OCR', v: site.ocr != null ? `${site.ocr}%` : '—', c: site.ocr >= 80 ? C.success : site.ocr != null ? C.warning : C.textMuted, icon: '📷' },
              { l: 'Versão', v: site.versao || '—', c: site.versao && site.versao >= 'v.1.2.0' ? C.success : C.warning, icon: '🏷️' },
            ].map(k => (
              <div key={k.l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.c, lineHeight: 1 }}>{k.v}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Checklist completo */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>📋 Checklist de Conformidade — Todos os Requisitos</h3>
              <span style={{ fontSize: 12, fontWeight: 700, color: aprovados >= 7 ? C.success : aprovados >= 5 ? C.warning : C.danger }}>
                {aprovados >= 7 ? '✅ Conforme' : aprovados >= 5 ? '⚠️ Atenção' : '🔴 Crítico'} — {aprovados}/{REQUISITOS.length}
              </span>
            </div>
            {/* Barra de progresso geral */}
            <div style={{ height: 6, background: C.border, borderRadius: 3, marginBottom: 16 }}>
              <div style={{ width: `${(aprovados / REQUISITOS.length) * 100}%`, height: '100%', background: aprovados >= 7 ? C.success : aprovados >= 5 ? C.warning : C.danger, borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reqs.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: 7,
                  background: r.ok ? C.successBg : C.dangerBg,
                  border: `1px solid ${r.ok ? 'rgba(108,203,95,0.2)' : 'rgba(255,153,164,0.2)'}`,
                }}>
                  {r.ok ? <CheckCircle2 size={16} color={C.success} style={{ flexShrink: 0, marginTop: 1 }} /> : <XCircle size={16} color={C.danger} style={{ flexShrink: 0, marginTop: 1 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: r.ok ? C.text : C.danger }}>{r.icon} {r.label}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{r.detalhe}</div>
                    {!r.ok && (
                      <div style={{ fontSize: 11, color: C.warning, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ArrowRight size={10} /> {r.recomendacao}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalhes técnicos */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>🔧 Detalhes Técnicos do Site</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {[
                { l: 'Versão', v: site.versao || '—' },
                { l: 'OCR (%)', v: site.ocr != null ? `${site.ocr}%` : '—' },
                { l: 'Equipamentos', v: typeof site.equipamentos === 'object' ? `${site.equipamentos.total} total (${site.equipamentos.grupos?.join(', ') || '—'})` : site.equipamentos ?? '—' },
                { l: 'Fabricantes', v: site.fabricantes?.join(', ') || '—' },
                { l: 'Tipo', v: site.tipo || '—' },
                { l: 'Estado / UF', v: site.estado || '—' },
                { l: 'Órgão', v: site.orgao || '—' },
                { l: 'Passagens/Dia', v: site.passagensDia ? site.passagensDia.toLocaleString('pt-BR') : '—' },
                { l: 'Total de Menus', v: site.menuCount || '—' },
                { l: 'Relatórios BI', v: site.bi?.length ? `${site.bi.length} relatórios` : '—' },
                { l: 'Extras', v: site.extras?.join(', ') || '—' },
                { l: 'Observações', v: site.observacoes || '—' },
              ].map(row => (
                <div key={row.l} style={{ padding: '10px 14px', background: C.codeBg, borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{row.l}</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{String(row.v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendações de correção */}
          {reprovados.length > 0 ? (
            <div style={{ ...cardStyle, borderColor: C.dangerBorder }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.danger }}>⚡ Plano de Correção — {reprovados.length} item(ns) reprovado(s)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reprovados.map((r, i) => (
                  <div key={r.id} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: C.dangerBg, borderRadius: 7, borderLeft: `3px solid ${C.danger}` }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.danger, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.icon} {r.label}</div>
                      <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>{r.recomendacao}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ ...cardStyle, borderColor: C.success, background: C.successBg, textAlign: 'center', padding: 24 }}>
              <CheckCircle2 size={28} color={C.success} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: C.success }}>Site em plena conformidade — todos os {REQUISITOS.length} requisitos atendidos</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RELATÓRIO GERENCIAL — visão consolidada para impressão / exportação
// ═══════════════════════════════════════════════════════════════════════════════
function Relatorio({ sitesComScore }) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const dados = useMemo(() => {
    return (sitesComScore || TODOS_SITES.map(s => ({
      ...s, healthScore: calcHealthScore(s, null), chamados: { abertos: 0, criticos: 0 },
    }))).map(s => {
      const score = { healthScore: s.healthScore, chamados: s.chamados };
      return { ...s, conformidade: REQUISITOS.filter(r => r.check(s, score)).length };
    }).sort((a, b) => a.conformidade - b.conformidade);
  }, [sitesComScore]);

  const summary = {
    total: dados.length,
    conformes: dados.filter(s => s.conformidade >= 7).length,
    alertas: dados.filter(s => s.conformidade >= 5 && s.conformidade < 7).length,
    criticos: dados.filter(s => s.conformidade < 5).length,
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(96,205,255,0.05) 0%, rgba(108,203,95,0.05) 100%)', borderColor: C.accentBorder }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📋 Relatório Gerencial — Central de Validação</h2>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Gerado em: {hoje} · Axion Tecnologia · {dados.length} sites avaliados</div>
          </div>
          <button onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: 8, color: C.accent, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            🖨️ Imprimir / Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Total de Sites', v: summary.total, c: C.text, bg: C.surface },
          { l: 'Conformes (≥7/8)', v: summary.conformes, c: C.success, bg: C.successBg },
          { l: 'Alertas (5–6/8)', v: summary.alertas, c: C.warning, bg: C.warningBg },
          { l: 'Críticos (<5/8)', v: summary.criticos, c: C.danger, bg: C.dangerBg },
        ].map(k => (
          <div key={k.l} style={{ background: k.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: k.c }}>{k.v}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Tabela do relatório */}
      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.codeBg }}>
              {['Site', 'Sistema', 'URL', 'Health', 'Conformidade', 'Chamados', 'Status', 'Resultado'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Site' || h === 'Sistema' || h === 'URL' ? 'left' : 'center', borderBottom: `2px solid ${C.border}`, fontWeight: 700, color: C.textMuted, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.map((s, i) => {
              const conf = s.conformidade;
              const cc = conf >= 7 ? C.success : conf >= 5 ? C.warning : C.danger;
              const resultado = conf >= 7 ? 'CONFORME' : conf >= 5 ? 'ALERTA' : 'CRÍTICO';
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: conf < 5 ? `rgba(255,153,164,0.05)` : conf < 7 ? `rgba(252,225,0,0.04)` : 'transparent' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{s.nome}</td>
                  <td style={{ padding: '8px 12px', color: C.textMuted }}>{s.sistema}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, fontSize: 11 }}>{s.url.replace('https://', '')}</a> : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: scoreColor(s.healthScore ?? 0) }}>{s.healthScore ?? '—'}%</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: cc }}>{conf}/8</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: (s.chamados?.abertos || 0) > 2 ? C.danger : C.text }}>{s.chamados?.abertos ?? 0}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: s.status === 'ativo' ? C.successBg : C.dangerBg, color: s.status === 'ativo' ? C.success : C.danger }}>{s.status}</span>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: conf >= 7 ? C.successBg : conf >= 5 ? C.warningBg : C.dangerBg, color: cc }}>{resultado}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rodapé */}
      <div style={{ padding: '12px 16px', background: C.codeBg, borderRadius: 8, fontSize: 11, color: C.textMuted, textAlign: 'center' }}>
        Relatório gerado automaticamente — Central de Validação · Axion Tecnologia · {hoje}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Auditoria() {
  const [tabAtiva, setTabAtiva]           = useState('painel');
  const [siteAuditadoId, setSiteAuditadoId] = useState('');
  const [chamadosData, setChamadosData]   = useState(null);
  // States usados pela aba Caso T1051
  const [tab, setTab]                     = useState("comparativo");
  const [expandedIndicadores, setExpandedIndicadores] = useState(true);
  const [viewMode, setViewMode]           = useState("lado-a-lado");
  const [highlightDiff, setHighlightDiff] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { api } = await import('../../../services/api');
        const r = await api.get('/helpdesk/sites-overview');
        setChamadosData(r.data);
      } catch {}
    })();
  }, []);

  const sitesComScore = useMemo(() => TODOS_SITES.map(s => ({
    ...s,
    healthScore: calcHealthScore(s, chamadosData),
    chamados: chamadosData?.ranking?.find(r => r.siteId === s.id) || { abertos: 0, criticos: 0 },
  })), [chamadosData]);

  return (
    <div style={{ color: C.text, maxWidth: 1600, margin: "0 auto", padding: "20px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={22} color={C.accent} />
            Central de Validação
          </h1>
          <p style={{ margin: "4px 0 0", color: C.textMuted, fontSize: 13 }}>
            Hub unificado de validação, revisão e controle de qualidade — {TODOS_SITES.length} sites monitorados
          </p>
        </div>
        {tabAtiva === "duplicidade" && (
          <a href="https://desk.axiontecnologia.com.br/Ticket/100423690" target="_blank" rel="noopener noreferrer"
            style={{ background: C.raised, color: C.accent, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 14px", fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
            <ExternalLink size={12} /> Ticket #100423690
          </a>
        )}
      </div>

      {/* Tabs principais */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, background: C.raised, borderRadius: 8, padding: 3 }}>
        {[
          { key: 'painel',       label: '📊 Visão Geral' },
          { key: 'auditoria',    label: '🔍 Auditoria de Site' },
          { key: 'comparar',     label: '⚖️ Comparar Sites' },
          { key: 'duplicidade',  label: '🔎 Caso T1051' },
          { key: 'relatorio',    label: '📋 Relatório' },
        ].map(t => (
          <button key={t.key} onClick={() => setTabAtiva(t.key)}
            style={{ flex: 1, padding: "10px 16px", border: "none", borderRadius: 6, cursor: "pointer",
              background: tabAtiva === t.key ? C.accent : "transparent",
              color: tabAtiva === t.key ? "#000" : C.textSecondary,
              fontWeight: tabAtiva === t.key ? 700 : 400, fontSize: 13, transition: "all .15s", whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Roteamento de tabs */}
      {tabAtiva === 'painel'    && <PainelGeral sitesComScore={sitesComScore} onAuditarSite={(id) => { setSiteAuditadoId(id); setTabAtiva('auditoria'); }} />}
      {tabAtiva === 'auditoria' && <AuditoriaSite chamadosData={chamadosData} sitesComScore={sitesComScore} siteInicial={siteAuditadoId} onMudarSite={setSiteAuditadoId} />}
      {tabAtiva === 'comparar'  && <ComparadorSites />}
      {tabAtiva === 'relatorio' && <Relatorio sitesComScore={sitesComScore} />}

      {/* ═══ TAB: CASO T1051 — ANÁLISE DE DUPLICIDADE ═══ */}
      {tabAtiva === "duplicidade" && (
        <>

      {/* Resumo do Caso */}
      <div style={{ ...cardStyle, padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { label: "Placa", value: CASO.placa, icon: "🚗" },
          { label: "Veículo", value: `${CASO.veiculo} (${CASO.cor})`, icon: "🏷️" },
          { label: "Equipamento", value: `${CASO.equipamento_codigo} / ${CASO.equipamento_modelo}`, icon: "📡" },
          { label: "Série", value: CASO.equipamento_serie, icon: "🔢" },
          { label: "Local", value: CASO.local, icon: "📍" },
          { label: "Vel. Regulamentada", value: `${CASO.velocidade_regulamentada} km/h`, icon: "⚡" },
          { label: "Lote", value: `${CASO.lote_importacao} (${CASO.quantidade_processadas_lote} proc.)`, icon: "📦" },
          { label: "Aferição", value: CASO.data_afericao, icon: "📋" }
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{item.label}</div>
              <div style={{ fontSize: 12, fontWeight: 500, fontFamily: "monospace" }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Veredicto Rápido */}
      <div style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(255,153,164,0.06) 0%, rgba(252,225,0,0.04) 100%)", borderColor: C.dangerBorder, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <AlertTriangle size={22} color={C.danger} />
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3 style={{ margin: 0, fontSize: 14, color: C.danger }}>{AUTO_ANALISE.veredicto}</h3>
            <span style={{ fontSize: 12, color: C.textMuted }}>Confiança: <strong style={{ color: C.success }}>{AUTO_ANALISE.confianca}</strong></span>
          </div>
          <Badge type="success" large>Válido: {AUTO_ANALISE.registro_valido}</Badge>
          <Badge type="danger" large>Inválido: {AUTO_ANALISE.registro_invalido}</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: C.raised, borderRadius: 8, padding: 3 }}>
        {[
          { key: "comparativo", label: "⚖️ Comparativo 3 Fontes" },
          { key: "indicadores", label: "📊 Indicadores & Auto-Análise" },
          { key: "diagnostico", label: "🔍 Diagnóstico Completo" },
          { key: "acoes", label: "✅ Ações & Recomendações" }
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: "10px 16px", border: "none", borderRadius: 6, cursor: "pointer", background: tab === t.key ? C.accent : "transparent", color: tab === t.key ? "#000" : C.textSecondary, fontWeight: tab === t.key ? 600 : 400, fontSize: 13, transition: "all .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: COMPARATIVO 3 FONTES ═══ */}
      {tab === "comparativo" && (
        <>
          {/* Controles */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 2, background: C.raised, borderRadius: 6, padding: 2 }}>
              {[{ key: "lado-a-lado", label: "Lado a Lado" }, { key: "tabela-unica", label: "Tabela Unificada" }].map(m => (
                <button key={m.key} onClick={() => setViewMode(m.key)}
                  style={{ padding: "6px 14px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, background: viewMode === m.key ? C.accent : "transparent", color: viewMode === m.key ? "#000" : C.textSecondary, fontWeight: viewMode === m.key ? 600 : 400 }}>
                  {m.label}
                </button>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted, cursor: "pointer" }}>
              <input type="checkbox" checked={highlightDiff} onChange={e => setHighlightDiff(e.target.checked)} style={{ accentColor: C.accent }} />
              Destacar Divergências
            </label>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.purple }}>📷 Imagem Helpdesk</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.accent }}>🔌 Integrador API</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.warning }}>💾 AxHub Sistema</span>
            </div>
          </div>

          {/* TABELA UNIFICADA */}
          {viewMode === "tabela-unica" && (
            <div style={{ ...cardStyle, overflowX: "auto", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: C.codeBg }}>
                    <th rowSpan={2} style={{ padding: "10px 12px", textAlign: "left", color: C.textMuted, borderBottom: `2px solid ${C.border}`, borderRight: `2px solid ${C.border}`, width: "11%" }}>Campo</th>
                    <th colSpan={3} style={{ padding: "8px 12px", textAlign: "center", color: C.success, borderBottom: `1px solid ${C.border}`, borderRight: `2px solid ${C.border}` }}>Infração 1 (Restante: 2) ✓</th>
                    <th colSpan={3} style={{ padding: "8px 12px", textAlign: "center", color: C.danger, borderBottom: `1px solid ${C.border}` }}>Infração 2 (Restante: 1) ✗</th>
                    <th rowSpan={2} style={{ padding: "8px", textAlign: "center", color: C.textMuted, borderBottom: `2px solid ${C.border}`, borderLeft: `2px solid ${C.border}`, width: "5%" }}>⚙️</th>
                  </tr>
                  <tr style={{ background: C.codeBg, borderBottom: `2px solid ${C.border}` }}>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 10, color: C.purple }}>📷 Img</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 10, color: C.accent }}>🔌 API</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 10, color: C.warning, borderRight: `2px solid ${C.border}` }}>💾 AxHub</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 10, color: C.purple }}>📷 Img</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 10, color: C.accent }}>🔌 API</th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 10, color: C.warning }}>💾 AxHub</th>
                  </tr>
                </thead>
                <tbody>
                  {CAMPOS_COMPARACAO.map((row, idx) => {
                    const hasDiff = row.status2 === "critico";
                    const bgRow = hasDiff && highlightDiff ? C.dangerBg : (idx % 2 === 0 ? "transparent" : C.codeBg);
                    return (
                      <tr key={row.campo} style={{ borderBottom: `1px solid ${C.border}`, background: bgRow }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600, fontSize: 11, color: hasDiff ? C.danger : C.text, borderRight: `2px solid ${C.border}` }}>{row.campo}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "monospace", fontSize: 11, color: C.purple }}>{row.img1}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "monospace", fontSize: 11, color: C.accent }}>{row.api1}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "monospace", fontSize: 11, color: C.warning, borderRight: `2px solid ${C.border}` }}>{row.axhub1}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "monospace", fontSize: 11, color: hasDiff ? C.danger : C.purple, fontWeight: hasDiff ? 700 : 400 }}>{row.img2}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "monospace", fontSize: 11, color: hasDiff ? C.danger : C.accent, fontWeight: hasDiff ? 700 : 400 }}>{row.api2}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", fontFamily: "monospace", fontSize: 11, color: hasDiff ? C.danger : C.warning, fontWeight: hasDiff ? 700 : 400 }}>{row.axhub2}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", borderLeft: `2px solid ${C.border}` }}>
                          {row.status2 === "ok" ? <CheckCircle2 size={13} color={C.success} /> : <XCircle size={13} color={C.danger} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* LADO A LADO */}
          {viewMode === "lado-a-lado" && (
            <>
              {/* Infração 1 — OK */}
              <div style={{ ...cardStyle, borderColor: "rgba(108,203,95,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Badge type="success" large>✓ Infração 1</Badge>
                  <span style={{ fontSize: 12, color: C.textMuted }}>Restante Lote: 2 — 3 fontes CONSISTENTES</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: C.success, fontWeight: 600 }}>100% ÍNTEGRO</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <SourceCard title="Imagem Helpdesk" icon="📷" color={C.purple} bgColor={C.purpleBg} borderColor="rgba(196,165,255,0.2)" data={INFRACAO_1.imagem_helpdesk} />
                  <SourceCard title="Integrador API" icon="🔌" color={C.accent} bgColor={C.accentBg} borderColor={C.accentBorder} data={INFRACAO_1.integrador_api} />
                  <SourceCard title="AxHub Sistema" icon="💾" color={C.warning} bgColor={C.warningBg} borderColor="rgba(252,225,0,0.2)" data={INFRACAO_1.axhub_sistema} />
                </div>
              </div>

              {/* Infração 2 — PROBLEMA */}
              <div style={{ ...cardStyle, borderColor: C.dangerBorder }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Badge type="danger" large>✗ Infração 2</Badge>
                  <span style={{ fontSize: 12, color: C.textMuted }}>Restante Lote: 1 — Imagem ≠ API/AxHub</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: C.danger, fontWeight: 600 }}>DADOS CORROMPIDOS</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <SourceCard title="Imagem Helpdesk" icon="📷" color={C.purple} bgColor={C.purpleBg} borderColor="rgba(196,165,255,0.2)" data={INFRACAO_2.imagem_helpdesk} badge="VERDADE" badgeType="success" diffKeys={["velocidade_medida","velocidade_considerada","codigo_enquadramento"]} highlightDiff={highlightDiff} />
                  <SourceCard title="Integrador API" icon="🔌" color={C.danger} bgColor={C.dangerBg} borderColor={C.dangerBorder} data={INFRACAO_2.integrador_api} badge="CORROMPIDO" badgeType="danger" diffKeys={["velocidade_medida","velocidade_considerada","codigo_enquadramento"]} highlightDiff={highlightDiff} isDanger />
                  <SourceCard title="AxHub Sistema" icon="💾" color={C.danger} bgColor={C.dangerBg} borderColor={C.dangerBorder} data={INFRACAO_2.axhub_sistema} badge="INCORRETO" badgeType="danger" diffKeys={["velocidade_medida","velocidade_considerada","codigo_enquadramento"]} highlightDiff={highlightDiff} isDanger />
                </div>
              </div>

              {/* Mapa de Divergências Visual */}
              <div style={{ ...cardStyle, borderColor: C.dangerBorder }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, color: C.danger }}>
                  <AlertTriangle size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Mapa de Divergências — Infração 2
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
                  {[
                    { campo: "Velocidade Medida", img: "088 km/h", api: "70 km/h" },
                    { campo: "Velocidade Considerada", img: "081 km/h", api: "63 km/h" },
                    { campo: "Cód. Enquadramento", img: "74630", api: "74550" }
                  ].map((item, idx) => (
                    <div key={item.campo} style={{ padding: 16, borderRight: idx < 2 ? `1px solid ${C.border}` : "none", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10, fontWeight: 600 }}>{item.campo}</div>
                      <div style={{ padding: "8px 12px", background: C.successBg, borderRadius: 6, border: "1px solid rgba(108,203,95,0.3)", marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: C.textMuted }}>📷 Imagem (VERDADE)</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: C.success, fontFamily: "monospace" }}>{item.img}</div>
                      </div>
                      <div style={{ fontSize: 16, color: C.danger, marginBottom: 8 }}>≠</div>
                      <div style={{ padding: "8px 12px", background: C.dangerBg, borderRadius: 6, border: `1px solid ${C.dangerBorder}` }}>
                        <div style={{ fontSize: 10, color: C.textMuted }}>🔌 API / 💾 AxHub</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: C.danger, fontFamily: "monospace" }}>{item.api}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "10px 14px", background: C.codeBg, borderRadius: 6, borderLeft: `3px solid ${C.danger}` }}>
                  <span style={{ fontSize: 12, color: C.textSecondary }}>
                    <strong style={{ color: C.danger }}>Conclusão:</strong> A tarja queimada na imagem é prova irrefutável. Os dados do Integrador/AxHub para a Infração 2 estão CORROMPIDOS — não correspondem à evidência fotográfica.
                  </span>
                </div>
              </div>

              {/* Validação: Imagens idênticas */}
              <div style={{ ...cardStyle, borderColor: "rgba(196,165,255,0.3)", background: "linear-gradient(135deg, rgba(196,165,255,0.04) 0%, rgba(96,205,255,0.04) 100%)" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 15, color: C.purple }}>
                  <Layers size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Validação: Imagens Integradas pela API são IDÊNTICAS
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
                  <div style={{ padding: 14, background: C.codeBg, borderRadius: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Imagem 1 — Tarja</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: C.purple, lineHeight: 1.8 }}>
                      VEL MED: <strong>088</strong><br />
                      VEL CONS: <strong>081</strong><br />
                      CÓD ENQ: <strong>74630</strong><br />
                      NO.SEQ.REG: <strong>44</strong><br />
                      SERIAL: <strong>FLSSD2206A00599</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, color: C.success }}>═</div>
                    <Badge type="success" large>IDÊNTICAS</Badge>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Mesma captura física</div>
                  </div>
                  <div style={{ padding: 14, background: C.codeBg, borderRadius: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Imagem 2 — Tarja</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: C.purple, lineHeight: 1.8 }}>
                      VEL MED: <strong>088</strong><br />
                      VEL CONS: <strong>081</strong><br />
                      CÓD ENQ: <strong>74630</strong><br />
                      NO.SEQ.REG: <strong>44</strong><br />
                      SERIAL: <strong>FLSSD2206A00599</strong>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: "10px 14px", background: C.warningBg, borderRadius: 6, borderLeft: `3px solid ${C.warning}` }}>
                  <span style={{ fontSize: 12, color: C.textSecondary }}>
                    <strong style={{ color: C.warning }}>Prova definitiva:</strong> Tarjas byte-a-byte idênticas — mesmo NO.SEQ.REG (44), mesmo serial, mesmos valores. É a MESMA captura do DTV202 registrada 2x com metadados diferentes.
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ TAB: INDICADORES ═══ */}
      {tab === "indicadores" && (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { valor: INDICADORES.filter(i => i.tipo === "critico").length, label: "Anomalias Críticas", color: C.danger },
              { valor: INDICADORES.filter(i => i.tipo === "alerta").length, label: "Alertas", color: C.warning },
              { valor: INDICADORES.filter(i => i.tipo === "ok").length, label: "OK", color: C.success },
              { valor: INDICADORES.length, label: "Total Indicadores", color: C.accent }
            ].map(k => (
              <div key={k.label} style={{ ...cardStyle, padding: 14, marginBottom: 0, borderColor: `${k.color}33` }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.valor}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Lista Indicadores */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>
                <Activity size={16} style={{ marginRight: 6, verticalAlign: "middle", color: C.accent }} />
                Indicadores Analisados ({INDICADORES.length})
              </h3>
              <button onClick={() => setExpandedIndicadores(!expandedIndicadores)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                {expandedIndicadores ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expandedIndicadores ? "Recolher" : "Expandir"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {INDICADORES.map(ind => {
                const resultColors = { CONFIRMADO: "info", ANOMALIA: "danger", OK: "success", FALHA: "danger", ESPERADO: "warning" };
                return (
                  <div key={ind.id} style={{
                    padding: "12px 16px", borderRadius: 8,
                    background: ind.tipo === "critico" || ind.tipo === "falha" ? C.dangerBg : ind.tipo === "ok" ? C.successBg : C.warningBg,
                    border: `1px solid ${ind.tipo === "critico" || ind.tipo === "falha" ? C.dangerBorder : ind.tipo === "ok" ? "rgba(108,203,95,0.2)" : "rgba(252,225,0,0.2)"}`,
                    display: "flex", alignItems: "flex-start", gap: 12
                  }}>
                    <StatusDot status={ind.tipo} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: 13, color: C.text }}>{ind.nome}</strong>
                        <Badge type={resultColors[ind.resultado] || "info"}>{ind.resultado}</Badge>
                        <span style={{ fontSize: 10, color: C.textMuted, marginLeft: "auto" }}>{ind.fonte}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: C.textSecondary }}>{ind.descricao}</p>
                      {expandedIndicadores && (
                        <div style={{ marginTop: 6, fontSize: 11, color: C.textMuted, padding: "4px 8px", background: C.codeBg, borderRadius: 4 }}>
                          <strong>Evidência:</strong> {ind.evidencia}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-Análise Consolidada */}
          <div style={{ ...cardStyle, borderColor: C.dangerBorder, background: "linear-gradient(135deg, rgba(255,153,164,0.04) 0%, rgba(252,225,0,0.03) 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: C.danger }}>
                <Zap size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Auto-Análise Consolidada
              </h3>
              <Badge type="danger" large>Confiança: {AUTO_ANALISE.confianca}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 14, background: C.successBg, borderRadius: 8, border: "1px solid rgba(108,203,95,0.2)" }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Registro VÁLIDO</div>
                <div style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>{AUTO_ANALISE.registro_valido}</div>
              </div>
              <div style={{ padding: 14, background: C.dangerBg, borderRadius: 8, border: `1px solid ${C.dangerBorder}` }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Registro INVÁLIDO</div>
                <div style={{ fontSize: 13, color: C.danger, fontWeight: 600 }}>{AUTO_ANALISE.registro_invalido}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, color: C.danger }}>Falhas Detectadas ({AUTO_ANALISE.falhas_detectadas.length})</h4>
              {AUTO_ANALISE.falhas_detectadas.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, padding: "6px 10px", background: C.codeBg, borderRadius: 4 }}>
                  <XCircle size={12} color={C.danger} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.textSecondary }}>{f}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, color: C.success }}>Recomendações ({AUTO_ANALISE.recomendacoes.length})</h4>
              {AUTO_ANALISE.recomendacoes.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, padding: "6px 10px", background: C.successBg, borderRadius: 4 }}>
                  <CheckCircle2 size={12} color={C.success} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.textSecondary }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══ TAB: DIAGNÓSTICO ═══ */}
      {tab === "diagnostico" && (
        <>
          {/* Timeline */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15 }}>
              <Clock size={16} style={{ marginRight: 6, verticalAlign: "middle", color: C.warning }} />
              Sequência dos Eventos
            </h3>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              {[
                { step: "Veículo BYD/Dolphin Mini (UJN9C59) passa pelo radar SL316R-2 às 16:30:22 a 88 km/h (regulamentada: 60 km/h)", tipo: "normal" },
                { step: "Equipamento DTV202 (FLSSD2206A00599) captura imagem e grava tarja: VEL MED 088, VEL CONS 081, CÓD ENQ 74630, SEQ REG 44", tipo: "normal" },
                { step: "Equipamento envia 1ª integração via Integrador — payload: vel.medida=88, vel.considerada=81, enquadramento=74630", tipo: "normal" },
                { step: "AxHub GRAVA Registro 1: 88/81/74630 — CORRETO (= tarja da imagem)", tipo: "ok" },
                { step: "Equipamento reenvia MESMA imagem (mesma tarja, mesmo NO.SEQ.REG 44) — provável retry por timeout", tipo: "alerta" },
                { step: "2ª importação: payload do Integrador chegou CORROMPIDO: vel.medida=70, vel.considerada=63, enquadramento=74550", tipo: "critico" },
                { step: "AxHub GRAVA Registro 2: 70/63/74550 — NÃO coincide com tarja da imagem vinculada!", tipo: "critico" },
                { step: "Sistema NÃO verificou inconsistência payload vs tarja", tipo: "falha" },
                { step: "Sistema NÃO verificou NO.SEQ.REG 44 duplicado (mesmo equip + placa + hora)", tipo: "falha" },
                { step: "Ambos registros entraram como 'Processada' no lote 07/06/2026 (782 processadas)", tipo: "alerta" }
              ].map((item, idx) => {
                const colors = { normal: C.accent, ok: C.success, alerta: C.warning, critico: C.danger, falha: C.danger };
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", marginBottom: 10, position: "relative" }}>
                    <div style={{ position: "absolute", left: -28, width: 20, height: 20, borderRadius: "50%", background: `${colors[item.tipo]}22`, border: `2px solid ${colors[item.tipo]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: colors[item.tipo], fontWeight: 700 }}>{idx + 1}</div>
                    {idx < 9 && <div style={{ position: "absolute", left: -19, top: 22, width: 2, height: 18, background: C.border }} />}
                    <div style={{ padding: "8px 14px", borderRadius: 6, fontSize: 12, flex: 1, background: item.tipo === "critico" || item.tipo === "falha" ? C.dangerBg : item.tipo === "ok" ? C.successBg : C.codeBg, borderLeft: `3px solid ${colors[item.tipo]}`, color: item.tipo === "critico" || item.tipo === "falha" ? C.danger : C.text, fontWeight: item.tipo === "critico" || item.tipo === "falha" ? 600 : 400 }}>
                      {item.step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alarme de Duplicidade */}
          <div style={{ ...cardStyle, borderColor: C.accentBorder }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.accent }}>
              <Shield size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Alarme de Infração Duplicada — Diagnóstico
            </h3>
            <div style={{ padding: 14, background: C.codeBg, borderRadius: 8, marginBottom: 14, borderLeft: `4px solid ${C.accent}` }}>
              <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 6 }}>🔔 Parâmetro: "Tempo de Infração Duplicada"</div>
              <p style={{ margin: 0, fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>
                O AxHub verifica se existe infração com TODOS os campos iguais (Placa + Equip + Faixa + Vel.Medida + Vel.Considerada + Enquadramento) dentro de janela temporal. Se TODOS coincidem → alarme dispara.
              </p>
            </div>
            <div style={{ padding: 14, background: C.warningBg, borderRadius: 8, marginBottom: 14, borderLeft: `3px solid ${C.warning}` }}>
              <strong style={{ fontSize: 12, color: C.warning }}>⚠️ Por que NÃO disparou?</strong>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: C.textSecondary }}>
                Dados numéricos DIVERGEM entre registros (88≠70, 81≠63, 74630≠74550). O alarme compara DADOS do banco — como divergem, conclui que são infrações distintas. Operou conforme projetado, mas lógica é insuficiente.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 12, background: C.dangerBg, borderRadius: 8, border: `1px solid ${C.dangerBorder}` }}>
                <h5 style={{ margin: "0 0 8px", fontSize: 12, color: C.danger }}>✗ DIVERGENTES (impedem alarme)</h5>
                {[{ campo: "Vel. Medida", v1: "88", v2: "70" }, { campo: "Vel. Considerada", v1: "81", v2: "63" }, { campo: "Enquadramento", v1: "74630", v2: "74550" }].map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", fontSize: 12 }}>
                    <span style={{ color: C.textMuted }}>{c.campo}</span>
                    <span><span style={{ color: C.accent, fontFamily: "monospace" }}>{c.v1}</span> <span style={{ color: C.danger }}>≠</span> <span style={{ color: C.warning, fontFamily: "monospace" }}>{c.v2}</span></span>
                  </div>
                ))}
              </div>
              <div style={{ padding: 12, background: C.successBg, borderRadius: 8, border: "1px solid rgba(108,203,95,0.2)" }}>
                <h5 style={{ margin: "0 0 8px", fontSize: 12, color: C.success }}>✓ IGUAIS</h5>
                {[{ campo: "Placa", valor: "UJN9C59" }, { campo: "Equipamento", valor: "SL316R-2" }, { campo: "Faixa", valor: "Faixa 2" }, { campo: "DataHora", valor: "16:30:22" }, { campo: "NO.SEQ.REG", valor: "44" }, { campo: "Serial", valor: "FLSSD2206A00599" }, { campo: "Tarja", valor: "088/081/74630" }].map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < 6 ? `1px solid ${C.border}` : "none", fontSize: 11 }}>
                    <span style={{ color: C.textMuted }}>{c.campo}</span>
                    <span style={{ color: C.success, fontFamily: "monospace" }}>{c.valor} ✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Causa Raiz */}
          <div style={{ ...cardStyle, borderColor: C.dangerBorder }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.danger }}>
              <Zap size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Causa Raiz
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ padding: 14, background: C.codeBg, borderRadius: 8, borderLeft: `3px solid ${C.warning}` }}>
                <strong style={{ fontSize: 12, color: C.warning, display: "block", marginBottom: 6 }}>❓ Por que mesmo horário?</strong>
                <span style={{ fontSize: 12, color: C.textSecondary }}>É a MESMA passagem/captura — tarjas idênticas comprovam. Equipamento enviou mesmo evento 2x.</span>
              </div>
              <div style={{ padding: 14, background: C.codeBg, borderRadius: 8, borderLeft: `3px solid ${C.danger}` }}>
                <strong style={{ fontSize: 12, color: C.danger, display: "block", marginBottom: 6 }}>❓ Por que velocidades diferentes?</strong>
                <span style={{ fontSize: 12, color: C.textSecondary }}>Tarja mostra 088/081 em AMBAS. Payload da 2ª integração veio CORROMPIDO (70/63) — alteração no transporte/reprocessamento pelo firmware.</span>
              </div>
            </div>
            <div style={{ padding: 14, background: C.dangerBg, borderRadius: 8, border: `1px solid ${C.dangerBorder}` }}>
              <strong style={{ fontSize: 12, color: C.danger, display: "block", marginBottom: 6 }}>Tripla Falha</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {["Não verificou NO.SEQ.REG duplicado", "Não validou payload vs tarja", "Não possui UNIQUE em Placa+Equip+Faixa+Hora"].map((f, i) => (
                  <div key={i} style={{ padding: "8px 10px", background: C.codeBg, borderRadius: 4, fontSize: 11, color: C.textSecondary }}>
                    <span style={{ color: C.danger, fontWeight: 700 }}>{i + 1}.</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cenários */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15 }}>🔍 Cenários Investigados</h3>
            {[
              { id: "C1", nome: "Timeout ACK → Retry automático", prob: "90%", tipo: "danger", desc: "ITScam envia → AxHub grava → resposta demora → timeout → retry com reprocessamento firmware" },
              { id: "C2", nome: "Reprocessamento firmware (modo conservador)", prob: "60%", tipo: "warning", desc: "Firmware v3.x reavalia com parâmetros conservadores; se difere, envia ambos" },
              { id: "C3", nome: "Reconexão túnel mTLS no Integrador", prob: "40%", tipo: "warning", desc: "Túnel cai → buffer acumula → reconecta → reenvia reprocessado" },
              { id: "C4", nome: "FTP + REST simultâneo", prob: "20%", tipo: "info", desc: "Dois canais configurados em paralelo entregam mesmo evento" },
              { id: "C5", nome: "Envio duplo intencional", prob: "5%", tipo: "info", desc: "Sem protocolo documentado. Improvável." }
            ].map(c => (
              <div key={c.id} style={{ padding: "12px 16px", background: C.codeBg, borderRadius: 6, marginBottom: 8, borderLeft: `3px solid ${c.tipo === "danger" ? C.danger : c.tipo === "warning" ? C.warning : C.textMuted}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: C.text }}>{c.id}: {c.nome}</strong>
                  <Badge type={c.tipo}>{c.prob}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: C.textSecondary }}>{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Timer */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.accent }}>
              <Clock size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Timer do Sistema
            </h3>
            <div style={{ padding: 12, background: C.codeBg, borderRadius: 8, marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: C.textSecondary }}>
                AxHub <strong style={{ color: C.accent }}>NÃO possui timer de deduplicação</strong>. Cada requisição é processada individualmente via INSERT. Não existe janela que agrupe eventos.
              </p>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.codeBg }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted }}>Campo SQL</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted }}>Origem</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { campo: "DataHoraPassagem", origem: "Payload fabricante (evento original)", valor: "16:30:22 (ambos)" },
                  { campo: "DataHoraImportacao", origem: "GETDATE() no INSERT", valor: "18:45:12 / 18:45:13" },
                  { campo: "DataRemessa", origem: "Timestamp do lote", valor: "07/06/2026" }
                ].map((c, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "6px 10px", fontFamily: "monospace", color: C.accent }}>{c.campo}</td>
                    <td style={{ padding: "6px 10px", fontSize: 11 }}>{c.origem}</td>
                    <td style={{ padding: "6px 10px", fontFamily: "monospace", fontSize: 11, color: C.warning }}>{c.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══ TAB: AÇÕES ═══ */}
      {tab === "acoes" && (
        <>
          {/* Ação Imediata */}
          <div style={{ ...cardStyle, borderColor: C.dangerBorder }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.danger }}>
              <AlertTriangle size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Ação Imediata — Ticket #100423690
            </h3>
            <div style={{ padding: 14, background: C.codeBg, borderRadius: 8, borderLeft: `3px solid ${C.danger}`, marginBottom: 12 }}>
              <strong style={{ fontSize: 13, color: C.danger }}>CANCELAR/EXCLUIR o Registro 2</strong>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: C.textSecondary }}>
                Registro 2 (70/63/74550) possui dados que NÃO correspondem à evidência fotográfica (tarja mostra 088/081/74630). Registro inválido.
              </p>
            </div>
            <div style={{ padding: 14, background: C.successBg, borderRadius: 8, borderLeft: `3px solid ${C.success}` }}>
              <strong style={{ fontSize: 13, color: C.success }}>MANTER o Registro 1</strong>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: C.textSecondary }}>
                Registro 1 (88/81/74630) está 100% consistente com a tarja da imagem. Este é o registro válido.
              </p>
            </div>
          </div>

          {/* Regras */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, color: C.success }}>
              <CheckCircle2 size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Regras de Proteção Propostas
            </h3>
            {[
              { regra: "Validação NO.SEQ.REG Duplicado", desc: "Rejeitar se já existe mesmo NO.SEQ.REG + Equipamento + DataHora", sql: "IF EXISTS (... WHERE NoSeqReg=@seq AND Equip=@eq AND DataHora=@dt) → REJECT", impacto: "Elimina 100% dos casos", pri: "CRÍTICA" },
              { regra: "OCR Validação Payload vs Tarja", desc: "Aplicar OCR na tarja e comparar com payload antes de gravar", sql: "IF OCR(tarja.vel) ≠ payload.vel → FLAG + LOG", impacto: "Detecta corrupção", pri: "ALTA" },
              { regra: "UNIQUE Constraint", desc: "Índice único em (Placa+Equip+Faixa+DataHoraPassagem)", sql: "CREATE UNIQUE INDEX IX_Dedup ON TBInfracoes(...)", impacto: "Última defesa", pri: "ALTA" },
              { regra: "Janela Supressão 60s", desc: "Rejeitar se mesma combinação em <60s", sql: "IF EXISTS (...ABS(DATEDIFF(s,...)) <= 60) → REJECT", impacto: "Captura retries", pri: "MÉDIA" },
              { regra: "Expandir Alarme Duplicidade", desc: "Alarmar se Placa+Equip+Faixa+DataHora iguais (independente de velocidade)", sql: "Alarme por: Placa+Equip+Faixa+DataHora (sem vel)", impacto: "Detecta este caso", pri: "MÉDIA" }
            ].map((r, idx) => (
              <div key={idx} style={{ padding: 14, background: C.codeBg, borderRadius: 8, marginBottom: 10, border: `1px solid ${r.pri === "CRÍTICA" ? C.dangerBorder : r.pri === "ALTA" ? "rgba(252,225,0,0.2)" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <strong style={{ fontSize: 13 }}>Regra {idx + 1}: {r.regra}</strong>
                  <Badge type={r.pri === "CRÍTICA" ? "danger" : r.pri === "ALTA" ? "warning" : "info"}>{r.pri}</Badge>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: C.textSecondary }}>{r.desc}</p>
                <div style={{ padding: "6px 10px", background: C.raised, borderRadius: 4, fontFamily: "monospace", fontSize: 11, color: C.accent, marginBottom: 4 }}>{r.sql}</div>
                <span style={{ fontSize: 11, color: C.success }}>Impacto: {r.impacto}</span>
              </div>
            ))}
          </div>

          {/* Fluxo Ideal */}
          <div style={{ ...cardStyle, borderColor: "rgba(108,203,95,0.3)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, color: C.success }}>Fluxo Ideal de Importação (Proposto)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 16 }}>
              {[
                "Fabricante envia evento com Idempotency Key (hash do evento)",
                "AxHub verifica: hash existe? → SIM = 200 OK sem gravar",
                "Verifica NO.SEQ.REG + Equip duplicado? → SIM = REJECT + LOG",
                "Verifica janela temporal (Placa+Equip+Faixa <60s)? → SIM = REJECT",
                "OCR na tarja: dados = payload? → NÃO = FLAG + LOG",
                "Todas validações OK → INSERT normal",
                "Trigger pós-INSERT: AssinaturaHash como safety net"
              ].map((step, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${C.success}22`, border: `1px solid ${C.success}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.success, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                  <span style={{ fontSize: 12, color: C.textSecondary }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Executivo */}
          <div style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(96,205,255,0.04) 0%, rgba(108,203,95,0.04) 100%)", borderColor: C.accentBorder }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: C.accent }}>📋 Resumo Executivo</h3>
            <p style={{ margin: 0, fontSize: 12, color: C.textSecondary, lineHeight: 1.7 }}>
              Caso UJN9C59: <strong style={{ color: C.danger }}>falha de idempotência</strong>. Equipamento ITSCAM DTV202 enviou mesma captura (NO.SEQ.REG 44) 2x. Na 2ª transmissão, payload veio corrompido (70/63/74550 ao invés de 88/81/74630). A imagem vinculada é IDÊNTICA à primeira — prova ser mesma captura. AxHub aceitou ambos sem validação cruzada. Regras propostas (NO.SEQ.REG + OCR) eliminariam 100% destes casos.
            </p>
          </div>
        </>
      )}

      {/* ═══ FIM DA TAB: CASO T1051 ═══ */}
      </>
      )}

      {/* Footer — links do caso T1051 */}
      {tabAtiva === "duplicidade" && (
      <div style={{ marginTop: 24, padding: "12px 16px", background: C.codeBg, borderRadius: 8, fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 16 }}>
        <strong>Links:</strong>
        <a href="https://desk.axiontecnologia.com.br/Ticket/100423690" target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <ExternalLink size={10} /> Helpdesk #100423690
        </a>
        <a href="https://smtt.axhub.axion.ws/infracao?placa=UJN9C59&exibirProcessadas=true&statusProcessamento=4&isInfracao=true" target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <ExternalLink size={10} /> AxHub SMTT (UJN9C59)
        </a>
        <a href="https://smtt.axhub.axion.ws/triagem" target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <ExternalLink size={10} /> Triagem SMTT
        </a>
      </div>
      )}
    </div>
  );
}

// ═══ COMPONENTE: Card de Fonte de Dados ═══
function SourceCard({ title, icon, color, bgColor, borderColor, data, badge, badgeType, diffKeys = [], highlightDiff, isDanger }) {
  return (
    <div style={{ padding: 14, background: bgColor, borderRadius: 8, border: `1px solid ${borderColor}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <strong style={{ fontSize: 12, color }}>{title}</strong>
        {badge && <Badge type={badgeType}>{badge}</Badge>}
      </div>
      <table style={{ width: "100%", fontSize: 11 }}>
        <tbody>
          {Object.entries(data).map(([k, v]) => {
            const isDiff = highlightDiff && diffKeys.includes(k);
            return (
              <tr key={k} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, background: isDiff ? "rgba(255,153,164,0.12)" : "transparent" }}>
                <td style={{ padding: "4px 6px", color: C.textMuted, width: "48%", fontSize: 10 }}>{k.replace(/_/g, " ")}</td>
                <td style={{ padding: "4px 6px", fontFamily: "monospace", fontWeight: isDiff ? 700 : 500, color: isDiff ? (isDanger ? C.danger : C.success) : color, fontSize: 10 }}>
                  {String(v)}{isDiff && (isDanger ? " ✗" : " ✓")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
