import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/AxTon.Docs/__docusaurus/debug',
    component: ComponentCreator('/AxTon.Docs/__docusaurus/debug', 'eb1'),
    exact: true
  },
  {
    path: '/AxTon.Docs/__docusaurus/debug/config',
    component: ComponentCreator('/AxTon.Docs/__docusaurus/debug/config', 'a25'),
    exact: true
  },
  {
    path: '/AxTon.Docs/__docusaurus/debug/content',
    component: ComponentCreator('/AxTon.Docs/__docusaurus/debug/content', 'dd8'),
    exact: true
  },
  {
    path: '/AxTon.Docs/__docusaurus/debug/globalData',
    component: ComponentCreator('/AxTon.Docs/__docusaurus/debug/globalData', 'b0a'),
    exact: true
  },
  {
    path: '/AxTon.Docs/__docusaurus/debug/metadata',
    component: ComponentCreator('/AxTon.Docs/__docusaurus/debug/metadata', 'da4'),
    exact: true
  },
  {
    path: '/AxTon.Docs/__docusaurus/debug/registry',
    component: ComponentCreator('/AxTon.Docs/__docusaurus/debug/registry', '2ac'),
    exact: true
  },
  {
    path: '/AxTon.Docs/__docusaurus/debug/routes',
    component: ComponentCreator('/AxTon.Docs/__docusaurus/debug/routes', 'a29'),
    exact: true
  },
  {
    path: '/AxTon.Docs/',
    component: ComponentCreator('/AxTon.Docs/', 'cd3'),
    routes: [
      {
        path: '/AxTon.Docs/',
        component: ComponentCreator('/AxTon.Docs/', '36f'),
        routes: [
          {
            path: '/AxTon.Docs/',
            component: ComponentCreator('/AxTon.Docs/', '96f'),
            routes: [
              {
                path: '/AxTon.Docs/administracao/perfis-acesso',
                component: ComponentCreator('/AxTon.Docs/administracao/perfis-acesso', 'b23'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/administracao/permissoes',
                component: ComponentCreator('/AxTon.Docs/administracao/permissoes', '3c0'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/administracao/usuarios',
                component: ComponentCreator('/AxTon.Docs/administracao/usuarios', '1cf'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/cadastros-basicos/equipamentos',
                component: ComponentCreator('/AxTon.Docs/cadastros-basicos/equipamentos', 'c6b'),
                exact: true
              },
              {
                path: '/AxTon.Docs/cadastros-basicos/fabricantes',
                component: ComponentCreator('/AxTon.Docs/cadastros-basicos/fabricantes', '515'),
                exact: true
              },
              {
                path: '/AxTon.Docs/cadastros-basicos/grupos-equipamentos',
                component: ComponentCreator('/AxTon.Docs/cadastros-basicos/grupos-equipamentos', '66e'),
                exact: true
              },
              {
                path: '/AxTon.Docs/cadastros-basicos/modelos-equipamentos',
                component: ComponentCreator('/AxTon.Docs/cadastros-basicos/modelos-equipamentos', 'c9c'),
                exact: true
              },
              {
                path: '/AxTon.Docs/cadastros-basicos/tipos-equipamentos',
                component: ComponentCreator('/AxTon.Docs/cadastros-basicos/tipos-equipamentos', '175'),
                exact: true
              },
              {
                path: '/AxTon.Docs/cadastros/classificacao-veiculos',
                component: ComponentCreator('/AxTon.Docs/cadastros/classificacao-veiculos', 'f01'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/cadastros/locais',
                component: ComponentCreator('/AxTon.Docs/cadastros/locais', '7ad'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/cadastros/sequencial-infracao',
                component: ComponentCreator('/AxTon.Docs/cadastros/sequencial-infracao', '022'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/controle-acesso/acessos-por-ip',
                component: ComponentCreator('/AxTon.Docs/controle-acesso/acessos-por-ip', '053'),
                exact: true
              },
              {
                path: '/AxTon.Docs/controle-acesso/configurar-permissoes',
                component: ComponentCreator('/AxTon.Docs/controle-acesso/configurar-permissoes', '82c'),
                exact: true
              },
              {
                path: '/AxTon.Docs/controle-acesso/logs-acesso',
                component: ComponentCreator('/AxTon.Docs/controle-acesso/logs-acesso', '126'),
                exact: true
              },
              {
                path: '/AxTon.Docs/glossario/infracao',
                component: ComponentCreator('/AxTon.Docs/glossario/infracao', '3d8'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/glossario/mdfe',
                component: ComponentCreator('/AxTon.Docs/glossario/mdfe', 'd2e'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/glossario/nfe',
                component: ComponentCreator('/AxTon.Docs/glossario/nfe', '88d'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/glossario/pbt',
                component: ComponentCreator('/AxTon.Docs/glossario/pbt', '875'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/glossario/pesagem',
                component: ComponentCreator('/AxTon.Docs/glossario/pesagem', '6cc'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/glossario/triagem',
                component: ComponentCreator('/AxTon.Docs/glossario/triagem', 'd38'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/infracoes/exportacao',
                component: ComponentCreator('/AxTon.Docs/infracoes/exportacao', 'bfe'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/medicoes/contratos',
                component: ComponentCreator('/AxTon.Docs/medicoes/contratos', '43e'),
                exact: true
              },
              {
                path: '/AxTon.Docs/medicoes/criar-medicao',
                component: ComponentCreator('/AxTon.Docs/medicoes/criar-medicao', '2e8'),
                exact: true
              },
              {
                path: '/AxTon.Docs/medicoes/indices-performance',
                component: ComponentCreator('/AxTon.Docs/medicoes/indices-performance', '087'),
                exact: true
              },
              {
                path: '/AxTon.Docs/medicoes/interrupcoes',
                component: ComponentCreator('/AxTon.Docs/medicoes/interrupcoes', '157'),
                exact: true
              },
              {
                path: '/AxTon.Docs/operacoes/alertas',
                component: ComponentCreator('/AxTon.Docs/operacoes/alertas', 'c49'),
                exact: true
              },
              {
                path: '/AxTon.Docs/operacoes/cadastro-operacoes',
                component: ComponentCreator('/AxTon.Docs/operacoes/cadastro-operacoes', 'd01'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/operacoes/consulta-placas',
                component: ComponentCreator('/AxTon.Docs/operacoes/consulta-placas', 'a35'),
                exact: true
              },
              {
                path: '/AxTon.Docs/operacoes/eventos-equipamentos',
                component: ComponentCreator('/AxTon.Docs/operacoes/eventos-equipamentos', 'd9f'),
                exact: true
              },
              {
                path: '/AxTon.Docs/operacoes/monitoramento-online',
                component: ComponentCreator('/AxTon.Docs/operacoes/monitoramento-online', '726'),
                exact: true
              },
              {
                path: '/AxTon.Docs/pesagem/liberar-pesagem',
                component: ComponentCreator('/AxTon.Docs/pesagem/liberar-pesagem', '947'),
                exact: true
              },
              {
                path: '/AxTon.Docs/pesagem/motivos',
                component: ComponentCreator('/AxTon.Docs/pesagem/motivos', '3bf'),
                exact: true
              },
              {
                path: '/AxTon.Docs/pesagem/postos',
                component: ComponentCreator('/AxTon.Docs/pesagem/postos', 'c9b'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/pesagem/reclassificar',
                component: ComponentCreator('/AxTon.Docs/pesagem/reclassificar', '5b4'),
                exact: true
              },
              {
                path: '/AxTon.Docs/pesagem/ticket-aberto',
                component: ComponentCreator('/AxTon.Docs/pesagem/ticket-aberto', 'd79'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/pesagem/ticket-fechado',
                component: ComponentCreator('/AxTon.Docs/pesagem/ticket-fechado', '64b'),
                exact: true
              },
              {
                path: '/AxTon.Docs/primeiros-passos/dashboard',
                component: ComponentCreator('/AxTon.Docs/primeiros-passos/dashboard', '697'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/primeiros-passos/login',
                component: ComponentCreator('/AxTon.Docs/primeiros-passos/login', '1f2'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/primeiros-passos/navegacao',
                component: ComponentCreator('/AxTon.Docs/primeiros-passos/navegacao', '7b0'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/relatorios/falhas-sequenciais',
                component: ComponentCreator('/AxTon.Docs/relatorios/falhas-sequenciais', '8f0'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/fluxo-diario-veiculos',
                component: ComponentCreator('/AxTon.Docs/relatorios/fluxo-diario-veiculos', '4d6'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/mapa-fluxo-passagens',
                component: ComponentCreator('/AxTon.Docs/relatorios/mapa-fluxo-passagens', '973'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/power-bi',
                component: ComponentCreator('/AxTon.Docs/relatorios/power-bi', '51e'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/processamento-imagens',
                component: ComponentCreator('/AxTon.Docs/relatorios/processamento-imagens', 'c28'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/processamento-por-usuario',
                component: ComponentCreator('/AxTon.Docs/relatorios/processamento-por-usuario', 'f62'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/relatorio-discrepancias',
                component: ComponentCreator('/AxTon.Docs/relatorios/relatorio-discrepancias', '94d'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/relatorio-infracoes',
                component: ComponentCreator('/AxTon.Docs/relatorios/relatorio-infracoes', '0b2'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/relatorio-nfe',
                component: ComponentCreator('/AxTon.Docs/relatorios/relatorio-nfe', '6db'),
                exact: true
              },
              {
                path: '/AxTon.Docs/relatorios/relatorio-passagens',
                component: ComponentCreator('/AxTon.Docs/relatorios/relatorio-passagens', '5fe'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/sistema/camera-ip',
                component: ComponentCreator('/AxTon.Docs/sistema/camera-ip', '35a'),
                exact: true
              },
              {
                path: '/AxTon.Docs/sistema/configuracoes',
                component: ComponentCreator('/AxTon.Docs/sistema/configuracoes', '635'),
                exact: true,
                sidebar: "manualSidebar"
              },
              {
                path: '/AxTon.Docs/veiculos/classificacoes-veiculos',
                component: ComponentCreator('/AxTon.Docs/veiculos/classificacoes-veiculos', '28d'),
                exact: true
              },
              {
                path: '/AxTon.Docs/veiculos/cores',
                component: ComponentCreator('/AxTon.Docs/veiculos/cores', 'c25'),
                exact: true
              },
              {
                path: '/AxTon.Docs/veiculos/marcas-veiculos',
                component: ComponentCreator('/AxTon.Docs/veiculos/marcas-veiculos', 'c14'),
                exact: true
              },
              {
                path: '/AxTon.Docs/veiculos/modelos-veiculos',
                component: ComponentCreator('/AxTon.Docs/veiculos/modelos-veiculos', '3d9'),
                exact: true
              },
              {
                path: '/AxTon.Docs/veiculos/municipios',
                component: ComponentCreator('/AxTon.Docs/veiculos/municipios', '2ca'),
                exact: true
              },
              {
                path: '/AxTon.Docs/veiculos/tipos-veiculos',
                component: ComponentCreator('/AxTon.Docs/veiculos/tipos-veiculos', 'c29'),
                exact: true
              },
              {
                path: '/AxTon.Docs/',
                component: ComponentCreator('/AxTon.Docs/', 'e2c'),
                exact: true,
                sidebar: "manualSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
