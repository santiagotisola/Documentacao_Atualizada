import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

const modulos = [
  { icone: '🚀', titulo: 'Primeiros Passos', desc: 'Login e navegação', link: '/docs/primeiros-passos/login', cor: '#1abc9c' },
  { icone: '📊', titulo: 'Dashboard', desc: 'Indicadores e métricas', link: '/docs/primeiros-passos/dashboard', cor: '#2ecc71' },
  { icone: '⚖️', titulo: 'Iniciar Pesagem', desc: 'Postos e captura', link: '/docs/pesagem/postos', cor: '#16a085' },
  { icone: '🎫', titulo: 'Tickets Abertos', desc: 'Pesagens em andamento', link: '/docs/pesagem/ticket-aberto', cor: '#3498db' },
  { icone: '✅', titulo: 'Tickets Fechados', desc: 'Pesagens finalizadas', link: '/docs/pesagem/ticket-fechado', cor: '#27ae60' },
  { icone: '🔄', titulo: 'Reclassificação', desc: 'Correção de classificação', link: '/docs/pesagem/reclassificar', cor: '#e67e22' },
  { icone: '🔓', titulo: 'Liberar Pesagem', desc: 'Liberação de tickets', link: '/docs/pesagem/liberar-pesagem', cor: '#2980b9' },
  { icone: '📡', titulo: 'Monitoramento', desc: 'Monitoramento online', link: '/docs/operacoes/monitoramento-online', cor: '#e74c3c' },
  { icone: '📤', titulo: 'Exportação', desc: 'Lotes de infrações', link: '/docs/infracoes/exportacao', cor: '#c0392b' },
  { icone: '📊', titulo: 'Relatórios', desc: 'Pesagem, fluxo e infrações', link: '/docs/relatorios/relatorio-passagens', cor: '#8e44ad' },
  { icone: '📈', titulo: 'Power BI', desc: 'Análise avançada', link: '/docs/relatorios/power-bi', cor: '#f1c40f' },
  { icone: '🗺️', titulo: 'Mapa de Fluxo', desc: 'Passagens por local', link: '/docs/relatorios/mapa-fluxo-passagens', cor: '#9b59b6' },
  { icone: '📐', titulo: 'Medições', desc: 'Contratos e performance', link: '/docs/medicoes/contratos', cor: '#34495e' },
  { icone: '🏷️', titulo: 'Classificações', desc: 'Tipos de veículos', link: '/docs/cadastros/classificacao-veiculos', cor: '#d35400' },
  { icone: '📍', titulo: 'Locais', desc: 'Cadastro de postos', link: '/docs/cadastros/locais', cor: '#f39c12' },
  { icone: '🔢', titulo: 'Sequenciais', desc: 'Sequencial de infração', link: '/docs/cadastros/sequencial-infracao', cor: '#7f8c8d' },
  { icone: '⚙️', titulo: 'Configurações', desc: 'Parâmetros do sistema', link: '/docs/sistema/configuracoes', cor: '#95a5a6' },
  { icone: '👥', titulo: 'Usuários', desc: 'Gestão de contas', link: '/docs/administracao/usuarios', cor: '#2c3e50' },
  { icone: '🔐', titulo: 'Controle de Acesso', desc: 'Perfis, permissões e logs', link: '/docs/administracao/perfis-acesso', cor: '#636e72' },
  { icone: '📖', titulo: 'Glossário', desc: 'Termos de pesagem', link: '/docs/glossario/pesagem', cor: '#00b894' },
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
    <Layout title="Início" description="AxTon — Manual do Usuário">
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>AxTon</h1>
          <p className={styles.heroSub}>Plataforma de Gestão de Pesagem Veicular e Fiscalização</p>
          <p className={styles.heroDesc}>
            Controle completo de pesagem veicular, classificação automática, exportação de infrações, reclassificação, medições contratuais e relatórios Power BI.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/docs/" className={`button button--lg ${styles.btnPrimary}`}>📖 Manual Completo</Link>
            <Link to="/docs/primeiros-passos/login" className={`button button--lg ${styles.btnOutline}`}>🚀 Primeiros Passos</Link>
          </div>
          <div style={{ marginTop: '1.5rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text"
                placeholder="Digite a URL do sistema (ex: economia.axton.axion.ws)"
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
          {[['40+', 'Telas'], ['⚖️', 'Pesagem'], ['8', 'Relatórios'], ['📊', 'Power BI']].map(([n, l], i) => (
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
