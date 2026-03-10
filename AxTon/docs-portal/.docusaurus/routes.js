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
    component: ComponentCreator('/AxTon.Docs/', 'bf1'),
    routes: [
      {
        path: '/AxTon.Docs/',
        component: ComponentCreator('/AxTon.Docs/', '459'),
        routes: [
          {
            path: '/AxTon.Docs/',
            component: ComponentCreator('/AxTon.Docs/', '488'),
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
