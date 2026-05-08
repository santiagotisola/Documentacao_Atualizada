import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Treinamento from "./pages/Treinamento.jsx";
import Logs from "./pages/Logs.jsx";
import KnowledgeBase from "./pages/KnowledgeBase.jsx";
import Chat from "./pages/Chat.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Helpdesk from "./pages/Helpdesk.jsx";
import GerarDoc from "./pages/GerarDoc.jsx";
import FontesPesquisa from "./pages/FontesPesquisa.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Specs from "./pages/Specs.jsx";
import RelatorioFluxo from "./pages/RelatorioFluxo.jsx";
import Conformidade from "./pages/Conformidade.jsx";
import PlanilhaHoras from "./pages/PlanilhaHoras.jsx";
import WhatsApp from "./pages/WhatsApp.jsx";
import AnaliseImagens from "./pages/AnaliseImagens.jsx";
import SlaCompliance from "./pages/SlaCompliance.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="sidebar">
          <div className="sidebar-header">
            <h1>AxionIA</h1>
            <span className="version">Painel v2.0</span>
          </div>
          <ul className="nav-links">
            <li><NavLink to="/">Dashboard</NavLink></li>
            <li><NavLink to="/chat">Chat</NavLink></li>
            <li><NavLink to="/helpdesk">Helpdesk</NavLink></li>
            <li><NavLink to="/whatsapp">💬 WhatsApp</NavLink></li>
            <li><NavLink to="/analise-imagens">🔍 Análise Imagens</NavLink></li>
            <li><NavLink to="/gerar-doc">📄 Gerar Doc</NavLink></li>
            <li><NavLink to="/fontes">🔎 Fontes de Pesquisa</NavLink></li>
            <li><NavLink to="/roadmap">🗺️ Roadmap</NavLink></li>
            <li><NavLink to="/specs">📐 Specs</NavLink></li>
            <li><NavLink to="/conformidade">📜 Conformidade</NavLink></li>
            <li><NavLink to="/relatorio-fluxo">📊 Relatório Fluxo</NavLink></li>
            <li><NavLink to="/planilha-horas">⏱️ Planilha de Horas</NavLink></li>
            <li><NavLink to="/sla-compliance">🎯 SLA Compliance</NavLink></li>
            <li><NavLink to="/treinamento">Treinamento</NavLink></li>
            <li><NavLink to="/logs">Logs</NavLink></li>
            <li><NavLink to="/kb">Knowledge Base</NavLink></li>
            <li className="nav-divider" />
            <li><NavLink to="/config">⚙️ Configurações</NavLink></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/helpdesk" element={<Helpdesk />} />
            <Route path="/gerar-doc" element={<GerarDoc />} />
            <Route path="/fontes" element={<FontesPesquisa />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/specs" element={<Specs />} />
            <Route path="/conformidade" element={<Conformidade />} />
            <Route path="/relatorio-fluxo" element={<RelatorioFluxo />} />
            <Route path="/planilha-horas" element={<PlanilhaHoras />} />
            <Route path="/sla-compliance" element={<SlaCompliance />} />
            <Route path="/whatsapp" element={<WhatsApp />} />
            <Route path="/analise-imagens" element={<AnaliseImagens />} />
            <Route path="/treinamento" element={<Treinamento />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/kb" element={<KnowledgeBase />} />
            <Route path="/config" element={<Configuracoes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
