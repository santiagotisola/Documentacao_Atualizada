import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

const modulos = [
  { icone: '🚀', titulo: 'Primeiros Passos', desc: 'Login, navegação e configuração inicial', link: '/docs/primeiros-passos/login', cor: '#3498db' },
  { icone: '📊', titulo: 'Dashboard', desc: 'Triagem mensal, mapa de equipamentos', link: '/docs/primeiros-passos/dashboard', cor: '#2ecc71' },
  { icone: '📸', titulo: 'Infrações', desc: 'Triagem, auditoria, exceções e exportação', link: '/docs/infracoes/triagem', cor: '#e74c3c' },
  { icone: '⏱️', titulo: 'Cronotacógrafo', desc: 'Triagem e consulta de dados de jornada', link: '/docs/cronotacografo/triagem', cor: '#f1c40f' },
  { icone: '⚖️', titulo: 'Balança / Pesagem', desc: 'Tickets, liberação e reclassificação', link: '/docs/pesagem/postos', cor: '#1abc9c' },
  { icone: '📡', titulo: 'Operações', desc: 'Monitoramento online, faixas e aferições', link: '/docs/operacoes/cadastro-operacoes', cor: '#e67e22' },
  { icone: '🚗', titulo: 'Veículos', desc: 'Classificações, marcas, modelos e placas', link: '/docs/veiculos/consulta', cor: '#3498db' },
  { icone: '🔧', titulo: 'Equipamentos', desc: 'Cadastro, grupos, tipos e fabricantes', link: '/docs/cadastros-basicos/fabricantes', cor: '#9b59b6' },
  { icone: '🔬', titulo: 'Medição', desc: 'Nova medição e medições finalizadas', link: '/docs/medicoes/equipamentos', cor: '#f39c12' },
  { icone: '📋', titulo: 'Relatórios', desc: 'Infrações, passagens, fluxo, BI e logs', link: '/docs/relatorios/relatorio-passagens', cor: '#8e44ad' },
  { icone: '🔐', titulo: 'Controle de Acesso', desc: 'Usuários, perfis, permissões e logs', link: '/docs/administracao/usuarios', cor: '#2c3e50' },
  { icone: '⚙️', titulo: 'Configurações', desc: 'Enquadramentos, tarjas, webhooks e BI', link: '/docs/administracao/configuracoes', cor: '#7f8c8d' },
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
    <Layout title="Início" description="AxHub — Manual do Usuário">
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>AxHub</h1>
          <p className={styles.heroSub}>Plataforma de Fiscalização Eletrônica de Trânsito</p>
          <p className={styles.heroDesc}>
            Triagem de infrações, pesagem veicular, monitoramento de equipamentos, cronotacógrafo, aferições INMETRO e relatórios BI — tudo em um só lugar.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/docs/" className={`button button--lg ${styles.btnPrimary}`}>📖 Manual Completo</Link>
          </div>
          <div style={{ marginTop: '1.5rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text"
                placeholder="Digite a URL do sistema (ex: economia.axhub.axion.ws)"
                value={accessUrl}
                onChange={e => setAccessUrl(e.target.value)}
                onKeyPress={e => { if (e.key === 'Enter') handleAccessSystem(); }}
                style={{ flex: 1, padding: '0.75rem 1rem', border: '2px solid #3498db', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
              />
              <button 
                onClick={handleAccessSystem}
                disabled={!accessUrl}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: accessUrl ? '#3498db' : '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: accessUrl ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (accessUrl) e.currentTarget.style.backgroundColor = '#2980b9'; }}
                onMouseLeave={e => { if (accessUrl) e.currentTarget.style.backgroundColor = '#3498db'; }}
              >
                🖥️ Acessar
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.stats}>
        <div className={`container ${styles.statsGrid}`}>
          {[['70', 'Telas'], ['14', 'Relatórios'], ['⚖️', 'Pesagem'], ['🔗', 'Integrações']].map(([n, l], i) => (
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
