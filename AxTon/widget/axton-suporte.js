/**
 * AxionIA Widget v5.0 — Motor Inteligente + Inferência Semântica
 * Assistente inteligente embeddavel para sistemas AxTon
 * Axion Tecnologia - 2026
 *
 * v5.0: Expansão semântica, fuzzy matching, contexto de conversa,
 *       classificação avançada, never-fail 3-layer fallback,
 *       respostas profissionais estruturadas
 *
 * Uso: <script src="https://axion-tecnologia.github.io/AxTon.Docs/widget/axton-suporte.js"></script>
 */
(function () {
  'use strict';

  function initAxionIA() {
    var WIDGET_ID = 'axionia-widget';
    var kbData = null;

    if (document.getElementById(WIDGET_ID)) return;

    // --- CSS ---
    var css = document.createElement('style');
    css.textContent = [
      '#axionia-widget, #axionia-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Segoe UI", system-ui, -apple-system, sans-serif; }',
      '#axionia-fab { position: fixed; bottom: 24px; right: 24px; height: 48px; border-radius: 24px; background: linear-gradient(135deg, #1abc9c 0%, #1a3c34 100%); color: #fff; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(26,188,156,0.4); z-index: 99999; display: flex; align-items: center; gap: 8px; padding: 0 18px 0 14px; transition: transform 0.2s, box-shadow 0.2s; }',
      '#axionia-fab:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(26,188,156,0.55); }',
      '#axionia-fab svg { width: 22px; height: 22px; fill: #fff; flex-shrink: 0; }',
      '#axionia-fab em { font-style: normal; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; }',
      '#axionia-panel { position: fixed; bottom: 84px; right: 24px; width: 420px; height: 600px; background: #f8f9fb; border-radius: 16px; box-shadow: 0 12px 48px rgba(0,0,0,0.18); z-index: 99999; display: none; flex-direction: column; overflow: hidden; }',
      '#axionia-panel.open { display: flex; }',
      '#axionia-hdr { background: linear-gradient(135deg, #1a3c34 0%, #2c6e5f 100%); color: #fff; padding: 14px 20px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }',
      '#axionia-hdr .av { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '#axionia-hdr .av svg { width: 18px; height: 18px; fill: #fff; }',
      '#axionia-hdr .nfo { flex: 1; }',
      '#axionia-hdr .nfo h3 { font-size: 15px; font-weight: 700; letter-spacing: 0.3px; }',
      '#axionia-hdr .nfo small { font-size: 11px; color: rgba(255,255,255,0.55); }',
      '#axionia-x { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 22px; line-height: 1; padding: 4px 2px; }',
      '#axionia-x:hover { color: #fff; }',
      '#axionia-chat { flex: 1; overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 12px; }',
      '#axionia-chat::-webkit-scrollbar { width: 5px; }',
      '#axionia-chat::-webkit-scrollbar-thumb { background: #d5dbdb; border-radius: 3px; }',
      '.ax-m { max-width: 96%; animation: axFade 0.3s ease; }',
      '.ax-m.b { align-self: flex-start; }',
      '.ax-m.u { align-self: flex-end; }',
      '.ax-b { padding: 10px 13px; border-radius: 14px; font-size: 13px; line-height: 1.55; word-wrap: break-word; overflow-wrap: break-word; }',
      '.ax-m.b .ax-b { background: #fff; color: #1a3c34; border: 1px solid #e8ecf0; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }',
      '.ax-m.u .ax-b { background: linear-gradient(135deg, #1abc9c, #16a085); color: #fff; border-bottom-right-radius: 4px; }',
      '.ax-b a { color: #1abc9c; text-decoration: none; }',
      '.ax-b a:hover { text-decoration: underline; }',
      '.ax-sug { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; animation: axFade 0.3s ease; }',
      '.ax-sug button { background: #fff; border: 1px solid #e0e5ea; padding: 7px 13px; border-radius: 18px; font-size: 12px; color: #1a3c34; cursor: pointer; transition: all 0.15s; }',
      '.ax-sug button:hover { background: #1abc9c; color: #fff; border-color: #1abc9c; }',
      '.ax-card { background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; padding: 11px 14px; margin-top: 6px; cursor: pointer; transition: all 0.15s; animation: axFade 0.25s ease; }',
      '.ax-card:hover { border-color: #1abc9c; box-shadow: 0 2px 8px rgba(26,188,156,0.12); transform: translateY(-1px); }',
      '.ax-card .cm { font-size: 10px; color: #1abc9c; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }',
      '.ax-card .ct { font-size: 13px; color: #1a3c34; font-weight: 600; margin-top: 2px; }',
      '.ax-card .cp { font-size: 11px; color: #95a5a6; margin-top: 3px; }',
      '.ax-steps { list-style: none; counter-reset: as; margin-top: 8px; padding: 0 0 0 4px; }',
      '.ax-steps li { counter-increment: as; padding: 7px 4px 7px 28px; position: relative; font-size: 12px; color: #1a3c34; line-height: 1.55; border-left: 2px solid #d5f5e3; margin-left: 10px; margin-bottom: 2px; }',
      '.ax-steps li::before { content: counter(as); position: absolute; left: -12px; top: 6px; width: 20px; height: 20px; border-radius: 50%; background: #1abc9c; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }',
      '.ax-steps li:last-child { border-left-color: transparent; }',
      '.ax-section { background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; padding: 11px 12px; margin-top: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }',
      '.ax-section-title { font-size: 10.5px; font-weight: 700; color: #1abc9c; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }',
      '.ax-path-item { display: flex; align-items: flex-start; gap: 5px; font-size: 11.5px; color: #5a6c7d; padding: 3px 0; word-break: break-word; }',
      '.ax-path-icon { flex-shrink: 0; font-size: 11px; }',
      '.ax-doc-btn { display: inline-flex; align-items: center; gap: 5px; background: #e8f8f5; border: 1px solid #a3e4d7; padding: 5px 12px; border-radius: 18px; font-size: 11px; color: #16a085; text-decoration: none; font-weight: 600; transition: all 0.15s; margin-top: 8px; }',
      '.ax-doc-btn:hover { background: #d1f2eb; border-color: #76d7c4; }',
      '.ax-comp-card { background: #f0faf7; border: 1px solid #a3e4d7; border-radius: 10px; padding: 10px 12px; margin-top: 8px; margin-bottom: 4px; }',
      '.ax-comp-title { font-size: 11.5px; font-weight: 700; color: #16a085; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }',
      '.ax-comp-text { font-size: 11.5px; color: #4a5568; line-height: 1.55; }',
      '.ax-db-ref { font-size: 10px; color: #a0aec0; margin-top: 6px; padding-top: 6px; border-top: 1px solid #f0f3f6; }',
      '.ax-db-ref code { font-size: 10px; background: #f0f4f8; padding: 1px 5px; border-radius: 3px; font-family: "Cascadia Code","Consolas",monospace; }',
      '.ax-related-grid { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }',
      '.ax-related-item { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #f8f9fb; border: 1px solid #e8ecf0; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-size: 12px; color: #1a3c34; }',
      '.ax-related-item:hover { background: #e8f8f5; border-color: #a3e4d7; color: #16a085; }',
      '.ax-related-icon { font-size: 10px; color: #95a5a6; flex-shrink: 0; }',
      '.ax-divider { height: 1px; background: #e8ecf0; margin: 4px 0; }',
      '.ax-comp-steps { list-style: none; counter-reset: cs; margin-top: 6px; padding: 0 0 0 2px; }',
      '.ax-comp-steps li { counter-increment: cs; padding: 4px 4px 4px 24px; position: relative; font-size: 11px; color: #4a5568; line-height: 1.5; margin-bottom: 1px; }',
      '.ax-comp-steps li::before { content: counter(cs); position: absolute; left: 2px; top: 4px; width: 16px; height: 16px; border-radius: 50%; background: #d5f5e3; color: #16a085; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; }',
      '.ax-typing { display: inline-flex; gap: 4px; padding: 2px 0; align-items: center; }',
      '.ax-typing i { display: block; width: 7px; height: 7px; border-radius: 50%; background: #95a5a6; animation: axDot 1.2s infinite; font-style: normal; }',
      '.ax-typing i:nth-child(2) { animation-delay: 0.2s; }',
      '.ax-typing i:nth-child(3) { animation-delay: 0.4s; }',
      '#axionia-bar { padding: 10px 14px; border-top: 1px solid #e8ecf0; background: #fff; display: flex; gap: 8px; align-items: center; flex-shrink: 0; }',
      '#axionia-q { flex: 1; padding: 10px 16px; border: 1px solid #d5dbdb; border-radius: 24px; font-size: 13.5px; outline: none; transition: border-color 0.2s; background: #f8f9fb; }',
      '#axionia-q:focus { border-color: #1abc9c; background: #fff; }',
      '#axionia-q::placeholder { color: #aab; }',
      '#axionia-go { width: 36px; height: 36px; border-radius: 50%; background: #1abc9c; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }',
      '#axionia-go:hover { background: #16a085; }',
      '#axionia-go svg { width: 16px; height: 16px; fill: #fff; }',
      '#axionia-ft { padding: 6px 16px 10px; text-align: center; background: #fff; flex-shrink: 0; }',
      '#axionia-ft a { font-size: 11px; color: #95a5a6; text-decoration: none; }',
      '#axionia-ft a:hover { color: #1abc9c; }',
      '.ax-hd-form { background: #fff; border: 1px solid #a3e4d7; border-radius: 12px; padding: 14px; margin-top: 6px; animation: axFade 0.3s ease; }',
      '.ax-hd-form label { display: block; font-size: 11px; font-weight: 700; color: #2c3e50; margin-bottom: 3px; margin-top: 10px; }',
      '.ax-hd-form label:first-child { margin-top: 0; }',
      '.ax-hd-form input, .ax-hd-form textarea { width: 100%; padding: 8px 10px; border: 1px solid #d5dbdb; border-radius: 8px; font-size: 12.5px; font-family: inherit; outline: none; transition: border-color 0.2s; box-sizing: border-box; background: #f8f9fb; }',
      '.ax-hd-form input:focus, .ax-hd-form textarea:focus { border-color: #1abc9c; background: #fff; }',
      '.ax-hd-form textarea { resize: vertical; min-height: 60px; }',
      '.ax-hd-submit { width: 100%; margin-top: 12px; padding: 9px; border: none; border-radius: 8px; background: linear-gradient(135deg, #27ae60, #229954); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }',
      '.ax-hd-submit:hover { opacity: 0.9; }',
      '.ax-hd-submit:disabled { opacity: 0.5; cursor: not-allowed; }',
      '.ax-hd-error { color: #e74c3c; font-size: 11px; margin-top: 6px; }',
      '.ax-hd-success { background: #eafaf1; border: 1px solid #a9dfbf; border-radius: 10px; padding: 12px; margin-top: 6px; animation: axFade 0.3s ease; }',
      '.ax-hd-success strong { color: #27ae60; }',
      '@keyframes axFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }',
      '@keyframes axDot { 0%,60%,100% { transform: translateY(0); opacity: 0.35; } 30% { transform: translateY(-4px); opacity: 1; } }',
      '@media (max-width: 480px) { #axionia-panel { width: calc(100vw - 16px); right: 8px; bottom: 80px; height: 80vh; } }'
    ].join('\n');
    document.head.appendChild(css);

    // --- SVG do robo ---
    var ICON = '<svg viewBox="0 0 24 24"><path d="M21.928 11.607c-.202-.488-.635-.605-.928-.633V8c0-1.103-.897-2-2-2h-6V4.61c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5c-1.103 0-2 .897-2 2v2.997l-.082.006A1 1 0 0 0 1.99 12.2l.012.166c.003.823.084 1.96.514 2.757.19.353.454.613.784.756.22.095.46.137.712.137l.001-.001V18c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-2.568l.023-.006c.022-.006.045-.01.066-.017.418-.157.73-.459.924-.862.378-.785.44-1.86.44-2.56V12a1 1 0 0 0-.738-.393zM5 18V8h14l.002 10H5z"/><circle cx="9" cy="13" r="1.25"/><circle cx="15" cy="13" r="1.25"/></svg>';

    // --- HTML ---
    var el = document.createElement('div');
    el.id = WIDGET_ID;
    el.innerHTML =
      '<button id="axionia-fab" aria-label="AxionIA">' + ICON + '<em>AxionIA</em></button>' +
      '<div id="axionia-panel">' +
        '<div id="axionia-hdr">' +
          '<div class="av">' + ICON + '</div>' +
          '<div class="nfo"><h3>AxionIA</h3><small>Assistente Inteligente AxTon</small></div>' +
          '<button id="axionia-x">&times;</button>' +
        '</div>' +
        '<div id="axionia-chat"></div>' +
        '<div id="axionia-bar">' +
          '<input id="axionia-q" type="text" placeholder="Pergunte algo..." autocomplete="off" />' +
          '<button id="axionia-go"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
        '</div>' +
        '<div id="axionia-ft"><a href="#" id="axionia-hd-link">\u2709 Abrir chamado no Help Desk</a></div>' +
      '</div>';
    document.body.appendChild(el);

    var fab   = el.querySelector('#axionia-fab');
    var panel = el.querySelector('#axionia-panel');
    var chat  = el.querySelector('#axionia-chat');
    var qbox  = el.querySelector('#axionia-q');
    var goBtn = el.querySelector('#axionia-go');
    var hdLink = el.querySelector('#axionia-hd-link');
    var greeted = false;
    var apiUrl = '';

    fab.addEventListener('click', function () {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) {
        qbox.focus();
        if (!kbData) loadKB();
        if (!greeted) { greeted = true; greet(); }
      }
    });
    el.querySelector('#axionia-x').addEventListener('click', function () {
      panel.classList.remove('open');
    });
    hdLink.addEventListener('click', function (e) {
      e.preventDefault();
      if (!panel.classList.contains('open')) panel.classList.add('open');
      showHelpdeskForm();
    });

    // --- Detectar URLs ---
    var scriptBase = '';
    try {
      var ss = document.getElementsByTagName('script');
      for (var i = ss.length - 1; i >= 0; i--) {
        if (ss[i].src && ss[i].src.indexOf('axton-suporte') !== -1) {
          scriptBase = ss[i].src.replace(/\/[^\/]*$/, '/');
          apiUrl = ss[i].getAttribute('data-api') || '';
          break;
        }
      }
    } catch (e) {}
    if (!apiUrl && window.AXIONIA_API_URL) apiUrl = window.AXIONIA_API_URL;

    var pageBase = '/';
    try {
      var pm = window.location.pathname.match(/^(\/[^\/]+\.Docs\/)/);
      if (pm) pageBase = pm[1];
    } catch (e) {}

    // --- Carregar KB ---
    function loadKB() {
      var urls = [];
      if (scriptBase) urls.push(scriptBase + 'knowledge-base.json');
      if (pageBase !== '/') urls.push(pageBase + 'widget/knowledge-base.json');
      urls.push('/widget/knowledge-base.json');
      urls.push(window.location.origin + '/AxTon.Docs/widget/knowledge-base.json');
      urls.push('https://axion-tecnologia.github.io/AxTon.Docs/widget/knowledge-base.json');
      tryUrl(urls, 0);
    }

    function tryUrl(urls, i) {
      if (i >= urls.length) {
        bot('Desculpe, n\u00e3o consegui carregar minha base de conhecimento. Clique em <strong>Abrir chamado</strong> no rodap\u00e9 para contatar o suporte.');
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.open('GET', urls[i], true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try { kbData = JSON.parse(xhr.responseText); } catch (e) { tryUrl(urls, i + 1); }
        } else { tryUrl(urls, i + 1); }
      };
      xhr.onerror = function () { tryUrl(urls, i + 1); };
      xhr.send();
    }

    // --- Mensagens ---
    function bot(html) {
      var d = document.createElement('div');
      d.className = 'ax-m b';
      d.innerHTML = '<div class="ax-b">' + html + '</div>';
      chat.appendChild(d);
      scroll();
    }

    function user(text) {
      var d = document.createElement('div');
      d.className = 'ax-m u';
      d.innerHTML = '<div class="ax-b">' + esc(text) + '</div>';
      chat.appendChild(d);
      scroll();
    }

    function typing() {
      var d = document.createElement('div');
      d.className = 'ax-m b';
      d.id = 'ax-tp';
      d.innerHTML = '<div class="ax-b"><div class="ax-typing"><i></i><i></i><i></i></div></div>';
      chat.appendChild(d);
      scroll();
    }

    function untype() {
      var t = chat.querySelector('#ax-tp');
      if (t) t.remove();
    }

    function suggest(items) {
      var d = document.createElement('div');
      d.className = 'ax-sug';
      items.forEach(function (t) {
        var b = document.createElement('button');
        b.textContent = t;
        b.addEventListener('click', function () { ask(t); });
        d.appendChild(b);
      });
      chat.appendChild(d);
      scroll();
    }

    function scroll() { setTimeout(function () { chat.scrollTop = chat.scrollHeight; }, 60); }
    function wait(ms, fn) { setTimeout(fn, ms); }
    function rand(n) { return Math.floor(Math.random() * n); }
    function esc(s) { return s.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    // --- Saudacao ---
    function greet() {
      bot('Ol\u00e1! Sou a <strong>AxionIA</strong>, assistente inteligente do AxTon.');
      wait(600, function () {
        bot('Me diga o que voc\u00ea precisa e eu monto uma orienta\u00e7\u00e3o completa para voc\u00ea.');
        suggest([
          'Como fazer triagem',
          'Ticket de pesagem',
          'Equipamento offline',
          'Exportar infra\u00e7\u00f5es',
          'Relat\u00f3rio de passagens',
          'Criar usu\u00e1rio'
        ]);
      });
    }

    // --- Helpdesk inline ---
    var lastUserQueries = [];

    function isHelpdeskIntent(query) {
      var n = normalize(query);
      return /\b(chamado|ticket|helpdesk|help desk|abrir chamado|criar chamado|suporte tecnico|quero suporte|preciso de suporte|atendimento)\b/.test(n);
    }

    function showHelpdeskForm(prefill) {
      var assuntoPrefill = prefill || (lastUserQueries.length > 0 ? lastUserQueries[lastUserQueries.length - 1] : '');
      bot('\ud83c\udfab Vou te ajudar a abrir um chamado no <strong>Help Desk</strong>! Preencha seus dados abaixo:');
      wait(400, function () {
        var formHtml = '<div class="ax-hd-form" id="ax-hd-form">' +
          '<label>Login <small>(e-mail do Help Desk)</small></label>' +
          '<input type="text" id="ax-hd-email" placeholder="seu.email@empresa.com" autocomplete="email" />' +
          '<label>Senha</label>' +
          '<input type="password" id="ax-hd-pass" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autocomplete="current-password" />' +
          '<label>Assunto</label>' +
          '<input type="text" id="ax-hd-subject" placeholder="Descreva brevemente o problema" value="' + esc(assuntoPrefill) + '" />' +
          '<label>Descri\u00e7\u00e3o</label>' +
          '<textarea id="ax-hd-body" placeholder="Detalhe o problema ou d\u00favida..."></textarea>' +
          '<div id="ax-hd-msg"></div>' +
          '<button class="ax-hd-submit" id="ax-hd-btn">\u2709 Enviar Chamado</button>' +
        '</div>';
        var fDiv = document.createElement('div');
        fDiv.className = 'ax-m b';
        fDiv.innerHTML = '<div class="ax-b">' + formHtml + '</div>';
        chat.appendChild(fDiv);
        scroll();

        var btnSubmit = fDiv.querySelector('#ax-hd-btn');
        btnSubmit.addEventListener('click', function () { submitHelpdesk(fDiv); });

        var fields = fDiv.querySelectorAll('input, textarea');
        fields.forEach(function (f) {
          f.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && f.tagName !== 'TEXTAREA') { submitHelpdesk(fDiv); }
          });
        });

        var emailField = fDiv.querySelector('#ax-hd-email');
        if (emailField) emailField.focus();
      });
    }

    function submitHelpdesk(formContainer) {
      var emailEl = formContainer.querySelector('#ax-hd-email');
      var passEl = formContainer.querySelector('#ax-hd-pass');
      var subjectEl = formContainer.querySelector('#ax-hd-subject');
      var bodyEl = formContainer.querySelector('#ax-hd-body');
      var msgEl = formContainer.querySelector('#ax-hd-msg');
      var btnEl = formContainer.querySelector('#ax-hd-btn');

      var email = emailEl ? emailEl.value.trim() : '';
      var pass = passEl ? passEl.value : '';
      var subject = subjectEl ? subjectEl.value.trim() : '';
      var body = bodyEl ? bodyEl.value.trim() : '';

      if (!email || !pass) { msgEl.innerHTML = '<div class="ax-hd-error">Preencha login e senha.</div>'; return; }
      if (!subject) { msgEl.innerHTML = '<div class="ax-hd-error">Preencha o assunto.</div>'; return; }
      if (!body) { msgEl.innerHTML = '<div class="ax-hd-error">Descreva o problema.</div>'; return; }

      if (!apiUrl) {
        msgEl.innerHTML = '<div class="ax-hd-error">API n\u00e3o configurada. Adicione data-api no script ou defina window.AXIONIA_API_URL.</div>';
        return;
      }

      btnEl.disabled = true;
      btnEl.textContent = 'Enviando...';
      msgEl.innerHTML = '';

      var xhr = new XMLHttpRequest();
      xhr.open('POST', apiUrl + '/helpdesk/criar', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            var resp = JSON.parse(xhr.responseText);
            formContainer.querySelector('.ax-hd-form').style.display = 'none';
            bot('<div class="ax-hd-success">\u2705 <strong>Chamado criado com sucesso!</strong><br>N\u00famero: <strong>#' + esc(resp.ticketId) + '</strong><br>Acompanhe pelo Help Desk.</div>');
          } catch (e) {
            msgEl.innerHTML = '<div class="ax-hd-error">Resposta inesperada do servidor.</div>';
            btnEl.disabled = false; btnEl.textContent = '\u2709 Enviar Chamado';
          }
        } else if (xhr.status === 401) {
          msgEl.innerHTML = '<div class="ax-hd-error">\u274c Login ou senha inv\u00e1lidos. Verifique suas credenciais do Help Desk.</div>';
          btnEl.disabled = false; btnEl.textContent = '\u2709 Enviar Chamado';
        } else {
          var errMsg = 'Erro ao criar chamado.';
          try { errMsg = JSON.parse(xhr.responseText).erro || errMsg; } catch (e) {}
          msgEl.innerHTML = '<div class="ax-hd-error">' + esc(errMsg) + '</div>';
          btnEl.disabled = false; btnEl.textContent = '\u2709 Enviar Chamado';
        }
        passEl.value = '';
      };
      xhr.onerror = function () {
        msgEl.innerHTML = '<div class="ax-hd-error">Erro de conex\u00e3o com o servidor. Verifique se a API est\u00e1 online.</div>';
        btnEl.disabled = false; btnEl.textContent = '\u2709 Enviar Chamado';
        passEl.value = '';
      };
      xhr.send(JSON.stringify({ email: email, senha: pass, assunto: subject, descricao: body }));
    }

    // --- Motor Inteligente v5.0 ---
    function normalize(s) {
      return s.toLowerCase()
        .replace(/[\u00e1\u00e0\u00e3\u00e2\u00e4]/g,'a').replace(/[\u00e9\u00e8\u00ea\u00eb]/g,'e')
        .replace(/[\u00ed\u00ec\u00ee\u00ef]/g,'i').replace(/[\u00f3\u00f2\u00f5\u00f4\u00f6]/g,'o')
        .replace(/[\u00fa\u00f9\u00fb\u00fc]/g,'u').replace(/[\u00e7]/g,'c').replace(/[\u00f1]/g,'n');
    }

    var STOPWORDS = ['sobre','informacao','informacoes','sistema','dados','como','fazer','qual','quais','pode','posso','onde','tem','tela','menu','preciso','quero','gostaria','favor','por','para','que','com','uma','este','voce','ajuda','me','isso','esse','essa','nos','meu','minha','do','da','de','no','na','os','as','um','em','ao','se','ou','mais','muito','bem','sim','nao','ola','bom','dia','boa','tarde','noite','obrigado','obrigada','la','aqui','ali','entao','apenas','tambem','ainda','ja','agora','so','todo','toda','todos','todas'];

    var SYSTEM_NAME = 'AxTon';
    var SYSTEM_DESC = 'pesagem veicular';
    var SYSTEM_WORDS = ['axton', 'ax ton', 'axion ton', 'sistema', 'plataforma'];
    var OTHER_SYSTEMS = ['axhub', 'ax hub', 'axion hub'];

    // --- CONTEXTO DE CONVERSA ---
    var lastContext = { module: null, topic: null, entryId: null };

    // --- MAPA SEMÂNTICO: sinônimos → termos que existem no KB ---
    var SEMANTIC_MAP = {
      // Erros e problemas
      'nao funciona':   ['erro','falha','problema'],
      'quebrou':        ['erro','falha','parou'],
      'travou':         ['erro','falha','parou'],
      'parou':          ['erro','falha','offline'],
      'bugou':          ['erro','falha','bug'],
      'deu pau':        ['erro','falha'],
      'nao abre':       ['erro','falha','acesso'],
      'nao salva':      ['erro','falha','salvar'],
      'nao aparece':    ['erro','falha','exibir'],
      'nao carrega':    ['erro','falha','carregar'],
      'sumiu':          ['erro','falha','desapareceu'],
      'nao conecta':    ['erro','falha','conexao','camera'],
      // Câmera
      'camera':         ['camera','ip','configurar','stream','rtsp'],
      'cam':            ['camera','ip'],
      'video':          ['camera','stream','imagem'],
      'imagem':         ['camera','processamento','imagem'],
      'stream':         ['camera','rtsp','video','h264','h265'],
      'rtsp':           ['camera','stream','porta','554'],
      'h265':           ['camera','codec','h264','stream'],
      'h264':           ['camera','codec','stream'],
      'onvif':          ['camera','protocolo','configurar'],
      'uniview':        ['camera','unv','configurar'],
      'unv':            ['camera','uniview','configurar'],
      'intelbras':      ['camera','vip','configurar'],
      'suitable track': ['camera','erro','falha','stream','codec'],
      'track not found':['camera','erro','falha','stream','codec'],
      // Pesagem
      'balanca':        ['pesagem','equipamento','posto','balanca'],
      'pesar':          ['pesagem','ticket','peso'],
      'pesou':          ['pesagem','ticket','peso'],
      'peso':           ['pesagem','ticket','excesso','pbt'],
      'excesso':        ['pesagem','excesso','peso','infracao'],
      'sobrepeso':      ['pesagem','excesso','peso','pbt'],
      'tara':           ['pesagem','peso','veiculo'],
      // Infrações
      'multa':          ['infracao','auto','penalidade'],
      'auto':           ['infracao','auto','registro'],
      'notificacao':    ['infracao','notificacao','exportacao'],
      'penalidade':     ['infracao','multa'],
      'autuacao':       ['infracao','auto','registro'],
      'triar':          ['triagem','infracao','validar'],
      'validar':        ['triagem','auditoria','infracao'],
      'descartar':      ['infracao','descartada','triagem'],
      'exportar':       ['exportacao','lote','infracao'],
      // Veículos
      'carro':          ['veiculo','tipo','placa'],
      'caminhao':       ['veiculo','tipo','pesagem','placa'],
      'placa':          ['veiculo','placa','consulta'],
      'cavalo':         ['veiculo','cavalo mecanico'],
      'reboque':        ['veiculo','reboque','semi'],
      // Documentos
      'nfe':            ['nota fiscal','nfe','xml'],
      'nota fiscal':    ['nfe','nota fiscal','danfe'],
      'mdfe':           ['mdfe','manifesto','transporte'],
      'xml':            ['nfe','exportacao','xml'],
      // Relatórios
      'dashboard':      ['dashboard','painel','indicador'],
      'grafico':        ['relatorio','dashboard','indicador'],
      'bi':             ['power bi','relatorio','indicador'],
      'planilha':       ['relatorio','exportar','dados'],
      'pdf':            ['relatorio','gerar','imprimir'],
      // Operacional
      'turno':          ['operacao','turno','periodo'],
      'faixa':          ['operacao','faixa','pista'],
      'pista':          ['operacao','faixa','local'],
      'local':          ['local','posto','cadastro'],
      'posto':          ['posto','pesagem','local'],
      // Acesso
      'login':          ['login','acesso','usuario','senha'],
      'senha':          ['login','senha','usuario','acesso'],
      'bloqueado':      ['acesso','restricao','ip','permissao'],
      'permissao':      ['permissao','perfil','acesso'],
      'perfil':         ['perfil','acesso','usuario']
    };

    // --- FUZZY MATCHING: tolerar erros de digitação ---
    function levenshtein(a, b) {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      var matrix = [];
      for (var i = 0; i <= b.length; i++) matrix[i] = [i];
      for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    // Encontrar a keyword do KB mais próxima de uma palavra digitada
    function fuzzyMatchKeyword(word) {
      if (word.length < 3) return null;
      var allKeywords = [];
      if (kbData) {
        kbData.entries.forEach(function(e) {
          e.keywords.forEach(function(k) {
            var nk = normalize(k);
            nk.split(/\s+/).forEach(function(part) {
              if (part.length >= 3 && allKeywords.indexOf(part) === -1) allKeywords.push(part);
            });
          });
        });
      }
      // Adicionar termos do mapa semântico
      Object.keys(SEMANTIC_MAP).forEach(function(k) {
        var nk = normalize(k);
        if (nk.length >= 3 && allKeywords.indexOf(nk) === -1) allKeywords.push(nk);
      });

      var best = null, bestDist = 999;
      for (var i = 0; i < allKeywords.length; i++) {
        var dist = levenshtein(word, allKeywords[i]);
        var maxDist = word.length <= 4 ? 1 : 2; // palavras curtas: max 1 erro, longas: max 2
        if (dist <= maxDist && dist < bestDist) {
          bestDist = dist;
          best = allKeywords[i];
        }
      }
      return best;
    }

    // --- EXPANSÃO SEMÂNTICA: expandir palavras do usuário em termos do KB ---
    function expandQuery(words) {
      var expanded = [];
      var seen = {};
      words.forEach(function(w) {
        if (!seen[w]) { expanded.push(w); seen[w] = true; }
        // Buscar no mapa semântico (chaves com 1 ou 2 palavras)
        Object.keys(SEMANTIC_MAP).forEach(function(key) {
          var nk = normalize(key);
          if (nk === w || nk.indexOf(w) !== -1 || w.indexOf(nk) !== -1) {
            SEMANTIC_MAP[key].forEach(function(syn) {
              var ns = normalize(syn);
              if (!seen[ns]) { expanded.push(ns); seen[ns] = true; }
            });
          }
        });
        // Fuzzy: se a palavra nao matchou nada, tentar correcao
        if (expanded.length <= words.length) {
          var corrected = fuzzyMatchKeyword(w);
          if (corrected && !seen[corrected]) {
            expanded.push(corrected);
            seen[corrected] = true;
            // Tambem expandir a versao corrigida pelo mapa semantico
            Object.keys(SEMANTIC_MAP).forEach(function(key) {
              if (normalize(key) === corrected) {
                SEMANTIC_MAP[key].forEach(function(syn) {
                  var ns = normalize(syn);
                  if (!seen[ns]) { expanded.push(ns); seen[ns] = true; }
                });
              }
            });
          }
        }
      });
      return expanded;
    }

    // --- DETECÇÃO DE FRASES COMPOSTAS (multi-palavra no mapa semântico) ---
    function detectCompoundTerms(query) {
      var n = normalize(query);
      var extraTerms = [];
      Object.keys(SEMANTIC_MAP).forEach(function(key) {
        var nk = normalize(key);
        if (nk.indexOf(' ') !== -1 && n.indexOf(nk) !== -1) {
          SEMANTIC_MAP[key].forEach(function(syn) {
            extraTerms.push(normalize(syn));
          });
        }
      });
      return extraTerms;
    }

    // Detectar perguntas fora do escopo do sistema
    function isOutOfScope(query) {
      var n = normalize(query);
      if (/\b(axhub|ax.hub|axion.hub)\b/.test(n)) return { out: true, topic: 'AxHub' };
      if (/\b(clima|tempo|previsao|futebol|jogo|receita|comida|piada|musica|filme|novela|politica|eleicao|bitcoin|cripto|chatgpt|openai|google|facebook|instagram|whatsapp|tiktok|twitter|netflix)\b/.test(n)) return { out: true, topic: null };
      return { out: false };
    }

    // --- SAUDAÇÃO SIMPLES (oi, olá, bom dia) ---
    function isGreeting(query) {
      var n = normalize(query).trim();
      return /^(oi|ola|hey|hi|hello|bom dia|boa tarde|boa noite|e ai|opa|fala|salve)[\.!\s]*$/.test(n);
    }

    // --- AGRADECIMENTO ---
    function isThanks(query) {
      var n = normalize(query).trim();
      return /^(obrigad[oa]|valeu|brigad[oa]|agradec|thanks|vlw|tmj|show|perfeito|otimo|excelente|top|massa|beleza)[\.!\s]*$/.test(n);
    }

    // Detectar meta-perguntas (sobre o sistema em si, visao geral, processos)
    function isMetaQuestion(query) {
      var n = normalize(query);
      // Detecta frases como: "explique os processos", "tudo sobre", "como funciona", "o que faz", "visão geral"
      var metaPatterns = [
        /\b(tudo|todos?)\b.*\b(sobre|axton|sistema)\b/,
        /\b(sobre|axton|sistema)\b.*\b(tudo|todos?)\b/,
        /\b(expliq|explic|descreva|apresent|resuma|resume|mostr)\b.*\b(processo|funcionalidade|modulo|recurso|sistema|axton|ferramenta|funcao|funcion)\b/,
        /\b(processo|funcionalidade|modulo|recurso|ferramenta|funcao|funcion)\b.*\b(expliq|explic|descreva|apresent|resuma|resume|mostr|axton|sistema)\b/,
        /\b(visao geral|overview|resumo geral|apresentacao)\b/,
        /\b(o que|pra que|para que)\b.*\b(serve|faz|e o)\b.*\b(axton|sistema|plataforma)\b/,
        /\b(axton|sistema|plataforma)\b.*\b(serve|faz|funciona)\b/,
        /\b(como|que)\b.*\b(funciona|opera)\b.*\b(axton|sistema|plataforma)\b/,
        /\b(quais|lista|mostr)\b.*\b(modulo|funcionalidade|tela|menu|processo|recurso)\b/,
        /\b(me (fale|conte|diga|explique))\b.*\b(sobre|axton|sistema)\b/,
        /\batudo\b/
      ];
      for (var i = 0; i < metaPatterns.length; i++) {
        if (metaPatterns[i].test(n)) return true;
      }
      return false;
    }

    // Responder meta-perguntas com visao geral do sistema
    function answerMetaQuestion() {
      bot('O <strong>' + SYSTEM_NAME + '</strong> \u00e9 o sistema de gest\u00e3o de <strong>' + SYSTEM_DESC + '</strong> da Axion Tecnologia. Ele cobre todo o fluxo operacional:');
      wait(500, function () {
        typing();
        wait(600, function () {
          untype();
          var overview = '<div class="ax-section">';
          overview += '<div class="ax-section-title">\ud83d\udcca M\u00f3dulos do ' + SYSTEM_NAME + '</div>';
          overview += '<div class="ax-related-grid">';
          var modules = [
            ['\u2696\ufe0f', 'Pesagem', 'Postos, tickets, reclassifica\u00e7\u00e3o, libera\u00e7\u00e3o'],
            ['\u26a0\ufe0f', 'Infra\u00e7\u00f5es', 'Triagem, auditoria, exporta\u00e7\u00e3o, exce\u00e7\u00f5es'],
            ['\ud83d\udce1', 'Opera\u00e7\u00f5es', 'Monitoramento, alertas, consulta de placas'],
            ['\ud83d\udcca', 'Relat\u00f3rios', 'Passagens, fluxo, NFe, Power BI, produtividade'],
            ['\ud83d\ude9a', 'Ve\u00edculos', 'Tipos, marcas, classifica\u00e7\u00f5es, munic\u00edpios'],
            ['\u2699\ufe0f', 'Cadastros B\u00e1sicos', 'Equipamentos, fabricantes, modelos'],
            ['\ud83d\udcc8', 'Medi\u00e7\u00f5es', 'Contratos, performance, interrup\u00e7\u00f5es'],
            ['\ud83d\udd12', 'Controle de Acesso', 'Usu\u00e1rios, perfis, permiss\u00f5es, logs'],
            ['\ud83d\udcf7', 'Sistema', 'C\u00e2mera IP, configura\u00e7\u00f5es gerais']
          ];
          modules.forEach(function (m) {
            overview += '<div class="ax-related-item" data-q="' + m[1] + '"><span class="ax-related-icon">' + m[0] + '</span> <strong>' + m[1] + '</strong> \u2014 ' + m[2] + '</div>';
          });
          overview += '</div></div>';
          var oDiv = document.createElement('div');
          oDiv.className = 'ax-m b';
          oDiv.innerHTML = '<div class="ax-b">' + overview + '</div>';
          oDiv.querySelectorAll('.ax-related-item').forEach(function (item) {
            item.addEventListener('click', function () { ask(item.getAttribute('data-q')); });
          });
          chat.appendChild(oDiv);
          scroll();
          wait(400, function () {
            bot('Clique em um m\u00f3dulo para saber mais, ou me pergunte algo espec\u00edfico!');
          });
        });
      });
    }

    // --- CLASSIFICAÇÃO AVANÇADA DE INTENÇÃO ---
    function detectIntent(q) {
      var n = normalize(q);
      // ERRO / PROBLEMA — prioridade alta
      if (/\b(erro|falha|problema|bug|nao funciona|n.o funciona|quebr|invalid|parou|travou|nao sobe|nao chega|nao abre|nao salva|nao aparece|nao conecta|nao carrega|sumiu|deu pau|bugou|caiu|lento|demora|trava|congel|corrompid)\b/.test(n)) return 'erro';
      // COMO FAZER — instrução passo a passo
      if (/\b(cadastr|criar|novo|adicionar|incluir|registrar|como faco|como eu|como faz|onde fica|onde cadastr|tela|caminho|campo|preencher|instalar|configurar|setar|habilitar|ativar|desativar|conectar|vincular)\b/.test(n)) return 'cadastro';
      // ALTERAR / CORRIGIR
      if (/\b(corrigir|alterar|editar|mudar|atualizar|trocar|ajustar|definir|reconfigurar|resetar|redefinir)\b/.test(n)) return 'cadastro';
      // INFORMAÇÃO / CONCEITO
      if (/\b(o que e|para que|qual|significado|explica|onde usa|dependencia|impacto|conceito|diferenca|funcionalidade|serve|significa)\b/.test(n)) return 'info';
      // RELATÓRIO / CONSULTA
      if (/\b(relatorio|gerar relatorio|emitir|fluxo|mapa|verificar|consultar|listar|filtrar|pesquisar|buscar|exportar|imprimir)\b/.test(n)) return 'consulta';
      // STATUS / VERIFICAÇÃO
      if (/\b(status|situacao|andamento|verificar|checar|conferir|monitorar|acompanhar)\b/.test(n)) return 'status';
      return 'geral';
    }

    // Detectar modulo mencionado na pergunta (expandido com termos semânticos)
    function detectModule(q) {
      var n = normalize(q);
      if (/\b(triagem|infracao|descartar|exporta|auditoria|lote|excecao|multa|auto|notificacao|autuacao|triar|validar|penalidade)\b/.test(n)) return 'Infra\u00e7\u00f5es';
      if (/\b(operacao|monitoramento|evento|alerta|consulta.placa|turno|faixa|pista)\b/.test(n)) return 'Opera\u00e7\u00f5es';
      if (/\b(equipamento|balanca|sensor|fabricante|modelo.equip|haenni)\b/.test(n)) return 'Cadastros B\u00e1sicos';
      if (/\b(pesagem|ticket|peso|reclassif|posto|liberar|motivo|pesar|sobrepeso|excesso|tara|pbt)\b/.test(n)) return 'Pesagem';
      if (/\b(medicao|contrato|indice|performance|interrupcao)\b/.test(n)) return 'Medi\u00e7\u00e3o';
      if (/\b(relatorio|fluxo|mapa|passagens|power.bi|processamento|nfe|nota.fiscal|discrepancia|dashboard|grafico|bi|pdf|planilha)\b/.test(n)) return 'Relat\u00f3rios';
      if (/\b(camera|cam|video|stream|rtsp|onvif|h264|h265|uniview|unv|intelbras|vip.1230|codec|suitable.track|configurac)\b/.test(n)) return 'Sistema';
      if (/\b(layout|sequencial)\b/.test(n)) return 'Administra\u00e7\u00e3o';
      if (/\b(usuario|permiss|perfil|login|senha|acesso|log|bloqueado|restricao)\b/.test(n)) return 'Controle de Acesso';
      if (/\b(veiculo|placa|marca|cor|municipio|tipo.veiculo|classificac|caminhao|cavalo|reboque|carro)\b/.test(n)) return 'Ve\u00edculos';
      return null;
    }

    function scoreEntry(entry, words, intent, detectedModule) {
      var titleText = normalize(entry.title + ' ' + entry.keywords.join(' '));
      var fullText = normalize(entry.title + ' ' + entry.module + ' ' + entry.keywords.join(' ') + ' ' + entry.content + ' ' + entry.path);
      var titleHits = 0, fullHits = 0;
      words.forEach(function (w) {
        if (titleText.indexOf(w) !== -1) titleHits++;
        if (fullText.indexOf(w) !== -1) fullHits++;
      });
      var base = titleHits * 3 + fullHits;
      if (base === 0) return 0;

      var eid = normalize(entry.id);
      var ekw = normalize(entry.keywords.join(' '));

      if (intent === 'cadastro' || intent === 'info') {
        if (eid.indexOf('cadastro') !== -1 || eid.indexOf('conceito') !== -1 || ekw.indexOf('cadastro') !== -1) base += 6;
        if (eid.indexOf('erro') !== -1) base -= 4;
      } else if (intent === 'erro') {
        if (eid.indexOf('erro') !== -1 || ekw.indexOf('erro') !== -1 || ekw.indexOf('problema') !== -1) base += 6;
        if (eid.indexOf('cadastro') !== -1 && eid.indexOf('erro') === -1) base -= 2;
      } else if (intent === 'consulta') {
        if (eid.indexOf('relatorio') !== -1 || eid.indexOf('consulta') !== -1 || eid.indexOf('verificar') !== -1) base += 6;
      }

      if (detectedModule && normalize(entry.module) === normalize(detectedModule)) {
        base += 4;
      }

      if (entry.steps && entry.steps.length >= 5) base += 1;

      return base;
    }

    function search(query) {
      if (!kbData) return { results: [], topScore: 0 };
      var q = normalize(query);
      // Filtrar stopwords e system words
      var rawWords = q.split(/\s+/).filter(function (w) {
        if (w.length <= 1) return false;
        if (STOPWORDS.indexOf(w) !== -1) return false;
        if (SYSTEM_WORDS.indexOf(w) !== -1) return false;
        return true;
      });

      // Detectar termos compostos na frase original
      var compoundTerms = detectCompoundTerms(query);

      // Expandir semanticamente (sinônimos + fuzzy)
      var expanded = expandQuery(rawWords);

      // Juntar termos compostos
      compoundTerms.forEach(function(t) {
        if (expanded.indexOf(t) === -1) expanded.push(t);
      });

      // Se contexto de conversa existe e nenhum módulo novo detectado, adicionar contexto
      if (lastContext.module && !detectModule(query) && rawWords.length <= 3) {
        var contextTerms = normalize(lastContext.module).split(/\s+/);
        contextTerms.forEach(function(t) {
          if (expanded.indexOf(t) === -1) expanded.push(t);
        });
      }

      if (!expanded.length && !rawWords.length) return { results: [], topScore: 0 };

      var searchWords = expanded.length > 0 ? expanded : rawWords;
      var intent = detectIntent(query);
      var detectedModule = detectModule(query);

      var scored = [];
      kbData.entries.forEach(function (e) {
        var s = scoreEntry(e, searchWords, intent, detectedModule);
        if (s > 0) scored.push({ entry: e, score: s });
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      var topScore = scored.length > 0 ? scored[0].score : 0;
      return { results: scored.map(function (x) { return x.entry; }).slice(0, 8), topScore: topScore };
    }

    // --- Lookup de entry por ID ---
    function findEntry(id) {
      if (!kbData) return null;
      for (var i = 0; i < kbData.entries.length; i++) {
        if (kbData.entries[i].id === id) return kbData.entries[i];
      }
      return null;
    }

    // --- Montar link de documentacao ---
    function buildDocLink(entry) {
      if (!entry.docUrl) return '';
      var url = pageBase + entry.docUrl;
      return '<a href="' + url + '" target="_blank" class="ax-doc-btn">' +
        '\ud83d\udcc4 Ver documenta\u00e7\u00e3o completa</a>';
    }

    // --- Montar referencia tecnica (tabelas SQL) ---
    function buildDbRef(entry) {
      if (!entry.dbTables || !entry.dbTables.length) return '';
      return '<div class="ax-db-ref">\ud83d\uddc4\ufe0f Tabelas: <code>' + entry.dbTables.join('</code> \u00b7 <code>') + '</code></div>';
    }

    // --- Gerar resposta inteligente ---
    function compose(query, results) {
      var main = results[0];
      var others = results.slice(1, 6);

      var complementary = [];
      var searchRelated = [];
      var mainWords = normalize(main.title + ' ' + main.keywords.join(' ')).split(/\s+/);

      others.forEach(function (r) {
        var rWords = normalize(r.title + ' ' + r.keywords.join(' ')).split(/\s+/);
        var overlap = 0;
        mainWords.forEach(function (w) {
          if (w.length > 2 && rWords.indexOf(w) !== -1) overlap++;
        });
        if (overlap >= 2 && complementary.length < 2) {
          complementary.push(r);
        } else if (searchRelated.length < 3) {
          searchRelated.push(r);
        }
      });

      var explicitRelated = [];
      if (main.related && main.related.length) {
        var usedIds = [main.id];
        complementary.forEach(function (c) { usedIds.push(c.id); });
        searchRelated.forEach(function (r) { usedIds.push(r.id); });

        main.related.forEach(function (rid) {
          if (usedIds.indexOf(rid) === -1 && explicitRelated.length < 3) {
            var e = findEntry(rid);
            if (e) { explicitRelated.push(e); usedIds.push(rid); }
          }
        });
      }

      var allRelated = [];
      var seenIds = {};
      searchRelated.concat(explicitRelated).forEach(function (r) {
        if (!seenIds[r.id] && allRelated.length < 4) {
          allRelated.push(r);
          seenIds[r.id] = true;
        }
      });

      var intro = buildIntro(query, main);
      var explanation = main.content;

      var mainStepsHtml = '';
      if (main.steps && main.steps.length) {
        mainStepsHtml = '<ol class="ax-steps">';
        main.steps.forEach(function (s) { mainStepsHtml += '<li>' + s + '</li>'; });
        mainStepsHtml += '</ol>';
      }

      var compCards = [];
      complementary.forEach(function (c) {
        var card = '<div class="ax-comp-card">';
        card += '<div class="ax-comp-title">\ud83d\udcd8 ' + c.title + '</div>';
        card += '<div class="ax-comp-text">' + c.content + '</div>';
        if (c.steps && c.steps.length) {
          card += '<ol class="ax-comp-steps">';
          c.steps.slice(0, 4).forEach(function (s) { card += '<li>' + s + '</li>'; });
          card += '</ol>';
        }
        card += '</div>';
        compCards.push(card);
      });

      var paths = [main.path];
      complementary.forEach(function (c) {
        if (c.path && paths.indexOf(c.path) === -1 && c.path !== 'Informa\u00e7\u00e3o de refer\u00eancia' && c.path !== 'Procedimento operacional') {
          paths.push(c.path);
        }
      });

      var navHtml = '<div class="ax-section">';
      navHtml += '<div class="ax-section-title">\ud83d\udccd Onde encontrar</div>';
      paths.forEach(function (p) {
        navHtml += '<div class="ax-path-item"><span class="ax-path-icon">\u25b8</span> ' + p + '</div>';
      });
      var docLinkHtml = buildDocLink(main);
      if (docLinkHtml) navHtml += docLinkHtml;
      var dbRefHtml = buildDbRef(main);
      if (dbRefHtml) navHtml += dbRefHtml;
      navHtml += '</div>';

      var relatedGridHtml = '';
      if (allRelated.length > 0) {
        relatedGridHtml = '<div class="ax-section">';
        relatedGridHtml += '<div class="ax-section-title">\ud83d\udca1 Temas relacionados</div>';
        relatedGridHtml += '<div class="ax-related-grid">';
        allRelated.forEach(function (r) {
          relatedGridHtml += '<div class="ax-related-item" data-q="' + r.title + '"><span class="ax-related-icon">\u25b6</span> ' + r.title + '</div>';
        });
        relatedGridHtml += '</div></div>';
      }

      return {
        intro: intro,
        explanation: explanation,
        compCards: compCards,
        mainSteps: mainStepsHtml,
        nav: navHtml,
        related: allRelated,
        relatedGrid: relatedGridHtml,
        main: main
      };
    }

    // --- INTRO PROFISSIONAL BASEADA EM INTENÇÃO ---
    function buildIntro(query, entry) {
      var intent = detectIntent(query);
      var title = '<strong>' + entry.title + '</strong>';
      var intros;

      switch (intent) {
        case 'erro':
          intros = [
            '\ud83d\udd0d Identifiquei a situa\u00e7\u00e3o. Veja a orienta\u00e7\u00e3o para ' + title + ':',
            '\u26a0\ufe0f Esse \u00e9 um problema conhecido. Aqui est\u00e1 a solu\u00e7\u00e3o para ' + title + ':',
            '\ud83d\udee0\ufe0f Analisei o problema. Segue a orienta\u00e7\u00e3o para resolver ' + title + ':'
          ];
          break;
        case 'cadastro':
          intros = [
            '\ud83d\udcdd Preparei o passo a passo para ' + title + '.',
            '\ud83d\udcd6 Aqui est\u00e1 o guia completo de ' + title + '.',
            '\u2699\ufe0f Vou te orientar sobre como configurar ' + title + '.'
          ];
          break;
        case 'info':
          intros = [
            '\ud83d\udca1 Aqui est\u00e3o as informa\u00e7\u00f5es sobre ' + title + '.',
            '\ud83d\udcca Sobre ' + title + ', veja o que encontrei:',
            '\ud83d\udcd8 Segue a explica\u00e7\u00e3o sobre ' + title + ':'
          ];
          break;
        case 'consulta':
          intros = [
            '\ud83d\udcc8 Para consultar ' + title + ', siga estas orienta\u00e7\u00f5es:',
            '\ud83d\udd0e Sobre ' + title + ', veja como acessar:',
            '\ud83d\udcca Aqui est\u00e1 como gerar/consultar ' + title + ':'
          ];
          break;
        case 'status':
          intros = [
            '\ud83d\udcca Para verificar o status de ' + title + ':',
            '\u2705 Sobre ' + title + ', veja como acompanhar:'
          ];
          break;
        default:
          intros = [
            'Com base na sua pergunta, preparei uma orienta\u00e7\u00e3o sobre ' + title + '.',
            'Analisei sua d\u00favida e aqui est\u00e1 o que encontrei sobre ' + title + '.',
            'Entendi! Segue a orienta\u00e7\u00e3o sobre ' + title + '.'
          ];
      }

      return intros[rand(intros.length)];
    }

    // --- PROCESSAR PERGUNTA (Pipeline v5.0) ---
    function ask(query) {
      user(query);
      qbox.value = '';
      lastUserQueries.push(query);
      if (lastUserQueries.length > 5) lastUserQueries.shift();

      if (!kbData) {
        bot('Aguarde, estou carregando minha base de conhecimento...');
        loadKB();
        return;
      }

      typing();

      var delay1 = 500 + rand(400);

      wait(delay1, function () {
        untype();

        // CAMADA 0: Saudação / Agradecimento
        if (isGreeting(query)) {
          var greets = [
            'Ol\u00e1! Como posso te ajudar com o <strong>' + SYSTEM_NAME + '</strong>?',
            'Oi! Estou aqui para ajudar. O que precisa saber sobre o <strong>' + SYSTEM_NAME + '</strong>?',
            'Ol\u00e1! Sou a AxionIA. Me diga sua d\u00favida sobre ' + SYSTEM_DESC + '.'
          ];
          bot(greets[rand(greets.length)]);
          wait(400, function () {
            suggest(['Pesagem', 'Triagem', 'C\u00e2mera IP', 'Relat\u00f3rios', 'Usu\u00e1rios', 'Equipamentos']);
          });
          return;
        }

        if (isThanks(query)) {
          var thanks = [
            'Disponha! Se precisar de mais alguma coisa, \u00e9 s\u00f3 perguntar. \ud83d\ude09',
            'Por nada! Estou aqui se precisar de mais ajuda.',
            'Fico feliz em ajudar! Qualquer d\u00favida, \u00e9 s\u00f3 chamar.'
          ];
          bot(thanks[rand(thanks.length)]);
          return;
        }

        // CAMADA 0.5: Helpdesk — abrir chamado inline
        if (isHelpdeskIntent(query)) {
          showHelpdeskForm();
          return;
        }

        // CAMADA 1: Fora do escopo
        var scope = isOutOfScope(query);
        if (scope.out) {
          if (scope.topic) {
            bot('O <strong>' + esc(scope.topic) + '</strong> \u00e9 um sistema diferente do ' + SYSTEM_NAME + '. Aqui eu s\u00f3 consigo ajudar com d\u00favidas sobre o <strong>' + SYSTEM_NAME + '</strong> (' + SYSTEM_DESC + ').');
          } else {
            bot('Essa pergunta est\u00e1 fora do meu escopo. Sou a assistente do <strong>' + SYSTEM_NAME + '</strong> e posso ajudar com d\u00favidas sobre ' + SYSTEM_DESC + ', infra\u00e7\u00f5es, relat\u00f3rios e opera\u00e7\u00f5es.');
          }
          wait(400, function () {
            bot('Posso te ajudar com algum desses temas?');
            suggest(['Pesagem', 'Triagem', 'C\u00e2mera IP', 'Relat\u00f3rios', 'Opera\u00e7\u00f5es', 'Usu\u00e1rios']);
          });
          return;
        }

        // CAMADA 2: Meta-pergunta (visão geral, processos, sobre o sistema)
        if (isMetaQuestion(query)) {
          lastContext = { module: null, topic: 'overview', entryId: null };
          answerMetaQuestion();
          return;
        }

        // CAMADA 3: Busca inteligente (com expansão semântica + fuzzy)
        var searchResult = search(query);
        var res = searchResult.results;
        var MIN_SCORE = 4;

        if (res.length > 0 && searchResult.topScore >= MIN_SCORE) {
          // SUCESSO: encontrou resultado relevante → pular para renderização
          lastContext = { module: res[0].module, topic: res[0].id, entryId: res[0].id };
          renderFullResponse(query, res);
          return;
        }

        // CAMADA 4: Módulo detectado → sugestões específicas (NEVER-FAIL nível 1)
        var mod = detectModule(query);
        if (mod) {
          lastContext = { module: mod, topic: null, entryId: null };
          bot('Sobre <strong>' + mod + '</strong>, posso te ajudar! Escolha um tema espec\u00edfico:');
          var modSuggestions = {
            'Infra\u00e7\u00f5es': ['Triagem de infra\u00e7\u00f5es', 'Auditoria', 'Exporta\u00e7\u00e3o de lote', 'Infra\u00e7\u00f5es descartadas'],
            'Opera\u00e7\u00f5es': ['Monitoramento online', 'Alertas', 'Consulta de placas', 'Eventos de equipamentos'],
            'Pesagem': ['Tickets em aberto', 'Tickets fechados', 'Postos de pesagem', 'Reclassificar ve\u00edculo'],
            'Relat\u00f3rios': ['Relat\u00f3rio de passagens', 'Relat\u00f3rio de infra\u00e7\u00f5es', 'Fluxo di\u00e1rio', 'Power BI'],
            'Cadastros B\u00e1sicos': ['Equipamentos', 'Fabricantes', 'Tipos de equipamentos'],
            'Medi\u00e7\u00e3o': ['Contratos', '\u00cdndices de performance', 'Interrup\u00e7\u00f5es'],
            'Ve\u00edculos': ['Tipos de ve\u00edculos', 'Classifica\u00e7\u00f5es', 'Munic\u00edpios'],
            'Controle de Acesso': ['Criar usu\u00e1rio', 'Permiss\u00f5es', 'Logs de acesso'],
            'Administra\u00e7\u00e3o': ['Usu\u00e1rios', 'Perfis de acesso', 'Permiss\u00f5es'],
            'Sistema': ['Configurar C\u00e2mera IP', 'Erro c\u00e2mera track not found', 'Configura\u00e7\u00f5es do Sistema']
          };
          var sug = modSuggestions[mod] || ['Pesagem', 'Triagem', 'Relat\u00f3rios'];
          wait(300, function () { suggest(sug); });
          return;
        }

        // CAMADA 5: Resultados parciais com score baixo → mostrar melhor candidato (NEVER-FAIL nível 2)
        if (res.length > 0 && searchResult.topScore >= 2) {
          lastContext = { module: res[0].module, topic: res[0].id, entryId: res[0].id };
          bot('Encontrei algo que pode estar relacionado \u00e0 sua pergunta:');
          wait(300, function () {
            // Mostrar como cards clicáveis em vez de resposta completa
            var cardHtml = '';
            res.slice(0, 3).forEach(function(r) {
              cardHtml += '<div class="ax-card" data-q="' + r.title + '">' +
                '<div class="cm">' + r.module + '</div>' +
                '<div class="ct">' + r.title + '</div>' +
                '<div class="cp">' + r.content.substring(0, 80) + '...</div></div>';
            });
            var cDiv = document.createElement('div');
            cDiv.className = 'ax-m b';
            cDiv.innerHTML = '<div class="ax-b">' + cardHtml + '</div>';
            cDiv.querySelectorAll('.ax-card').forEach(function(card) {
              card.addEventListener('click', function() { ask(card.getAttribute('data-q')); });
            });
            chat.appendChild(cDiv);
            scroll();
            wait(300, function () {
              bot('Clique em um resultado ou reformule sua pergunta para mais precis\u00e3o.');
            });
          });
          return;
        }

        // CAMADA 6: Nada encontrado → orientação inteligente (NEVER-FAIL nível 3)
        var nq = normalize(query);
        var smartTip = '';
        if (/\b(erro|falha|problema|nao|bug)\b/.test(nq)) {
          smartTip = 'Para problemas t\u00e9cnicos, descreva: <em>qual tela</em>, <em>qual a\u00e7\u00e3o</em> e <em>qual mensagem de erro</em>.';
        } else if (/\b(como|onde|qual)\b/.test(nq)) {
          smartTip = 'Tente incluir o nome da funcionalidade. Ex: "<em>como configurar c\u00e2mera</em>" ou "<em>como exportar infra\u00e7\u00f5es</em>".';
        } else {
          smartTip = 'Tente usar palavras-chave do sistema. Ex: "<em>ticket pesagem</em>", "<em>erro c\u00e2mera</em>", "<em>relat\u00f3rio passagens</em>".';
        }

        bot('Analisei sua pergunta mas n\u00e3o encontrei um resultado direto na base.');
        wait(400, function () {
          bot(smartTip);
          wait(300, function () {
            bot('Ou escolha um dos temas abaixo:');
            suggest(['Pesagem', 'Triagem', 'C\u00e2mera IP', 'Relat\u00f3rios', 'Equipamentos', 'Usu\u00e1rios', 'Opera\u00e7\u00f5es']);
          });
        });
      });
    }

    // --- RENDERIZAR RESPOSTA COMPLETA ---
    function renderFullResponse(query, res) {

      var resp = compose(query, res);

      bot(resp.intro);

      wait(350, function () {
        typing();
        wait(400 + rand(300), function () {
          untype();
          bot(resp.explanation);

          var d = 200;

          if (resp.mainSteps) {
            wait(d, function () {
              typing();
              wait(500 + rand(300), function () {
                untype();
                bot('<div class="ax-section"><div class="ax-section-title">\ud83d\udcdd Passo a passo</div>' + resp.mainSteps + '</div>');
              });
            });
            d += 900;
          }

          resp.compCards.forEach(function (card, idx) {
            wait(d + idx * 700, function () {
              typing();
              wait(350 + rand(200), function () {
                untype();
                bot(card);
              });
            });
          });
          if (resp.compCards.length) d += resp.compCards.length * 700;

          wait(d + 200, function () {
            bot(resp.nav);

            wait(300, function () {
              if (resp.relatedGrid) {
                var rDiv = document.createElement('div');
                rDiv.className = 'ax-m b';
                rDiv.innerHTML = '<div class="ax-b">' + resp.relatedGrid + '</div>';
                rDiv.querySelectorAll('.ax-related-item').forEach(function (item) {
                  item.addEventListener('click', function () {
                    ask(item.getAttribute('data-q'));
                  });
                });
                chat.appendChild(rDiv);
                scroll();
              } else {
                bot('Precisa de mais alguma coisa? Pode perguntar ou digite <strong>"abrir chamado"</strong> para contatar o suporte.');
              }
            });
          });
        });
      });
    }

    // --- Eventos ---
    goBtn.addEventListener('click', function () {
      var q = qbox.value.trim();
      if (q) ask(q);
    });
    qbox.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var q = qbox.value.trim();
        if (q) ask(q);
      }
    });

  } // fim initAxionIA

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAxionIA);
  } else {
    initAxionIA();
  }
})();
