/**
 * AxHub Data Sender — content.js
 * Roda automaticamente em qualquer página *.axhub.axion.ws
 * Envia os equipamentos para o Axion IA painel (localhost:3100)
 */
(function () {
  // Só processa páginas de operação (lista de equipamentos)
  const path = location.pathname.toLowerCase();
  if (!path.startsWith('/operacao') && path !== '/') return;

  // Evita envio duplicado na mesma aba
  if (window.__axhubSenderRan) return;
  window.__axhubSenderRan = true;

  const API = 'http://localhost:3100/api/depara-equipamentos/receive-hub-data';
  const url = location.origin;
  const key = location.hostname;

  // Aguarda a página carregar completamente (Kendo Grid)
  setTimeout(function enviar() {
    fetch('/operacao/datahandler?pageSize=500&page=1&skip=0&take=500', {
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' — sem sessão?');
        return r.json();
      })
      .then(function (data) {
        var eq = (data.Data || []).map(function (e) {
          return {
            codigo: (e.Equipamento && e.Equipamento.Descricao) || e.CodigoEquipamento || '',
            grupo: e.GrupoEquipamento || '',
            fabricante: e.FabricanteNome || ''
          };
        }).filter(function (e) { return e.codigo; });

        if (!eq.length) {
          console.log('[AxHub Sender] Nenhum equipamento — página sem dados ou não autenticado');
          return;
        }

        return fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url, key: key, equipamentos: eq })
        });
      })
      .then(function (r) { return r && r.json(); })
      .then(function (r) {
        if (r && r.total) {
          console.log('[AxHub Sender] ✅ ' + r.total + ' equipamentos de ' + key + ' enviados ao Axion IA!');
          // Mostra badge visual discreto na página
          var badge = document.createElement('div');
          badge.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:99999;background:#15803d;color:#fff;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.25);';
          badge.textContent = '✅ ' + r.total + ' equip. enviados ao Axion IA';
          document.body.appendChild(badge);
          setTimeout(function () { badge.remove(); }, 4000);
        }
      })
      .catch(function (e) {
        console.log('[AxHub Sender] Erro ao enviar:', e.message);
      });
  }, 2500); // aguarda 2.5s para o Kendo Grid carregar
})();
