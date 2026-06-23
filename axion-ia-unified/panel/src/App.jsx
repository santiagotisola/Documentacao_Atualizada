import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import IntelligenceHub from './pages/IntelligenceHub.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        {/* Header simples */}
        <header style={{ 
          backgroundColor: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '1rem'
        }}>
          <Link to="/" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#2563eb',
            textDecoration: 'none'
          }}>
            🧠 Axion IA Panel
          </Link>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<IntelligenceHub />} />
          <Route path="*" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>Página não encontrada</h1>
              <Link to="/">Voltar para o início</Link>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
