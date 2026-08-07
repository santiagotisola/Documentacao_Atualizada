import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

const modulos = [
  { icone: '🚀', titulo: 'Primeiros Passos', desc: 'Login e navegação', link: '/docs/primeiros-passos/login', cor: '#e67e22' },
  { icone: '📊', titulo: 'Dashboard', desc: 'KPIs e passagens em tempo real', link: '/docs/primeiros-passos/dashboard', cor: '#2ecc71' },
  { icone: '🚗', titulo: 'Veículos Monitorados', desc: 'Cadastro e vigência', link: '/docs/operacoes/veiculos-monitorados', cor: '#3498db' },
  { icone: '⚠️', titulo: 'Tipos de Ocorrências', desc: 'Categorias de alerta', link: '/docs/operacoes/tipos-ocorrencias', cor: '#e74c3c' },
  { icone: '🔔', titulo: 'Alertas', desc: 'Regras e notificações', link: '/docs/operacoes/alertas', cor: '#f39c12' },
  { icone: '🏷️', titulo: 'Classificações', desc: 'Tipos de veículos', link: '/docs/referencia-tecnica/classificacao-veiculos-integracao', cor: '#9b59b6' },
  { icone: '📥', titulo: 'Importação', desc: 'Veículos e equipamentos', link: '/docs/operacoes/veiculos-monitorados', cor: '#1abc9c' },
  { icone: '🖥️', titulo: 'Equipamentos', desc: 'Cadastro e grupos', link: '/docs/cadastros/equipamentos', cor: '#34495e' },
  { icone: '📍', titulo: 'Áreas', desc: 'Regiões de monitoramento', link: '/docs/cadastros/locais', cor: '#16a085' },
  { icone: '📡', titulo: 'Monitoramento Online', desc: 'Feed em tempo real (SignalR)', link: '/docs/operacoes/monitoramento-online', cor: '#c0392b' },
  { icone: '🗺️', titulo: 'Mapa de Equipamentos', desc: 'Geolocalização Google Maps', link: '/docs/operacoes/monitoramento-online', cor: '#27ae60' },
  { icone: '📊', titulo: 'Relatório Passagens', desc: 'Filtros avançados por placa/cor', link: '/docs/relatorios/relatorio-passagens', cor: '#8e44ad' },
  { icone: '🛣️', titulo: 'Mapeamento de Rotas', desc: 'Trajetos de veículos', link: '/docs/relatorios/mapeamento-rotas', cor: '#2980b9' },
  { icone: '🔎', titulo: 'Rastreamento de Placas', desc: 'Busca por placa específica', link: '/docs/relatorios/rastreamento-placas', cor: '#d35400' },
  { icone: '📋', titulo: 'Ocorrências e Alertas', desc: 'Histórico de detecções', link: '/docs/relatorios/ocorrencias-alertas', cor: '#7f8c8d' },
  { icone: '📄', titulo: 'PDFs Gerados', desc: 'Relatórios exportados', link: '/docs/relatorios/pdf-gerados', cor: '#95a5a6' },
  { icone: '⚙️', titulo: 'Configurações', desc: 'Parâmetros do sistema', link: '/docs/sistema/configuracoes', cor: '#636e72' },
  { icone: '👥', titulo: 'Usuários', desc: 'Gestão de contas', link: '/docs/administracao/usuarios', cor: '#2c3e50' },
  { icone: '🔐', titulo: 'Controle de Acesso', desc: 'Perfis, permissões e logs', link: '/docs/administracao/usuarios', cor: '#e17055' },
  { icone: '🔄', titulo: 'Sincronização', desc: 'Sync de passagens', link: '/docs/sistema/sincronizacao', cor: '#00b894' },
];

function ServiceCard({ icone, titulo, desc, link, cor }) {
  return (
    <Link to={link} className={styles.serviceLink}>
      <div className={styles.serviceCard}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div className={styles.serviceIcon} ref={el => { if (el) el.style.backgroundColor = cor; }}>{icone}</div>
        <div className={styles.serviceTitle}>{titulo}</div>
        <div className={styles.serviceDesc}>{desc}</div>
      </div>
    </Link>
  );
}

export default function Home(): React.JSX.Element {
  const [accessUrl, setAccessUrl] = useState('');

  const handleAccessSystem = () => {
    if (accessUrl) {
      window.open(accessUrl.startsWith('http') ? accessUrl : `https://${accessUrl}`, '_blank');
    }
  };

  return (
    <Layout title="Início" description="AxCross — Manual do Usuário">
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>AxCross</h1>
          <p className={styles.heroSub}>Plataforma de Cruzamento e Monitoramento de Dados de Trânsito</p>
          <p className={styles.heroDesc}>
            Monitoramento online em tempo real, rastreamento de placas, alertas automáticos por cruzamento, mapeamento de rotas e relatórios avançados.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/docs/" className={`button button--lg ${styles.btnPrimary}`}>📖 Manual Completo</Link>
            <Link to="/docs/primeiros-passos/login" className={`button button--lg ${styles.btnOutline}`}>🚀 Primeiros Passos</Link>
          </div>
          <div style={{ marginTop: '1.5rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text"
                placeholder="Digite a URL do sistema (ex: economia.axcross.axion.ws)"
                value={accessUrl}
                onChange={e => setAccessUrl(e.target.value)}
                onKeyPress={e => { if (e.key === 'Enter') handleAccessSystem(); }}
                style={{ flex: 1, padding: '0.75rem 1rem', border: '2px solid #0078d4', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
              />
              <button 
                onClick={handleAccessSystem}
                disabled={!accessUrl}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: accessUrl ? '#0078d4' : '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: accessUrl ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (accessUrl) e.currentTarget.style.backgroundColor = '#005a9e'; }}
                onMouseLeave={e => { if (accessUrl) e.currentTarget.style.backgroundColor = '#0078d4'; }}
              >
                🖥️ Acessar
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.stats}>
        <div className={`container ${styles.statsGrid}`}>
          {[['24', 'Telas'], ['52', 'Equipamentos'], ['6', 'Relatórios'], ['📡', 'Tempo Real']].map(([n, l], i) => (
            <div key={i}>
              <div className={styles.statVal}>{n}</div>
              <div className={styles.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <main className={styles.main}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Módulos</h2>
          <div className={styles.modulesGrid}>
            {modulos.map((m, i) => <ServiceCard key={i} {...m} />)}
          </div>
        </div>
      </main>
    </Layout>
  );
}
