import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AxHub',
  tagline: 'Manual do Usuário - Sistema de Gestão de Equipamentos de Trânsito',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://axion-tecnologia.github.io',
  baseUrl: '/AxHub.Docs/',

  organizationName: 'Axion-Tecnologia',
  projectName: 'AxHub.Docs',

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
    image: 'img/axhub-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AxHub',
      logo: {
        alt: 'AxHub Logo',
        src: 'img/logo.svg',
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
            { label: 'Início', to: '/' },
            { label: 'Primeiros Passos', to: '/primeiros-passos/login' },
            { label: 'Cadastros Básicos', to: '/cadastros-basicos/fabricantes' },
          ],
        },
        {
          title: 'Módulos',
          items: [
            { label: 'Operações', to: '/operacoes/cadastro-operacoes' },
            { label: 'Infrações', to: '/infracoes/triagem' },
            { label: 'Pesagem', to: '/pesagem/postos' },
          ],
        },
        {
          title: 'Axion Tecnologia',
          items: [
            { label: 'Site Axion', href: 'https://axion.com.br' },
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