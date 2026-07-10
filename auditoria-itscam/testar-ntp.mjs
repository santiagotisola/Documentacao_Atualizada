const base = 'https://d0595c80-9ea7-49af-b2a0-d305d688e567-80.tunnel.varco.cloud';
const auth = await fetch(base + '/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ params: { username: 'admin', password: '#econocr@' } })
}).then(r => r.json());
const tok = auth.token;

const current = await fetch(base + '/api/equipment/dateAndTime', {
  headers: { Authorization: 'Bearer ' + tok }
}).then(r => r.json());
console.log('CURRENT:', JSON.stringify(current));

const payloads = [
  { ntpServerAddress: ['time.google.com'] },
  { useNTPServer: true, ntpServerAddress: ['time.google.com'] },
  { timezone: current.timezone, useNTPServer: true, ntpServerAddress: ['time.google.com'], serveNtp: false },
];
for (const p of payloads) {
  const r = await fetch(base + '/api/equipment/dateAndTime', {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
    body: JSON.stringify(p)
  });
  const txt = await r.text();
  console.log(`${JSON.stringify(p)} -> ${r.status} ${txt.slice(0, 120)}`);
}
