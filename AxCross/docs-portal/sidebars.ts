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
      type: 'category',
      label: '🚗 Veículos Monitorados',
      collapsed: false,
      items: [
        'operacoes/veiculos-monitorados',
        'operacoes/tipos-ocorrencias',
        'operacoes/alertas',
        'operacoes/vigencia-alertas',
      ],
    },

    // ── Operações ──
    {
      type: 'doc',
      id: 'operacoes/cadastro-operacoes',
      label: '🚦 Operações',
    },

    // ── Sistema ──
    {
      type: 'category',
      label: '⚙️ Sistema',
      collapsed: true,
      items: [
        'sistema/configuracoes',
        'sistema/sincronizacao',
      ],
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
      type: 'category',
      label: '📊 Relatórios',
      collapsed: true,
      items: [
        'relatorios/relatorio-passagens',
        'relatorios/mapeamento-rotas',
        'relatorios/rastreamento-placas',
        'relatorios/veiculos-monitorados',
        'relatorios/ocorrencias-alertas',
        'relatorios/pdf-gerados',
      ],
    },

    // ── Administração (expansível) ──
    {
      type: 'category',
      label: '🔒 Administração',
      collapsed: true,
      items: [
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
