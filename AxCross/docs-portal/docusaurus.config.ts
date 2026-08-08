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

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['pt'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
          showLastUpdateTime: true,
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
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AxCross',
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
              to: '/docs/primeiros-passos/login',
            },
            {
              label: 'Cadastros',
              to: '/docs/cadastros/locais',
            },
          ],
        },
        {
          title: 'Módulos',
          items: [
            {
              label: 'Monitoramento',
              to: '/docs/operacoes/monitoramento-online',
            },
            {
              label: 'Operações',
              to: '/docs/operacoes/cadastro-operacoes',
            },
            {
              label: 'Relatórios',
              to: '/docs/relatorios/relatorio-passagens',
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
