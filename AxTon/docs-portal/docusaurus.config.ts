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

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
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
    image: 'img/axton-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AxTon',
      logo: {
        alt: 'AxTon Logo',
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
              label: 'Locais',
              to: '/cadastros/locais',
            },
            {
              label: 'Classificação de Veículos',
              to: '/cadastros/classificacao-veiculos',
            },
            {
              label: 'Usuários',
              to: '/administracao/usuarios',
            },
          ],
        },
        {
          title: 'Axion Tecnologia',
          items: [
            {
              label: 'Site Axion',
              href: 'https://axion.com.br',
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
