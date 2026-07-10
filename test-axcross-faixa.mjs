import http from 'http';

const body = JSON.stringify({
  data: {
    area_nome:   'CRUZAMENTO ALL TEST 01',
    area_codigo: 'CRZ-ALL-001',
    area_cor:    '#E74C3C',
    grupo_nome:  'GRUPO ALL TEST AXC',
    equip_codigo: 'EQ-AXC-ALL-001',
    equip_serie:  'SN-AXC-ALL-001',
    equip_codext: 'EXT-ALL-001',
    equip_lat:    '-16.6869',
    equip_lng:    '-49.2648',
    faixa_codigo:     'FX-AXC-ALL-001',
    faixa_numero:     '1',
    faixa_logradouro: 'AV. GOIAS',
    faixa_complemento:'FAIXA DIREITA',
    faixa_num_end:    'S/N',
    faixa_bairro:     'CENTRO',
    faixa_cidade:     'GOIANIA',
    faixa_estado:     'GO',
    veiculo_placa:    'ALL0A01',
    veiculo_validade: '2026-12-31',
  }
});

const opts = {
  host: 'localhost', port: 3100,
  path: '/api/manual-scripts/execute/axcross-cycle',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
};

let buf = '';
let eventType = null;
const req = http.request(opts, (res) => {
  console.log('STATUS:', res.statusCode);
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
            console.log(`  ${icon} [${p.step}/${p.total}] ${p.label}: ${p.message}`);
          }
        } catch {}
        eventType = null;
      }
    }
  });
  res.on('end', () => { console.log('\n=== FIM ==='); });
});
req.setTimeout(300000);
req.on('error', e => console.error('ERRO:', e.message));
req.write(body);
req.end();
console.log('Aguardando ciclo AxCross com Faixa...\n');
