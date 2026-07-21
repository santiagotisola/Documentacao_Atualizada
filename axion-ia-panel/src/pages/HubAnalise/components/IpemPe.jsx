import { useState, useRef } from 'react';

// ─── DADOS ESTÁTICOS das planilhas (unificados) ───────────────────────────
// Fonte 1: Planilha de Pontos | Fonte 2: Planilha de Faixas (Patrimônio)
// Anomalias detectadas: Patrimônio 000132 duplicado, PE003C-2 sentido "0",
// PE009C ambas faixas SUL/NORTE, PE010C-2 patrimônio em branco, PE015C ambas LESTE/OESTE
const EQUIPAMENTOS = [
  {
    ponto: 1, codigo: 'PE001C', rodovia: 'BR-104', km: '057+527', cidade: 'Caruaru', estado: 'PE',
    sentido: 'S/N', faixas: 2, lat: -8.213503, lng: -35.972894, bairro: 'Nova Caruaru',
    cep: '55014-170', codMunic: 2381, tipo: 'federal', status: 'ok',
    trecho: 'ENTR PE-145 (P/FAZENDA NOVA) e ENTR PE-095 (P/RIACHO DAS ALMAS)',
    lanes: [
      { patrimonio: '000100', codigo: 'PE001C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Nova Caruaru', status: 'ok' },
      { patrimonio: '000132', codigo: 'PE001C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Nova Caruaru', status: 'alerta', anomalia: 'Patrimônio 000132 duplicado (também em PE002C-2)' },
    ],
  },
  {
    ponto: 2, codigo: 'PE002C', rodovia: 'BR-104', km: '057+024', cidade: 'Caruaru', estado: 'PE',
    sentido: 'N/S', faixas: 2, lat: -8.2092871, lng: -35.971170, bairro: 'Juriti Caruaru',
    cep: '55014-170', codMunic: 2381, tipo: 'federal', status: 'alerta',
    trecho: '',
    lanes: [
      { patrimonio: '000109', codigo: 'PE002C-1', faixa: 1, sentido: 'NORTE/SUL', bairro: 'Nova Caruaru', status: 'ok' },
      { patrimonio: '000132', codigo: 'PE002C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Nova Caruaru', status: 'erro', anomalia: 'Patrimônio 000132 duplicado (também em PE001C-2)' },
    ],
  },
  {
    ponto: 3, codigo: 'PE003C', rodovia: 'BR-110', km: '093+506', cidade: 'Sertânia', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -8.3591283, lng: -37.272936, bairro: 'Zona Rural',
    cep: '56600-000', codMunic: 2581, tipo: 'federal', status: 'alerta',
    trecho: '',
    lanes: [
      { patrimonio: '000101', codigo: 'PE003C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000030', codigo: 'PE003C-2', faixa: 2, sentido: '0', bairro: 'Zona Rural', status: 'erro', anomalia: 'Sentido "0" inválido — deve ser NORTE/SUL' },
    ],
  },
  {
    ponto: 4, codigo: 'PE004C', rodovia: 'PE-180', km: '0+200', cidade: 'Belo Jardim', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -8.350281, lng: -36.442253, bairro: 'Zona Rural',
    cep: '', codMunic: 2333, tipo: 'estadual', status: 'pendente',
    trecho: '',
    lanes: [
      { patrimonio: '000153', codigo: 'PE004C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000138', codigo: 'PE004C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 5, codigo: 'PE005C', rodovia: 'PE-320', km: '129+739', cidade: 'Serra Talhada', estado: 'PE',
    sentido: 'L/O-O/L', faixas: 2, lat: -7.988038, lng: -38.253675, bairro: 'Zona Rural',
    cep: '', codMunic: 0, tipo: 'estadual', status: 'pendente',
    trecho: '',
    lanes: [
      { patrimonio: '000127', codigo: 'PE005C-1', faixa: 1, sentido: 'OESTE/LESTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000105', codigo: 'PE005C-2', faixa: 2, sentido: 'LESTE/OESTE', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 6, codigo: 'PE006C', rodovia: 'BR-116', km: '025+425', cidade: 'Salgueiro', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -8.065982, lng: -39.13524, bairro: 'Zona Rural',
    cep: '56000-000', codMunic: 2543, tipo: 'federal', status: 'ok',
    trecho: '',
    lanes: [
      { patrimonio: '000117', codigo: 'PE006C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000122', codigo: 'PE006C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 7, codigo: 'PE007C', rodovia: 'BR-116', km: '026+711', cidade: 'Salgueiro', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -8.077056, lng: -39.131847, bairro: 'Zona Rural',
    cep: '56000-000', codMunic: 2543, tipo: 'federal', status: 'ok',
    trecho: 'ENTR BR-232/361 (SALGUEIRO) - ENTR PE-460',
    lanes: [
      { patrimonio: '000119', codigo: 'PE007C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000123', codigo: 'PE007C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 8, codigo: 'PE008C', rodovia: 'BR-316', km: '061+297', cidade: 'Trindade', estado: 'PE',
    sentido: 'L/O-O/L', faixas: 2, lat: -7.7787439, lng: -40.245136, bairro: 'Zona Rural',
    cep: '56000-000', codMunic: 2611, tipo: 'federal', status: 'ok',
    trecho: '',
    lanes: [
      { patrimonio: '000160', codigo: 'PE008C-1', faixa: 1, sentido: 'LESTE/OESTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000152', codigo: 'PE008C-2', faixa: 2, sentido: 'OESTE/LESTE', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 9, codigo: 'PE009C', rodovia: 'BR-316', km: '216+751', cidade: 'Belém do São Francisco', estado: 'PE',
    sentido: 'S/N', faixas: 2, lat: -8.5481, lng: -39.225334, bairro: 'Zona Rural',
    cep: '56440-000', codMunic: 2331, tipo: 'federal', status: 'alerta',
    trecho: 'ENTR BR-116/316(A) - ENTR BR-316(B) (CABROBÓ)',
    lanes: [
      { patrimonio: '000116', codigo: 'PE009C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000125', codigo: 'PE009C-2', faixa: 2, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'alerta', anomalia: 'Ambas as faixas com sentido SUL/NORTE — PE009C-2 deveria ser NORTE/SUL' },
    ],
  },
  {
    ponto: 10, codigo: 'PE010C', rodovia: 'BR-122', km: '295+455', cidade: 'Petrolina', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -9.318231, lng: -40.459097, bairro: 'Zona Rural',
    cep: '', codMunic: 2521, tipo: 'federal', status: 'erro',
    trecho: '',
    lanes: [
      { patrimonio: '000088', codigo: 'PE010C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '', codigo: 'PE010C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Zona Rural', status: 'erro', anomalia: 'Patrimônio em branco — equipamento sem número de patrimônio cadastrado' },
    ],
  },
  {
    ponto: 11, codigo: 'PE011C', rodovia: 'PE-300', km: '0+090', cidade: 'Águas Belas', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -9.128165, lng: -37.114940, bairro: 'Zona Rural',
    cep: '', codMunic: 0, tipo: 'estadual', status: 'pendente',
    trecho: '',
    lanes: [
      { patrimonio: '000126', codigo: 'PE011C-1', faixa: 1, sentido: 'LESTE/OESTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000120', codigo: 'PE011C-2', faixa: 2, sentido: 'OESTE/LESTE', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 12, codigo: 'PE012C', rodovia: 'PE-275', km: '69+810', cidade: 'São José do Egito', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -7.527198, lng: -37.281833, bairro: 'Zona Rural',
    cep: '', codMunic: 0, tipo: 'estadual', status: 'pendente',
    trecho: '',
    lanes: [
      { patrimonio: '000159', codigo: 'PE012C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000154', codigo: 'PE012C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 13, codigo: 'PE013C', rodovia: 'BR-423', km: '092+512', cidade: 'Garanhuns', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -8.869007, lng: -36.462469, bairro: 'Zona Rural',
    cep: '55293-970', codMunic: 2419, tipo: 'federal', status: 'ok',
    trecho: '',
    lanes: [
      { patrimonio: '000091', codigo: 'PE013C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000113', codigo: 'PE013C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 14, codigo: 'PE014C', rodovia: 'BR-424', km: '093+284', cidade: 'Garanhuns', estado: 'PE',
    sentido: 'S/N-N/S', faixas: 2, lat: -8.9171522, lng: -36.489073, bairro: 'Zona Rural',
    cep: '55293-970', codMunic: 2419, tipo: 'federal', status: 'ok',
    trecho: '',
    lanes: [
      { patrimonio: '000037', codigo: 'PE014C-1', faixa: 1, sentido: 'SUL/NORTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000012', codigo: 'PE014C-2', faixa: 2, sentido: 'NORTE/SUL', bairro: 'Zona Rural', status: 'ok' },
    ],
  },
  {
    ponto: 15, codigo: 'PE015C', rodovia: 'BR-232', km: '144+114', cidade: 'São Caitano', estado: 'PE',
    sentido: 'L/O', faixas: 2, lat: -8.3283917, lng: -35.130518, bairro: 'Zona Rural',
    cep: '55130-000', codMunic: 2561, tipo: 'federal', status: 'alerta',
    trecho: '',
    lanes: [
      { patrimonio: '000031', codigo: 'PE015C-1', faixa: 1, sentido: 'LESTE/OESTE', bairro: 'Zona Rural', status: 'ok' },
      { patrimonio: '000011', codigo: 'PE015C-2', faixa: 2, sentido: 'LESTE/OESTE', bairro: 'Zona Rural', status: 'alerta', anomalia: 'Ambas faixas com sentido LESTE/OESTE — uma deveria ser OESTE/LESTE' },
    ],
  },
];

// ─── Template padrão de config Hikvision ITS ─────────────────────────────
const CONFIG_TEMPLATE = {
  _meta: { versao: 'V5.5.0', modelo: 'Hikvision ITS', geradoEm: '', fonte: 'PE001C' },
  dispositivo: { nome: '', ip: '', porta: 80, canal: 1 },
  deteccao: {
    modo: 'radar_video',  // radar, video, radar_video
    limiteVelocidadePadrao: 60,
    tolerancia: 5,
    faixas: [
      { id: 1, ativa: true, limiteVelocidade: 60, sentido: 'SUL/NORTE', tiposVeiculo: ['automovel', 'onibus', 'caminhao', 'moto'] },
      { id: 2, ativa: true, limiteVelocidade: 60, sentido: 'NORTE/SUL', tiposVeiculo: ['automovel', 'onibus', 'caminhao', 'moto'] },
    ],
  },
  captura: { qtdImagens: 3, qualidade: 85, tempoEntreImagens: 200, resolucao: '1920x1080' },
  ocr: { ativo: true, confiancaMinima: 75, tentativas: 3, prefixoEstado: 'PE' },
  rede: { servidorUrl: 'https://ipempe.axhub.axion.ws', porta: 443, protocolo: 'https', timeout: 30 },
  afericao: { numeroSerie: '', dataAfericao: '', proximaAfericao: '', inmetro: '' },
};

const STATUS_COR = {
  ok:       { cor: '#10b981', bg: '#ecfdf5', label: 'OK' },
  alerta:   { cor: '#f59e0b', bg: '#fffbeb', label: 'Atenção' },
  erro:     { cor: '#ef4444', bg: '#fef2f2', label: 'Erro' },
  pendente: { cor: '#6b7280', bg: '#f9fafb', label: 'Pendente' },
};

const TIPO_COR = {
  federal:  { cor: '#1d4ed8', bg: '#eff6ff' },
  estadual: { cor: '#7c3aed', bg: '#f5f3ff' },
};

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────
export default function IpemPe() {
  const [secao, setSecao] = useState('inventario');
  const [equip, setEquip] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [config, setConfig] = useState(() => JSON.parse(JSON.stringify(CONFIG_TEMPLATE)));
  const [configEditando, setConfigEditando] = useState(null);
  const [padraoDefinido, setPadraoDefinido] = useState(false);
  const [guiaPassos, setGuiaPassos] = useState({});
  const importRef = useRef(null);

  // ── Dados reativos (permitem correções) ──
  const [dados, setDados] = useState(() => JSON.parse(JSON.stringify(EQUIPAMENTOS)));
  const [correcoes, setCorrecoes] = useState([]); // auditoria de alterações
  const [formCorrecao, setFormCorrecao] = useState({}); // valores do formulário por lane
  const [corrigido, setCorrigido] = useState({}); // { 'PE001C-2': true }

  // Inicializar formulário de correção com valores atuais das anomalias
  const initForm = (laneId, campo, valor) => {
    setFormCorrecao(prev => ({ ...prev, [`${laneId}_${campo}`]: valor }));
  };
  const getForm = (laneId, campo, fallback) => formCorrecao[`${laneId}_${campo}`] ?? fallback;

  // Aplicar correção a uma faixa específica
  const aplicarCorrecao = (equipCodigo, laneCodigo, campos) => {
    const ts = new Date().toISOString();
    setDados(prev => prev.map(e => {
      if (e.codigo !== equipCodigo) return e;
      return {
        ...e,
        status: e.lanes.every(l => l.codigo === laneCodigo
          ? (campos.status || l.status) === 'ok'
          : l.status === 'ok') ? 'ok' : e.status,
        lanes: e.lanes.map(l => {
          if (l.codigo !== laneCodigo) return l;
          return { ...l, ...campos, anomalia: null, status: 'ok' };
        }),
      };
    }));
    setCorrigido(prev => ({ ...prev, [laneCodigo]: true }));
    setCorrecoes(prev => [...prev, {
      ts, equipCodigo, laneCodigo,
      alteracoes: campos,
      usuario: 'Operador',
    }]);
  };

  // Exportar dados corrigidos
  const exportarCorrigidos = () => {
    const payload = { geradoEm: new Date().toISOString(), equipamentos: dados, correcoes };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `ipem-pe-dados-corrigidos-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  // ── Stats (usar dados reativos) ──
  const totalEquip = dados.length;
  const totalLanes = dados.reduce((s, e) => s + e.lanes.length, 0);
  const anomalias  = dados.flatMap(e => e.lanes.filter(l => l.anomalia).map(l => ({ equip: e.codigo, lane: l.codigo, msg: l.anomalia, tipo: l.status, laneObj: l, equipObj: e })));

  // ── Filtro ──
  const equipFiltrados = dados.filter(e => {
    if (filtroStatus !== 'todos' && e.status !== filtroStatus && !e.lanes.some(l => l.status === filtroStatus)) return false;
    if (filtroTipo !== 'todos' && e.tipo !== filtroTipo) return false;
    if (busca && !e.codigo.toLowerCase().includes(busca.toLowerCase()) && !e.cidade.toLowerCase().includes(busca.toLowerCase()) && !e.rodovia.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  // ── Config export ──
  const exportarConfig = () => {
    const data = { ...config, _meta: { ...config._meta, geradoEm: new Date().toISOString(), fonte: configEditando || 'template' } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `hikvision-config-${configEditando || 'template'}-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importarConfig = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setConfig(data);
        alert(`✅ Configuração importada com sucesso!\nFonte: ${data._meta?.fonte || 'desconhecida'}\nGerado em: ${data._meta?.geradoEm ? new Date(data._meta.geradoEm).toLocaleString('pt-BR') : '—'}`);
      } catch { alert('❌ Arquivo JSON inválido.'); }
    };
    reader.readAsText(file);
  };

  const toggleGuia = (equipId, idx) => {
    setGuiaPassos(prev => {
      const key = `${equipId}_${idx}`;
      return { ...prev, [key]: !prev[key] };
    });
  };
  const guiaConcluido = (equipId, idx) => guiaPassos[`${equipId}_${idx}`] === true;

  const GUIA = [
    { titulo: 'Verificar dados no inventário (planilha)', desc: 'Confirme que código, rodovia, km, faixas e coordenadas estão corretos para este equipamento.', tipo: 'auditoria' },
    { titulo: 'Confirmar cadastro no AxHub IPEM-PE', desc: 'Acesse https://ipempe.axhub.axion.ws/equipamento e verifique se o equipamento e suas faixas estão cadastrados com os dados corretos.', tipo: 'sistema', link: 'https://ipempe.axhub.axion.ws/equipamento' },
    { titulo: 'Conectar à câmera Hikvision e verificar configuração', desc: 'Acesse a interface web da câmera pelo IP local. Verifique: velocidade limite, faixas ativas, servidor de envio, reconhecimento de placa.', tipo: 'camera', link: 'http://192.168.0.201/doc/page/config.asp' },
    { titulo: 'Configurar e exportar template de configuração', desc: 'Preencha a aba "Config Câmera", defina os parâmetros corretos para este ponto e clique em "Exportar Config JSON". Guarde o arquivo para replicar nos demais equipamentos.', tipo: 'config' },
    { titulo: 'Importar configuração para câmeras adicionais', desc: 'Para replicar a mesma configuração em outro equipamento, carregue o JSON exportado no passo anterior, ajuste apenas o IP e dados de faixa, e aplique via ISAPI.', tipo: 'replicacao' },
    { titulo: 'Testar captura e OCR de placa', desc: 'Realize uma passagem de teste e verifique se a imagem chegou no AxHub com placa lida corretamente e velocidade registrada.', tipo: 'teste', link: 'https://ipempe.axhub.axion.ws/consultainfracao' },
    { titulo: 'Validar de-para e fechar', desc: 'Confirme que todos os campos de de-para (planilha vs AxHub vs câmera) estão verdes. Altere status do ponto para Validado.', tipo: 'encerramento' },
  ];

  const TIPO_GUIA_COR = { auditoria: '#0891b2', sistema: '#667eea', camera: '#7c3aed', config: '#d97706', replicacao: '#f97316', teste: '#10b981', encerramento: '#374151' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Header Stats ── */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #0891b2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📷</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a202c' }}>IPEM-PE — Gestão de Equipamentos</div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Câmeras Hikvision ITS · Contrato IPEM Pernambuco · <a href="https://ipempe.axhub.axion.ws" target="_blank" rel="noreferrer" style={{ color: '#0891b2' }}>ipempe.axhub.axion.ws ↗</a></div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Equipamentos', value: totalEquip, cor: '#0891b2', bg: '#ecfeff' },
              { label: 'Faixas', value: totalLanes, cor: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Anomalias', value: anomalias.length, cor: '#ef4444', bg: '#fef2f2' },
              { label: 'Pendentes', value: EQUIPAMENTOS.filter(e => e.status === 'pendente').length, cor: '#6b7280', bg: '#f9fafb' },
            ].map(s => (
              <div key={s.label} style={{ padding: '0.5rem 0.875rem', borderRadius: '8px', background: s.bg, border: `1px solid ${s.cor}33`, textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.cor, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '0.15rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navegação ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'inventario', label: '📋 Inventário Unificado' },
          { id: 'config', label: '📷 Config Câmera' },
          { id: 'depara', label: '🔁 De-Para' },
          { id: 'axhub',     label: '🔗 AxHub Equipamentos' },
          { id: 'api',       label: '⚡ API De-Para' },
          { id: 'anomalias', label: `⚠️ Anomalias (${anomalias.length})` },
          { id: 'guia', label: '🗺️ Guia de Validação' },
        ].map(s => (
          <button key={s.id} onClick={() => setSecao(s.id)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, borderColor: secao === s.id ? '#0891b2' : '#e2e8f0', background: secao === s.id ? '#0891b2' : 'white', color: secao === s.id ? 'white' : '#374151', transition: 'all 0.15s' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ══════════ INVENTÁRIO ══════════ */}
      {secao === 'inventario' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Filtros */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Código, cidade, rodovia..." style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', minWidth: '200px' }} />
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none' }}>
              <option value="todos">Todos os Status</option>
              <option value="ok">✅ OK</option>
              <option value="alerta">⚠️ Atenção</option>
              <option value="erro">❌ Erro</option>
              <option value="pendente">⏳ Pendente</option>
            </select>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none' }}>
              <option value="todos">Federal + Estadual</option>
              <option value="federal">🛣️ Federal (BR)</option>
              <option value="estadual">🛤️ Estadual (PE)</option>
            </select>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#9ca3af' }}>{equipFiltrados.length}/{totalEquip} equipamentos</span>
          </div>

          {/* Tabela */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Pto', 'Código', 'Tipo', 'Rodovia / Km', 'Cidade', 'Sentido', 'Faixas', 'Patrimônios', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.72rem', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipFiltrados.map((e, idx) => {
                  const st = STATUS_COR[e.status] || STATUS_COR.pendente;
                  const tp = TIPO_COR[e.tipo];
                  const hasAnomaly = e.lanes.some(l => l.status === 'erro' || l.status === 'alerta');
                  return (
                    <tr key={e.codigo} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '0.625rem 0.875rem', color: '#9ca3af', fontFamily: 'monospace' }}>{e.ponto}</td>
                      <td style={{ padding: '0.625rem 0.875rem', fontWeight: 700, color: '#1a202c', fontFamily: 'monospace' }}>{e.codigo}</td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: tp.bg, color: tp.cor, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {e.tipo === 'federal' ? '🛣️ BR' : '🛤️ PE'}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: '#1a202c' }}>{e.rodovia}</span>
                        <span style={{ color: '#9ca3af', marginLeft: '0.3rem' }}>Km {e.km}</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem', color: '#374151' }}>{e.cidade}</td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#374151' }}>{e.sentido}</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem', textAlign: 'center', fontWeight: 700, color: '#1a202c' }}>{e.faixas}</td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {e.lanes.map(l => {
                            const ls = STATUS_COR[l.status];
                            return (
                              <div key={l.codigo} title={l.anomalia || l.sentido} style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ls.cor, flexShrink: 0 }} />
                                <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#374151' }}>{l.patrimonio || '⚠️ —'}</span>
                                <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{l.codigo.split('-')[1]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '20px', background: st.bg, color: st.cor, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {hasAnomaly && e.status === 'ok' ? '⚠️' : ''} {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button onClick={() => { setEquip(e); setSecao('config'); setConfigEditando(e.codigo); }} title="Configurar câmera" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f0f4ff', color: '#667eea', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>⚙️</button>
                          <button onClick={() => { setEquip(e); setSecao('guia'); }} title="Guia de validação" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>🗺️</button>
                          <a href={`https://ipempe.axhub.axion.ws/equipamento`} target="_blank" rel="noreferrer" title="Ver no AxHub" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ecfeff', color: '#0891b2', fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none' }}>↗</a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════ CONFIG CÂMERA ══════════ */}
      {secao === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Cabeçalho + Ações */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', color: '#1a202c', fontSize: '1rem', fontWeight: 700 }}>
                  📷 Configuração Hikvision ITS
                  {configEditando && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '6px', fontFamily: 'monospace' }}>{configEditando}</span>}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                  Configure o equipamento de referência e gere um arquivo JSON para replicar nas demais câmeras.
                  <br />
                  <strong>API:</strong> <code style={{ fontSize: '0.72rem' }}>http://192.168.0.201/ISAPI/</code> · <strong>Versão:</strong> V5.5.0.100204build260326
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={exportarConfig} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📥 Exportar Config JSON
                </button>
                <button onClick={() => importRef.current?.click()} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #667eea', background: '#eff6ff', color: '#667eea', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📤 Importar JSON
                </button>
                <input ref={importRef} type="file" accept=".json" onChange={importarConfig} style={{ display: 'none' }} />
                {padraoDefinido && (
                  <span style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>✅ Padrão definido</span>
                )}
              </div>
            </div>

            {/* Seletor de equipamento */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>Configurando para:</span>
              <select value={configEditando || ''} onChange={e => setConfigEditando(e.target.value)} style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none' }}>
                <option value="">— Selecione o equipamento —</option>
                {EQUIPAMENTOS.map(e => <option key={e.codigo} value={e.codigo}>{e.codigo} — {e.rodovia} Km {e.km} ({e.cidade})</option>)}
              </select>
              <button onClick={() => { setPadraoDefinido(true); alert(`✅ Configuração definida como padrão para ${configEditando}.\n\nClique em "Exportar Config JSON" para gerar o arquivo de clonagem.`); }} disabled={!configEditando} style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: configEditando ? '#fef3c7' : '#f8fafc', color: configEditando ? '#92400e' : '#9ca3af', cursor: configEditando ? 'pointer' : 'default', fontSize: '0.78rem', fontWeight: 600 }}>
                ⭐ Definir como Padrão
              </button>
            </div>
          </div>

          {/* Campos de configuração */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>

            {/* Dispositivo */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🌐 Dispositivo</h4>
              {[
                { label: 'Nome do equipamento', key: 'nome', placeholder: 'Ex: PE001C-BR104-Caruaru' },
                { label: 'Endereço IP', key: 'ip', placeholder: '192.168.0.201' },
                { label: 'Porta HTTP', key: 'porta', placeholder: '80', type: 'number' },
                { label: 'Canal', key: 'canal', placeholder: '1', type: 'number' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={config.dispositivo[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setConfig(prev => ({ ...prev, dispositivo: { ...prev.dispositivo, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value } }))}
                    style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>

            {/* Detecção */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🚗 Detecção de Velocidade</h4>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Modo de Detecção</label>
                <select value={config.deteccao.modo} onChange={e => setConfig(prev => ({ ...prev, deteccao: { ...prev.deteccao, modo: e.target.value } }))} style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none' }}>
                  <option value="radar_video">Radar + Vídeo</option>
                  <option value="radar">Apenas Radar</option>
                  <option value="video">Apenas Vídeo</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Vel. Limite (km/h)</label>
                  <input type="number" value={config.deteccao.limiteVelocidadePadrao} onChange={e => setConfig(prev => ({ ...prev, deteccao: { ...prev.deteccao, limiteVelocidadePadrao: Number(e.target.value) } }))} style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Tolerância (km/h)</label>
                  <input type="number" value={config.deteccao.tolerancia} onChange={e => setConfig(prev => ({ ...prev, deteccao: { ...prev.deteccao, tolerancia: Number(e.target.value) } }))} style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              {/* Faixas */}
              {config.deteccao.faixas.map((faixa, fi) => (
                <div key={fi} style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#374151', marginBottom: '0.5rem' }}>Faixa {faixa.id}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Sentido</label>
                      <input value={faixa.sentido} onChange={e => {
                        const f = [...config.deteccao.faixas]; f[fi] = { ...f[fi], sentido: e.target.value };
                        setConfig(prev => ({ ...prev, deteccao: { ...prev.deteccao, faixas: f } }));
                      }} style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Vel. Limite</label>
                      <input type="number" value={faixa.limiteVelocidade} onChange={e => {
                        const f = [...config.deteccao.faixas]; f[fi] = { ...f[fi], limiteVelocidade: Number(e.target.value) };
                        setConfig(prev => ({ ...prev, deteccao: { ...prev.deteccao, faixas: f } }));
                      }} style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Captura + OCR */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#1a202c' }}>📸 Captura & OCR</h4>
              {[
                { label: 'Qtd. imagens por infração', key: 'captura.qtdImagens', type: 'number' },
                { label: 'Qualidade (1-100)', key: 'captura.qualidade', type: 'number' },
                { label: 'Tempo entre imagens (ms)', key: 'captura.tempoEntreImagens', type: 'number' },
                { label: 'Resolução', key: 'captura.resolucao' },
                { label: 'Confiança mínima OCR (%)', key: 'ocr.confiancaMinima', type: 'number' },
                { label: 'Prefixo estado', key: 'ocr.prefixoEstado' },
              ].map(f => {
                const [section, field] = f.key.split('.');
                const val = config[section][field];
                return (
                  <div key={f.key} style={{ marginBottom: '0.625rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase' }}>{f.label}</label>
                    <input type={f.type || 'text'} value={val} onChange={e => setConfig(prev => ({
                      ...prev, [section]: { ...prev[section], [field]: f.type === 'number' ? Number(e.target.value) : e.target.value }
                    }))} style={{ width: '100%', padding: '0.35rem 0.625rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                );
              })}
            </div>

            {/* Rede + Aferição */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#1a202c' }}>🌐 Rede & Aferição INMETRO</h4>
              {[
                { label: 'URL do servidor AxHub', key: 'rede.servidorUrl' },
                { label: 'Porta', key: 'rede.porta', type: 'number' },
                { label: 'Nº Série Equipamento', key: 'afericao.numeroSerie' },
                { label: 'Data de Aferição', key: 'afericao.dataAfericao', type: 'date' },
                { label: 'Próxima Aferição', key: 'afericao.proximaAfericao', type: 'date' },
                { label: 'Certificado INMETRO', key: 'afericao.inmetro' },
              ].map(f => {
                const [section, field] = f.key.split('.');
                const val = config[section][field];
                return (
                  <div key={f.key} style={{ marginBottom: '0.625rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase' }}>{f.label}</label>
                    <input type={f.type || 'text'} value={val} onChange={e => setConfig(prev => ({
                      ...prev, [section]: { ...prev[section], [field]: f.type === 'number' ? Number(e.target.value) : e.target.value }
                    }))} style={{ width: '100%', padding: '0.35rem 0.625rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                );
              })}

              {/* ISAPI Commands */}
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#1e1e2e', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase' }}>🔌 Comandos ISAPI (Hikvision)</div>
                <code style={{ fontSize: '0.68rem', color: '#a6e22e', display: 'block', lineHeight: 1.6 }}>
                  GET /ISAPI/System/deviceInfo<br />
                  GET /ISAPI/ITS/channels/1/laneConfig<br />
                  GET /ISAPI/ITS/channels/1/speedDetection<br />
                  PUT /ISAPI/ITS/channels/1/captureConf
                </code>
              </div>
            </div>
          </div>

          {/* ─── Wizard Visual de Clonagem ─── */}
          <div style={{ background: 'white', borderRadius: '12px', border: '2px solid #f59e0b', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', padding: '1rem 1.5rem', borderBottom: '1px solid #fcd34d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ margin: 0, color: '#92400e', fontSize: '0.95rem', fontWeight: 800 }}>🔄 Fluxo de Clonagem de Configuração</h4>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#b45309' }}>Configure uma câmera de referência e replique para todas as demais em segundos</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600 }}>
                  {[!!configEditando, !!(config.dispositivo.nome && config.dispositivo.ip), padraoDefinido].filter(Boolean).length}/3 concluídos
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[!!configEditando, !!(config.dispositivo.nome && config.dispositivo.ip), padraoDefinido].map((ok, i) => (
                    <div key={i} style={{ width: '28px', height: '6px', borderRadius: '3px', background: ok ? '#f59e0b' : '#e5e7eb', transition: 'background 0.3s' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Passos do wizard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>

              {/* PASSO A — ORIGEM */}
              <div style={{ padding: '1.25rem', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', background: configEditando ? '#f59e0b' : '#f1f5f9', color: configEditando ? 'white' : '#9ca3af', border: `2px solid ${configEditando ? '#f59e0b' : '#e5e7eb'}` }}>1</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: configEditando ? '#92400e' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Câmera de Origem</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Selecione o equipamento padrão</div>
                  </div>
                  {configEditando && <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>✅</span>}
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: configEditando ? '#fffbeb' : '#f8fafc', border: `1px solid ${configEditando ? '#fcd34d' : '#e5e7eb'}` }}>
                  {configEditando ? (
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Selecionado</div>
                      <div style={{ fontWeight: 800, color: '#1a202c', fontFamily: 'monospace', fontSize: '0.95rem' }}>{configEditando}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.2rem' }}>
                        {EQUIPAMENTOS.find(e => e.codigo === configEditando)?.rodovia} Km {EQUIPAMENTOS.find(e => e.codigo === configEditando)?.km} — {EQUIPAMENTOS.find(e => e.codigo === configEditando)?.cidade}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>
                      👆 Use o seletor <strong>"Configurando para"</strong> acima para escolher o equipamento
                    </div>
                  )}
                </div>
              </div>

              {/* PASSO B — PREENCHER */}
              <div style={{ padding: '1.25rem', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', background: (config.dispositivo.nome && config.dispositivo.ip) ? '#f59e0b' : '#f1f5f9', color: (config.dispositivo.nome && config.dispositivo.ip) ? 'white' : '#9ca3af', border: `2px solid ${(config.dispositivo.nome && config.dispositivo.ip) ? '#f59e0b' : '#e5e7eb'}` }}>2</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: (config.dispositivo.nome && config.dispositivo.ip) ? '#92400e' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preencher Configuração</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Velocidade, OCR, rede, aferição</div>
                  </div>
                  {(config.dispositivo.nome && config.dispositivo.ip) && <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>✅</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    { label: 'Nome', value: config.dispositivo.nome, icon: '🏷️' },
                    { label: 'IP', value: config.dispositivo.ip, icon: '🌐' },
                    { label: 'Vel. Limite', value: `${config.deteccao.limiteVelocidadePadrao} km/h`, icon: '🚗' },
                    { label: 'OCR mín.', value: `${config.ocr.confiancaMinima}%`, icon: '📸' },
                    { label: 'Nº Série', value: config.afericao.numeroSerie, icon: '🔢' },
                    { label: 'Aferição', value: config.afericao.dataAfericao, icon: '📅' },
                  ].map(f => (
                    <div key={f.label} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.3rem 0.5rem', borderRadius: '6px', background: f.value ? '#f0fdf4' : '#fef2f2' }}>
                      <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>{f.icon}</span>
                      <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, flexShrink: 0, minWidth: '52px' }}>{f.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: f.value ? 600 : 400, color: f.value ? '#374151' : '#9ca3af', fontFamily: f.value ? 'monospace' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.value || '— não preenchido'}
                      </span>
                      <span style={{ marginLeft: 'auto', flexShrink: 0 }}>{f.value ? '✓' : '○'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PASSO C — DEFINIR PADRÃO */}
              <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', background: padraoDefinido ? '#f59e0b' : '#f1f5f9', color: padraoDefinido ? 'white' : '#9ca3af', border: `2px solid ${padraoDefinido ? '#f59e0b' : '#e5e7eb'}` }}>3</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: padraoDefinido ? '#92400e' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Definir como Padrão</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Confirmar origem da clonagem</div>
                  </div>
                  {padraoDefinido && <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>✅</span>}
                </div>
                {padraoDefinido ? (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.82rem', marginBottom: '0.3rem' }}>✅ Padrão definido!</div>
                    <div style={{ fontSize: '0.75rem', color: '#047857', lineHeight: 1.5 }}>
                      A configuração de <strong>{configEditando}</strong> está pronta para ser exportada e clonada para qualquer outro equipamento.
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      Após preencher os campos, clique no botão abaixo para confirmar esta câmera como padrão de referência:
                    </div>
                    <button
                      onClick={() => { if (configEditando && config.dispositivo.nome) { setPadraoDefinido(true); } else { alert('⚠️ Selecione um equipamento e preencha ao menos o Nome e IP antes de definir como padrão.'); } }}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #fcd34d', background: '#fef3c7', color: '#92400e', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      ⭐ Definir como Padrão
                    </button>
                  </div>
                )}
              </div>

              {/* PASSO D — EXPORTAR */}
              <div style={{ padding: '1.25rem', borderRight: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', background: padraoDefinido ? '#10b981' : '#f1f5f9', color: padraoDefinido ? 'white' : '#9ca3af', border: `2px solid ${padraoDefinido ? '#10b981' : '#e5e7eb'}` }}>4</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: padraoDefinido ? '#065f46' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exportar JSON</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Baixar arquivo de clonagem</div>
                  </div>
                </div>
                <div style={{ padding: '0.875rem', borderRadius: '8px', background: padraoDefinido ? '#ecfdf5' : '#f8fafc', border: `1px solid ${padraoDefinido ? '#6ee7b7' : '#e2e8f0'}` }}>
                  {padraoDefinido ? (
                    <>
                      <div style={{ fontSize: '0.75rem', color: '#065f46', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        O arquivo contém todas as configurações de <strong>{configEditando}</strong>. Salve-o em um local de fácil acesso.
                      </div>
                      <button onClick={exportarConfig} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        📥 Baixar JSON
                        <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>hikvision-config-{configEditando}.json</span>
                      </button>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem' }}>🔒 Disponível após definir padrão</div>
                  )}
                </div>
              </div>

              {/* PASSO E — SELECIONAR DESTINO */}
              <div style={{ padding: '1.25rem', borderRight: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', background: padraoDefinido ? '#667eea' : '#f1f5f9', color: padraoDefinido ? 'white' : '#9ca3af', border: `2px solid ${padraoDefinido ? '#667eea' : '#e5e7eb'}` }}>5</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: padraoDefinido ? '#3730a3' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Câmera Destino</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Selecione o próximo equipamento</div>
                  </div>
                </div>
                <div style={{ padding: '0.875rem', borderRadius: '8px', background: padraoDefinido ? '#eff6ff' : '#f8fafc', border: `1px solid ${padraoDefinido ? '#bfdbfe' : '#e2e8f0'}` }}>
                  {padraoDefinido ? (
                    <>
                      <div style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                        Selecione o equipamento de destino no combobox acima e importe o JSON exportado no passo anterior.
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#3b82f6', background: '#dbeafe', padding: '0.4rem 0.625rem', borderRadius: '6px', fontWeight: 600 }}>
                        💡 Após importar, ajuste apenas:<br />
                        • <strong>IP</strong> da câmera destino<br />
                        • <strong>Sentido</strong> das faixas (se diferente)
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem' }}>🔒 Disponível após exportar</div>
                  )}
                </div>
              </div>

              {/* PASSO F — IMPORTAR E APLICAR */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', background: padraoDefinido ? '#667eea' : '#f1f5f9', color: padraoDefinido ? 'white' : '#9ca3af', border: `2px solid ${padraoDefinido ? '#667eea' : '#e5e7eb'}` }}>6</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: padraoDefinido ? '#3730a3' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Importar & Aplicar</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Clonar config e enviar à câmera</div>
                  </div>
                </div>
                <div style={{ padding: '0.875rem', borderRadius: '8px', background: padraoDefinido ? '#eff6ff' : '#f8fafc', border: `1px solid ${padraoDefinido ? '#bfdbfe' : '#e2e8f0'}` }}>
                  {padraoDefinido ? (
                    <>
                      <button onClick={() => importRef.current?.click()} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #667eea', background: '#eff6ff', color: '#667eea', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                        📤 Carregar JSON
                      </button>
                      <div style={{ padding: '0.5rem', borderRadius: '6px', background: '#1e1e2e' }}>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>ISAPI — Aplicar via API</div>
                        <code style={{ fontSize: '0.65rem', color: '#a6e22e', lineHeight: 1.6 }}>
                          PUT /ISAPI/ITS/channels/1/speedDetection<br />
                          PUT /ISAPI/ITS/channels/1/captureConf<br />
                          PUT /ISAPI/ITS/channels/1/laneConfig
                        </code>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem' }}>🔒 Disponível após exportar</div>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé com fluxo visual resumido */}
            <div style={{ padding: '0.875rem 1.5rem', background: '#fef3c7', borderTop: '1px solid #fcd34d', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', overflow: 'hidden' }}>
              {[
                { n: 1, label: 'Selecionar origem', ok: !!configEditando },
                { n: 2, label: 'Preencher dados', ok: !!(config.dispositivo.nome && config.dispositivo.ip) },
                { n: 3, label: 'Definir padrão', ok: padraoDefinido },
                { n: 4, label: 'Exportar JSON', ok: false },
                { n: 5, label: 'Selecionar destino', ok: false },
                { n: 6, label: 'Importar & aplicar', ok: false },
              ].map((s, i, arr) => (
                <>
                  <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, background: s.ok ? '#f59e0b' : '#e5e7eb', color: s.ok ? 'white' : '#9ca3af', flexShrink: 0 }}>{s.n}</div>
                    <span style={{ fontSize: '0.72rem', fontWeight: s.ok ? 700 : 400, color: s.ok ? '#92400e' : '#9ca3af', whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <span style={{ color: '#fcd34d', fontSize: '0.75rem', flexShrink: 0 }}>→</span>}
                </>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ DE-PARA ══════════ */}
      {secao === 'depara' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1a202c' }}>🔁 De-Para — Planilha × AxHub × Câmera</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#6b7280' }}>Verificação cruzada entre os dados das planilhas e o sistema AxHub IPEM-PE</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Código', 'Faixa', 'Patrimônio', 'Sentido (Planilha)', 'Sentido (AxHub)', 'Vel. Limite', 'Nº Série', 'Aferição', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.7rem', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EQUIPAMENTOS.flatMap(e => e.lanes.map((l, li) => {
                  const ls = STATUS_COR[l.status];
                  return (
                    <tr key={l.codigo} style={{ borderBottom: '1px solid #f1f5f9', background: li % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '0.5rem 0.875rem', fontFamily: 'monospace', fontWeight: 600, color: '#1a202c', whiteSpace: 'nowrap' }}>{l.codigo}</td>
                      <td style={{ padding: '0.5rem 0.875rem', textAlign: 'center', color: '#374151' }}>{l.faixa}</td>
                      <td style={{ padding: '0.5rem 0.875rem', fontFamily: 'monospace', color: l.patrimonio ? '#374151' : '#ef4444' }}>{l.patrimonio || '⚠️ VAZIO'}</td>
                      <td style={{ padding: '0.5rem 0.875rem' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', color: l.sentido === '0' ? '#ef4444' : '#374151' }}>{l.sentido}</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.875rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>— a verificar</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.875rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>— a verificar</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.875rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>— a preencher</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.875rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>— a preencher</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.875rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '20px', background: ls.bg, color: ls.cor, fontWeight: 700 }}>
                          {ls.label}
                        </span>
                        {l.anomalia && <div style={{ fontSize: '0.68rem', color: '#ef4444', marginTop: '0.2rem', maxWidth: '200px' }}>{l.anomalia}</div>}
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════ AXHUB EQUIPAMENTOS ══════════ */}
      {secao === 'axhub' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Cabeçalho + link */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', color: '#1a202c' }}>🔗 Equipamentos no AxHub IPEM-PE</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>Tabela espelhando as colunas da tela <code>ipempe.axhub.axion.ws/equipamento</code></p>
            </div>
            <a href="https://ipempe.axhub.axion.ws/equipamento" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', background: '#0891b2', color: 'white', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              🌐 Abrir no AxHub IPEM-PE ↗
            </a>
          </div>

          {/* Tabela AxHub */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#0891b2' }}>
                    {['Nº Série', 'Código', 'Fabricante', 'Modelo', 'Tipo', 'Modo Operação', 'Desabilitado', 'Limite Horas Importação', 'Grupo do Equipamento', 'Link AxHub'].map(h => (
                      <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 700, color: 'white', fontSize: '0.7rem', whiteSpace: 'nowrap', borderBottom: '2px solid #0284c7' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EQUIPAMENTOS.flatMap(e => e.lanes.map((l, li) => {
                    const nserie = config.afericao.numeroSerie && configEditando === e.codigo ? config.afericao.numeroSerie : `HIK-ITS-${e.codigo}-${l.faixa}`;
                    const st = STATUS_COR[l.status];
                    return (
                      <tr key={l.codigo} style={{ borderBottom: '1px solid #f1f5f9', background: li % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '0.5rem 0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {l.patrimonio ? (
                              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#374151' }}>{nserie}</span>
                            ) : (
                              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#ef4444' }}>⚠️ sem nº série</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem 0.875rem', fontFamily: 'monospace', fontWeight: 700, color: '#1a202c', whiteSpace: 'nowrap' }}>{l.codigo}</td>
                        <td style={{ padding: '0.5rem 0.875rem', color: '#374151' }}>Hikvision</td>
                        <td style={{ padding: '0.5rem 0.875rem', color: '#374151', whiteSpace: 'nowrap' }}>ITS — V5.5.0</td>
                        <td style={{ padding: '0.5rem 0.875rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>Cinemômetro</span>
                        </td>
                        <td style={{ padding: '0.5rem 0.875rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#ecfeff', color: '#0891b2', fontWeight: 600 }}>Fiscal 4.0</span>
                        </td>
                        <td style={{ padding: '0.5rem 0.875rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: e.status === 'pendente' ? '#9ca3af' : '#10b981' }}>{e.status === 'pendente' ? '—' : 'Não'}</span>
                        </td>
                        <td style={{ padding: '0.5rem 0.875rem', textAlign: 'center', color: '#6b7280', fontSize: '0.75rem' }}>24h</td>
                        <td style={{ padding: '0.5rem 0.875rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: e.tipo === 'federal' ? '#eff6ff' : '#f5f3ff', color: e.tipo === 'federal' ? '#1d4ed8' : '#7c3aed', fontWeight: 600 }}>
                            IPEM-PE {e.tipo === 'federal' ? '(BR)' : '(PE)'}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.875rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <a href="https://ipempe.axhub.axion.ws/equipamento" target="_blank" rel="noreferrer" style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#ecfeff', color: '#0891b2', fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #a5f3fc' }}>
                              ↗ AxHub
                            </a>
                            <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: st.bg, color: st.cor, fontSize: '0.68rem', fontWeight: 700, border: `1px solid ${st.cor}33` }}>
                              {st.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aviso sobre colunas */}
          <div style={{ background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.7 }}>
            <strong>📌 Observação:</strong> Os campos <em>Nº Série</em> e <em>Código</em> devem corresponder exatamente ao cadastro em <a href="https://ipempe.axhub.axion.ws/equipamento" target="_blank" rel="noreferrer" style={{ color: '#0891b2' }}>ipempe.axhub.axion.ws/equipamento</a>.
            O campo <strong>Código</strong> é a chave de integração usada na API (<code>codigoEquipamento</code>) — qualquer divergência causa falha no envio de passagens.
          </div>
        </div>
      )}

      {/* ══════════ API DE-PARA ══════════ */}
      {secao === 'api' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', color: '#1a202c' }}>⚡ De-Para — Hikvision ISAPI → AxHub API</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>Mapeamento entre os eventos enviados pela câmera Hikvision e os campos esperados pela API da Axion</p>
              </div>
              <a href="https://economia.axhub-api.axion.ws/api-docs/#tag/evento-equipamento/POST/api/v1/evento-equipamento" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', background: '#667eea', color: 'white', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                📄 API Docs AxHub ↗
              </a>
            </div>
          </div>

          {/* ── De-Para principal ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'start' }}>
            {/* Hikvision */}
            <div style={{ background: 'white', borderRadius: '12px', border: '2px solid #7c3aed', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📷</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: '0.875rem' }}>Hikvision ISAPI</div>
                  <div style={{ fontSize: '0.7rem', color: '#c4b5fd' }}>Evento de Passagem (ANPR/Speed)</div>
                </div>
              </div>
              <div style={{ padding: '0.75rem 0' }}>
                {[
                  { campo: 'ipAddress / mac', tipo: 'string', desc: 'Identificação do dispositivo' },
                  { campo: 'channelID', tipo: 'integer', desc: 'Canal da câmera (faixa)' },
                  { campo: 'dateTime', tipo: 'datetime', desc: 'Data/hora da captura' },
                  { campo: 'eventType', tipo: 'string', desc: 'Tipo: speedingVehicle, ANPR' },
                  { campo: 'plateNumber', tipo: 'string', desc: 'Placa lida pelo OCR' },
                  { campo: 'plateColor', tipo: 'string', desc: 'Cor da placa' },
                  { campo: 'vehicleSpeed', tipo: 'integer', desc: 'Velocidade medida (km/h)' },
                  { campo: 'vehicleType', tipo: 'string', desc: 'Tipo do veículo' },
                  { campo: 'laneNo', tipo: 'integer', desc: 'Número da faixa' },
                  { campo: 'direction', tipo: 'string', desc: 'Direção (approach/away)' },
                  { campo: 'picture (base64)', tipo: 'string', desc: 'Imagem da passagem' },
                  { campo: 'confidence', tipo: 'integer', desc: 'Confiança OCR (%)' },
                  { campo: 'serialNumber', tipo: 'string', desc: 'Nº série do dispositivo' },
                  { campo: 'firmwareVersion', tipo: 'string', desc: 'Versão do firmware' },
                  { campo: 'diskUsage / diskFree', tipo: 'integer', desc: 'Uso de disco (MB)' },
                ].map((f, i) => (
                  <div key={f.campo} style={{ padding: '0.4rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid #f5f3ff', background: i % 2 === 0 ? 'white' : '#faf5ff' }}>
                    <code style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700, minWidth: '140px', flexShrink: 0 }}>{f.campo}</code>
                    <span style={{ fontSize: '0.65rem', background: '#f5f3ff', color: '#7c3aed', padding: '0.1rem 0.3rem', borderRadius: '4px', flexShrink: 0 }}>{f.tipo}</span>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Setas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '3.5rem', alignItems: 'center' }}>
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} style={{ fontSize: '1rem', color: '#9ca3af', lineHeight: '1.9rem' }}>→</div>
              ))}
            </div>

            {/* AxHub API */}
            <div style={{ background: 'white', borderRadius: '12px', border: '2px solid #667eea', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #667eea, #4f46e5)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🔵</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: '0.875rem' }}>AxHub API (Axion)</div>
                  <div style={{ fontSize: '0.7rem', color: '#c7d2fe' }}>economia.axhub-api.axion.ws</div>
                </div>
              </div>
              <div style={{ padding: '0.75rem 0' }}>
                {[
                  { campo: 'codigoEquipamento *', endpoint: '/api/v1/evento-equipamento', mapeado: 'Código AxHub (PE001C-1)', status: 'ok' },
                  { campo: 'codigoEquipamento *', endpoint: '/api/v1/heartbeat-equipamento', mapeado: 'Mapeado por channelID', status: 'ok' },
                  { campo: 'dataHoraEvento *', endpoint: '/api/v1/evento-equipamento', mapeado: 'dateTime → ISO 8601', status: 'ok' },
                  { campo: 'descricao *', endpoint: '/api/v1/evento-equipamento', mapeado: 'eventType + vehicleSpeed', status: 'ok' },
                  { campo: 'tipoEventoEquipamento *', endpoint: '/api/v1/evento-equipamento', mapeado: '← veja enum abaixo', status: 'mapeamento' },
                  { campo: 'correcao', endpoint: '/api/v1/evento-equipamento', mapeado: 'false (padrão)', status: 'ok' },
                  { campo: 'placa', endpoint: '/api/v1/infracoes', mapeado: 'plateNumber', status: 'ok' },
                  { campo: 'velocidadeMedida', endpoint: '/api/v1/infracoes', mapeado: 'vehicleSpeed', status: 'ok' },
                  { campo: 'faixa', endpoint: '/api/v1/infracoes', mapeado: 'laneNo → código faixa', status: 'ok' },
                  { campo: 'sentido', endpoint: '/api/v1/infracoes', mapeado: 'direction → SUL/NORTE', status: 'mapeamento' },
                  { campo: 'imagem (base64)', endpoint: '/api/v1/infracoes v1', mapeado: 'picture → base64 ≤200KB', status: 'ok' },
                  { campo: 'confiancaOCR', endpoint: '/api/v1/infracoes', mapeado: 'confidence → %', status: 'ok' },
                  { campo: 'numeroSerie', endpoint: '/api/v1/equipamento', mapeado: 'serialNumber', status: 'ok' },
                  { campo: '—', endpoint: '—', mapeado: 'firmwareVersion (não usado)', status: 'nao_usado' },
                  { campo: 'tipoEvento=EspacoDisco (8)', endpoint: '/api/v1/evento-equipamento', mapeado: 'diskUsage/diskFree → alerta', status: 'mapeamento' },
                ].map((f, i) => {
                  const cor = f.status === 'ok' ? '#10b981' : f.status === 'mapeamento' ? '#f59e0b' : '#9ca3af';
                  const bg = f.status === 'ok' ? '#f0fdf4' : f.status === 'mapeamento' ? '#fffbeb' : '#f9fafb';
                  return (
                    <div key={i} style={{ padding: '0.4rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', borderBottom: '1px solid #eef2ff', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <code style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 700 }}>{f.campo}</code>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.1rem' }}>{f.endpoint}</div>
                      </div>
                      <div style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: bg, border: `1px solid ${cor}44`, flexShrink: 0 }}>
                        <span style={{ fontSize: '0.68rem', color: cor, fontWeight: 600 }}>{f.mapeado}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enum tipoEventoEquipamento */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
            <h4 style={{ margin: '0 0 0.875rem', fontSize: '0.9rem', color: '#1a202c' }}>🔢 Mapeamento: Hikvision eventType → AxHub tipoEventoEquipamento</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Evento Hikvision (ISAPI)', 'Valor AxHub', 'Tipo AxHub', 'Descrição', 'Observação'].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.875rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { hikEvt: 'speedingVehicle', val: 2, tipo: 'Operacao', desc: 'Veículo em excesso de velocidade capturado', obs: 'Evento principal — gerado a cada passagem com infração', cor: '#0891b2' },
                    { hikEvt: 'ANPR / vehicleDetection', val: 2, tipo: 'Operacao', desc: 'Passagem de veículo detectada (sem infração)', obs: 'Passagem normal — sem excesso de velocidade', cor: '#10b981' },
                    { hikEvt: 'networkConnectEvent / disconnect', val: 4, tipo: 'Comunicacao', desc: 'Evento de falha ou retomada de rede', obs: 'Heartbeat perdido → verificar conexão', cor: '#f59e0b' },
                    { hikEvt: 'timeChange / NTPSyncFailed', val: 5, tipo: 'Relogio', desc: 'Alteração ou falha no relógio interno', obs: 'Crítico para validade das autuações — timestamp incorreto invalida o auto', cor: '#ef4444' },
                    { hikEvt: 'diskFull / diskError', val: 8, tipo: 'EspacoDisco', desc: 'Disco cheio ou com erro', obs: 'Câmera para de gravar — perda de evidências', cor: '#ef4444' },
                    { hikEvt: 'powerOn / reboot', val: 3, tipo: 'Energia', desc: 'Liga/reinicialização do equipamento', obs: 'Indica reinicialização — verificar causa', cor: '#7c3aed' },
                    { hikEvt: 'configurationChanged', val: 7, tipo: 'Configuracao', desc: 'Alteração de configuração detectada', obs: 'Alertar operador — pode indicar adulteração', cor: '#dc2626' },
                    { hikEvt: 'tamperDetection / cover', val: 6, tipo: 'Intervencao', desc: 'Tampering ou intervenção física detectada', obs: 'Crítico — possível adulteração do equipamento', cor: '#dc2626' },
                    { hikEvt: 'hardwareFailure / sensorError', val: 1, tipo: 'Falha', desc: 'Falha crítica de hardware', obs: 'Equipamento fora de serviço — acionar manutenção', cor: '#dc2626' },
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '0.5rem 0.875rem' }}><code style={{ fontSize: '0.72rem', color: '#7c3aed', background: '#faf5ff', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{r.hikEvt}</code></td>
                      <td style={{ padding: '0.5rem 0.875rem', textAlign: 'center' }}><span style={{ width: '24px', height: '24px', borderRadius: '50%', background: r.cor, color: 'white', fontWeight: 800, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{r.val}</span></td>
                      <td style={{ padding: '0.5rem 0.875rem' }}><span style={{ fontSize: '0.72rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: `${r.cor}15`, color: r.cor, fontWeight: 700 }}>{r.tipo}</span></td>
                      <td style={{ padding: '0.5rem 0.875rem', color: '#374151', fontSize: '0.75rem' }}>{r.desc}</td>
                      <td style={{ padding: '0.5rem 0.875rem', color: '#6b7280', fontSize: '0.72rem', fontStyle: 'italic' }}>{r.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payload de exemplo */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
            <h4 style={{ margin: '0 0 0.875rem', fontSize: '0.9rem', color: '#1a202c' }}>📋 Exemplo: Passagem Hikvision → Payload AxHub</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '0.4rem' }}>📷 Hikvision (recebido via webhook)</div>
                <pre style={{ margin: 0, background: '#1e1e2e', borderRadius: '8px', padding: '0.875rem', fontSize: '0.7rem', color: '#a6e22e', overflow: 'auto', lineHeight: 1.7 }}>{`{
  "dateTime": "2026-07-20T09:06:19",
  "eventType": "speedingVehicle",
  "channelID": 1,
  "laneNo": 1,
  "direction": "approach",
  "plateNumber": "NAW0666",
  "vehicleSpeed": 65,
  "speedLimit": 60,
  "vehicleType": "smallCar",
  "confidence": 92,
  "serialNumber": "DS-XXXXXXXXXX",
  "picture": "<base64>..."
}`}</pre>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '0.4rem' }}>🔵 AxHub API (a enviar)</div>
                <pre style={{ margin: 0, background: '#1e1e2e', borderRadius: '8px', padding: '0.875rem', fontSize: '0.7rem', color: '#66d9e8', overflow: 'auto', lineHeight: 1.7 }}>{`// POST /api/v1/evento-equipamento
{
  "codigoEquipamento": "PE001C-1",
  "dataHoraEvento": "2026-07-20T09:06:19",
  "descricao": "speedingVehicle — 65km/h (limite 60)",
  "tipoEventoEquipamento": 2,
  "correcao": false
}

// POST /api/v1/infracoes
{
  "codigoEquipamento": "PE001C-1",
  "placa": "NAW0666",
  "velocidadeMedida": 65,
  "dataHoraPassagem": "2026-07-20T09:06:19",
  "imagem": "<base64>..."
}`}</pre>
              </div>
            </div>
          </div>

          {/* Atenção campos obrigatórios */}
          <div style={{ background: '#fef2f2', borderRadius: '10px', border: '1px solid #fca5a5', padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#991b1b', lineHeight: 1.7 }}>
            <strong>🔴 Campos obrigatórios na API AxHub:</strong> <code>codigoEquipamento</code>, <code>dataHoraEvento</code>, <code>descricao</code>, <code>tipoEventoEquipamento</code> — todos marcados com <strong>*</strong> na documentação.
            <br />O <code>codigoEquipamento</code> deve corresponder exatamente ao <strong>Código</strong> cadastrado no AxHub IPEM-PE (ex: <code>PE001C-1</code>).
            Autenticação via <strong>Header: <code>apikey: [seu-token]</code></strong>.
          </div>
        </div>
      )}

      {/* ══════════ ANOMALIAS + ROTINA DE CORREÇÃO ══════════ */}
      {secao === 'anomalias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Painel de controle */}
          <div style={{ background: anomalias.length === 0 ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', border: `2px solid ${anomalias.length === 0 ? '#6ee7b7' : '#fca5a5'}`, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem', color: anomalias.length === 0 ? '#065f46' : '#dc2626', fontSize: '1rem' }}>
                {anomalias.length === 0 ? '✅ Todas as anomalias foram corrigidas!' : `⚠️ ${anomalias.length} anomalia${anomalias.length > 1 ? 's' : ''} pendente${anomalias.length > 1 ? 's' : ''} de correção`}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: anomalias.length === 0 ? '#047857' : '#7f1d1d' }}>
                {correcoes.length > 0 ? `${correcoes.length} correção(ões) aplicada(s) nesta sessão` : 'Preencha os formulários abaixo e clique em "Aplicar Correção"'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {correcoes.length > 0 && (
                <button onClick={exportarCorrigidos} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📥 Exportar JSON Corrigido
                </button>
              )}
              <div style={{ padding: '0.5rem 0.875rem', borderRadius: '8px', background: 'white', border: '1px solid #e2e8f0', fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>
                {EQUIPAMENTOS.flatMap(e => e.lanes).length - anomalias.length}/{EQUIPAMENTOS.flatMap(e => e.lanes).length} faixas OK
              </div>
            </div>
          </div>

          {/* Barra de progresso das correções */}
          {correcoes.length > 0 && (
            <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '0.875rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>
                <span>Progresso de correção</span>
                <span style={{ color: '#10b981' }}>{correcoes.length}/{EQUIPAMENTOS.flatMap(e => e.lanes.filter(l => l.anomalia)).length + correcoes.length} corrigidas</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '6px', transition: 'width 0.5s', width: `${Math.round(correcoes.length / (EQUIPAMENTOS.flatMap(e => e.lanes.filter(l => l.anomalia)).length + correcoes.length) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* Formulários de correção por anomalia */}
          {anomalias.length === 0 && correcoes.length > 0 && (
            <div style={{ background: '#ecfdf5', borderRadius: '12px', border: '2px solid #6ee7b7', padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#065f46' }}>Todos os dados foram corrigidos!</h3>
              <p style={{ margin: '0 0 1rem', color: '#047857', fontSize: '0.875rem' }}>Clique em "Exportar JSON Corrigido" para baixar os dados atualizados e importar no AxHub.</p>
            </div>
          )}

          {[
            // ── ANOMALIA 1 e 2: Patrimônio 000132 duplicado ──
            {
              id: 'PAT-DUP-001',
              titulo: 'Patrimônio Duplicado — 000132 em PE001C-2 e PE002C-2',
              tipo: 'duplicado',
              gravidade: 'erro',
              equipamentos: ['PE001C', 'PE002C'],
              lanes: ['PE001C-2', 'PE002C-2'],
              descricao: 'O número de patrimônio 000132 está cadastrado em duas faixas diferentes (PE001C-2 e PE002C-2). Cada equipamento físico deve ter um patrimônio único. Verifique qual é o correto e atribua um novo número para a faixa incorreta.',
              impacto: 'Conflito de identificação no AxHub — relatórios e autuações podem ser atribuídos ao equipamento errado.',
              campos: [
                {
                  laneId: 'PE001C-2', equipId: 'PE001C', label: 'Patrimônio PE001C-2',
                  campo: 'patrimonio', valorAtual: '000132', sugestao: '000132', placeholder: 'Ex: 000133',
                  tipo: 'text', instrucao: 'Se este é o CORRETO, mantenha. Se é o ERRADO, informe o número real do equipamento físico.',
                },
                {
                  laneId: 'PE002C-2', equipId: 'PE002C', label: 'Patrimônio PE002C-2',
                  campo: 'patrimonio', valorAtual: '000132', sugestao: '', placeholder: 'Ex: 000134 (novo número)',
                  tipo: 'text', instrucao: 'Informe o patrimônio CORRETO para esta faixa (diferente de 000132).',
                },
              ],
            },
            // ── ANOMALIA 3: Sentido "0" ──
            {
              id: 'SENT-0-003',
              titulo: 'Sentido Inválido — PE003C-2 com valor "0"',
              tipo: 'sentido',
              gravidade: 'erro',
              equipamentos: ['PE003C'],
              lanes: ['PE003C-2'],
              descricao: 'A faixa PE003C-2 tem o sentido registrado como "0" (valor numérico inválido). O sentido deve ser um texto descritivo de direção: NORTE/SUL, SUL/NORTE, LESTE/OESTE ou OESTE/LESTE.',
              impacto: 'Falha na geração do Auto de Infração — o campo sentido é obrigatório no sistema SGI/DETRAN.',
              campos: [
                {
                  laneId: 'PE003C-2', equipId: 'PE003C', label: 'Sentido PE003C-2',
                  campo: 'sentido', valorAtual: '0', sugestao: 'NORTE/SUL', placeholder: 'NORTE/SUL',
                  tipo: 'select', opcoes: ['NORTE/SUL', 'SUL/NORTE', 'LESTE/OESTE', 'OESTE/LESTE'],
                  instrucao: 'PE003C-1 é SUL/NORTE → PE003C-2 deve ser o sentido oposto: NORTE/SUL.',
                },
              ],
            },
            // ── ANOMALIA 4: PE009C-2 sentido igual ──
            {
              id: 'SENT-DUP-009',
              titulo: 'Sentido Duplicado — PE009C: ambas as faixas SUL/NORTE',
              tipo: 'sentido',
              gravidade: 'alerta',
              equipamentos: ['PE009C'],
              lanes: ['PE009C-2'],
              descricao: 'Ambas as faixas de PE009C têm sentido SUL/NORTE. Um equipamento bidirecional deve ter sentidos opostos em cada faixa (faixa 1: SUL/NORTE, faixa 2: NORTE/SUL).',
              impacto: 'Infrações capturadas na faixa 2 podem ter o sentido errado registrado no Auto de Infração.',
              campos: [
                {
                  laneId: 'PE009C-2', equipId: 'PE009C', label: 'Sentido PE009C-2',
                  campo: 'sentido', valorAtual: 'SUL/NORTE', sugestao: 'NORTE/SUL', placeholder: 'NORTE/SUL',
                  tipo: 'select', opcoes: ['NORTE/SUL', 'SUL/NORTE', 'LESTE/OESTE', 'OESTE/LESTE'],
                  instrucao: 'PE009C-1 é SUL/NORTE → PE009C-2 deve ser NORTE/SUL (sentido oposto).',
                },
              ],
            },
            // ── ANOMALIA 5: PE010C-2 patrimônio em branco ──
            {
              id: 'PAT-VAZIO-010',
              titulo: 'Patrimônio em Branco — PE010C-2',
              tipo: 'patrimonio',
              gravidade: 'erro',
              equipamentos: ['PE010C'],
              lanes: ['PE010C-2'],
              descricao: 'A faixa PE010C-2 não possui número de patrimônio cadastrado. O patrimônio é o identificador físico do equipamento e é obrigatório para rastreabilidade, manutenção e auditoria.',
              impacto: 'Impossível identificar fisicamente o equipamento em campo. Pode causar falha na importação para o AxHub.',
              campos: [
                {
                  laneId: 'PE010C-2', equipId: 'PE010C', label: 'Patrimônio PE010C-2',
                  campo: 'patrimonio', valorAtual: '', sugestao: '', placeholder: 'Ex: 000089',
                  tipo: 'text', instrucao: 'PE010C-1 tem patrimônio 000088 → informe o número de patrimônio do equipamento físico desta faixa.',
                },
              ],
            },
            // ── ANOMALIA 6: PE015C-2 sentido igual ──
            {
              id: 'SENT-DUP-015',
              titulo: 'Sentido Duplicado — PE015C: ambas as faixas LESTE/OESTE',
              tipo: 'sentido',
              gravidade: 'alerta',
              equipamentos: ['PE015C'],
              lanes: ['PE015C-2'],
              descricao: 'Ambas as faixas de PE015C têm sentido LESTE/OESTE. Para um equipamento bidirecional, a faixa 2 deve ter o sentido oposto: OESTE/LESTE.',
              impacto: 'Infrações da faixa 2 podem ter o sentido incorreto no Auto de Infração.',
              campos: [
                {
                  laneId: 'PE015C-2', equipId: 'PE015C', label: 'Sentido PE015C-2',
                  campo: 'sentido', valorAtual: 'LESTE/OESTE', sugestao: 'OESTE/LESTE', placeholder: 'OESTE/LESTE',
                  tipo: 'select', opcoes: ['NORTE/SUL', 'SUL/NORTE', 'LESTE/OESTE', 'OESTE/LESTE'],
                  instrucao: 'PE015C-1 é LESTE/OESTE → PE015C-2 deve ser OESTE/LESTE (sentido oposto).',
                },
              ],
            },
          ].filter(rotina => rotina.lanes.some(l => !corrigido[l])).map((rotina) => {
            const jaConcluida = rotina.lanes.every(l => corrigido[l]);
            const gravCor = rotina.gravidade === 'erro' ? '#ef4444' : '#f59e0b';
            const gravBg  = rotina.gravidade === 'erro' ? '#fef2f2' : '#fffbeb';
            return (
              <div key={rotina.id} style={{ background: 'white', borderRadius: '12px', border: `2px solid ${gravCor}44`, overflow: 'hidden' }}>
                {/* Header da anomalia */}
                <div style={{ padding: '1rem 1.25rem', background: gravBg, borderBottom: `1px solid ${gravCor}22`, display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', background: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#6b7280', border: '1px solid #e2e8f0' }}>{rotina.id}</span>
                      {rotina.lanes.map(l => <span key={l} style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: `${gravCor}15`, padding: '0.15rem 0.4rem', borderRadius: '4px', color: gravCor, fontWeight: 700 }}>{l}</span>)}
                      <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '20px', background: gravBg, color: gravCor, fontWeight: 700, border: `1px solid ${gravCor}44` }}>{rotina.gravidade === 'erro' ? '🔴 Erro' : '🟡 Atenção'}</span>
                    </div>
                    <h4 style={{ margin: '0 0 0.3rem', color: '#1a202c', fontSize: '0.9rem', fontWeight: 700 }}>{rotina.titulo}</h4>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>{rotina.descricao}</p>
                    <div style={{ fontSize: '0.75rem', color: gravCor, background: `${gravCor}10`, padding: '0.3rem 0.625rem', borderRadius: '6px', display: 'inline-block' }}>
                      ⚡ <strong>Impacto:</strong> {rotina.impacto}
                    </div>
                  </div>
                </div>

                {/* Formulário de correção */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ✏️ Formulário de Correção
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {rotina.campos.map((campo) => {
                      const chave = `${campo.laneId}_${campo.campo}`;
                      const valorAtual = formCorrecao[chave] ?? campo.sugestao ?? campo.valorAtual;
                      const jaCorrigido = corrigido[campo.laneId];
                      return (
                        <div key={campo.laneId} style={{ padding: '1rem', borderRadius: '10px', background: jaCorrigido ? '#f0fdf4' : '#f8fafc', border: `1px solid ${jaCorrigido ? '#6ee7b7' : '#e2e8f0'}` }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.625rem' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: jaCorrigido ? '#065f46' : '#1a202c' }}>{campo.laneId}</span>
                            {jaCorrigido && <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>✅ Corrigido</span>}
                          </div>

                          {/* Valor atual → novo */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{ padding: '0.4rem 0.625rem', borderRadius: '6px', background: jaCorrigido ? '#dcfce7' : '#fee2e2', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.62rem', color: '#6b7280', marginBottom: '0.1rem' }}>ATUAL</div>
                              <code style={{ fontSize: '0.75rem', fontWeight: 700, color: jaCorrigido ? '#15803d' : '#dc2626' }}>{campo.valorAtual || '(vazio)'}</code>
                            </div>
                            <span style={{ color: '#9ca3af', fontSize: '1rem' }}>→</span>
                            <div style={{ padding: '0.4rem 0.625rem', borderRadius: '6px', background: '#f0fdf4', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.62rem', color: '#6b7280', marginBottom: '0.1rem' }}>NOVO</div>
                              <code style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>{valorAtual || '—'}</code>
                            </div>
                          </div>

                          {/* Instrução */}
                          <div style={{ fontSize: '0.72rem', color: '#6b7280', background: '#eff6ff', padding: '0.4rem 0.625rem', borderRadius: '6px', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                            💡 {campo.instrucao}
                          </div>

                          {/* Campo de entrada */}
                          {!jaCorrigido && (
                            campo.tipo === 'select' ? (
                              <select
                                value={valorAtual}
                                onChange={e => setFormCorrecao(prev => ({ ...prev, [chave]: e.target.value }))}
                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: `2px solid ${gravCor}44`, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontWeight: 600 }}
                              >
                                {campo.opcoes.map(op => <option key={op} value={op}>{op}</option>)}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={valorAtual}
                                onChange={e => setFormCorrecao(prev => ({ ...prev, [chave]: e.target.value }))}
                                placeholder={campo.placeholder}
                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: `2px solid ${gravCor}44`, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', fontWeight: 600 }}
                              />
                            )
                          )}

                          {/* Botão aplicar */}
                          {!jaCorrigido ? (
                            <button
                              disabled={!valorAtual?.trim()}
                              onClick={() => aplicarCorrecao(campo.equipId, campo.laneId, { [campo.campo]: valorAtual?.trim(), status: 'ok' })}
                              style={{ width: '100%', marginTop: '0.625rem', padding: '0.5rem', borderRadius: '8px', border: 'none', background: valorAtual?.trim() ? '#10b981' : '#e5e7eb', color: valorAtual?.trim() ? 'white' : '#9ca3af', fontWeight: 700, cursor: valorAtual?.trim() ? 'pointer' : 'default', fontSize: '0.82rem', transition: 'all 0.15s' }}
                            >
                              ✓ Aplicar Correção
                            </button>
                          ) : (
                            <div style={{ marginTop: '0.625rem', padding: '0.5rem', borderRadius: '8px', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center' }}>
                              ✅ Correção aplicada
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Auditoria de correções aplicadas */}
          {correcoes.length > 0 && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '0.875rem 1.25rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.875rem', color: '#065f46' }}>📋 Auditoria — Correções Aplicadas ({correcoes.length})</h4>
                <button onClick={exportarCorrigidos} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                  📥 Exportar JSON
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Data/Hora', 'Equipamento', 'Faixa', 'Campo', 'Valor Anterior', 'Valor Novo', 'Operador'].map(h => (
                        <th key={h} style={{ padding: '0.5rem 0.875rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correcoes.map((c, i) => {
                      const laneOriginal = EQUIPAMENTOS.find(e => e.codigo === c.equipCodigo)?.lanes.find(l => l.codigo === c.laneCodigo);
                      return Object.entries(c.alteracoes).filter(([k]) => k !== 'status').map(([campo, novoValor]) => (
                        <tr key={`${i}_${campo}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.5rem 0.875rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#6b7280' }}>{new Date(c.ts).toLocaleString('pt-BR')}</td>
                          <td style={{ padding: '0.5rem 0.875rem', fontFamily: 'monospace', fontWeight: 700, color: '#1a202c' }}>{c.equipCodigo}</td>
                          <td style={{ padding: '0.5rem 0.875rem', fontFamily: 'monospace', color: '#374151' }}>{c.laneCodigo}</td>
                          <td style={{ padding: '0.5rem 0.875rem' }}><span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace' }}>{campo}</span></td>
                          <td style={{ padding: '0.5rem 0.875rem' }}><code style={{ fontSize: '0.72rem', color: '#dc2626', background: '#fef2f2', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{laneOriginal?.[campo] || '(vazio)'}</code></td>
                          <td style={{ padding: '0.5rem 0.875rem' }}><code style={{ fontSize: '0.72rem', color: '#15803d', background: '#f0fdf4', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{novoValor}</code></td>
                          <td style={{ padding: '0.5rem 0.875rem', color: '#6b7280', fontSize: '0.75rem' }}>{c.usuario}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ GUIA ══════════ */}
      {secao === 'guia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Seletor de equipamento */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#1a202c' }}>🗺️ Guia de Validação por Equipamento</h3>
            <select value={equip?.codigo || ''} onChange={e => setEquip(dados.find(eq => eq.codigo === e.target.value) || null)} style={{ padding: '0.5rem 0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', minWidth: '320px' }}>
              <option value="">— Selecione o equipamento para validar —</option>
              {dados.map(e => {
                const hasIssue = e.lanes.some(l => l.status !== 'ok');
                return <option key={e.codigo} value={e.codigo}>{hasIssue ? '⚠️ ' : '✅ '}{e.codigo} — {e.rodovia} Km {e.km} ({e.cidade})</option>;
              })}
            </select>
          </div>

          {equip && (
            <>
              {/* Info do equipamento */}
              <div style={{ background: 'white', borderRadius: '12px', border: `2px solid ${TIPO_COR[equip.tipo].cor}33`, padding: '1rem 1.5rem', borderLeft: `4px solid ${TIPO_COR[equip.tipo].cor}` }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div><div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase' }}>Equipamento</div><div style={{ fontWeight: 800, color: '#1a202c', fontFamily: 'monospace' }}>{equip.codigo}</div></div>
                  <div><div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase' }}>Rodovia</div><div style={{ fontWeight: 600, color: '#374151' }}>{equip.rodovia} Km {equip.km}</div></div>
                  <div><div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase' }}>Cidade</div><div style={{ fontWeight: 600, color: '#374151' }}>{equip.cidade}/{equip.estado}</div></div>
                  <div><div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase' }}>Faixas</div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {equip.lanes.map(l => { const ls = STATUS_COR[l.status]; return (
                        <span key={l.codigo} title={l.anomalia} style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: ls.bg, color: ls.cor, fontFamily: 'monospace', fontWeight: 600 }}>{l.codigo} ({l.patrimonio || '⚠️'})</span>
                      );})}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passos */}
              {GUIA.map((passo, idx) => {
                const concluido = guiaConcluido(equip.codigo, idx);
                const isProximo = !concluido && GUIA.slice(0, idx).every((_, i) => guiaConcluido(equip.codigo, i));
                const cor = TIPO_GUIA_COR[passo.tipo] || '#374151';
                return (
                  <div key={idx} style={{ background: 'white', borderRadius: '12px', border: concluido ? '2px solid #6ee7b7' : isProximo ? '2px solid #667eea' : '1px solid #e2e8f0', opacity: !concluido && !isProximo && idx > 0 && !GUIA.slice(0, idx).every((_, i) => guiaConcluido(equip.codigo, i)) ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <div onClick={() => toggleGuia(equip.codigo, idx)} style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: concluido ? '#10b981' : isProximo ? '#667eea' : '#f1f5f9', color: concluido || isProximo ? 'white' : '#9ca3af', fontWeight: 700, fontSize: concluido ? '1rem' : '0.875rem' }}>
                        {concluido ? '✓' : idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '20px', background: `${cor}18`, color: cor, fontWeight: 700 }}>{passo.tipo}</span>
                          {isProximo && <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '20px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}>← PRÓXIMO</span>}
                        </div>
                        <div style={{ fontWeight: 600, color: concluido ? '#6b7280' : '#1a202c', fontSize: '0.875rem', textDecoration: concluido ? 'line-through' : 'none', marginTop: '0.2rem' }}>{passo.titulo}</div>
                      </div>
                      <span style={{ color: '#9ca3af' }}>▼</span>
                    </div>
                    <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
                      <p style={{ margin: '0.75rem 0', fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{passo.desc}</p>
                      {passo.link && <a href={passo.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', borderRadius: '8px', background: cor, color: 'white', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}>🔗 Abrir</a>}
                      <button onClick={() => toggleGuia(equip.codigo, idx)} style={{ marginLeft: passo.link ? '0.5rem' : '0', padding: '0.4rem 0.875rem', borderRadius: '8px', border: 'none', background: concluido ? '#fee2e2' : '#10b981', color: concluido ? '#dc2626' : 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                        {concluido ? '↩ Desfazer' : '✓ Concluído'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
