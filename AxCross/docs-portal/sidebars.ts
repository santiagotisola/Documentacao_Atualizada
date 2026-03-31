import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Sidebar manual — espelha o menu do sistema AxCross
 * Estrutura inicial — ajustar conforme menus reais do sistema
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

    // ── Dashboards ──
    {
      type: 'doc',
      id: 'primeiros-passos/dashboard',
      label: '📊 Dashboards',
    },

    // ── Monitoramento Online ──
    {
      type: 'doc',
      id: 'operacoes/monitoramento-online',
      label: '📡 Monitoramento Online',
    },

    // ── Veículos Monitorados ──
    {
      type: 'doc',
      id: 'operacoes/veiculos-monitorados',
      label: '🚗 Veículos Monitorados',
    },

    // ── Alertas ──
    {
      type: 'doc',
      id: 'operacoes/alertas',
      label: '🚨 Alertas',
    },

    // ── Operações ──
    {
      type: 'doc',
      id: 'operacoes/cadastro-operacoes',
      label: '🚦 Operações',
    },

    // ── Sistema ──
    {
      type: 'doc',
      id: 'sistema/configuracoes',
      label: '⚙️ Sistema',
    },

    // ── Cadastros (expansível) ──
    {
      type: 'category',
      label: '📋 Cadastros',
      collapsed: true,
      items: [
        'cadastros/locais',
        'cadastros/equipamentos',
        'cadastros/grupos-equipamentos',
        'cadastros/faixas',
      ],
    },

    // ── Relatórios ──
    {
      type: 'doc',
      id: 'relatorios/relatorio-passagens',
      label: '📊 Relatório de Passagens',
    },

    // ── Administração (expansível) ──
    {
      type: 'category',
      label: '🔒 Administração',
      collapsed: true,
      items: [
        'administracao/usuarios',
        'administracao/permissoes',
        'administracao/perfis-acesso',
      ],
    },

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
