import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Sidebar manual — espelha o menu do sistema AxTon (Electron.NET)
 * Ordem: Dashboards > Iniciar Pesagem > Operações > Tickets > Exportação >
 *        Sistema > Locais > Classificações > Usuários > Relatórios >
 *        Seq. Infração > Seq. Exportação > Permissões > Perfis > ...
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

    // ── Dashboards (link direto) ──
    {
      type: 'doc',
      id: 'primeiros-passos/dashboard',
      label: '📊 Dashboards',
      className: 'menu-hidden',
    },

    // ── Iniciar Pesagem ──
    {
      type: 'doc',
      id: 'pesagem/postos',
      label: '⚖️ Iniciar Pesagem',
    },

    // ── Operações ──
    {
      type: 'doc',
      id: 'operacoes/cadastro-operacoes',
      label: '📡 Operações',
    },

    // ── Tickets de Pesagens ──
    {
      type: 'doc',
      id: 'pesagem/ticket-aberto',
      label: '🎫 Tickets de Pesagens',
    },

    // ── Exportação ──
    {
      type: 'doc',
      id: 'infracoes/exportacao',
      label: '📤 Exportação',
    },

    // ── Sistema ──
    {
      type: 'doc',
      id: 'sistema/configuracoes',
      label: '⚙️ Sistema',
    },

    // ── Locais ──
    {
      type: 'doc',
      id: 'cadastros/locais',
      label: '📍 Locais',
    },

    // ── Classificações ──
    {
      type: 'doc',
      id: 'cadastros/classificacao-veiculos',
      label: '🏷️ Classificações',
    },

    // ── Usuários ──
    {
      type: 'doc',
      id: 'administracao/usuarios',
      label: '👤 Usuários',
    },

    // ── Relatório de Pesagem ──
    {
      type: 'doc',
      id: 'relatorios/relatorio-passagens',
      label: '📊 Relatório de Pesagem',
    },

    // ── Sequenciais de Infração ──
    {
      type: 'doc',
      id: 'cadastros/sequencial-infracao',
      label: '⚠️ Sequenciais de Infração',
    },

    // ── Sequenciais de Exportação ──
    {
      type: 'doc',
      id: 'infracoes/exportacao',
      label: '📦 Sequenciais de Exportação',
    },

    // ── Permissões de acesso ──
    {
      type: 'doc',
      id: 'administracao/permissoes',
      label: '🔐 Permissões de acesso',
    },

    // ── Perfis de acesso ──
    {
      type: 'doc',
      id: 'administracao/perfis-acesso',
      label: '🛡️ Perfis de acesso',
    },

    // ── Glossário ──
    {
      type: 'category',
      label: '📖 Glossário Técnico',
      collapsed: true,
      items: [
        'glossario/pesagem',
        'glossario/pbt',
        'glossario/nfe',
        'glossario/mdfe',
        'glossario/infracao',
        'glossario/triagem',
      ],
    },
  ],
};

export default sidebars;
