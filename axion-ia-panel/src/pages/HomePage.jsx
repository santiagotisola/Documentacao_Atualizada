import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain, LayoutDashboard, ScanSearch, BookOpen, Ticket,
  Bot, MessageCircle, Headphones,
  ScanLine, CheckCircle2, Target, ShieldCheck, BarChart3,
  Landmark, PieChart, Map, Ruler,
  BookMarked, FileText, Search, GraduationCap, Clock, ScrollText,
  Settings, ArrowRight, Globe, Shield, TrendingUp
} from "lucide-react";

const FILTER_TABS = [
  { id: "all", label: "Todos" },
  { id: "operation", label: "Operação" },
  { id: "support", label: "Atendimento" },
  { id: "quality", label: "Qualidade" },
  { id: "intelligence", label: "Inteligência" },
  { id: "resources", label: "Recursos" },
];

const SERVICES = [
  { to: "/intelligence-hub", icon: Brain, label: "Intelligence Hub", group: "operation", color: "#3b82f6" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", group: "operation", color: "#60a5fa" },
  { to: "/analise", icon: ScanSearch, label: "Análise de Sites", group: "operation", color: "#2563eb" },
  { to: "/guia-sites", icon: BookOpen, label: "Guia por Site", group: "operation", color: "#1d4ed8" },
  { to: "/chamados-sites", icon: Ticket, label: "Chamados × Sites", group: "operation", color: "#1e40af" },

  { to: "/chat", icon: Bot, label: "Chat IA", group: "support", color: "#059669" },
  { to: "/whatsapp", icon: MessageCircle, label: "WhatsApp", group: "support", color: "#10b981" },
  { to: "/helpdesk", icon: Headphones, label: "Helpdesk", group: "support", color: "#34d399" },

  { to: "/analise-imagens", icon: ScanLine, label: "Análise de Imagens", group: "quality", color: "#7c3aed" },
  { to: "/confianca", icon: CheckCircle2, label: "Fila de Revisão", group: "quality", color: "#8b5cf6" },
  { to: "/sla-compliance", icon: Target, label: "SLA Compliance", group: "quality", color: "#a78bfa" },
  { to: "/conformidade", icon: ShieldCheck, label: "Conformidade", group: "quality", color: "#6d28d9" },
  { to: "/relatorio-fluxo", icon: BarChart3, label: "Relatório de Fluxo", group: "quality", color: "#5b21b6" },

  { to: "/editais-gov", icon: Landmark, label: "Editais Gov", group: "intelligence", color: "#d97706" },
  { to: "/analisa-multi", icon: PieChart, label: "Multi-Produto", group: "intelligence", color: "#f59e0b" },
  { to: "/roadmap", icon: Map, label: "Roadmap", group: "intelligence", color: "#eab308" },
  { to: "/specs", icon: Ruler, label: "Specs Técnicas", group: "intelligence", color: "#ca8a04" },

  { to: "/kb", icon: BookMarked, label: "Knowledge Base", group: "resources", color: "#0891b2" },
  { to: "/gerar-doc", icon: FileText, label: "Gerador de Docs", group: "resources", color: "#06b6d4" },
  { to: "/fontes", icon: Search, label: "Fontes de Pesquisa", group: "resources", color: "#22d3ee" },
  { to: "/treinamento", icon: GraduationCap, label: "Treinamento", group: "resources", color: "#0e7490" },
  { to: "/planilha-horas", icon: Clock, label: "Planilha de Horas", group: "resources", color: "#155e75" },
  { to: "/logs", icon: ScrollText, label: "Logs do Sistema", group: "resources", color: "#164e63" },
  { to: "/config", icon: Settings, label: "Configurações", group: "resources", color: "#475569" },
];

export default function HomePage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? SERVICES : SERVICES.filter(s => s.group === filter);

  return (
    <div className="home-page">
      {/* ══ Hero ══ */}
      <section className="hero-section">
        <div className="hero-inner">
          <span className="hero-badge">Plataforma Unificada de Inteligência</span>
          <h1 className="hero-title">AXION TECNOLOGIA</h1>
          <p className="hero-subtitle">
            Gestão inteligente de trânsito, pesagem veicular e monitoramento cruzado
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>3</strong>
              <span>Produtos</span>
            </div>
            <div className="hero-stat">
              <strong>25+</strong>
              <span>Sites Ativos</span>
            </div>
            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Monitoramento</span>
            </div>
            <div className="hero-stat">
              <strong>IA</strong>
              <span>Integrada</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Serviços ══ */}
      <section className="services-section">
        <h2 className="section-heading">SERVIÇOS</h2>
        <div className="services-filter">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              className={`svc-filter-btn ${filter === tab.id ? "active" : ""}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="svc-grid">
          {filtered.map(svc => (
            <Link to={svc.to} key={svc.to} className="svc-card">
              <div className="svc-card-icon" style={{ background: svc.color }}>
                <svc.icon size={36} strokeWidth={1.5} color="#fff" />
              </div>
              <span className="svc-card-label">{svc.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ Produtos ══ */}
      <section className="products-section">
        <h2 className="section-heading dark">NOSSOS PRODUTOS</h2>
        <div className="products-grid">
          <article className="product-card">
            <Globe size={44} strokeWidth={1.4} />
            <h3>AxHub</h3>
            <p>Gestão de trânsito e infrações com OCR e inteligência artificial</p>
            <a href="http://localhost:3010/AxHub.Docs" target="_blank" rel="noreferrer" className="product-link">
              Ver Documentação <ArrowRight size={14} />
            </a>
          </article>
          <article className="product-card">
            <Shield size={44} strokeWidth={1.4} />
            <h3>AxTon</h3>
            <p>Pesagem veicular automatizada com controle de conformidade</p>
            <a href="http://localhost:3011/AxTon.Docs" target="_blank" rel="noreferrer" className="product-link">
              Ver Documentação <ArrowRight size={14} />
            </a>
          </article>
          <article className="product-card">
            <TrendingUp size={44} strokeWidth={1.4} />
            <h3>AxCross</h3>
            <p>Monitoramento cruzado de veículos com alertas em tempo real</p>
            <a href="http://localhost:3012/AxCross.Docs" target="_blank" rel="noreferrer" className="product-link">
              Ver Documentação <ArrowRight size={14} />
            </a>
          </article>
        </div>
      </section>
    </div>
  );
}
