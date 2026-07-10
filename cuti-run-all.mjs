import http from 'http';

const BASE = 'http://localhost:3100';

const cycles = [
  {
    id: 'equipment-cycle',
    label: '🏗️  AxHub — Equipment Cycle (Fabricante→Tipo→Modelo→Grupo→Equip→Faixa)',
    data: {
      fabricante_slug: 'axion-all-test',
      fabricante_nome: 'AXION ALL TEST 2026',
      tipo_nome: 'RADAR FIXO',
      modelo_marca: 'VELSIS',
      modelo_nome: 'VSIS-ALL-TEST',
      modelo_portaria_num: '245/2022',
      modelo_portaria: 'PORTARIA INMETRO/DIMEL No 245/2022',
      grupo_nome: 'GRUPO ALL TEST 2026',
      equip_serie: 'SN-ALL-001',
      equip_codigo: 'AXT-ALL-001',
      equip_cert_inmetro: 'CERT-ALL-001',
      faixa_codigo: 'FX-ALL-001',
    }
  },
  {
    id: 'admin-cycle',
    label: '⚙️  AxHub — Admin Cycle (Arco + Motivo de Descarte)',
    data: {
      arco_nome: 'ARCO ALL TEST 2026',
      arco_localizacao: 'AV. TESTE AUTOMATIZADO, KM 1',
      motivo_codigo: 'MOT-ALL-001',
      motivo_descricao: 'Motivo teste automação completa 2026',
    }
  },
  {
    id: 'admin-full-cycle',
    label: '⚙️  AxHub — Admin Full (Tipo Afer, Tarja, Enquad, Região, FormaAut, Seq)',
    data: {
      tafer_codigo: 'TA-ALL-001',
      tafer_descricao: 'AFERIÇÃO PERIÓDICA ALL TEST',
      tafer_validade: '12',
      tarja_nome: 'TARJA ALL TEST 2026',
      tarja_codigo: 'TRJ-ALL-001',
      enq_codigo: '218I-ALL',
      enq_descricao: 'Excesso de velocidade ALL TEST',
      enq_velocidade: '80',
      reg_nome: 'REGIÃO ALL TEST',
      reg_uf: 'GO',
      reg_descricao: 'Região all test',
      forma_nome: 'ELETRÔNICA ALL TEST',
      forma_descricao: 'Auto eletrônico all test',
      seq_codigo: 'SEQ-ALL-001',
      seq_prefixo: 'AUT',
      seq_num_inicial: '1',
    }
  },
  {
    id: 'operacoes-cycle',
    label: '🔄  AxHub — Operações (Aferição + Operação)',
    data: {
      afer_num_inmetro: 'INMETRO-ALL-001',
      afer_num_lacre: 'LACRE-ALL-001',
      afer_num_laudo: 'LAUDO-ALL-001',
      afer_data: '01/01/2026',
      afer_data_validade: '01/01/2027',
      oper_codigo: 'OP-ALL-001',
      oper_data_inicio: '01/01/2026',
      oper_data_fim: '31/12/2026',
      oper_data_instal: '01/01/2026',
    }
  },
  {
    id: 'axcross-cycle',
    label: '📡  AxCross — Ciclo Completo (Área + Grupo + Equipamento + Veículo)',
    data: {
      area_nome: 'CRUZAMENTO ALL TEST 01',
      area_codigo: 'CRZ-ALL-001',
      area_cor: '#E74C3C',
      grupo_nome: 'GRUPO ALL TEST AXC',
      equip_codigo: 'EQ-AXC-ALL-001',
      equip_serie: 'SN-AXC-ALL-001',
      equip_codext: 'EXT-ALL-001',
      equip_lat: '-16.6869',
      equip_lng: '-49.2648',
      faixa_codigo: 'FX-AXC-ALL-001',
      faixa_numero: '1',
      faixa_logradouro: 'AV. GOIAS',
      faixa_complemento: 'FAIXA DIREITA',
      faixa_num_end: 'S/N',
      faixa_bairro: 'CENTRO',
      faixa_cidade: 'GOIANIA',
      faixa_estado: 'GO',
      veiculo_placa: 'ALL0A01',
      veiculo_validade: '2026-12-31',
    }
  },
];

function runCycle(cycle) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ data: cycle.data });
    const opts = {
      host: 'localhost', port: 3100,
      path: `/api/manual-scripts/execute/${cycle.id}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };

    const steps = [];
    let eventType = null;
    let buf = '';

    const req = http.request(opts, (res) => {
      res.on('data', chunk => {
        buf += chunk.toString();
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (line.startsWith('event: ')) { eventType = line.slice(7).trim(); }
          else if (line.startsWith('data: ')) {
            try {
              const p = JSON.parse(line.slice(6));
              if (eventType === 'progress') {
                const icon = p.status === 'success' ? '✅' : p.status === 'error' ? '❌' : '⏳';
                process.stdout.write(`    ${icon} [${String(p.step).padStart(2)}/${p.total}] ${p.label}: ${p.message}\n`);
                steps.push(p);
              }
            } catch {}
            eventType = null;
          }
        }
      });
      res.on('end', () => {
        const ok  = steps.filter(s => s.status === 'success').length;
        const err = steps.filter(s => s.status === 'error').length;
        resolve({ id: cycle.id, label: cycle.label, ok, err, total: steps.length });
      });
    });
    req.on('error', e => resolve({ id: cycle.id, label: cycle.label, ok: 0, err: 1, total: 1, error: e.message }));
    req.setTimeout(360000);
    req.write(body);
    req.end();
  });
}

const SEP = '═'.repeat(62);
console.log(`\n${SEP}`);
console.log('  CUTI — EXECUÇÃO COMPLETA DE TODOS OS CICLOS');
console.log(`${SEP}\n`);

const summary = [];
for (const cycle of cycles) {
  const t0 = Date.now();
  console.log(`\n▶ ${cycle.label}`);
  console.log('─'.repeat(62));
  const r = await runCycle(cycle);
  r.duration = `${((Date.now() - t0) / 1000).toFixed(1)}s`;
  summary.push(r);
  const badge = r.err === 0 ? '✅ SUCESSO' : r.ok > 0 ? '⚠️  PARCIAL' : '❌ FALHOU';
  console.log(`\n  ${badge}  —  ${r.ok}/${r.total} passos OK  |  ${r.duration}\n`);
  // Aguarda servidor estabilizar entre ciclos
  await new Promise(r => setTimeout(r, 5000));
}

console.log(`\n${SEP}`);
console.log('  RESUMO FINAL');
console.log(SEP);
for (const r of summary) {
  const icon = r.err === 0 ? '✅' : r.ok > 0 ? '⚠️ ' : '❌';
  const bar  = '█'.repeat(r.ok) + '░'.repeat(r.err);
  console.log(`${icon} ${r.label.slice(5)}`);
  console.log(`   ${bar}  ${r.ok}/${r.total} OK  |  ${r.duration}`);
}
console.log(`${SEP}\n`);
