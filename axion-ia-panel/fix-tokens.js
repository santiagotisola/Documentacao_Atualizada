const fs = require('fs');
const file = require('path').join(__dirname, 'src/pages/VarcoMonitor.jsx');
const T = '4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3';
let c = fs.readFileSync(file, 'utf8');

const patterns = [
  [`{ "Content-Type": "application/json", "X-Admin-Token": "${T}" }`, 'API_HEADERS'],
  [`{"Content-Type":"application/json","X-Admin-Token":"${T}"}`, 'API_HEADERS'],
  [`{ "X-Admin-Token": "${T}" }`, 'API_HEADERS'],
];

let total = 0;
patterns.forEach(([from, to]) => {
  const n = c.split(from).length - 1;
  if (n > 0) {
    c = c.split(from).join(to);
    console.log('Replaced ' + n + 'x: ' + from.slice(0, 55));
    total += n;
  }
});

fs.writeFileSync(file, c, 'utf8');
const rem = c.split(T).length - 1;
console.log('\nTotal: ' + total + ' | Restantes: ' + rem);
