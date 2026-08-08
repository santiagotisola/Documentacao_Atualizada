import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  manualSidebar: [
    'intro',

    // ── Primeiros Passos ──
    {
      type: 'category',
      label: '🚀 Primeiros Passos',
      collapsed: false,
      items: [
        'primeiros-passos/login',
        'primeiros-passos/navegacao',
        'primeiros-passos/dashboard',
      ],
    },

    // ── Monitoramento ──
    {
      type: 'category',
      label: '📡 Monitoramento',
      collapsed: false,
      items: [
        'operacoes/veiculos-monitorados',
        'operacoes/monitoramento-online',
        'operacoes/alertas',
        'operacoes/vigencia-alertas',
        'operacoes/cadastro-operacoes',
        'operacoes/tipos-ocorrencias',
      ],
    },

    // ── Equipamentos ──
    {
      type: 'category',
      label: '📷 Equipamentos',
      collapsed: true,
      items: [
        'cadastros/equipamentos',
        'cadastros/locais',
        'cadastros/faixas',
        'cadastros/grupos-equipamentos',
      ],
    },

    // ── Relatórios ──
    {
      type: 'doc',
      id: 'relatorios/relatorio-passagens',
      label: '📊 Relatórios',
    },

    // ── Administração ──
    {
      type: 'category',
      label: '⚙️ Administração',
      collapsed: true,
      items: [
        'sistema/configuracoes',
        'administracao/usuarios',
        'administracao/perfis-acesso',
        'administracao/permissoes',
        'administracao/logs-acesso',
      ],
    },

    // ── Referência Técnica ──
    {
      type: 'category',
      label: '🗄️ Referência Técnica',
      collapsed: true,
      items: [
        'referencia-tecnica/banco-de-dados',
        'referencia-tecnica/classificacao-veiculos-integracao',
      ],
    },

    // ── Glossário ──
    {
      type: 'category',
      label: '📖 Glossário',
      collapsed: true,
      items: [
        'glossario/passagem',
        'glossario/equipamento',
        'glossario/operacao',
      ],
    },
  ],
};

export default sidebars;
