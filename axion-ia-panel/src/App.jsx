import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Treinamento from "./pages/Treinamento.jsx";
import Logs from "./pages/Logs.jsx";
import KnowledgeBase from "./pages/KnowledgeBase.jsx";
import Chat from "./pages/Chat.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Helpdesk from "./pages/Helpdesk.jsx";
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
