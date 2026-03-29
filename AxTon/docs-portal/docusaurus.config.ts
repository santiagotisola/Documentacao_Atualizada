import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AxTon',
  tagline: 'Manual do Usuário - Sistema de Gestão de Pesagem Veicular',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://axion-tecnologia.github.io',
  baseUrl: '/AxTon.Docs/',

  organizationName: 'Axion-Tecnologia',
  projectName: 'AxTon.Docs',

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
    '/AxTon.Docs/widget/axton-suporte.js',
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
    image: 'img/axton-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AxTon',
      logo: {
        alt: 'AxTon Logo',
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
              label: 'Pesagem',
              to: '/pesagem/postos',
            },
            {
              label: 'Infrações',
              to: '/infracoes/triagem',
            },
            {
              label: 'Operações',
              to: '/operacoes/monitoramento-online',
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
