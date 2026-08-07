import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Sidebar manual — espelha o menu do sistema AxCross
 */
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
      ],
    },

    // ── Dashboard ──
    {
      type: 'doc',
      id: 'primeiros-passos/dashboard',
      label: '📊 Dashboard',
    },

    // ── Veículos Monitorados ──
    {
      type: 'doc',
      id: 'operacoes/veiculos-monitorados',
      label: '🚗 Veículos Monitorados',
    },

    // ── Equipamentos ──
    {
      type: 'doc',
      id: 'cadastros/equipamentos',
      label: '📷 Equipamentos',
    },

    // ── Monitoramento ──
    {
      type: 'doc',
      id: 'operacoes/monitoramento-online',
      label: '📡 Monitoramento',
    },

    // ── Relatórios ──
    {
      type: 'doc',
      id: 'relatorios/relatorio-passagens',
      label: '📊 Relatórios',
    },

    // ── Configurações ──
    {
      type: 'doc',
      id: 'sistema/configuracoes',
      label: '⚙️ Configurações',
    },


    // ── Referência Técnica ──
    

    // ── Glossário ──
    {
      type: 'category',
      label: '📖 Glossário Técnico',
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
