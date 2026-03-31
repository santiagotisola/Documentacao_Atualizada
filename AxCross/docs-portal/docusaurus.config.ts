import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AxCross',
  tagline: 'Manual do Usuário - Sistema de Gestão de Cruzamentos',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://axion-tecnologia.github.io',
  baseUrl: '/AxCross.Docs/',

  organizationName: 'Axion-Tecnologia',
  projectName: 'AxCross.Docs',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  scripts: [
    '/AxCross.Docs/widget/axcross-suporte.js',
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/axcross-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AxCross',
      logo: {
        alt: 'AxCross Logo',
        src: 'img/axion-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'manualSidebar',
          position: 'left',
          label: 'Manual do Usuário',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            {
              label: 'Início',
              to: '/',
            },
            {
              label: 'Primeiros Passos',
              to: '/primeiros-passos/login',
            },
            {
              label: 'Cadastros',
              to: '/cadastros/locais',
            },
          ],
        },
        {
          title: 'Módulos',
          items: [
            {
              label: 'Monitoramento',
              to: '/operacoes/monitoramento-online',
            },
            {
              label: 'Operações',
              to: '/operacoes/cadastro-operacoes',
            },
            {
              label: 'Relatórios',
              to: '/relatorios/relatorio-passagens',
            },
          ],
        },
        {
          title: 'Axion Tecnologia',
          items: [
            {
              label: 'Site Axion',
              href: 'https://axiontecnologia.com.br/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Axion Tecnologia. Todos os direitos reservados.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
