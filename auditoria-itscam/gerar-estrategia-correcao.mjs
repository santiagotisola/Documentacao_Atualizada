/**
 * Gerador de estratégia de correção DE-PARA
 * Usa GOEC6O045 - Faixa 1 como REFERÊNCIA (100% padrão, uptime estável 136.9h, status OK)
 * Gera JSON com casos separados para correção
 */
import fs from 'fs';
import path from 'path';

const dir = './auditoria-itscam/resultados';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'));

// ─── REFERÊNCIA: Equipamento 100% correto ───────────────────────────────────
const refFile = 'GOEC6O045_-_Faixa_1.json';
const REF = JSON.parse(fs.readFileSync(path.join(dir, refFile), 'utf8'));
const REF_NAME = REF._device.name;

console.log(`Referência: ${REF_NAME} (UUID: ${REF._device.uuid})`);
console.log(`Status: 100% em conformidade, uptime 136.9h, VARCO ativo, storage OK\n`);

// ─── Extrair valores CORRETOS da referência ─────────────────────────────────
function getRefValues() {
  const presets = REF.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/restapiclient/presets'].data;
  const ftp = REF.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/ftp'].data;
  const itscamPro = REF.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/itscampro'].data;
  const lince = REF.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/lince'].data;
  const protocols = REF.menus['04-EQUIPAMENTO/04f-SERVIDORES']['/api/equipment/servers/protocols'].data;
  const ocr = REF.menus['04-EQUIPAMENTO/04a-OCR']['/api/equipment/ocr'].data;
  const classif = REF.menus['04-EQUIPAMENTO/04b-CLASSIFICADOR']['/api/equipment/classifier'].data;
  const profiles = REF.menus['02-IMAGEM']['/api/image/profiles'].data;
  const varco = REF.menus['05-SISTEMA/05c-MANUTENCAO']['/api/system/maintenance/remoteaccess'].data;
  const net = REF.menus['05-SISTEMA/05b-REDE']['/api/equipment/network'].data;
  const general = REF.menus['05-SISTEMA/05a-GERAL']['/api/equipment/general'].data;
  const dateTime = REF.menus['05-SISTEMA/05a-GERAL']['/api/equipment/dateAndTime'].data;
  const misc = REF.menus['04-EQUIPAMENTO/04i-DIVERSOS']['/api/equipment/misc'].data;

  return {
    // VARCO
    varco: {
      enabled: varco.remoteAccess.varco.enabled,
      edgeServer: varco.remoteAccess.varco.edgeServer,
      provisionKey: varco.remoteAccess.varco.provisionKey
    },
    // REST Presets
    restPresets: {
      pumatronix: {
        enabled: presets.pumatronix.enabled,
        url: presets.pumatronix.url
      },
      pumatronixCompat_v1_7_6: {
        enabled: presets.pumatronixCompat_v1_7_6.enabled,
        url: presets.pumatronixCompat_v1_7_6.url
      },
      helios: {
        enabled: presets.helios.enabled,
        url: presets.helios.url
      },
      RFB: {
        enabled: presets.RFB.enabled,
        url: presets.RFB.url
      }
    },
    // Servidores
    ftp: { enable: ftp.ftp.enable },
    itscampro: { enable: itscamPro.itscampro.enable },
    lince: { enabled: lince.lince.enabled },
    // Protocolos
    protocols: {
      blockAPI: protocols.configCgi.blockAPI,
      cougarAuth: protocols.cougar.auth.require
    },
    // OCR
    ocr: {
      enabled: ocr.ocr.enabled,
      countryCode: ocr.ocr.countryCode,
      maxPlates: ocr.ocr.maxPlates,
      lowProbChar: ocr.ocr.lowProbChar,
      maxLowProbChars: ocr.ocr.maxLowProbChars
    },
    // Classificador
    classifier: {
      enabled: classif.classifier.enabled,
      processingQueue: classif.classifier.processingQueue,
      processingThreads: classif.classifier.processingThreads
    },
    // Perfis de Imagem
    perfilDiurno: {
      transitions: profiles[0].transitions,
      flash: profiles[0].flash || null,
      multipleExposures: profiles[0].multipleExposures || null
    },
    perfilNoturno: {
      transitions: profiles[1].transitions,
      flash: profiles[1].flash || null,
      multipleExposures: profiles[1].multipleExposures || null
    },
    // Rede
    rede: {
      gateway: net.ethernet.ipv4Primary.gateway,
      dns: net.ethernet.ipv4Primary.dns
    },
    // Data/Hora
    dateTime: {
      timezone: dateTime.timezone,
      gps: dateTime.gps
    },
    // Misc
    misc: {
      snapshotCrop: { enable: misc.snapshotCrop.enable, mode: misc.snapshotCrop.mode }
    }
  };
}

const CORRETO = getRefValues();

// ─── Carregar TODOS os equipamentos ─────────────────────────────────────────
function loadEquip(filename) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, filename), 'utf8'));
  return d;
}

// ─── CASO 1: VARCO Desabilitado ─────────────────────────────────────────────
function caso1_varcoDesabilitado() {
  const afetados = ['GOEC6O019_-_Faixa_1.json', 'GOEC6O019_-_Faixa_2.json',
    'GOEC6O023_-_Faixa_1.json', 'GOEC6O049_-_Faixa_1.json',
    'GOEC6O049_-_Faixa_2.json', 'GOEC6O052_-_Faixa_1.json'];

  const caso = {
    id: 'CASO-01',
    titulo: 'VARCO Tunnel Desabilitado + Configuração Zerada',
    severidade: 'CRITICA',
    descricao: 'Equipamentos com VARCO desabilitado não possuem conectividade remota. A coleta de config retornou dados nulos em quase todos os campos, indicando que o dispositivo está inacessível ou com firmware em estado de fábrica.',
    impacto: 'Sem heartbeat, sem imagens de teste, sem acesso remoto para manutenção',
    causa_provavel: 'Equipamento não provisionado no VARCO ou perda de configuração após reset de fábrica',
    equipamentos_afetados: [],
    referencia: {
      equipamento: REF_NAME,
      config_correta: {
        endpoint: '/api/system/maintenance/remoteaccess',
        valores: CORRETO.varco
      }
    },
    correcao: {
      metodo: 'Acesso local (IP público ou visita técnica)',
      passos: [
        '1. Acessar câmera via IP público (se disponível) ou acesso físico',
        '2. Login: admin / #econocr@',
        '3. Menu: SISTEMA → Manutenção → Acesso Remoto',
        '4. Habilitar VARCO com os dados abaixo:',
        '   - Enabled: true',
        '   - Edge Server: edge.varco.io',
        '   - Provision Key: yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=',
        '   - Device Name: [NOME DO EQUIPAMENTO] (ex: GOEC6O019 - FAIXA 1)',
        '5. Salvar e aguardar reconexão (~30s)',
        '6. Verificar no portal VARCO se aparece como Online',
        '7. Após VARCO ativo, aplicar TODAS as configs dos demais casos via tunnel'
      ],
      api_rest: {
        method: 'PUT',
        path: '/api/system/maintenance/remoteaccess',
        body: {
          remoteAccess: {
            varco: {
              enabled: true,
              edgeServer: 'edge.varco.io',
              provisionKey: 'yk-pzGzXLGmz6-iO3GhdR7hinksDN7aek-kjQ4WYl_c=',
              deviceName: '{{DEVICE_NAME}}'
            }
          }
        }
      }
    }
  };

  for (const f of afetados) {
    try {
      const d = loadEquip(f);
      caso.equipamentos_afetados.push({
        nome: d._device.name,
        uuid: d._device.uuid,
        ip_publico: d._device.ip,
        varco_atual: false,
        deviceName_esperado: d._device.name.replace(' - Faixa ', ' - FAIXA ')
      });
    } catch (e) {}
  }

  return caso;
}

// ─── CASO 2: Noturno Upper Profile Errado ────────────────────────────────────
function caso2_profileErrado() {
  const caso = {
    id: 'CASO-02',
    titulo: 'Perfil Noturno → Upper Profile INCORRETO (Câmera trava em P&B)',
    severidade: 'CRITICA',
    descricao: 'O campo transitions.upper.profile do perfil noturno aponta para o próprio perfil ao invés de apontar para o perfil 0 (Diurno). Quando a luminosidade sobe, a câmera deveria voltar ao Diurno mas volta para si mesma, ficando presa no modo P&B indefinidamente.',
    impacto: 'Imagens diurnas em preto e branco = OCR degradado, classificação incorreta, autuações invalidadas',
    causa_provavel: 'Erro de configuração manual — profile ID do noturno inserido no campo upper.profile',
    equipamentos_afetados: [],
    referencia: {
      equipamento: REF_NAME,
      config_correta: {
        endpoint: '/api/image/profiles',
        perfil_index: 1,
        campo: 'transitions.upper.profile',
        valor_correto: 0,
        transicoes_completas: CORRETO.perfilNoturno.transitions
      }
    },
    de_para: {
      campo: 'Perfil Noturno → Transições → Superior → Profile',
      errado: 23483,
      correto: 0,
      explicacao: 'O valor 23483 é o ID interno do próprio perfil noturno. Deve ser 0 (ID do perfil Diurno) para que a câmera retorne ao modo colorido quando a luz aumenta.'
    },
    correcao: {
      metodo: 'Via VARCO tunnel + interface web ou API REST',
      passos: [
        '1. Acessar via VARCO tunnel: https://<UUID>-80.tunnel.varco.cloud',
        '2. Login: admin / #econocr@',
        '3. Menu: IMAGEM → Perfis de Imagem',
        '4. Selecionar Perfil NOTURNO (2º perfil)',
        '5. Aba "Transições" → Seção "Superior" (Upper)',
        '6. Campo "Profile" → Alterar de 23483 para 0',
        '7. Salvar',
        '8. Testar: cobrir sensor de luz → esperar voltar → confirmar que sai do P&B'
      ],
      api_rest: {
        method: 'PUT',
        path: '/api/image/profiles/1',
        nota: 'Enviar perfil completo com transitions.upper.profile = 0'
      }
    }
  };

  // GOEC6O008 - Faixa 1
  const d = loadEquip('GOEC6O008_-_Faixa_1.json');
  const profileAtual = d.menus['02-IMAGEM']['/api/image/profiles'].data[1];
  caso.equipamentos_afetados.push({
    nome: d._device.name,
    uuid: d._device.uuid,
    ip_publico: d._device.ip,
    tunnel_url: `https://${d._device.uuid}-80.tunnel.varco.cloud`,
    valor_atual: profileAtual.transitions.upper.profile,
    valor_correto: 0,
    transicoes_atuais: profileAtual.transitions
  });

  return caso;
}

// ─── CASO 3: Transições com Horário ──────────────────────────────────────────
function caso3_transicoesHorario() {
  const afetados = [
    'GOEC6O033_-_Faixa_2.json',
    'GOEC6O040_-_Faixa_1.json',
    'GOEC6O040_-_Faixa_2.json',
    'GOEC6O055_-_Faixa_1.json',
    'GOEC6O055_-_Faixa_2.json',
    'GOEC6O008_-_Faixa_1.json'
  ];

  const caso = {
    id: 'CASO-03',
    titulo: 'Transições Diurno/Noturno com Janelas de Horário (Risco de travamento P&B)',
    severidade: 'ALTA',
    descricao: 'Equipamentos com startTime/endTime diferentes de 00:00:00 nas transições. Isso cria janelas de tempo onde a câmera NÃO consegue transicionar entre perfis, podendo ficar presa em modo noturno (P&B) durante o dia se a condição de luz mudar fora da janela configurada.',
    impacto: 'Risco de câmera travar em P&B em horários específicos. Não é garantido mas é possível dependendo das condições de luz.',
    causa_provavel: 'Configuração manual antiga com lógica de horário — o padrão correto é usar SOMENTE luminosidade (sensor) sem restrição de horário.',
    equipamentos_afetados: [],
    referencia: {
      equipamento: REF_NAME,
      config_correta: {
        endpoint: '/api/image/profiles',
        campo: 'transitions.lower/upper.startTime e endTime',
        valor_correto: '00:00:00 (ou "0" no formato interno)',
        perfil_diurno_correto: CORRETO.perfilDiurno.transitions,
        perfil_noturno_correto: CORRETO.perfilNoturno.transitions
      }
    },
    de_para: {
      regra: 'TODOS os campos startTime e endTime de AMBOS os perfis devem ser "00:00:00"',
      explicacao: 'Com horário 00:00:00, a transição funciona 24h baseada apenas no sensor de luminosidade. Com horários específicos, a transição só acontece dentro da janela — fora dela a câmera fica travada no perfil atual.',
      exemplos_errados: [
        { campo: 'diurno.lower.startTime', errado: '06:00:00', correto: '00:00:00' },
        { campo: 'diurno.lower.endTime', errado: '18:00:00', correto: '00:00:00' },
        { campo: 'noturno.upper.startTime', errado: '18:01:00', correto: '00:00:00' },
        { campo: 'noturno.upper.endTime', errado: '06:00:00', correto: '00:00:00' }
      ]
    },
    correcao: {
      metodo: 'Via VARCO tunnel + interface web ou API REST',
      passos: [
        '1. Acessar via VARCO tunnel',
        '2. Menu: IMAGEM → Perfis de Imagem',
        '3. Perfil DIURNO → Transições:',
        '   - Lower: Start Time = 00:00:00, End Time = 00:00:00',
        '   - Upper: Start Time = 00:00:00, End Time = 00:00:00',
        '4. Perfil NOTURNO → Transições:',
        '   - Lower: Start Time = 00:00:00, End Time = 00:00:00',
        '   - Upper: Start Time = 00:00:00, End Time = 00:00:00',
        '   - Upper Profile = 0 (Diurno)',
        '5. Salvar ambos os perfis'
      ],
      api_rest: {
        method: 'PUT',
        path: '/api/image/profiles/0 e /api/image/profiles/1',
        nota: 'Enviar perfis completos com todos startTime/endTime = "00:00:00"'
      }
    }
  };

  for (const f of afetados) {
    try {
      const d = loadEquip(f);
      const profiles = d.menus['02-IMAGEM']['/api/image/profiles'].data;
      caso.equipamentos_afetados.push({
        nome: d._device.name,
        uuid: d._device.uuid,
        ip_publico: d._device.ip,
        tunnel_url: `https://${d._device.uuid}-80.tunnel.varco.cloud`,
        diurno_lower: { start: profiles[0].transitions.lower.startTime, end: profiles[0].transitions.lower.endTime },
        diurno_upper: { start: profiles[0].transitions.upper.startTime, end: profiles[0].transitions.upper.endTime },
        noturno_lower: { start: profiles[1].transitions.lower.startTime, end: profiles[1].transitions.lower.endTime },
        noturno_upper: { start: profiles[1].transitions.upper.startTime, end: profiles[1].transitions.upper.endTime },
        noturno_upper_profile: profiles[1].transitions.upper.profile
      });
    } catch (e) {}
  }

  return caso;
}

// ─── CASO 4: Classificador Queue/Threads ─────────────────────────────────────
function caso4_classificador() {
  const caso = {
    id: 'CASO-04',
    titulo: 'Classificador com processingQueue e/ou processingThreads diferentes',
    severidade: 'BAIXA',
    descricao: 'O classificador veicular identifica tipo de veículo (carro, moto, caminhão). Com processingQueue=4 ou processingThreads>1, consome mais CPU. O padrão recomendado é queue=1, threads=1 para estabilidade. NOTA: 34 dos 70 equipamentos usam queue=4 — pode ter sido intencional.',
    impacto: 'Consumo elevado de CPU pode atrasar processamento de OCR em picos de tráfego. Em geral funciona mas com maior carga térmica.',
    causa_provavel: 'Configuração aplicada em lote com valor diferente ou ajuste intencional para melhorar classificação em vias de alto volume.',
    equipamentos_afetados: [],
    referencia: {
      equipamento: REF_NAME,
      config_correta: {
        endpoint: '/api/equipment/classifier',
        valores: CORRETO.classifier
      }
    },
    de_para: {
      campo: 'classifier.processingQueue / classifier.processingThreads',
      valores_encontrados: [
        { queue: 4, threads: 1, qtd: 28, nota: 'Maioria dos desviados — pode ser intencional' },
        { queue: 4, threads: 4, qtd: 3, nota: 'GOEC6O010-F1, GOEC6O052-F2, GOEC6O058-F2 — alto consumo' },
        { queue: 2, threads: 2, qtd: 2, nota: 'GOEC6O011-F2, GOEC6O028-F1' },
        { queue: 1, threads: 2, qtd: 1, nota: 'GOEC6O010-F2' },
        { queue: 1, threads: 1, qtd: 34, nota: 'PADRÃO REFERÊNCIA' }
      ],
      recomendacao: 'Avaliar com equipe se queue=4 é intencional. Se não, padronizar para queue=1, threads=1.'
    },
    correcao: {
      metodo: 'Via VARCO tunnel + API REST',
      passos: [
        '1. Acessar via VARCO tunnel',
        '2. Menu: EQUIPAMENTO → Classificador',
        '3. Processing Queue → 1',
        '4. Processing Threads → 1',
        '5. Salvar'
      ],
      api_rest: {
        method: 'PUT',
        path: '/api/equipment/classifier',
        body: { classifier: { processingQueue: 1, processingThreads: 1 } },
        nota: 'Enviar campo classifier completo para não perder outros valores'
      }
    }
  };

  // Listar apenas os com threads > 1 (mais críticos)
  const criticos = [
    'GOEC6O010_-_Faixa_1.json', 'GOEC6O010_-_Faixa_2.json',
    'GOEC6O011_-_Faixa_2.json', 'GOEC6O028_-_Faixa_1.json',
    'GOEC6O052_-_Faixa_2.json', 'GOEC6O058_-_Faixa_2.json'
  ];

  for (const f of criticos) {
    try {
      const d = loadEquip(f);
      const classif = d.menus['04-EQUIPAMENTO/04b-CLASSIFICADOR']['/api/equipment/classifier'].data;
      caso.equipamentos_afetados.push({
        nome: d._device.name,
        uuid: d._device.uuid,
        tunnel_url: `https://${d._device.uuid}-80.tunnel.varco.cloud`,
        queue_atual: classif.classifier.processingQueue,
        threads_atual: classif.classifier.processingThreads,
        queue_correto: 1,
        threads_correto: 1
      });
    } catch (e) {}
  }

  return caso;
}

// ─── CASO 5: Transição Levels Diferentes ─────────────────────────────────────
function caso5_transitionLevels() {
  const afetados = [
    'GOEC6O009_-_Faixa_1.json', 'GOEC6O009_-_Faixa_2.json',
    'GOEC6O013_-_Faixa_2.json', 'GOEC6O008_-_Faixa_1.json'
  ];

  const caso = {
    id: 'CASO-05',
    titulo: 'Níveis de Transição (Level) Diurno/Noturno Diferentes do Padrão',
    severidade: 'MEDIA',
    descricao: 'Os campos transitions.lower.level e transitions.upper.level controlam em qual nível de luminosidade a câmera troca de perfil. Valores diferentes do padrão podem causar transições prematuras ou atrasadas.',
    impacto: 'Transição entre diurno/noturno pode ocorrer cedo/tarde demais, afetando qualidade de imagem.',
    causa_provavel: 'Ajuste manual de campo para condições específicas do local ou erro de configuração.',
    equipamentos_afetados: [],
    referencia: {
      equipamento: REF_NAME,
      config_correta: {
        diurno_lower_level: CORRETO.perfilDiurno.transitions.lower.level,
        diurno_upper_level: CORRETO.perfilDiurno.transitions.upper.level,
        noturno_lower_level: CORRETO.perfilNoturno.transitions.lower.level,
        noturno_upper_level: CORRETO.perfilNoturno.transitions.upper.level
      }
    },
    de_para: {
      padrao: {
        lower_level: 10,
        upper_level: 35,
        explicacao: 'Lower=10 → quando luminosidade cai para 10, vai pro noturno. Upper=35 → quando sobe para 35, volta pro diurno.'
      }
    },
    correcao: {
      metodo: 'Via VARCO tunnel',
      passos: [
        '1. Acessar via VARCO tunnel',
        '2. Menu: IMAGEM → Perfis de Imagem → Perfil Diurno → Transições',
        '3. Lower Level = 10, Upper Level = 35',
        '4. Perfil Noturno → Transições',
        '5. Lower Level = 10, Upper Level = 35',
        '6. Salvar ambos'
      ]
    }
  };

  for (const f of afetados) {
    try {
      const d = loadEquip(f);
      const profiles = d.menus['02-IMAGEM']['/api/image/profiles'].data;
      caso.equipamentos_afetados.push({
        nome: d._device.name,
        uuid: d._device.uuid,
        tunnel_url: `https://${d._device.uuid}-80.tunnel.varco.cloud`,
        diurno_lower_level: profiles[0].transitions.lower.level,
        diurno_upper_level: profiles[0].transitions.upper.level,
        noturno_lower_level: profiles[1].transitions.lower.level,
        noturno_upper_level: profiles[1].transitions.upper.level,
        correto: { lower: 10, upper: 35 }
      });
    } catch (e) {}
  }

  return caso;
}

// ─── CASO 6: OCR MaxPlates Diferente ─────────────────────────────────────────
function caso6_ocrMaxPlates() {
  const caso = {
    id: 'CASO-06',
    titulo: 'OCR maxPlates Reduzido (1 ao invés de 2)',
    severidade: 'BAIXA',
    descricao: 'Dois equipamentos têm maxPlates=1, enquanto o padrão é 2. Isso limita a câmera a detectar apenas 1 placa por frame, o que em vias de mão dupla pode perder veículos.',
    impacto: 'Em cenários com 2 veículos simultâneos no frame, um não será lido.',
    causa_provavel: 'Ajuste para via de faixa única — pode ser intencional.',
    equipamentos_afetados: [],
    referencia: {
      equipamento: REF_NAME,
      config_correta: { endpoint: '/api/equipment/ocr', campo: 'ocr.maxPlates', valor: CORRETO.ocr.maxPlates }
    },
    correcao: {
      api_rest: {
        method: 'PUT',
        path: '/api/equipment/ocr',
        campo: 'ocr.maxPlates',
        valor_correto: 2
      }
    }
  };

  const afetados = ['GOEC6O009_-_Faixa_2.json', 'GOEC6O055_-_Faixa_2.json'];
  for (const f of afetados) {
    try {
      const d = loadEquip(f);
      const ocr = d.menus['04-EQUIPAMENTO/04a-OCR']['/api/equipment/ocr'].data;
      caso.equipamentos_afetados.push({
        nome: d._device.name,
        uuid: d._device.uuid,
        tunnel_url: `https://${d._device.uuid}-80.tunnel.varco.cloud`,
        maxPlates_atual: ocr.ocr.maxPlates,
        maxPlates_correto: 2
      });
    } catch (e) {}
  }

  return caso;
}

// ─── CASO 7: Snapshot Crop e Mode ────────────────────────────────────────────
function caso7_snapshot() {
  const caso = {
    id: 'CASO-07',
    titulo: 'Snapshot Crop Habilitado ou Mode Diferente',
    severidade: 'BAIXA',
    descricao: 'Alguns equipamentos têm snapshotCrop habilitado (true) ou mode diferente de "static". Pode ser intencional para cortar a imagem antes de enviar.',
    impacto: 'Imagem enviada pode ser recortada, mostrando apenas parte da cena. Se não intencional, pode prejudicar contexto da autuação.',
    equipamentos_afetados: [],
    referencia: {
      equipamento: REF_NAME,
      config_correta: { snapshotCrop: false, snapshotMode: 'static' }
    },
    correcao: {
      passos: [
        '1. Acessar via VARCO tunnel',
        '2. Menu: EQUIPAMENTO → Diversos',
        '3. Snapshot Crop → Desabilitado',
        '4. Mode → static',
        '5. Salvar'
      ]
    }
  };

  const afetados = ['GOEC6O003_-_Faixa_2.json', 'GOEC6O008_-_Faixa_1.json', 'GOEC6O013_-_Faixa_1.json'];
  for (const f of afetados) {
    try {
      const d = loadEquip(f);
      const misc = d.menus['04-EQUIPAMENTO/04i-DIVERSOS']['/api/equipment/misc'].data;
      caso.equipamentos_afetados.push({
        nome: d._device.name,
        uuid: d._device.uuid,
        snapshotCrop_atual: misc.snapshotCrop.enable,
        snapshotMode_atual: misc.snapshotCrop.mode,
        correto: { enable: false, mode: 'static' }
      });
    } catch (e) {}
  }

  return caso;
}

// ─── CASO 8: Gateway/DNS Diferente ───────────────────────────────────────────
function caso8_rede() {
  const caso = {
    id: 'CASO-08',
    titulo: 'Gateway ou DNS Diferente do Padrão',
    severidade: 'INFORMATIVA',
    descricao: 'Alguns equipamentos possuem gateway diferente de 192.168.0.1 ou DNS diferente de 8.8.8.8. Pode ser intencional baseado na infraestrutura local do ponto.',
    impacto: 'Se o gateway local realmente for diferente, é CORRETO estar diferente. Só investigar se houver problemas de conectividade.',
    equipamentos_afetados: [],
    referencia: {
      equipamento: REF_NAME,
      config_correta: CORRETO.rede
    }
  };

  const afetados = ['GOEC6O046_-_Faixa_1.json', 'GOEC6O046_-_Faixa_2.json'];
  for (const f of afetados) {
    try {
      const d = loadEquip(f);
      const net = d.menus['05-SISTEMA/05b-REDE']['/api/equipment/network'].data;
      caso.equipamentos_afetados.push({
        nome: d._device.name,
        uuid: d._device.uuid,
        ip_publico: d._device.ip,
        gateway_atual: net.ethernet.ipv4Primary.gateway,
        dns_atual: net.ethernet.ipv4Primary.dns,
        padrao: { gateway: '192.168.0.1', dns: '8.8.8.8' }
      });
    } catch (e) {}
  }

  return caso;
}

// ─── Montar JSON completo ────────────────────────────────────────────────────
const estrategia = {
  _metadata: {
    titulo: 'Estratégia de Correção — ITSCAM 450 SETRANS-GO (Labor)',
    data_geracao: '2026-06-03T00:00:00Z',
    total_equipamentos: 70,
    equipamento_referencia: {
      nome: REF_NAME,
      uuid: REF._device.uuid,
      ip: REF._device.ip,
      status: '100% em conformidade, uptime estável, VARCO ativo',
      motivo_escolha: 'Zero desvios de configuração, uptime 136.9h sem instabilidade, storage normal (967MB)'
    },
    resumo_casos: {
      total_casos: 8,
      criticos: 2,
      altos: 1,
      medios: 1,
      baixos: 3,
      informativos: 1
    }
  },
  configuracao_referencia: CORRETO,
  casos: [
    caso1_varcoDesabilitado(),
    caso2_profileErrado(),
    caso3_transicoesHorario(),
    caso4_classificador(),
    caso5_transitionLevels(),
    caso6_ocrMaxPlates(),
    caso7_snapshot(),
    caso8_rede()
  ]
};

// Salvar
const outputPath = './auditoria-itscam/ESTRATEGIA-CORRECAO-DE-PARA.json';
fs.writeFileSync(outputPath, JSON.stringify(estrategia, null, 2));
console.log(`\n✅ JSON salvo: ${outputPath}`);
console.log(`\nResumo dos casos:`);
estrategia.casos.forEach(c => {
  console.log(`  ${c.id} [${c.severidade}] ${c.titulo} → ${c.equipamentos_afetados.length} equip.`);
});
